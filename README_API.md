# 基金净值API使用说明

## 📦 安装依赖

```bash
pip install requests beautifulsoup4
```

## 🚀 快速开始

### 方式1: 使用简化版（推荐新手）

```python
from fund_api_simple import get_actual_nav, get_estimate_nav, get_index_data

# 获取指数数据
result = get_index_data('100.NDX', '纳斯达克100')
print(f"最新价: {result['latest']}, 涨跌幅: {result['change_percent']}%")

# 获取最新实际净值
result = get_actual_nav('163406')
print(f"净值: {result['nav']}, 日期: {result['date']}")

# 获取估算净值
result = get_estimate_nav('163406')
print(f"估算净值: {result['estimate_nav']}")
```

### 方式2: 使用完整版（功能更丰富）

```python
from fund_api import FundAPI

api = FundAPI()

# 获取指数数据
result = api.get_index_data('100.NDX', '纳斯达克100')

# 获取实际净值
result = api.get_actual_nav_eastmoney('163406')

# 获取估算净值
result = api.get_estimate_nav_ttfund('163406')

# 对比两个数据源
api.compare_sources('163406')
```

---

## 📡 接口1: 东方财富指数数据

### 函数签名
```python
get_index_data(index_code: str, index_name: str = '') -> dict
```

### 参数
- `index_code`: 指数代码，格式如 `"100.NDX"`, `"1.000300"`, `"1.518660"`
- `index_name`: 指数名称（可选）

### 返回值
```python
{
    'name': '纳斯达克100',
    'latest': 22904.58,         # 最新价
    'yesterday': 23256.42,      # 昨收价
    'change': -351.84,          # 涨跌额
    'change_percent': -1.51     # 涨跌幅
}
```

### 常用指数代码
| 指数名称 | 代码 |
|---------|------|
| 纳斯达克100 | `100.NDX` |
| 标普500 | `100.SPX` |
| 沪深300 | `1.000300` |
| 上证指数 | `1.000001` |
| 中证红利低波 | `1.515100` |
| 黄金ETF | `1.518660` |

### 使用示例
```python
# 获取纳斯达克100指数
result = get_index_data('100.NDX', '纳斯达克100')
if result:
    print(f"{result['name']}")
    print(f"最新价: {result['latest']:.2f}")
    print(f"涨跌幅: {result['change_percent']:+.2f}%")

# 批量获取多个指数
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
        print(f"{data['name']}: {data['latest']:.2f} ({data['change_percent']:+.2f}%)")
```

---

## 📡 接口2: 东方财富实际净值

### 函数签名
```python
get_actual_nav(fund_code: str) -> dict
```

### 参数
- `fund_code`: 基金代码（6位数字），如 `"163406"`

### 返回值
```python
{
    'nav': 2.1925,              # 单位净值
    'date': '2026-02-04',       # 净值日期
    'growth': '-0.93%'          # 日增长率
}
```

### 特点
- ✅ 获取**最新实际净值**（基金公司已公布）
- ✅ 晚上8点后可获取当日净值
- ✅ 数据最准确
- ⏰ 更新时间: 交易日晚上 18:00-22:00

### 使用示例
```python
result = get_actual_nav('163406')
if result:
    print(f"兴全合润混合A")
    print(f"净值: {result['nav']}")
    print(f"日期: {result['date']}")
    print(f"涨跌: {result['growth']}")
```

---

## 📡 接口3: 天天基金估算净值

### 函数签名
```python
get_estimate_nav(fund_code: str) -> dict
```

### 参数
- `fund_code`: 基金代码（6位数字），如 `"163406"`

### 返回值
```python
{
    'actual_nav': 2.2131,                   # 前一日实际净值
    'actual_date': '2026-02-03',            # 前一日日期
    'estimate_nav': 2.1843,                 # 实时估算净值
    'estimate_time': '2026-02-04 15:00',    # 估值时间
    'growth': '-1.30'                       # 估算涨跌幅
}
```

### 特点
- 🟠 提供**实时估算净值**（交易时间内）
- 🟠 前一日实际净值
- ⏰ 更新时间: 交易日 9:30-15:00 实时更新
- ⚠️ 无法获取当日实际净值

