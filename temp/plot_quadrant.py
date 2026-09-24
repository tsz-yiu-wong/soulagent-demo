import os
import sys
import openpyxl
import matplotlib.pyplot as plt
import warnings
warnings.filterwarnings('ignore', category=UserWarning)

# 1. 字体与样式配置（完美支持 macOS 和 Windows 中文字体显示）
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
plt.rcParams['font.sans-serif'] = ['PingFang SC', 'STHeiti', 'Heiti TC', 'Arial Unicode MS', 'SimHei', 'Microsoft YaHei']
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['axes.unicode_minus'] = False

def load_data(file_path):
    """读取 Excel 文件，计算毛利率并进行销量与毛利率排名"""
    wb = openpyxl.load_workbook(file_path)
    sheet = wb.active
    rows = list(sheet.iter_rows(values_only=True))

    data = []
    start_row = 0
    for idx, row in enumerate(rows):
        if row and row[0] == '产品名称':
            start_row = idx + 1
            break
    
    for row in rows[start_row:]:
        if not row or row[0] is None or row[0] == '产品名称':
            continue
        try:
            name = str(row[0]).strip()
            sales = float(row[1]) if row[1] is not None else 0.0
            price = float(row[2]) if row[2] is not None else 0.0
            cost = float(row[3]) if row[3] is not None else 0.0
            
            # 毛利率 = (单价 - 成本) / 单价
            gross_margin = (price - cost) / price if price > 0 else 0.0
            
            data.append({
                'name': name,
                'sales': sales,
                'price': price,
                'cost': cost,
                'gross_margin': gross_margin
            })
        except (ValueError, TypeError):
            continue

    n = len(data)
    if n == 0:
        return data

    # 1. 计算销量排名 (1 ~ N)
    sorted_by_sales = sorted(enumerate(data), key=lambda x: x[1]['sales'])
    for rank, (orig_idx, _) in enumerate(sorted_by_sales, 1):
        data[orig_idx]['sales_rank'] = rank

    # 2. 计算毛利率排名 (1 ~ N)
    sorted_by_margin = sorted(enumerate(data), key=lambda x: x[1]['gross_margin'])
    for rank, (orig_idx, _) in enumerate(sorted_by_margin, 1):
        data[orig_idx]['margin_rank'] = rank

    return data

def format_num(val):
    """格式化显示数字"""
    s = f"{val:.1f}"
    return s[:-2] if s.endswith('.0') else s

