#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
说话人语句聚类准确率评估脚本
Evaluation Script for Speaker Diarization / Sentence Clustering Accuracy

该脚本对比标注文件（Ground Truth）与 ASR 模型转录聚类文件（ASR Diarization）：
1. 自动提取并对齐说话人文本段落（忽略错别字与标点符号差异，仅关注说话人聚类）。
2. 计算聚类映射矩阵（Diarized Cluster <-> Ground Truth Speaker）。
3. 评估指标包括：聚类纯度 (Purity)、覆盖率 (Coverage/Recall)、DER (说话人聚类错误率)、F1值、说话人转换边界准确率。
4. 输出误聚类段落的具体时间戳、模型标签、实际说话人及文本内容。
"""

import sys
import os
import zipfile
import re
import argparse
import json
import xml.etree.ElementTree as ET
from difflib import SequenceMatcher
from collections import defaultdict, Counter


def read_docx(path):
    """从 docx 文件中提取段落文本 (无需安装 python-docx)"""
    if not os.path.exists(path):
        raise FileNotFoundError(f"文件不存在: {path}")
    with zipfile.ZipFile(path) as z:
        xml_content = z.read('word/document.xml')
        root = ET.fromstring(xml_content)
        texts = []
        for p in root.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
            t = ''.join([node.text for node in p.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t') if node.text])
            if t.strip():
                texts.append(t.strip())
        return texts


def parse_ground_truth(lines):
    """解析 Ground Truth 文档 (包含 [说话人]: [文本] 的段落)"""
    gt_blocks = []
    current_speaker = None
    current_text = []

    for line in lines:
        m = re.match(r'^([^：:]{1,30})[：:](.*)', line)
        if m:
            if current_speaker:
                gt_blocks.append({
                    'speaker': current_speaker,
                    'text': '\n'.join(current_text)
                })
            current_speaker = m.group(1).strip()
            current_text = [m.group(2).strip()]
        else:
            if current_speaker:
                current_text.append(line.strip())

    if current_speaker:
        gt_blocks.append({
            'speaker': current_speaker,
            'text': '\n'.join(current_text)
        })

    return gt_blocks


def parse_asr_diarization(lines):
    """解析 ASR 转录 Diarization 文档 (格式如 [0.03][S01]正文[2.32])"""
    asr_segs = []
    current_section = "默认章节"

    for i, line in enumerate(lines):
        line_str = line.strip()
        # 章节检测
        if re.match(r'^\d+\.\s*圆桌', line_str):
            current_section = line_str

        m = re.match(r'^\[(\d+\.\d+)\]\[(S\d+)\](.*?)\[(\d+\.\d+)\]$', line_str)
        if m:
            start_t = float(m.group(1))
            spk_tag = m.group(2)
            text_content = m.group(3).strip()
            end_t = float(m.group(4))
            asr_segs.append({
                'id': len(asr_segs),
                'line_num': i,
                'section': current_section,
                'start': start_t,
                'end': end_t,
                'duration': round(end_t - start_t, 2),
                'speaker': spk_tag,
                'text': text_content
            })

    return asr_segs


def normalize_text(text):
    """归一化文本（保留中文字符、英文字母及数字，转小写），过滤标点符号与错别字影响"""
    return re.sub(r'[^\w]', '', text).lower()


def align_asr_with_gt(gt_blocks, asr_segs):
    """利用最长公共子序列/全局序列对齐，将每一个 ASR 语句映射到对应的真实说话人"""
    # 构造 GT 字符序列及映射
    gt_full_chars = []
    gt_char_to_speaker = []

    for b in gt_blocks:
        cleaned = normalize_text(b['text'])
        for ch in cleaned:
            gt_char_to_speaker.append(b['speaker'])
            gt_full_chars.append(ch)

    full_gt_str = ''.join(gt_full_chars)

    # 构造 ASR 字符序列及映射
    asr_full_chars = []
    asr_char_to_seg = []

    for seg in asr_segs:
        cleaned = normalize_text(seg['text'])
        for ch in cleaned:
            asr_char_to_seg.append(seg['id'])
            asr_full_chars.append(ch)

    full_asr_str = ''.join(asr_full_chars)

    # 序列匹配
    sm = SequenceMatcher(None, full_asr_str, full_gt_str)
    matching_blocks = sm.get_matching_blocks()

    seg_gt_counts = [defaultdict(int) for _ in range(len(asr_segs))]
    for b in matching_blocks:
        asr_idx, gt_idx, length = b.a, b.b, b.size
        for i in range(length):
            s_id = asr_char_to_seg[asr_idx + i]
            spk = gt_char_to_speaker[gt_idx + i]
            seg_gt_counts[s_id][spk] += 1

    # 为每个 ASR 语句赋予匹配数最多的 GT 说话人
    for seg in asr_segs:
        counts = seg_gt_counts[seg['id']]
        if counts:
            best_spk = max(counts.items(), key=lambda x: x[1])[0]
            seg['gt_speaker'] = best_spk
        else:
            seg['gt_speaker'] = None

    # 对未对齐的短短句（如语气词、对答）进行邻近插值
    for idx in range(len(asr_segs)):
        if asr_segs[idx]['gt_speaker'] is None:
            prev_spk = asr_segs[idx - 1]['gt_speaker'] if idx > 0 else None
            next_spk = asr_segs[idx + 1]['gt_speaker'] if idx < len(asr_segs) - 1 else None
            if prev_spk and prev_spk == next_spk:
                asr_segs[idx]['gt_speaker'] = prev_spk
            elif prev_spk:
                asr_segs[idx]['gt_speaker'] = prev_spk
            elif next_spk:
                asr_segs[idx]['gt_speaker'] = next_spk
            else:
                asr_segs[idx]['gt_speaker'] = "未知"

    return asr_segs, len(full_gt_str), len(full_asr_str)


def compute_metrics(asr_segs):
    """计算说话人聚类的各项指标 (Purity, DER, Precision, Recall, F1, Matrix)"""
    # 统计 聚类簇(S0X) 与 真实说话人 的映射矩阵
    matrix_count = defaultdict(lambda: defaultdict(int))
    matrix_chars = defaultdict(lambda: defaultdict(int))
    matrix_duration = defaultdict(lambda: defaultdict(float))

    cluster_total_chars = defaultdict(int)
    cluster_total_segs = defaultdict(int)
    gt_total_chars = defaultdict(int)
    gt_total_segs = defaultdict(int)

    for seg in asr_segs:
        c_tag = seg['speaker']
        g_spk = seg['gt_speaker']
        c_len = len(normalize_text(seg['text']))
        dur = seg['duration']

        matrix_count[c_tag][g_spk] += 1
        matrix_chars[c_tag][g_spk] += c_len
        matrix_duration[c_tag][g_spk] += dur

        cluster_total_chars[c_tag] += c_len
        cluster_total_segs[c_tag] += 1
        gt_total_chars[g_spk] += c_len
        gt_total_segs[g_spk] += 1

    # 贪心最佳映射 (Cluster -> Primary Ground Truth Speaker)
    cluster_to_gt = {}
    used_gt = set()

    # 按字符数从大到小排序聚类簇进行主说话人绑定
    for c_tag in sorted(cluster_total_chars.keys(), key=lambda x: cluster_total_chars[x], reverse=True):
        candidates = sorted(matrix_chars[c_tag].items(), key=lambda x: x[1], reverse=True)
        assigned = False
        for g_spk, count in candidates:
            if g_spk not in used_gt:
                cluster_to_gt[c_tag] = g_spk
                used_gt.add(g_spk)
                assigned = True
                break
        if not assigned and candidates:
            # 若 GT 说话人已被绑定，绑定最频繁的候选
            cluster_to_gt[c_tag] = candidates[0][0]

    # 计算各簇的纯度 (Purity) 与 各说话人的覆盖率 (Coverage)
    correct_segs = 0
    correct_chars = 0
    total_segs = len(asr_segs)
    total_chars = sum(len(normalize_text(s['text'])) for s in asr_segs)

    misclustered_segments = []

    for seg in asr_segs:
        c_tag = seg['speaker']
        mapped_gt = cluster_to_gt.get(c_tag, "未知")
        actual_gt = seg['gt_speaker']
        c_len = len(normalize_text(seg['text']))

        if mapped_gt == actual_gt:
            correct_segs += 1
            correct_chars += c_len
        else:
            misclustered_segments.append({
                'id': seg['id'],
                'start': seg['start'],
                'end': seg['end'],
                'cluster': c_tag,
                'mapped_speaker': mapped_gt,
                'actual_speaker': actual_gt,
                'text': seg['text']
            })

    # 计算 DER (Diarization Error Rate)
    der_chars = (total_chars - correct_chars) / max(1, total_chars) * 100.0
    der_segs = (total_segs - correct_segs) / max(1, total_segs) * 100.0

    # 说话人转换点（Speaker Turn Change）边界匹配率
    gt_turns = 0
    matched_turns = 0
    for i in range(1, len(asr_segs)):
        prev_seg = asr_segs[i - 1]
        curr_seg = asr_segs[i]
        
        # 实际说话人发生切换
        if prev_seg['gt_speaker'] != curr_seg['gt_speaker']:
            gt_turns += 1
            # 模型也预测了切换
            if prev_seg['speaker'] != curr_seg['speaker']:
                matched_turns += 1

    turn_accuracy = (matched_turns / gt_turns * 100.0) if gt_turns > 0 else 100.0

    # 详细说话人性能指标
    speaker_stats = {}
    all_speakers = set(gt_total_chars.keys()) | set(cluster_to_gt.values())

    for spk in all_speakers:
        # 该说话人对应的簇
        matched_clusters = [c for c, g in cluster_to_gt.items() if g == spk]
        tp_chars = sum(matrix_chars[c][spk] for c in matched_clusters)
        fp_chars = sum(cluster_total_chars[c] for c in matched_clusters) - tp_chars
        fn_chars = gt_total_chars[spk] - tp_chars

        precision = (tp_chars / (tp_chars + fp_chars)) if (tp_chars + fp_chars) > 0 else 0.0
        recall = (tp_chars / (tp_chars + fn_chars)) if (tp_chars + fn_chars) > 0 else 0.0
        f1 = (2 * precision * recall / (precision + recall)) if (precision + recall) > 0 else 0.0

        speaker_stats[spk] = {
            'clusters': matched_clusters,
            'total_gt_chars': gt_total_chars[spk],
            'total_gt_segs': gt_total_segs[spk],
            'tp_chars': tp_chars,
            'precision': precision * 100.0,
            'recall': recall * 100.0,
            'f1': f1 * 100.0
        }

    return {
        'total_segs': total_segs,
        'correct_segs': correct_segs,
        'seg_accuracy': (correct_segs / total_segs * 100.0) if total_segs > 0 else 0.0,
        'total_chars': total_chars,
        'correct_chars': correct_chars,
        'char_accuracy': (correct_chars / total_chars * 100.0) if total_chars > 0 else 0.0,
        'der_chars': der_chars,
        'der_segs': der_segs,
        'gt_turns': gt_turns,
        'matched_turns': matched_turns,
        'turn_accuracy': turn_accuracy,
        'cluster_to_gt': cluster_to_gt,
        'matrix_chars': matrix_chars,
        'matrix_count': matrix_count,
        'speaker_stats': speaker_stats,
        'misclustered_segments': misclustered_segments
    }


def generate_report(gt_path, asr_path, metrics, output_file=None):
    """生成 Markdown 评估报告"""
    lines = []
    lines.append("# 说话人语句聚类准确率评估报告\n")
    lines.append(f"- **标注文件 (Ground Truth)**: `{os.path.basename(gt_path)}`")
    lines.append(f"- **模型转录文件 (ASR Diarization)**: `{os.path.basename(asr_path)}`\n")

    lines.append("## 1. 核心指标汇总 (Overall Metrics)\n")
    lines.append("| 评估指标 | 统计数值 | 说明 |")
    lines.append("|---|---|---|")
    lines.append(f"| **语句聚类准确率 (Segment Accuracy)** | **{metrics['seg_accuracy']:.2f}%** | 正确聚类的语句数 ({metrics['correct_segs']} / {metrics['total_segs']}) |")
    lines.append(f"| **字符级聚类纯度 (Character Accuracy)** | **{metrics['char_accuracy']:.2f}%** | 正确聚类的字符数 ({metrics['correct_chars']} / {metrics['total_chars']}) |")
    lines.append(f"| **说话人聚类错误率 (DER / Diarization Error)** | **{metrics['der_chars']:.2f}%** | 按字符数计算的说话人识别错误占比 |")
    lines.append(f"| **说话人切换点匹配率 (Turn Boundary Accuracy)** | **{metrics['turn_accuracy']:.2f}%** | 正确识别说话人交替切换边界 ({metrics['matched_turns']} / {metrics['gt_turns']}) |")
    lines.append("\n---\n")

    lines.append("## 2. 聚类簇与真实说话人最佳映射关系 (Cluster Mapping)\n")
    lines.append("| Diarization 聚类簇 | 绑定真实说话人 | 簇内总语句数 | 簇内匹配字符数 / 总字符数 | 簇纯度 (Purity) |")
    lines.append("|---|---|---|---|---|")

    matrix_chars = metrics['matrix_chars']
    matrix_count = metrics['matrix_count']

    for c_tag, spk in sorted(metrics['cluster_to_gt'].items()):
        total_c = sum(matrix_chars[c_tag].values())
        matched_c = matrix_chars[c_tag][spk]
        purity = (matched_c / total_c * 100.0) if total_c > 0 else 0.0
        seg_cnt = sum(matrix_count[c_tag].values())
        lines.append(f"| `{c_tag}` | **{spk}** | {seg_cnt} | {matched_c} / {total_c} | {purity:.2f}% |")

    lines.append("\n---\n")

    lines.append("## 3. 各说话人分类性能指标 (Per-Speaker Metrics)\n")
    lines.append("| 真实说话人 | 对应聚类簇 | GT总字符数 | 查准率 (Precision) | 查全率/覆盖率 (Recall) | F1 值 |")
    lines.append("|---|---|---|---|---|---|")

    for spk, stats in sorted(metrics['speaker_stats'].items(), key=lambda x: x[1]['total_gt_chars'], reverse=True):
        clusters_str = ", ".join(f"`{c}`" for c in stats['clusters']) if stats['clusters'] else "无"
        lines.append(f"| **{spk}** | {clusters_str} | {stats['total_gt_chars']} | {stats['precision']:.2f}% | {stats['recall']:.2f}% | **{stats['f1']:.2f}%** |")

    lines.append("\n---\n")

    lines.append("## 4. 误聚类语句明细 (Misclustered Segments Log)\n")
    mis_segs = metrics['misclustered_segments']
    if not mis_segs:
        lines.append("> ✅ 未发现误聚类语句，所有说话人聚类完全准确！\n")
    else:
        lines.append(f"共发现 **{len(mis_segs)}** 处误聚类语句段落：\n")
        lines.append("| 时间戳 (秒) | 模型预测簇 (映射说话人) | 实际说话人 (Ground Truth) | 转录语句内容 |")
        lines.append("|---|---|---|---|")
        for seg in mis_segs:
            time_str = f"`[{seg['start']:.2f}s - {seg['end']:.2f}s]`"
            pred_str = f"`{seg['cluster']}` ({seg['mapped_speaker']})"
            actual_str = f"**{seg['actual_speaker']}**"
            text_str = seg['text'].replace('\n', ' ')
            lines.append(f"| {time_str} | {pred_str} | {actual_str} | {text_str} |")

    report_text = "\n".join(lines)

    if output_file:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(report_text)
        print(f"\n[✓] 评估报告已成功保存至: {output_file}")

    return report_text


def main():
    parser = argparse.ArgumentParser(description="说话人语句聚类准确率评估工具")
    parser.add_argument("--gt", type=str, default="/Users/baai/Library/Mobile Documents/com~apple~CloudDocs/Documents/智源/soulagent-component-demo/temp/2025圆桌_具身智能.docx", help="标注文件 (GT docx) 路径")
    parser.add_argument("--asr", type=str, default="/Users/baai/Library/Mobile Documents/com~apple~CloudDocs/Documents/智源/soulagent-component-demo/temp/ASR转录 MOSS-Transcribe-Diarize模型.docx", help="ASR聚类文件 (ASR docx) 路径")
    parser.add_argument("--output", type=str, default=None, help="输出报告文件 (.md) 路径")
    parser.add_argument("--section", type=str, default="1", help="针对多章节文件，指定选择的章节 (默认为 1)")

    args = parser.parse_args()

    print("==================================================")
    print("      说话人语句聚类准确率评估工具               ")
    print("==================================================")
    print(f"标注文件 GT : {args.gt}")
    print(f"模型文件 ASR: {args.asr}")

    # 1. 读取文件
    gt_lines = read_docx(args.gt)
    asr_lines = read_docx(args.asr)

    # 2. 解析段落
    gt_blocks = parse_ground_truth(gt_lines)
    all_asr_segs = parse_asr_diarization(asr_lines)

    # 如果 ASR 包含多个章节（如 1. 圆桌-智源... 2. 圆桌-技术...），默认使用第 1 章节匹配
    if args.section == "1":
        asr_segs = [s for s in all_asr_segs if "1." in s['section'] or s['section'] == "默认章节"]
        if not asr_segs:
            asr_segs = all_asr_segs[:313] # fallback
    else:
        asr_segs = all_asr_segs

    print(f"提取标注讲话块 (GT Blocks): {len(gt_blocks)} 个")
    print(f"提取转录时间段 (ASR Segments): {len(asr_segs)} 个")

    # 3. 序列对齐
    asr_segs, gt_char_len, asr_char_len = align_asr_with_gt(gt_blocks, asr_segs)

    # 4. 计算指标
    metrics = compute_metrics(asr_segs)

    # 5. 输出控制台摘要
    print("\n---------------- Metrics Summary ----------------")
    print(f"语句聚类准确率 (Segment Accuracy) : {metrics['seg_accuracy']:.2f}% ({metrics['correct_segs']}/{metrics['total_segs']})")
    print(f"字符级聚类纯度 (Character Accuracy): {metrics['char_accuracy']:.2f}% ({metrics['correct_chars']}/{metrics['total_chars']})")
    print(f"说话人聚类错误率 (DER Error Rate)  : {metrics['der_chars']:.2f}%")
    print(f"说话人切换边界匹配率 (Turn Acc)    : {metrics['turn_accuracy']:.2f}% ({metrics['matched_turns']}/{metrics['gt_turns']})")

    # 6. 生成详细报告
    default_report_path = os.path.join(os.path.dirname(args.gt), "说话人聚类准确率评估报告.md")
    out_path = args.output if args.output else default_report_path
    report = generate_report(args.gt, args.asr, metrics, out_path)

    print("\n---------------- Report Preview ----------------")
    print(report[:1500])
    print("...\n[详细报告及误聚类段落已输出至文件]")


if __name__ == "__main__":
    main()
