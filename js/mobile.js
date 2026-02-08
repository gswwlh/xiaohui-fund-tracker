// 移动端专用JavaScript

// 页面加载完成后执行
window.onload = async function() {
    // 初始化Supabase
    initSupabase();
    
    // 优先从云端加载数据
    const cloudLoaded = await loadFromCloud();
    if (!cloudLoaded) {
        // 云端加载失败，尝试从本地加载
        loadFromLocal();
    }
    
    // 加载指数数据
    loadIndexData();
    
    // 加载今日盈亏数据
    loadDailyPnL();
};

// 加载指数数据
async function loadIndexData() {
    const indices = [
        { id: 'index-ndx', code: '100.NDX' },
        { id: 'index-spx', code: '100.SPX' },
        { id: 'index-csi300', code: '1.000300' },
        { id: 'index-redlow', code: '1.000922' },
        { id: 'index-gold', code: '1.518660' }
    ];
    
    for (const index of indices) {
        try {
            const data = await fetchIndexData(index.code);
            const element = document.getElementById(index.id);
            if (element && data) {
                element.querySelector('.index-value').textContent = data.value;
                const changeEl = element.querySelector('.index-change');
                changeEl.textContent = (data.change >= 0 ? '+' : '') + data.change + '%';
                changeEl.style.color = data.isPositive ? '#ff4d4f' : '#52c41a';
            }
        } catch (error) {
            console.error(`加载指数 ${index.code} 失败:`, error);
        }
        await delay(100);
    }
}

// 加载今日盈亏数据
async function loadDailyPnL() {
    const loadingEl = document.getElementById('pnlLoading');
    const contentEl = document.getElementById('pnlContent');
    
    // 显示加载动画
    if (loadingEl) loadingEl.style.display = 'block';
    if (contentEl) contentEl.innerHTML = '';
    
    // 收集所有基金
    const allFunds = [];
    appData.sectors.forEach(sector => {
        sector.funds.forEach(fund => {
            allFunds.push({
                ...fund,
                sectorId: sector.id,
                sectorName: sector.name,
                sectorColor: sector.color
            });
        });
    });
    
    if (allFunds.length === 0) {
        if (loadingEl) loadingEl.style.display = 'none';
        if (contentEl) {
            contentEl.innerHTML = '<div style="padding:40px;text-align:center;color:#999;">暂无持仓数据</div>';
        }
        return;
    }
    
    // 获取所有基金的净值数据
    const results = [];
    for (const fund of allFunds) {
        try {
            const navData = await fetchFundNavData(fund.code);
            if (navData.success) {
                const growthRate = ((navData.nav - navData.yesterdayNav) / navData.yesterdayNav) * 100;
                const dailyProfit = fund.share * (navData.nav - navData.yesterdayNav);
                
                results.push({
                    ...fund,
                    todayNav: navData.nav,
                    yesterdayNav: navData.yesterdayNav,
                    growthRate: growthRate,
                    dailyProfit: dailyProfit,
                    date: navData.date
                });
            }
        } catch (error) {
            console.error(`获取基金 ${fund.code} 净值失败:`, error);
        }
        await delay(300);
    }
    
    // 隐藏加载动画
    if (loadingEl) loadingEl.style.display = 'none';
    
    // 渲染数据
    if (results.length > 0) {
        renderDailyPnL(results);
    } else {
        if (contentEl) {
            contentEl.innerHTML = '<div style="padding:40px;text-align:center;color:#999;">获取数据失败，请刷新重试</div>';
        }
    }
}


