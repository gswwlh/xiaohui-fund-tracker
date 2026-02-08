# Supabase 云存储集成代码

## 📦 在HTML中添加以下代码

### 1. 在 `<head>` 中添加 Supabase SDK

```html
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>智能定投系统 (V7 全能旗舰版)</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    
    <!-- 添加 Supabase SDK -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    
    <style>
    ...
```

### 2. 在 `<script>` 开始处添加配置和函数

```javascript
<script>
    // ===== Supabase 云端存储配置 =====
    const SUPABASE_URL = 'https://你的项目ID.supabase.co';  // 替换为你的Project URL
    const SUPABASE_KEY = '你的anon_key';  // 替换为你的anon public key
    
    // 初始化 Supabase 客户端
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    
    // 生成或获取用户ID
    let userId = localStorage.getItem('userId');
    if (!userId) {
        userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('userId', userId);
    }
    
    // ===== 云端存储函数 =====
    
    /**
     * 保存数据到云端
     */
    async function saveToCloud() {
        try {
            showNotification('正在保存到云端...', 'info');
            
            // 检查是否已存在该用户的数据
            const { data: existingData, error: queryError } = await supabase
                .from('fund_data')
                .select('id')
                .eq('user_id', userId)
                .single();
            
            if (existingData) {
                // 更新现有数据
                const { error } = await supabase
                    .from('fund_data')
                    .update({
                        data: appData,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', userId);
                
                if (error) throw error;
            } else {
                // 插入新数据
                const { error } = await supabase
                    .from('fund_data')
                    .insert({
                        user_id: userId,
                        data: appData,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    });
                
                if (error) throw error;
            }
            
            console.log('✅ 数据已保存到云端');
            showNotification('数据已保存到云端', 'success');
            return true;
        } catch (error) {
            console.error('❌ 保存到云端失败:', error);
            showNotification('保存失败: ' + error.message, 'error');
            return false;
        }
    }
    
    /**
     * 从云端加载数据
     */
    async function loadFromCloud() {
        try {
            const { data, error } = await supabase
                .from('fund_data')
                .select('data, updated_at')
                .eq('user_id', userId)
                .single();
            
            if (error) {
                if (error.code === 'PGRST116') {
                    // 没有找到数据
                    console.log('⚠️ 云端没有数据');
                    return null;
                }
                throw error;
            }
            
            if (data) {
                console.log('✅ 从云端加载数据成功');
                console.log('最后更新时间:', data.updated_at);
                return data.data;
            }
            
            return null;
        } catch (error) {
            console.error('❌ 从云端加载失败:', error);
            showNotification('加载失败: ' + error.message, 'error');
            return null;
        }
    }
    
    /**
     * 手动从云端加载
     */
    async function loadFromCloudManual() {
        showNotification('正在从云端加载...', 'info');
        const cloudData = await loadFromCloud();
        
        if (cloudData) {
            appData = cloudData;
            renderApp();
            calcAll();
            showNotification('数据已从云端加载', 'success');
        } else {
            showNotification('云端没有数据', 'error');
        }
    }
    
    /**
     * 显示通知
     */
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        const colors = {
            success: '#52c41a',
            error: '#ff4d4f',
            info: '#1890ff',
            warning: '#faad14'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${colors[type]};
            color: white;
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-size: 14px;
            font-weight: 500;
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // 添加CSS动画
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(400px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // ===== 修改原有函数 =====
    
    /**
     * 保存到本地（同时保存到云端）
     */
    function saveToLocal() {
        localStorage.setItem('smartSIP_data_v7', JSON.stringify(appData));
        // 自动保存到云端（不阻塞UI）
        saveToCloud().catch(err => console.error('云端保存失败:', err));
    }
    
    // 原有代码继续...
    const DEFAULT_DATA = {
        totalGoal: 1000000,
        months: 24,
        sectors: [
            // ... 默认数据
        ]
    };
    
    let appData = null;
    let myChart = null;
    let compoundChart = null;
    
    // ===== 修改 window.onload =====
    window.onload = async function() {
        // 显示加载提示
        showNotification('正在加载数据...', 'info');
        
        // 优先从云端加载
        const cloudData = await loadFromCloud();
        
        if (cloudData) {
            // 使用云端数据
            appData = cloudData;
            console.log('📥 使用云端数据');
            showNotification('已加载云端数据', 'success');
        } else {
            // 尝试从本地加载
            const saved = localStorage.getItem('smartSIP_data_v7');
            if (saved) {
                try {
                    appData = JSON.parse(saved);
                    console.log('📥 使用本地数据');
                    showNotification('已加载本地数据', 'info');
                    // 将本地数据同步到云端
                    saveToCloud().catch(err => console.error('同步失败:', err));
                } catch (e) {
                    console.error(e);
                    appData = JSON.parse(JSON.stringify(DEFAULT_DATA));
                    showNotification('使用默认数据', 'warning');
                }
            } else {
                appData = JSON.parse(JSON.stringify(DEFAULT_DATA));
                showNotification('使用默认数据', 'info');
            }
        }
        
        initChart(); 
        renderApp();
        loadIndexData();
        loadDailyPnL();
    };
    
    // 后面是原有的所有代码...
</script>
```

