// Supabase 配置
const SUPABASE_CONFIG = {
    url: 'https://tweusnlqlgiiuchlfbdr.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3ZXVzbmxxbGdpaXVjaGxmYmRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNjkxMjksImV4cCI6MjA4NTk0NTEyOX0.3-JvqUMlHigtjwcGHZDdaOhvwq1dDLeoqn2A0gxXNPg'
};

// 初始化 Supabase 客户端
let supabase = null;

function initSupabase() {
    try {
        if (typeof window.supabase === 'undefined') {
            console.warn('Supabase库未加载');
            return null;
        }
        if (typeof supabase === 'undefined' || supabase === null) {
            supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        }
        return supabase;
    } catch (error) {
        console.error('初始化Supabase失败:', error);
        return null;
    }
}

// 用户ID管理
function getUserId() {
    let userId = localStorage.getItem('userId');
    if (!userId) {
        userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('userId', userId);
    }
    return userId;
}

function setUserId(newUserId) {
    localStorage.setItem('userId', newUserId);
}

function resetUserId() {
    const newUserId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('userId', newUserId);
    return newUserId;
}

// 默认数据结构
const DEFAULT_APP_DATA = {
    totalGoal: 700000,
    months: 24,
    sectors: [
        {
            id: 1,
            name: '债基底仓',
            color: '#1890ff',
            targetRatio: 35,
            funds: []
        }
    ]
};