// 渲染今日盈亏（移动端版本）
function renderDailyPnL(results) {
    const contentEl = document.getElementById('pnlContent');
    
    // 按板块分组
    const sectorMap = {};
    results.forEach(item => {
        if (!sectorMap[item.sectorId]) {
            sectorMap[item.sectorId] = {
                name: item.sectorName,
                color: item.sectorColor,
                funds: []
            };
        }
        sectorMap[item.sectorId].funds.push(item);
    });
    
    // 计算总收益、持仓市值和浮盈
    let totalProfit = 0;
    let profitCount = 0;
    let lossCount = 0;
    let totalAsset = 0;
    let totalCost = 0;
    
    results.forEach(item => {
        totalProfit += item.dailyProfit;
        if (item.dailyProfit > 0) profitCount++;
        else if (item.dailyProfit < 0) lossCount++;
        
        const marketValue = item.share * item.todayNav;
        const costValue = item.share * item.costNav;
        totalAsset += marketValue;
        totalCost += costValue;
    });
    
    const totalFloatProfit = totalAsset - totalCost;
    const totalFloatProfitRate = totalCost > 0 ? (totalFloatProfit / totalCost * 100) : 0;
    
    // 更新顶部汇总
    const totalPnlEl = document.getElementById('totalDailyPnl');
    totalPnlEl.textContent = (totalProfit >= 0 ? '+' : '') + totalProfit.toFixed(2);
    totalPnlEl.style.color = totalProfit >= 0 ? '#ff4d4f' : '#52c41a';
    
    const dailyProfitRate = totalAsset > 0 ? (totalProfit / totalAsset * 100) : 0;
    const dailyProfitRateEl = document.getElementById('dailyProfitRate');
    dailyProfitRateEl.textContent = (dailyProfitRate >= 0 ? '+' : '') + dailyProfitRate.toFixed(2) + '%';
    dailyProfitRateEl.style.color = dailyProfitRate >= 0 ? '#ff4d4f' : '#52c41a';
    
    document.getElementById('totalFundCount').textContent = results.length;
    const profitLossRatioEl = document.getElementById('profitLossRatio');
    profitLossRatioEl.innerHTML = `<span style="color: #ff4d4f">${profitCount}</span>/<span style="color: #52c41a">${lossCount}</span>`;
    
    const totalAssetEl = document.getElementById('totalAssetInPnl');
    totalAssetEl.textContent = Math.round(totalAsset).toLocaleString();
    
    const totalProfitEl = document.getElementById('totalProfitInPnl');
    totalProfitEl.textContent = (totalFloatProfit >= 0 ? '+' : '') + Math.round(totalFloatProfit).toLocaleString();
    totalProfitEl.style.color = totalFloatProfit >= 0 ? '#ff4d4f' : '#52c41a';
    
    const totalProfitRateEl = document.getElementById('totalProfitRateInPnl');
    totalProfitRateEl.textContent = (totalFloatProfitRate >= 0 ? '+' : '') + totalFloatProfitRate.toFixed(2) + '%';
    totalProfitRateEl.style.color = totalFloatProfitRate >= 0 ? '#ff4d4f' : '#52c41a';
    
    // 渲染各板块（移动端卡片式）
    let html = '';
    
    appData.sectors.forEach(sector => {
        const sectorData = sectorMap[sector.id];
        if (!sectorData || sectorData.funds.length === 0) return;
        
        // 计算板块总收益、持仓总额和收益率
        const sectorProfit = sectorData.funds.reduce((sum, f) => sum + f.dailyProfit, 0);
        let sectorTotalAsset = 0;
        let sectorTotalCost = 0;
        
        sectorData.funds.forEach(fund => {
            const marketValue = fund.share * fund.todayNav;
            const costValue = fund.share * fund.costNav;
            sectorTotalAsset += marketValue;
            sectorTotalCost += costValue;
        });
        
        const sectorHoldingProfit = sectorTotalAsset - sectorTotalCost;
        const sectorHoldingProfitRate = sectorTotalCost > 0 ? (sectorHoldingProfit / sectorTotalCost * 100) : 0;
        
        html += `
            <div class="pnl-sector" style="border-top-color: ${sectorData.color}">
                <div class="pnl-sector-header">
                    <div class="pnl-sector-name">
                        <span style="color:${sectorData.color}; font-size:20px;">●</span>
                        ${sectorData.name}
                    </div>
                    <div class="pnl-sector-stats">
                        <div class="pnl-sector-stat">
                            <div class="pnl-sector-total" style="color: ${sectorProfit >= 0 ? '#ff4d4f' : '#52c41a'}">
                                ${sectorProfit >= 0 ? '+' : ''}${sectorProfit.toFixed(2)}
                            </div>
                        </div>
                        <div class="pnl-sector-stat">
                            <div class="pnl-sector-asset">${Math.round(sectorTotalAsset).toLocaleString()}</div>
                            <div class="pnl-sector-rate" style="color: ${sectorHoldingProfitRate >= 0 ? '#ff4d4f' : '#52c41a'}">
                                ${sectorHoldingProfitRate >= 0 ? '+' : ''}${sectorHoldingProfitRate.toFixed(2)}%
                            </div>
                        </div>
                    </div>
                </div>
                <div class="pnl-mobile-list">
        `;
        
        sectorData.funds.forEach(fund => {
            const totalMarketValue = fund.share * fund.todayNav;
            const holdingProfit = totalMarketValue - (fund.share * fund.costNav);
            const holdingProfitRate = (holdingProfit / (fund.share * fund.costNav)) * 100;
            
            html += `
                <div class="pnl-mobile-item">
                    <div class="pnl-mobile-header">
                        <div class="pnl-mobile-fund-info">
                            <div class="pnl-mobile-fund-name">${fund.name}</div>
                            <div class="pnl-mobile-fund-code">${fund.code}</div>
                        </div>
                    </div>
                    <div class="pnl-mobile-data">
                        <div class="pnl-mobile-col">
                            <div class="pnl-mobile-label">日收益</div>
                            <div class="pnl-mobile-value" style="color: ${fund.dailyProfit >= 0 ? '#ff4d4f' : '#52c41a'}">
                                ${fund.dailyProfit >= 0 ? '+' : ''}${fund.dailyProfit.toFixed(2)}
                            </div>
                            <div class="pnl-mobile-sub" style="color: ${fund.growthRate >= 0 ? '#ff4d4f' : '#52c41a'}">
                                ${fund.growthRate >= 0 ? '+' : ''}${fund.growthRate.toFixed(2)}%
                            </div>
                        </div>
                        <div class="pnl-mobile-col">
                            <div class="pnl-mobile-label">持仓收益</div>
                            <div class="pnl-mobile-value" style="color: ${holdingProfit >= 0 ? '#ff4d4f' : '#52c41a'}">
                                ${holdingProfit >= 0 ? '+' : ''}${holdingProfit.toFixed(2)}
                            </div>
                            <div class="pnl-mobile-sub" style="color: ${holdingProfitRate >= 0 ? '#ff4d4f' : '#52c41a'}">
                                ${holdingProfitRate >= 0 ? '+' : ''}${holdingProfitRate.toFixed(2)}%
                            </div>
                        </div>
                        <div class="pnl-mobile-col">
                            <div class="pnl-mobile-label">总市值</div>
                            <div class="pnl-mobile-value">${totalMarketValue.toFixed(2)}</div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    contentEl.innerHTML = html;
}

// 用户ID管理函数
function showUserIdManager() {
    const modal = document.getElementById('userIdModal');
    const currentUserIdEl = document.getElementById('currentUserId');
    
    if (modal && currentUserIdEl) {
        currentUserIdEl.textContent = getUserId();
        modal.classList.add('active');
    }
}

function closeUserIdManager() {
    const modal = document.getElementById('userIdModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function copyUserId() {
    const userId = getUserId();
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(userId).then(() => {
            showNotification('✅ 用户ID已复制到剪贴板', 'success');
        }).catch(() => {
            fallbackCopy(userId);
        });
    } else {
        fallbackCopy(userId);
    }
}

function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        showNotification('✅ 用户ID已复制', 'success');
    } catch (err) {
        showNotification('❌ 复制失败，请手动复制', 'error');
    }
    
    document.body.removeChild(textarea);
}

function applyNewUserId() {
    const input = document.getElementById('newUserIdInput');
    const newUserId = input.value.trim();
    
    if (!newUserId) {
        showNotification('❌ 请输入新的用户ID', 'error');
        return;
    }
    
    setUserId(newUserId);
    document.getElementById('currentUserId').textContent = newUserId;
    input.value = '';
    showNotification('✅ 用户ID已更新', 'success');
    
    // 重新加载数据
    setTimeout(async () => {
        await loadFromCloud();
        loadDailyPnL();
    }, 1000);
}

function confirmResetUserId() {
    if (confirm('确定要重置用户ID吗？这将生成一个新的ID。')) {
        const newUserId = resetUserId();
        document.getElementById('currentUserId').textContent = newUserId;
        showNotification('✅ 用户ID已重置', 'success');
    }
}