### 3. 修改按钮组（添加云端同步按钮）

```html
<div class="btn-group">
    <button class="btn-dash" id="btnToggleRb" onclick="toggleRebalance()">📊 显示再平衡</button>
    <button class="btn-dash" id="btnToggleCp" onclick="toggleCompound()">🧮 复利推演</button>
    <button class="btn-dash" id="btnToggleEst" onclick="toggleEstimate()">📈 实时预估</button>
    <button class="btn-dash" onclick="syncAllFundNav()">🔄 同步实时净值</button>
    
    <!-- 添加云端同步按钮 -->
    <button class="btn-dash" onclick="saveToCloud()" title="手动保存到云端">☁️ 保存到云端</button>
    <button class="btn-dash" onclick="loadFromCloudManual()" title="从云端重新加载">📥 从云端加载</button>
    
    <button class="btn-dash" onclick="exportData()">⬇️ 备份配置</button>
    <button class="btn-dash" onclick="document.getElementById('importFile').click()">⬆️ 恢复配置</button>
    <input type="file" id="importFile" style="display:none" onchange="importData(this)">
</div>
```

---

## 🎯 工作流程

### 自动保存流程：
```
用户修改数据
    ↓
calcAll() 或其他函数
    ↓
saveToLocal()
    ↓
localStorage + saveToCloud()（后台异步）
    ↓
数据保存到云端
```

### 加载流程：
```
打开页面
    ↓
window.onload
    ↓
loadFromCloud()（优先）
    ↓
有云端数据？
    ├─ 是 → 使用云端数据
    └─ 否 → 使用本地数据 → 同步到云端
    ↓
渲染页面
```

---

## 🔒 安全配置

### 在 Supabase 中设置行级安全策略（RLS）

1. 进入 Supabase 控制台
2. 点击 "Authentication" → "Policies"
3. 选择 `fund_data` 表
4. 点击 "Enable RLS"
5. 添加策略：

**允许用户读取自己的数据：**
```sql
CREATE POLICY "Users can read own data"
ON fund_data
FOR SELECT
USING (user_id = current_setting('request.jwt.claims')::json->>'sub');
```

**允许用户插入自己的数据：**
```sql
CREATE POLICY "Users can insert own data"
ON fund_data
FOR INSERT
WITH CHECK (true);
```

**允许用户更新自己的数据：**
```sql
CREATE POLICY "Users can update own data"
ON fund_data
FOR UPDATE
USING (user_id = current_setting('request.jwt.claims')::json->>'sub');
```

---

## 📊 数据结构

在 Supabase 的 `fund_data` 表中：

| 列名 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键，自动生成 |
| user_id | text | 用户唯一标识 |
| data | jsonb | 完整的 appData 对象 |
| created_at | timestamp | 创建时间 |
| updated_at | timestamp | 最后更新时间 |

---

## 🧪 测试步骤

1. 打开HTML文件
2. 修改一些数据（添加基金等）
3. 观察右上角通知："数据已保存到云端"
4. 在 Supabase 控制台查看 `fund_data` 表，应该能看到数据
5. 清空浏览器缓存
6. 刷新页面
7. 数据应该自动从云端加载

---

## ❓ 常见问题

**Q: 如何在多个设备上使用同一份数据？**
A: 需要在两个设备上使用相同的 `userId`。可以：
- 方案1：手动复制 localStorage 中的 userId
- 方案2：添加登录功能（推荐）

**Q: 数据会自动保存吗？**
A: 是的，每次修改数据后会自动保存到云端

**Q: 如果云端保存失败怎么办？**
A: 数据仍然保存在本地 localStorage，不会丢失

**Q: 免费额度够用吗？**
A: 完全够用！Supabase 免费版支持 50,000 月活跃用户

---

## 🎉 完成后的效果

- ✅ 打开页面自动从云端加载
- ✅ 修改数据自动保存到云端
- ✅ 右上角显示保存/加载通知
- ✅ 可以手动触发云端同步
- ✅ 数据永久保存，不依赖浏览器

---

需要我生成完整的修改后的HTML文件吗？
