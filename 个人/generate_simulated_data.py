import pandas as pd
import numpy as np
import datetime
import os

# Set random seed for reproducibility
np.random.seed(42)

# File paths
input_excel = '/Users/tywong/Documents/智源/soulagent-demo/个人/四宫格原始数据新.xlsx'
output_excel = '/Users/tywong/Documents/智源/soulagent-demo/个人/三门店月度明细模拟数据.xlsx'

# Read raw data
df_raw = pd.read_excel(input_excel)
# Drop top rows that are not data
df_raw = df_raw.iloc[2:].copy()
df_raw.columns = ['产品名称', '基准月销量', '单价（元）', '成本（元）']
df_raw['基准月销量'] = pd.to_numeric(df_raw['基准月销量'])
df_raw['单价（元）'] = pd.to_numeric(df_raw['单价（元）'])
df_raw['成本（元）'] = pd.to_numeric(df_raw['成本（元）'])
df_raw = df_raw.dropna(subset=['产品名称'])

# Category Mapping (Unified 3 Categories: 招牌菜, 热菜, 主食小吃)
category_map = {
    '金牌酸菜鱼（中份）': '招牌菜',
    '叫花鸡': '招牌菜',
    '腌笃鲜': '热菜',
    '金牌酸菜鱼（小份）': '招牌菜',
    '红烧带鱼': '热菜',
    '秘制花蛤': '热菜',
    '红烧大排': '热菜',
    '蟹粉豆腐': '热菜',
    '豆腐羹': '招牌菜',
    '老鸭煲': '招牌菜',
    '椒脆藕夹': '热菜',
    '砂锅鱼头': '招牌菜',
    '酸汤冬笋': '主食小吃',
    '招牌拌饭': '主食小吃',
    '水晶肴蹄': '招牌菜',
    '百叶豆腐': '热菜',
    '酒酿圆子': '招牌菜',
    '葱油芋艿': '主食小吃',
    '红烧狮子头': '热菜',
    '蟹粉小笼': '主食小吃',
    '蒜蓉虾仁': '热菜',
    '小鸡炖蘑菇': '热菜',
    '葱油肉饼': '主食小吃',
    '片儿川': '主食小吃',
    '火爆腰花': '热菜',
    '半份酥饼': '主食小吃',
    '炒菌菇': '热菜',
    '秘制炒米': '主食小吃',
    '叫花鸡（大份）': '招牌菜',
    '红烧肉': '热菜',
    '砂锅鱼头（小份）': '招牌菜',
    '招牌酥饼': '主食小吃',
    '小酥肉': '招牌菜',
    '金牌酸菜鱼（大份）': '招牌菜',
    '冰粉': '招牌菜',
    '焗南瓜': '热菜',
    '上汤娃娃菜': '主食小吃',
    '酱香小龙虾': '招牌菜',
    '蒜香花甲': '热菜',
    '肉粉炒饭': '主食小吃',
    '每日鲜菜': '主食小吃',
    '干锅花菜': '主食小吃',
    '樱花虾莴苣': '主食小吃',
    '上汤扬州干丝': '主食小吃',
    '爽口荟萃': '热菜',
    '蒜香龙虾小': '招牌菜',
    '小龙虾（大份）': '招牌菜',
    '干煸四季豆': '主食小吃',
    '白灼芥兰': '主食小吃',
    '蒜香鸡翅': '热菜',
    '春卷': '主食小吃',
    '大米糕': '主食小吃',
    '蒜苗蚕豆': '主食小吃',
    '爆炒猪肝': '热菜',
    '醉虾': '热菜',
    '凉拌黄瓜': '热菜',
    '干贝冬瓜汤': '招牌菜',
    '松鼠鱼': '招牌菜',
    '黄花鱼': '热菜',
    '杏仁酸奶': '招牌菜',
    '美颜桃胶': '招牌菜',
    '米饭': '主食小吃'
}