### 使用示例
```python
result = get_estimate_nav('163406')
if result:
    print(f"前日净值: {result['actual_nav']} ({result['actual_date']})")
    print(f"估算净值: {result['estimate_nav']}")
    print(f"估算涨跌: {result['growth']}%")
```

---

## 🎯 使用场景

### 场景1: 获取全球市场指数
```python
# 获取多个指数数据
indices = [
    ('100.NDX', '纳斯达克100'),
    ('100.SPX', '标普500'),
    ('1.000300', '沪深300')
]

for code, name in indices:
    result = get_index_data(code, name)
    if result:
        print(f"{result['name']}: {result['latest']:.2f} ({result['change_percent']:+.2f}%)")
```

### 场景2: 晚上查看当日实际净值
```python
# 推荐使用东方财富接口
result = get_actual_nav('163406')
print(f"今日净值: {result['nav']}")
```

### 场景3: 交易时间查看实时涨跌
```python
# 推荐使用天天基金接口
result = get_estimate_nav('163406')
print(f"实时估算: {result['estimate_nav']}")
print(f"涨跌幅: {result['growth']}%")
```

### 场景4: 批量获取多只基金
```python
fund_codes = ['163406', '161005', '008163', '217022']

for code in fund_codes:
    result = get_actual_nav(code)
    if result:
        print(f"{code}: {result['nav']} ({result['date']})")
```

### 场景5: 对比实际净值和估算净值
```python
actual = get_actual_nav('163406')
estimate = get_estimate_nav('163406')

print(f"实际净值: {actual['nav']}")
print(f"估算净值: {estimate['estimate_nav']}")
print(f"差异: {abs(actual['nav'] - estimate['estimate_nav']):.4f}")
```

---

## 📊 接口对比

| 特性 | 指数接口 | 东方财富接口 | 天天基金接口 |
|------|---------|------------|------------|
| 数据类型 | 指数行情 📊 | 实际净值 ✅ | 估算净值 🟠 |
| 当日数据 | 实时 ✅ | 晚上可获取 ✅ | 无法获取 ❌ |
| 实时性 | 实时 ✅ | 晚上更新 | 交易时间实时 ✅ |
| 准确性 | 实时行情 ✅ | 最准确 ✅ | 估算值 |
| 更新时间 | 交易时间实时 | 18:00-22:00 | 9:30-15:00 |
| 推荐场景 | 查看市场行情 | 晚上查看当日净值 | 交易时间看涨跌 |

---

## ⚠️ 注意事项

1. **请求频率**: 建议每次请求间隔 300ms 以上，避免被限流
2. **节假日**: 非交易日返回最近一个交易日的净值
3. **更新时间**: 
   - 东方财富: 晚上 18:00-22:00 陆续更新
   - 天天基金: 交易日 9:30-15:00 实时更新
4. **错误处理**: 两个函数失败时都返回 `None`，请做好异常处理

---

## 🔧 完整示例

```python
#!/usr/bin/env python3
from fund_api_simple import get_actual_nav, get_estimate_nav
import time

def monitor_fund(fund_code, interval=60):
    """
    监控基金净值变化
    
    Args:
        fund_code: 基金代码
        interval: 刷新间隔（秒）
    """
    print(f"开始监控基金 {fund_code}，每 {interval} 秒刷新一次")
    print("按 Ctrl+C 停止监控\n")
    
    try:
        while True:
            # 获取估算净值
            estimate = get_estimate_nav(fund_code)
            
            if estimate:
                print(f"[{estimate['estimate_time']}]")
                print(f"  估算净值: {estimate['estimate_nav']}")
                print(f"  涨跌幅: {estimate['growth']}%")
                print("-" * 50)
            
            time.sleep(interval)
            
    except KeyboardInterrupt:
        print("\n监控已停止")

if __name__ == '__main__':
    # 监控兴全合润混合A
    monitor_fund('163406', interval=60)
```

---

## 📝 更多示例

查看 `fund_api.py` 中的 `main()` 函数，包含更多使用示例。

运行完整示例：
```bash
python fund_api.py
```

运行简化示例：
```bash
python fund_api_simple.py
```

---

## 🤝 贡献

如有问题或建议，欢迎提出！
