#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
基金净值API封装
提供东方财富和天天基金两个数据源
"""

import requests
from bs4 import BeautifulSoup
import re
import json
from typing import Dict, Optional
from datetime import datetime


class FundAPI:
    """基金净值API封装类"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
    
    def get_index_data(self, index_code: str, index_name: str = '') -> Optional[Dict]:
        """
        从东方财富获取指数数据
        
        Args:
            index_code: 指数代码，格式如 "100.NDX", "1.000300", "1.518660"
            index_name: 指数名称（可选）
            
        Returns:
            {
                'index_code': '100.NDX',
                'index_name': '纳斯达克100',
                'latest_price': 22904.58,
                'yesterday_close': 23256.42,
                'change': -351.84,
                'change_percent': -1.51,
                'high': 23960.00,
                'low': 22786.00,
                'status': 'success'
            }
            失败返回 None
        """
        try:
            url = 'http://push2.eastmoney.com/api/qt/stock/get'
            params = {
                'secid': index_code,
                'fields': 'f43,f51,f52,f58,f60'
            }
            
            response = self.session.get(url, params=params, timeout=10)
            data = response.json()
            
            if data.get('rc') != 0 or not data.get('data'):
                print(f"❌ 获取指数数据失败: {index_code}")
                return None
            
            index_data = data['data']
            
            # 所有价格需要除以100
            latest_price = index_data['f43'] / 100
            yesterday_close = index_data['f60'] / 100
            high = index_data['f51'] / 100
            low = index_data['f52'] / 100
            
            # 计算涨跌
            change = latest_price - yesterday_close
            change_percent = (change / yesterday_close * 100) if yesterday_close > 0 else 0
            
            # 获取指数名称
            if not index_name:
                index_name = index_data.get('f58', index_code)
            
            result = {
                'index_code': index_code,
                'index_name': index_name,
                'latest_price': latest_price,
                'yesterday_close': yesterday_close,
                'change': change,
                'change_percent': change_percent,
                'high': high,
                'low': low,
                'status': 'success'
            }
            
            print(f"✅ {index_name} ({index_code})")
            print(f"   最新价: {latest_price:.2f}")
            print(f"   昨收价: {yesterday_close:.2f}")
            print(f"   涨跌额: {change:+.2f}")
            print(f"   涨跌幅: {change_percent:+.2f}%")
            print(f"   最高价: {high:.2f}")
            print(f"   最低价: {low:.2f}")
            
            return result
            
        except Exception as e:
            print(f"❌ 获取指数数据失败 {index_code}: {str(e)}")
            return None
    
    def get_actual_nav_eastmoney(self, fund_code: str) -> Optional[Dict]:
        """
        从东方财富获取最新实际净值
        
        Args:
            fund_code: 基金代码，如 "163406"
            
        Returns:
            {
                'fund_code': '163406',
                'fund_name': '兴全合润混合A',
                'nav_date': '2026-02-04',
                'nav': 2.1925,
                'acc_nav': 8.3381,
                'growth_rate': '-0.93%',
                'status': 'success'
            }
            失败返回 None
        """
        try:
            url = f'http://fund.eastmoney.com/f10/F10DataApi.aspx'
            params = {
                'type': 'lsjz',
                'code': fund_code,
                'page': 1,
                'per': 1
            }
            
            response = self.session.get(url, params=params, timeout=10)
            response.encoding = 'utf-8'
            
            # 直接解析HTML
            soup = BeautifulSoup(response.text, 'html.parser')
            rows = soup.select('tbody tr')
            
            if not rows:
                print(f"❌ 没有净值数据: {fund_code}")
                return None
            
            # 提取第一行数据（最新净值）
            cells = rows[0].find_all('td')
            if len(cells) < 4:
                print(f"❌ 数据格式错误: {fund_code}")
                return None
            
            # 获取基金名称
            fund_name = self._get_fund_name(fund_code)
            
            result = {
                'fund_code': fund_code,
                'fund_name': fund_name,
                'nav_date': cells[0].text.strip(),
                'nav': float(cells[1].text.strip()),
                'acc_nav': float(cells[2].text.strip()),
                'growth_rate': cells[3].text.strip(),
                'status': 'success'
            }
            
            print(f"✅ {fund_name} ({fund_code})")
            print(f"   净值日期: {result['nav_date']}")
            print(f"   单位净值: {result['nav']}")
            print(f"   累计净值: {result['acc_nav']}")
            print(f"   日增长率: {result['growth_rate']}")
            
            return result
            
        except Exception as e:
            print(f"❌ 获取失败 {fund_code}: {str(e)}")
            return None
    
    def get_estimate_nav_ttfund(self, fund_code: str) -> Optional[Dict]:
        """
        从天天基金获取前一日净值和实时估算净值
        
        Args:
            fund_code: 基金代码，如 "163406"
            
        Returns:
            {
                'fund_code': '163406',
                'fund_name': '兴全合润混合A',
                'nav_date': '2026-02-03',          # 前一日净值日期
                'nav': 2.2131,                      # 前一日实际净值
                'estimate_nav': 2.1843,             # 实时估算净值
                'estimate_growth': '-1.30',         # 估算涨跌幅
                'estimate_time': '2026-02-04 15:00', # 估值时间
                'status': 'success'
            }
            失败返回 None
        """
        try:
            url = f'https://fundgz.1234567.com.cn/js/{fund_code}.js'
            
            response = self.session.get(url, timeout=10)
            response.encoding = 'utf-8'
            
            # 提取JSONP数据
            match = re.search(r'jsonpgz\((.*?)\);?', response.text)
            if not match:
                print(f"❌ 未找到数据: {fund_code}")
                return None
            
            data = json.loads(match.group(1))
            
            result = {
                'fund_code': data.get('fundcode', fund_code),
                'fund_name': data.get('name', ''),
                'nav_date': data.get('jzrq', ''),
                'nav': float(data.get('dwjz', 0)),
                'estimate_nav': float(data.get('gsz', 0)),
                'estimate_growth': data.get('gszzl', ''),
                'estimate_time': data.get('gztime', ''),
                'status': 'success'
            }
            
            print(f"✅ {result['fund_name']} ({fund_code})")
            print(f"   前一日净值: {result['nav']} ({result['nav_date']})")
            print(f"   估算净值: {result['estimate_nav']} ({result['estimate_time']})")
            print(f"   估算涨跌: {result['estimate_growth']}%")
            
            return result
            
        except Exception as e:
            print(f"❌ 获取失败 {fund_code}: {str(e)}")
            return None
    
    def _get_fund_name(self, fund_code: str) -> str:
        """获取基金名称（辅助方法）"""
        try:
            url = f'http://fund.eastmoney.com/{fund_code}.html'
            response = self.session.get(url, timeout=5)
            response.encoding = 'utf-8'
            
            soup = BeautifulSoup(response.text, 'html.parser')
            title = soup.find('title')
            if title:
                # 提取基金名称（格式：基金名称(代码)）
                match = re.search(r'(.+?)\(', title.text)
                if match:
                    return match.group(1).strip()
            return fund_code
        except:
            return fund_code
    
    def compare_sources(self, fund_code: str):
        """
        对比两个数据源的结果
        
        Args:
            fund_code: 基金代码
        """
        print(f"\n{'='*60}")
        print(f"📊 对比基金 {fund_code} 的两个数据源")
        print(f"{'='*60}\n")
        
        print("🔵 数据源1: 东方财富（实际净值）")
        print("-" * 60)
        eastmoney_data = self.get_actual_nav_eastmoney(fund_code)
        
        print("\n🟠 数据源2: 天天基金（估算净值）")
        print("-" * 60)
        ttfund_data = self.get_estimate_nav_ttfund(fund_code)
        
        if eastmoney_data and ttfund_data:
            print(f"\n{'='*60}")
            print("📈 数据对比")
            print(f"{'='*60}")
            print(f"东方财富实际净值: {eastmoney_data['nav']} ({eastmoney_data['nav_date']})")
            print(f"天天基金前日净值: {ttfund_data['nav']} ({ttfund_data['nav_date']})")
            print(f"天天基金估算净值: {ttfund_data['estimate_nav']} ({ttfund_data['estimate_time']})")
            
            # 计算差异
            if eastmoney_data['nav_date'] == ttfund_data['nav_date']:
                diff = abs(eastmoney_data['nav'] - ttfund_data['nav'])
                print(f"\n💡 同日净值差异: {diff:.4f} (应该为0)")
            else:
                print(f"\n💡 净值日期不同，无法直接对比")


