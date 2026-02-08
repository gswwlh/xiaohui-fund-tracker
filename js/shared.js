// 共享的数据处理和API调用逻辑

// 全局应用数据
let appData = JSON.parse(JSON.stringify(DEFAULT_APP_DATA));

// ==================== 数据存储 ====================

// 保存到本地存储
function saveToLocal() {
    localStorage.setItem('appData', JSON.stringify(appData));
    saveToCloud(); // 自动保存到云端
}

// 从本地存储加载
function loadFromLocal() {
    const saved = localStorage.getItem('appData');
    if (saved) {
        try {
            appData = JSON.parse(saved);
            return true;
        } catch (e) {
            console.error('加载本地数据失败:', e);
            return false;
        }
    }
    return false;
}

// 保存到云端
async function saveToCloud() {
    try {
        const supabase = initSupabase();
        const userId = getUserId();
        
        const { data, error } = await supabase
            .from('fund_data')
            .upsert({
                user_id: userId,
                data: appData,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id'
            });
        
        if (error) throw error;
        
        console.log('云端保存成功');
        return true;
    } catch (error) {
        console.error('云端保存失败:', error);
        return false;
    }
}

// 从云端加载
async function loadFromCloud() {
    try {
        const supabase = initSupabase();
        const userId = getUserId();
        
        const { data, error } = await supabase
            .from('fund_data')
            .select('*')
            .eq('user_id', userId)
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') {
                console.log('云端无数据，使用本地数据');
                return false;
            }
            throw error;
        }
        
        if (data && data.data) {
            appData = data.data;
            saveToLocal(); // 同步到本地
            console.log('云端加载成功');
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('云端加载失败:', error);
        return false;
    }
}

// 手动从云端加载
async function loadFromCloudManual() {
    const success = await loadFromCloud();
    if (success) {
        showNotification('✅ 从云端加载成功！', 'success');
        if (typeof renderApp === 'function') {
            renderApp();
        }
    } else {
        showNotification('❌ 云端加载失败，请检查网络', 'error');
    }
}

// 显示通知
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#52c41a' : type === 'error' ? '#ff4d4f' : '#1890ff'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        font-size: 14px;
        font-weight: 500;
    `;
    
    document.body.appendChild(notification);
    
    // 3秒后自动消失
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// ==================== API调用 ====================

// 获取指数数据
async function fetchIndexData(code) {
    return new Promise((resolve, reject) => {
        const callbackName = 'jsonpCallback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const timeout = setTimeout(() => {
            cleanup();
            reject(new Error('Timeout'));
        }, 10000);
        
        const cleanup = () => {
            delete window[callbackName];
            if (script && script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
        
        window[callbackName] = (data) => {
            clearTimeout(timeout);
            cleanup();
            
            if (data && data.data) {
                const item = data.data;
                resolve({
                    name: item.f58,
                    value: (item.f43 / 100).toFixed(2),
                    change: ((item.f43 - item.f60) / item.f60 * 100).toFixed(2),
                    isPositive: item.f43 >= item.f60
                });
            } else {
                reject(new Error('No data'));
            }
        };
        
        const script = document.createElement('script');
        script.src = `https://push2.eastmoney.com/api/qt/stock/get?secid=${code}&fields=f43,f58,f60&cb=${callbackName}`;
        script.onerror = () => {
            clearTimeout(timeout);
            cleanup();
            reject(new Error('Network error'));
        };
        
        document.head.appendChild(script);
    });
}

// 获取基金净值数据（今日和昨日）
async function fetchFundNavData(code) {
    return new Promise((resolve, reject) => {
        const callbackName = 'fundCallback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const timeout = setTimeout(() => {
            cleanup();
            reject(new Error('Timeout'));
        }, 10000);
        
        const cleanup = () => {
            delete window[callbackName];
            if (script && script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
        
        window[callbackName] = (content) => {
            setTimeout(() => {
                try {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(content, 'text/html');
                    const table = doc.querySelector('.dataTable tbody');
                    
                    if (!table) {
                        clearTimeout(timeout);
                        cleanup();
                        reject(new Error('No table found'));
                        return;
                    }
                    
                    const rows = table.querySelectorAll('tr');
                    if (rows.length < 2) {
                        clearTimeout(timeout);
                        cleanup();
                        reject(new Error('Insufficient data'));
                        return;
                    }
                    
                    // 今日净值
                    const todayCells = rows[0].querySelectorAll('td');
                    const todayDate = todayCells[0].textContent.trim();
                    const todayNav = parseFloat(todayCells[1].textContent.trim());
                    
                    // 昨日净值
                    let yesterdayNav = todayNav;
                    if (rows.length >= 2) {
                        const yesterdayCells = rows[1].querySelectorAll('td');
                        yesterdayNav = parseFloat(yesterdayCells[1].textContent.trim()) || todayNav;
                    }
                    
                    clearTimeout(timeout);
                    cleanup();
                    resolve({
                        success: true,
                        code: code,
                        nav: todayNav,
                        yesterdayNav: yesterdayNav,
                        date: todayDate
                    });
                } catch (e) {
                    clearTimeout(timeout);
                    cleanup();
                    reject(e);
                }
            }, 200);
        };
        
        const script = document.createElement('script');
        script.onerror = () => {
            clearTimeout(timeout);
            cleanup();
            reject(new Error('Network error'));
        };
        
        script.src = `https://fund.eastmoney.com/f10/F10DataApi.aspx?type=lsjz&code=${code}&page=1&per=2&callback=${callbackName}`;
        document.head.appendChild(script);
    });
}

// 获取基金实时估值
async function fetchFundEstimate(code) {
    return new Promise((resolve, reject) => {
        const callbackName = 'estimateCallback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const timeout = setTimeout(() => {
            cleanup();
            reject(new Error('Timeout'));
        }, 10000);
        
        const cleanup = () => {
            delete window[callbackName];
            if (script && script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
        
        window[callbackName] = (data) => {
            clearTimeout(timeout);
            cleanup();
            
            if (data && data.gsz) {
                resolve({
                    success: true,
                    code: code,
                    nav: parseFloat(data.gsz),
                    growthRate: parseFloat(data.gszzl)
                });
            } else {
                reject(new Error('No estimate data'));
            }
        };
        
        const script = document.createElement('script');
        script.onerror = () => {
            clearTimeout(timeout);
            cleanup();
            reject(new Error('Network error'));
        };
        
        script.src = `https://fundgz.1234567.com.cn/js/${code}.js?rt=${Date.now()}`;
        document.head.appendChild(script);
    });
}

// ==================== 工具函数 ====================

// 延迟函数
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 格式化数字
function formatNumber(num, decimals = 2) {
    return num.toFixed(decimals);
}

// 格式化货币
function formatCurrency(num) {
    return Math.round(num).toLocaleString();
}
