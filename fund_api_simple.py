#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
基金净值API - 简化版
快速获取基金净值和指数数据的函数
"""

import requests
from bs4 import BeautifulSoup
import re
import json


def get_index_data(index_code, index_name=''):
    """
    获取指数数据（东方财富）
    
    参数:
        index_code: 指数代码，如 "100.NDX", "1.000300", "1.518660"
        index_name: 指数名称（可选）
    
    返回:
        成功: {
            'name': '纳斯达克100',
            'latest': 22904.58,
            'yesterday': 23256.42,
            'change': -351.84,
            'change_percent': -1.51
        }
        失败: None
    """
    try:
        url = 'http://push2.eastmoney.com/api/qt/stock/get'
        params = {
            'secid': index_code,
            'fields': 'f43,f51,f52,f58,f60'
        }
        
        response = requests.get(url, params=params, timeout=10)
        data = response.json()
        
        if data.get('rc') != 0 or not data.get('data'):
            return None
        
        index_data = data['data']
        
        # 所有价格需要除以100
        latest = index_data['f43'] / 100
        yesterday = index_data['f60'] / 100
        
        # 计算涨跌
        change = latest - yesterday
        change_percent = (change / yesterday * 100) if yesterday > 0 else 0
        
        # 获取名称
        name = index_name if index_name else index_data.get('f58', index_code)
        
        return {
            'name': name,
            'latest': latest,
            'yesterday': yesterday,
            'change': change,
            'change_percent': change_percent
        }
    except:
        return None


def get_actual_nav(fund_code):
    """
    获取最新实际净值（东方财富）
    
    参数:
        fund_code: 基金代码，如 "163406"
    
    返回:
        成功: {'nav': 2.1925, 'date': '2026-02-04', 'growth': '-0.93%'}
        失败: None
    """
    try:
        url = f'http://fund.eastmoney.com/f10/F10DataApi.aspx?type=lsjz&code={fund_code}&page=1&per=1'
        response = requests.get(url, timeout=10)
        response.encoding = 'utf-8'
        
        # 直接解析HTML，不使用JSON
        soup = BeautifulSoup(response.text, 'html.parser')
        rows = soup.select('tbody tr')
        
        if not rows:
            print(f"Debug: 没有找到表格行")
            return None
            
        cells = rows[0].find_all('td')
        
        if len(cells) < 4:
            print(f"Debug: 单元格数量不足: {len(cells)}")
            return None
        
        return {
            'nav': float(cells[1].text.strip()),
            'date': cells[0].text.strip(),
            'growth': cells[3].text.strip()
        }
    except Exception as e:
        print(f"Error: {str(e)}")
        return None


def get_estimate_nav(fund_code):
    """
    获取估算净值（天天基金）
    
    参数:
        fund_code: 基金代码，如 "163406"
    
    返回:
        成功: {
            'actual_nav': 2.2131,           # 前一日实际净值
            'actual_date': '2026-02-03',    # 前一日日期
            'estimate_nav': 2.1843,         # 实时估算净值
            'estimate_time': '2026-02-04 15:00',
            'growth': '-1.30'               # 估算涨跌幅
        }
        失败: None
    """
    try:
        url = f'https://fundgz.1234567.com.cn/js/{fund_code}.js'
        response = requests.get(url, timeout=10)
        response.encoding = 'utf-8'
        
        # 提取JSONP数据
        match = re.search(r'jsonpgz\((.*?)\);?', response.text)
        if not match:
            return None
        
        data = json.loads(match.group(1))
        
        return {
            'actual_nav': float(data.get('dwjz', 0)),
            'actual_date': data.get('jzrq', ''),
            'estimate_nav': float(data.get('gsz', 0)),
            'estimate_time': data.get('gztime', ''),
            'growth': data.get('gszzl', '')
        }
    except:
        return None


# 使用示例
if __name__ == '__main__':
    # 示例1: 获取指数数据
    print("=" * 50)
    print("【指数数据】")
    print("=" * 50)
    
    indices = [
        ('100.NDX', '纳斯达克100'),
        ('100.SPX', '标普500'),
        ('1.000300', '沪深300'),
        ('1.515100', '中证红利低波'),
        ('1.518660', '黄金ETF')
    ]
    
    for code, name in indices:
        data = get_index_data(code, name)
        if data:
            print(f"\n{data['name']}:")
            print(f"  最新价: {data['latest']:.2f}")
            print(f"  涨跌幅: {data['change_percent']:+.2f}%")
        else:
            print(f"\n{name}: 获取失败")
    
    # 示例2: 获取基金净值
    fund_code = '163406'
    
    print("\n" + "=" * 50)
    print(f"【基金代码: {fund_code}】")
    print("=" * 50)
    
    # 获取实际净值
    print("\n【东方财富 - 最新实际净值】")
    actual = get_actual_nav(fund_code)
    if actual:
        print(f"净值: {actual['nav']}")
        print(f"日期: {actual['date']}")
        print(f"涨跌: {actual['growth']}")
    else:
        print("获取失败")
    
    # 获取估算净值
    print("\n【天天基金 - 估算净值】")
    estimate = get_estimate_nav(fund_code)
    if estimate:
        print(f"前日净值: {estimate['actual_nav']} ({estimate['actual_date']})")
        print(f"估算净值: {estimate['estimate_nav']} ({estimate['estimate_time']})")
        print(f"估算涨跌: {estimate['growth']}%")
    else:
        print("获取失败")
