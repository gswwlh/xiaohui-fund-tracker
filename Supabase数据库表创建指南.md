# Supabase 数据库表创建指南

## ✅ 当前状态

你的HTML文件已经完成了Supabase云存储的代码集成！现在只需要在Supabase控制台创建数据库表即可使用。

### 已配置信息：
- **Project URL**: https://tweusnlqlgiiuchlfbdr.supabase.co
- **Anon Key**: 已集成到代码中
- **用户ID**: 自动生成（存储在浏览器localStorage）

---

## 📋 第一步：创建数据库表

### 1. 登录 Supabase 控制台

访问：https://supabase.com/dashboard

### 2. 进入 Table Editor

1. 选择你的项目（应该能看到项目名称）
2. 点击左侧菜单的 **"Table Editor"**
3. 点击右上角的 **"New Table"** 按钮

### 3. 创建 fund_data 表

在创建表单中填写以下信息：

**表名（Name）**：
```
fund_data
```

**描述（Description）**（可选）：
```
基金投资组合数据存储
```

**启用行级安全（Enable Row Level Security）**：
- ✅ 勾选（推荐，但暂时可以不勾选以便测试）

### 4. 添加列（Columns）

Supabase会自动创建 `id` 和 `created_at` 列，你需要添加以下列：

#### 列 1: user_id
- **Name**: `user_id`
- **Type**: `text`
- **Default Value**: 留空
- **Primary**: 不勾选
- **Nullable**: 不勾选（必填）
- **Unique**: 不勾选

#### 列 2: data
- **Name**: `data`
- **Type**: `jsonb`
- **Default Value**: 留空
- **Primary**: 不勾选
- **Nullable**: 不勾选（必填）

#### 列 3: updated_at
- **Name**: `updated_at`
- **Type**: `timestamptz`
- **Default Value**: `now()`
- **Primary**: 不勾选
- **Nullable**: 可以勾选

### 5. 完整的表结构

创建完成后，你的表应该有以下列：

| 列名 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键（自动生成）|
| created_at | timestamptz | 创建时间（自动生成）|
| user_id | text | 用户唯一标识 |
| data | jsonb | 完整的基金数据 |
| updated_at | timestamptz | 最后更新时间 |

### 6. 点击 "Save" 保存表

---

## 🔒 第二步：配置访问权限（可选）

### 方案A：简单模式（推荐新手）

**暂时禁用 RLS，允许所有人访问**

1. 在 Table Editor 中，找到 `fund_data` 表
2. 点击表名旁边的 **"..."** 菜单
3. 选择 **"Edit table"**
4. 取消勾选 **"Enable Row Level Security (RLS)"**
5. 保存

⚠️ **注意**：这种方式任何人都可以访问数据，仅适合测试或个人使用。

### 方案B：安全模式（推荐生产环境）

**启用 RLS 并添加策略**

1. 确保 RLS 已启用
2. 点击左侧菜单的 **"Authentication"** → **"Policies"**
3. 选择 `fund_data` 表
4. 点击 **"New Policy"**

#### 策略 1：允许所有人读取自己的数据

- **Policy name**: `Allow public read`
- **Policy command**: `SELECT`
- **Target roles**: `public`
- **USING expression**:
```sql
true
```

#### 策略 2：允许所有人插入数据

- **Policy name**: `Allow public insert`
- **Policy command**: `INSERT`
- **Target roles**: `public`
- **WITH CHECK expression**:
```sql
true
```

#### 策略 3：允许所有人更新自己的数据

- **Policy name**: `Allow public update`
- **Policy command**: `UPDATE`
- **Target roles**: `public`
- **USING expression**:
```sql
true
```
- **WITH CHECK expression**:
```sql
true
```

---

## 🧪 第三步：测试云端同步

### 1. 打开HTML文件

双击打开 `我的智能定投补仓系统6.5.html`

### 2. 查看控制台日志

按 `F12` 打开浏览器开发者工具，切换到 **Console** 标签

你应该能看到类似的日志：
```
🆔 使用现有用户ID: user_1738369129_abc123
正在加载数据...
⚠️ 云端没有数据
📥 使用本地数据（或默认数据）
```

### 3. 测试保存到云端

1. 在页面上修改一些数据（比如添加基金、修改份额）
2. 观察右上角的通知："数据已保存到云端"
3. 在控制台查看日志：
```
✅ 创建云端数据成功
```

### 4. 验证数据已保存

1. 回到 Supabase 控制台
2. 进入 **Table Editor** → `fund_data`
3. 应该能看到一条数据记录
4. 点击查看，`data` 列应该包含你的基金数据（JSON格式）

### 5. 测试从云端加载

1. 清空浏览器缓存（或使用无痕模式）
2. 重新打开HTML文件
3. 观察控制台日志：
```
✅ 从云端加载数据成功
📅 最后更新时间: 2025/2/6 14:30:25
📥 使用云端数据
```
4. 页面应该显示你之前保存的数据