def main():
    """示例用法"""
    import time
    
    api = FundAPI()
    
    # 示例1: 获取指数数据
    print("\n" + "="*60)
    print("示例1: 获取指数数据")
    print("="*60)
    
    indices = [
        ('100.NDX', '纳斯达克100'),
        ('100.SPX', '标普500'),
        ('1.000300', '沪深300'),
        ('1.515100', '中证红利低波'),
        ('1.518660', '黄金ETF')
    ]
    
    for code, name in indices:
        print(f"\n--- {name} ---")
        api.get_index_data(code, name)
        time.sleep(0.3)  # 延迟300ms避免请求过快
    
    # 示例2: 获取东方财富实际净值
    print("\n" + "="*60)
    print("示例2: 获取东方财富最新实际净值")
    print("="*60)
    result1 = api.get_actual_nav_eastmoney('163406')
    
    # 示例3: 获取天天基金估算净值
    print("\n" + "="*60)
    print("示例3: 获取天天基金估算净值")
    print("="*60)
    result2 = api.get_estimate_nav_ttfund('163406')
    
    # 示例4: 对比两个数据源
    print("\n" + "="*60)
    print("示例4: 对比两个数据源")
    print("="*60)
    api.compare_sources('163406')
    
    # 示例5: 批量获取多只基金
    print("\n" + "="*60)
    print("示例5: 批量获取多只基金")
    print("="*60)
    fund_codes = ['163406', '161005', '008163']
    for code in fund_codes:
        print(f"\n--- {code} ---")
        api.get_actual_nav_eastmoney(code)


if __name__ == '__main__':
    main()