def plot_ranking_quadrant(data, output_path='四宫格矩阵图_销量排名_毛利率排名.png'):
    """
    绘制极简、无遮挡、背景带透明大字的销量排名 - 毛利率排名四宫格分析图
    """
    if not data:
        print("错误：数据为空！")
        return

    n = len(data)
    x = [d['sales_rank'] for d in data]
    y = [d['margin_rank'] for d in data]

    # 坐标范围与分割线
    x_min, x_max = 0, n + 1
    y_min, y_max = 0, n + 1
    x_split = (n + 1) / 2.0
    y_split = (n + 1) / 2.0

    # 创建 26 x 16 英寸超高清画布 (7800 x 4800 px)
    fig, ax = plt.subplots(figsize=(26, 16), dpi=300)

    # 绘制四宫格背景色
    # Q1 (右上)：明星区 (绿色)
    ax.fill_between([x_split, x_max], y_split, y_max, color='#E8F5E9', alpha=0.5)
    # Q2 (左上)：高潜区 (黄色)
    ax.fill_between([x_min, x_split], y_split, y_max, color='#FFF8E1', alpha=0.5)
    # Q3 (左下)：瘦狗区 (红色)
    ax.fill_between([x_min, x_split], y_min, y_split, color='#FFEBEE', alpha=0.5)
    # Q4 (右下)：引流区 (蓝色)
    ax.fill_between([x_split, x_max], y_min, y_split, color='#E1F5FE', alpha=0.5)

    # 直接在四个象限背景正中央加入半透明大字背景水印说明
    ax.text((x_split + x_max) / 2.0, (y_split + y_max) / 2.0, '明星区',
            fontsize=46, fontweight='bold', color='#2E7D32', alpha=0.22,
            ha='center', va='center', zorder=1)

    ax.text((x_min + x_split) / 2.0, (y_split + y_max) / 2.0, '高潜区',
            fontsize=46, fontweight='bold', color='#D77F00', alpha=0.22,
            ha='center', va='center', zorder=1)

    ax.text((x_min + x_split) / 2.0, (y_min + y_split) / 2.0, '瘦狗区',
            fontsize=46, fontweight='bold', color='#C62828', alpha=0.22,
            ha='center', va='center', zorder=1)

    ax.text((x_split + x_max) / 2.0, (y_min + y_split) / 2.0, '引流区',
            fontsize=46, fontweight='bold', color='#1565C0', alpha=0.22,
            ha='center', va='center', zorder=1)

    # 绘制数据散点
    ax.scatter(x, y, color='#1565C0', alpha=0.85, edgecolors='#0D47A1', linewidths=1.5, s=110, zorder=4)

    # 绘制分割虚线
    ax.axvline(x=x_split, color='#D32F2F', linestyle='--', linewidth=2.0, zorder=3)
    ax.axhline(y=y_split, color='#D32F2F', linestyle='--', linewidth=2.0, zorder=3)

    # 避让与碰撞检测算法
    candidate_offsets = [
        (10, 10), (-14, 12), (12, -14), (-16, -14),
        (14, 4), (-18, 4), (4, 14), (4, -16),
        (16, 16), (-20, -10), (10, -18), (-14, 18),
        (18, -6), (-22, 8), (6, -20), (-8, -20),
        (22, 10), (-24, -12), (20, -16), (-22, 18)
    ]

    placed_positions = []

    for i, d in enumerate(data):
        px, py = x[i], y[i]
        name = d['name']
        sales_str = str(int(d['sales']))
        margin_pct = d['gross_margin'] * 100
        margin_str = format_num(margin_pct)
        
        # 标签格式：炒菌菇（销量352，毛利率26.5%）
        label_text = f"{name}（销量{sales_str}，毛利率{margin_str}%）"

        best_offset = candidate_offsets[0]
        min_conflict = float('inf')
        for dx, dy in candidate_offsets:
            tx, ty = px + dx * 0.35, py + dy * 0.35
            conflict = 0
            for rx, ry in placed_positions:
                dist_sq = (tx - rx) ** 2 + (ty - ry) ** 2
                if dist_sq < 3.0:
                    conflict += 1
            if conflict == 0:
                best_offset = (dx, dy)
                break
            elif conflict < min_conflict:
                min_conflict = conflict
                best_offset = (dx, dy)

        dx, dy = best_offset
        placed_positions.append((px + dx * 0.35, py + dy * 0.35))

        ax.annotate(
            label_text, 
            (px, py), 
            xytext=(dx, dy), 
            textcoords='offset points',
            fontsize=9.0,
            fontweight='medium',
            color='#111111',
            arrowprops=dict(arrowstyle='-', color='#999999', linewidth=0.6, alpha=0.6),
            bbox=dict(boxstyle='round,pad=0.25', facecolor='white', alpha=0.85, edgecolor='#E0E0E0', linewidth=0.6),
            zorder=5
        )

    # 坐标轴与标题
    ax.set_title('产品销量排名 - 毛利率排名四宫格分析图', fontsize=20, fontweight='bold', pad=20)
    ax.set_xlabel('销量排名', fontsize=14, labelpad=12, fontweight='bold')
    ax.set_ylabel('毛利率排名', fontsize=14, labelpad=12, fontweight='bold')
    ax.set_xlim(x_min, x_max)
    ax.set_ylim(y_min, y_max)
    ax.tick_params(axis='both', which='major', labelsize=11)
    ax.grid(True, linestyle=':', alpha=0.6, zorder=1)

    plt.tight_layout()
    plt.savefig(output_path, dpi=300)
    plt.close()
    print(f"图表已成功保存至: {output_path}")

if __name__ == '__main__':
    base_dir = os.path.dirname(os.path.abspath(__file__))
    excel_path = os.path.join(base_dir, '四宫格原始数据新.xlsx')

    if not os.path.exists(excel_path):
        print(f"错误: 找不到文件 {excel_path}")
        sys.exit(1)

    print("读取 Excel 数据...")
    data = load_data(excel_path)
    print(f"共解析出 {len(data)} 条有效数据。")

    output_path = os.path.join(base_dir, '四宫格矩阵图_销量排名_毛利率排名.png')
    plot_ranking_quadrant(data, output_path=output_path)