df_raw['品类'] = df_raw['产品名称'].map(category_map).fillna('热菜')

# Simulation Dimensions
start_date = datetime.date(2026, 8, 1)
days_count = 31
dates = [start_date + datetime.timedelta(days=i) for i in range(days_count)]

weekday_names = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日']

stores = [
    {'name': '旗舰店', 'weight': 0.45},
    {'name': '商业街店', 'weight': 0.35},
    {'name': '社区店', 'weight': 0.20}
]

channels = [
    {'name': '堂食', 'weight': 0.50},
    {'name': '美团外卖', 'weight': 0.30},
    {'name': '饿了么外卖', 'weight': 0.15},
    {'name': '自提/团购', 'weight': 0.05}
]

rows = []

for d in dates:
    weekday_idx = d.weekday()
    weekday_str = weekday_names[weekday_idx]
    
    # Weekday factor
    if weekday_idx in [5, 6]: # Weekend
        day_factor = 1.30
    elif weekday_idx == 4: # Friday
        day_factor = 1.10
    else:
        day_factor = 0.85
        
    for store in stores:
        for channel in channels:
            for _, item in df_raw.iterrows():
                base_monthly = item['基准月销量']
                price = item['单价（元）']
                cost = item['成本（元）']
                sku = item['产品名称']
                cat = item['品类']
                
                # Daily expected mean sales volume
                expected_daily = (base_monthly / 31.0) * store['weight'] * channel['weight'] * day_factor
                
                # Draw from Poisson distribution for natural integer sales count
                qty = np.random.poisson(lam=expected_daily)
                
                # Only record if qty > 0 to keep dataset clean, or record all?
                # Usually in restaurant POS data, daily sales transactions are recorded when qty > 0.
                if qty > 0:
                    revenue = round(qty * price, 2)
                    total_cost = round(qty * cost, 2)
                    gross_profit = round(revenue - total_cost, 2)
                    
                    rows.append({
                        '日期': d.strftime('%Y-%m-%d'),
                        '星期': weekday_str,
                        '门店': store['name'],
                        '渠道': channel['name'],
                        '品类': cat,
                        '产品名称': sku,
                        '单价（元）': price,
                        '成本（元）': cost,
                        '销量': qty,
                        '销售额（元）': revenue,
                        '总成本（元）': total_cost,
                        '毛利（元）': gross_profit
                    })

df_sim = pd.DataFrame(rows)

print(f"Total generated records count: {len(df_sim)}")
print(f"Total sales volume: {df_sim['销量'].sum()}")
print(f"Total revenue: {df_sim['销售额（元）'].sum():,.2f}")
print(f"Total gross profit: {df_sim['毛利（元）'].sum():,.2f}")

# Export to Excel
df_sim.to_excel(output_excel, index=False, engine='openpyxl')
print(f"Successfully saved to {output_excel}")

# Export to JSON
base_dir = os.path.dirname(os.path.abspath(__file__))
json_output = os.path.join(base_dir, 'dashboard_data.json')
import json
records = df_sim.to_dict(orient='records')
with open(json_output, 'w', encoding='utf-8') as f:
    json.dump(records, f, ensure_ascii=False, indent=2)
print(f"Successfully saved to {json_output}")

# Export to JS (window.RAW_DATA format: ["日期", "门店", "渠道", "品类", "产品名称", 销量, 毛利, 销售额, 总成本])
js_output = os.path.join(base_dir, 'dashboard_data.js')
raw_data_array = []
for r in records:
    raw_data_array.append([
        r['日期'],
        r['门店'],
        r['渠道'],
        r['品类'],
        r['产品名称'],
        r['销量'],
        r['毛利（元）'],
        r['销售额（元）'],
        r['总成本（元）']
    ])

with open(js_output, 'w', encoding='utf-8') as f:
    f.write('window.RAW_DATA = ' + json.dumps(raw_data_array, ensure_ascii=False) + ';')
print(f"Successfully saved to {js_output}")