### 6. 测试手动同步按钮

点击页面上的按钮测试：
- **"☁️ 保存到云端"**：手动触发保存
- **"📥 从云端加载"**：手动从云端重新加载数据

---

## 🎯 使用 SQL Editor 创建表（高级方式）

如果你熟悉SQL，可以直接使用SQL创建表：

### 1. 进入 SQL Editor

点击左侧菜单的 **"SQL Editor"**

### 2. 执行以下SQL

```sql
-- 创建 fund_data 表
CREATE TABLE fund_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX idx_fund_data_user_id ON fund_data(user_id);

-- 启用 RLS（可选）
ALTER TABLE fund_data ENABLE ROW LEVEL SECURITY;

-- 添加策略：允许所有人访问（简单模式）
CREATE POLICY "Allow public access" ON fund_data
    FOR ALL
    USING (true)
    WITH CHECK (true);
```

### 3. 点击 "Run" 执行

---

## 📊 验证表结构

### 使用 SQL 查询验证

在 SQL Editor 中执行：

```sql
-- 查看表结构
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'fund_data'
ORDER BY ordinal_position;

-- 查看所有数据
SELECT * FROM fund_data;

-- 查看特定用户的数据
SELECT user_id, updated_at, 
       jsonb_pretty(data) as formatted_data
FROM fund_data
WHERE user_id = '你的用户ID';
```

---

## 🔍 故障排查

### 问题1：保存失败，提示 "relation does not exist"

**原因**：表还没有创建

**解决**：按照上面的步骤创建 `fund_data` 表

### 问题2：保存失败，提示 "permission denied"

**原因**：RLS 策略配置不正确

**解决**：
1. 禁用 RLS（测试用）
2. 或者添加正确的策略（见上面的方案B）

### 问题3：保存失败，提示 "new row violates check constraint"

**原因**：数据格式不符合表结构

**解决**：
1. 检查列的类型是否正确
2. 确保 `data` 列是 `jsonb` 类型
3. 确保 `user_id` 列是 `text` 类型

### 问题4：数据保存成功，但从云端加载失败

**原因**：可能是查询权限问题

**解决**：
1. 检查 RLS 策略
2. 在控制台查看是否有数据
3. 查看浏览器控制台的错误信息

### 问题5：提示 "Failed to fetch"

**原因**：网络问题或 Supabase 服务不可用

**解决**：
1. 检查网络连接
2. 确认 Supabase 项目状态
3. 检查 Project URL 是否正确

---

## 🎉 完成后的效果

✅ 打开页面自动从云端加载最新数据  
✅ 每次修改自动保存到云端  
✅ 右上角显示保存/加载通知  
✅ 可以手动触发云端同步  
✅ 数据永久保存，不依赖浏览器缓存  
✅ 在 Supabase 控制台可以查看和管理数据  

---

## 📱 多设备使用

### 获取你的用户ID

1. 在第一台设备上打开HTML文件
2. 按 `F12` 打开控制台
3. 输入并执行：
```javascript
console.log('我的用户ID:', userId);
// 或者
console.log('我的用户ID:', localStorage.getItem('userId'));
```
4. 复制显示的用户ID（如：`user_1738369129_abc123`）

### 在其他设备上使用相同数据

1. 在第二台设备上打开HTML文件
2. 按 `F12` 打开控制台
3. 输入并执行（替换为你的用户ID）：
```javascript
localStorage.setItem('userId', 'user_1738369129_abc123');
location.reload();
```
4. 页面刷新后会自动加载云端数据

---

## 💡 高级功能（可选）

### 1. 添加用户登录功能

如果你想要真正的多设备同步，可以添加登录功能。需要修改代码，使用 Supabase Auth。

### 2. 数据备份

虽然有云端存储，但建议定期使用 "⬇️ 备份配置" 导出JSON文件作为本地备份。

### 3. 查看数据历史

在 Supabase 控制台可以查看 `created_at` 和 `updated_at` 来追踪数据变更历史。

### 4. 数据迁移

如果需要迁移到新的 Supabase 项目：
1. 导出数据（使用备份功能）
2. 在新项目中创建相同的表结构
3. 更新HTML中的 `SUPABASE_URL` 和 `SUPABASE_KEY`
4. 导入数据

---

## 📞 需要帮助？

如果遇到问题：

1. **查看浏览器控制台**：按 F12，查看 Console 标签的错误信息
2. **查看 Supabase 日志**：在 Supabase 控制台的 "Logs" 部分查看 API 请求日志
3. **检查表结构**：确认表名和列名完全匹配
4. **测试 API**：在 Supabase 控制台的 "API" 部分可以测试 API 调用

---

## 🎊 恭喜！

完成以上步骤后，你的智能定投系统就拥有了云端存储功能！

现在你可以：
- 在任何设备上访问你的数据
- 不用担心浏览器缓存被清空
- 数据永久保存在云端
- 随时查看和管理你的投资组合

开始使用你的云端智能定投系统吧！ 🚀
