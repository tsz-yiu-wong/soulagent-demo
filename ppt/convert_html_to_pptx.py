#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
HTML to PPTX Converter for SoulAgent Business Plan Deck (v3).
Converts bp v3.html (or specified HTML slide deck) into a beautifully styled widescreen PowerPoint presentation.
"""

import os
import sys
import argparse
from bs4 import BeautifulSoup
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.dml.color import RGBColor

# Professional Color Palette matching the HTML CSS tokens
C_DARK = RGBColor(15, 23, 42)          # #0f172a
C_MUTED = RGBColor(71, 85, 105)        # #475569
C_DIM = RGBColor(100, 116, 139)        # #64748b
C_BLUE = RGBColor(37, 99, 235)         # #2563eb
C_BLUE_HOVER = RGBColor(29, 78, 216)   # #1d4ed8
C_SKY = RGBColor(2, 132, 199)          # #0284c7
C_INDIGO = RGBColor(79, 70, 229)       # #4f46e5
C_PURPLE = RGBColor(124, 58, 237)      # #7c3aed
C_AMBER = RGBColor(217, 119, 6)        # #d97706
C_EMERALD = RGBColor(5, 150, 105)      # #059669
C_WHITE = RGBColor(255, 255, 255)

C_BG_DARK = RGBColor(248, 250, 252)    # #f8fafc
C_CARD_BG = RGBColor(255, 255, 255)    # #ffffff
C_CARD_SUB_BG = RGBColor(248, 250, 252)# #f8fafc
C_CARD_BORDER = RGBColor(226, 232, 240)# #e2e8f0

C_HIGHLIGHT_BG = RGBColor(239, 246, 255)     # #eff6ff
C_HIGHLIGHT_BORDER = RGBColor(191, 219, 254) # #bfdbfe
C_GREEN_BG = RGBColor(240, 253, 244)         # #f0fdf4
C_GREEN_BORDER = RGBColor(187, 247, 208)     # #bbf7d0
C_RED_BG = RGBColor(254, 242, 242)           # #fef2f2
C_RED_BORDER = RGBColor(254, 202, 202)       # #fecaca
C_RED_TEXT = RGBColor(153, 27, 27)           # #991b1b

FONT_FAMILY = "Noto Sans SC"

def set_shape_flat_style(shape, fill_color, border_color=None, border_width_pt=1):
    """Utility to style shapes with solid fill and borders."""
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill_color
    if border_color:
        shape.line.color.rgb = border_color
        shape.line.width = Pt(border_width_pt)
    else:
        shape.line.fill.background()

def add_header(slide, tag_text, title_text, subtitle_text):
    """Renders the standard slide header: tag, title, and subtitle."""
    top_pos = Inches(0.4)
    if tag_text:
        tx_box = slide.shapes.add_textbox(Inches(0.8), top_pos, Inches(11.733), Inches(0.32))
        tf = tx_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = tag_text
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.name = FONT_FAMILY
        p.font.color.rgb = C_BLUE
        top_pos += Inches(0.28)

    if title_text:
        tx_box = slide.shapes.add_textbox(Inches(0.8), top_pos, Inches(11.733), Inches(0.45))
        tf = tx_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = title_text
        p.font.size = Pt(19)
        p.font.bold = True
        p.font.name = FONT_FAMILY
        p.font.color.rgb = C_DARK
        top_pos += Inches(0.42)

    if subtitle_text:
        tx_box = slide.shapes.add_textbox(Inches(0.8), top_pos, Inches(11.733), Inches(0.35))
        tf = tx_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = subtitle_text
        p.font.size = Pt(11)
        p.font.name = FONT_FAMILY
        p.font.color.rgb = C_MUTED

def add_takeaway(slide, takeaway_text):
    """Renders the bottom takeaway bar."""
    box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.65), Inches(11.733), Inches(0.55))
    set_shape_flat_style(box, C_HIGHLIGHT_BG, C_HIGHLIGHT_BORDER)
    tf = box.text_frame
    tf.word_wrap = True
    tf.margin_left = Inches(0.2)
    tf.margin_right = Inches(0.2)
    tf.margin_top = Inches(0.08)
    tf.margin_bottom = Inches(0.08)
    p = tf.paragraphs[0]
    clean_text = takeaway_text.replace("“", "").replace("”", "").strip()
    p.text = "“ " + clean_text
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.name = FONT_FAMILY
    p.font.color.rgb = C_BLUE

def build_slide_1(slide, elem):
    """Slide 1: Cover / Hero."""
    hero_tag = "Personal Intelligence System"
    hero_title = "SoulAgent"
    hero_slogan = "从千人一面的通用智能，到千人千面的个人智能"
    keywords = ["记住你", "理解你", "适应你", "替你行动"]
    
    # Tag
    tx = slide.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(11.733), Inches(0.4))
    p = tx.text_frame.paragraphs[0]
    p.text = hero_tag
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.name = FONT_FAMILY
    p.font.color.rgb = C_BLUE
    
    # Title
    tx = slide.shapes.add_textbox(Inches(0.8), Inches(2.0), Inches(11.733), Inches(1.2))
    p = tx.text_frame.paragraphs[0]
    p.text = hero_title
    p.font.size = Pt(56)
    p.font.bold = True
    p.font.name = FONT_FAMILY
    p.font.color.rgb = C_DARK
    
    # Slogan
    tx = slide.shapes.add_textbox(Inches(0.8), Inches(3.3), Inches(11.733), Inches(0.6))
    p = tx.text_frame.paragraphs[0]
    p.text = hero_slogan
    p.font.size = Pt(22)
    p.font.bold = True
    p.font.name = FONT_FAMILY
    p.font.color.rgb = C_DARK
    
    # Keywords Pills
    left = Inches(0.8)
    for kw in keywords:
        pill = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, Inches(4.3), Inches(1.8), Inches(0.45))
        set_shape_flat_style(pill, C_HIGHLIGHT_BG, C_HIGHLIGHT_BORDER)
        tf = pill.text_frame
        p = tf.paragraphs[0]
        p.text = kw
        p.alignment = PP_ALIGN.CENTER
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.name = FONT_FAMILY
        p.font.color.rgb = C_BLUE
        left += Inches(2.0)
        
    takeaway = elem.find('div', class_='slide-footer-takeaway')
    if takeaway:
        add_takeaway(slide, takeaway.get_text())

def build_slide_2(slide, elem):
    """Slide 2: Industry Evolution Table."""
    header = elem.find('div', class_='slide-header')
    add_header(slide, 
               header.find('div', class_='slide-tag').get_text(strip=True) if header.find('div', class_='slide-tag') else "",
               header.find('h2', class_='slide-title').get_text(strip=True) if header.find('h2', class_='slide-title') else "",
               header.find('p', class_='slide-subtitle').get_text(strip=True) if header.find('p', class_='slide-subtitle') else "")
    
    table_elem = elem.find('table', class_='table-custom')
    if table_elem:
        rows_elem = table_elem.find_all('tr')
        num_rows = len(rows_elem)
        num_cols = 4
        
        table_shape = slide.shapes.add_table(num_rows, num_cols, Inches(0.8), Inches(1.8), Inches(11.733), Inches(4.4))
        table = table_shape.table
        
        table.columns[0].width = Inches(1.8)
        table.columns[1].width = Inches(3.2)
        table.columns[2].width = Inches(3.3)
        table.columns[3].width = Inches(3.433)
        
        for r_idx, row_elem in enumerate(rows_elem):
            cells = row_elem.find_all(['th', 'td'])
            for c_idx, cell_elem in enumerate(cells):
                cell = table.cell(r_idx, c_idx)
                cell.text_frame.word_wrap = True
                cell.vertical_anchor = MSO_ANCHOR.MIDDLE
                
                cell_text = cell_elem.get_text(separator=" ", strip=True)
                p = cell.text_frame.paragraphs[0]
                p.text = cell_text
                p.font.size = Pt(11)
                p.font.name = FONT_FAMILY
                
                if r_idx == 0:
                    cell.fill.solid()
                    if c_idx == 2:
                        cell.fill.fore_color.rgb = RGBColor(245, 243, 255)
                    elif c_idx == 3:
                        cell.fill.fore_color.rgb = RGBColor(239, 246, 255)
                    else:
                        cell.fill.fore_color.rgb = RGBColor(241, 245, 249)
                    p.font.bold = True
                    p.font.color.rgb = C_DARK
                else:
                    cell.fill.solid()
                    if c_idx == 3:
                        cell.fill.fore_color.rgb = RGBColor(248, 250, 252)
                        p.font.bold = True
                        p.font.color.rgb = C_BLUE
                    else:
                        cell.fill.fore_color.rgb = C_WHITE
                        p.font.color.rgb = C_DARK

    takeaway = elem.find('div', class_='slide-footer-takeaway')
    if takeaway:
        add_takeaway(slide, takeaway.get_text())

def build_slide_3(slide, elem):
    """Slide 3: Three Core Pain Points."""
    header = elem.find('div', class_='slide-header')
    add_header(slide, 
               header.find('div', class_='slide-tag').get_text(strip=True),
               header.find('h2', class_='slide-title').get_text(strip=True),
               header.find('p', class_='slide-subtitle').get_text(strip=True))

    col_widths = Inches(3.7)
    left_positions = [Inches(0.8), Inches(4.8), Inches(8.8)]
    colors = [C_PURPLE, C_SKY, C_BLUE]
    pills = ["痛点一｜表达瓶颈", "痛点二｜上下文割裂", "痛点三｜无认知沉淀"]
    titles = ["说不清 · 说不全", "碎片化 · 串不起", "留不下 · 记不住"]
    subtitles = ["意图低带宽与隐性偏好难言尽", "数据孤岛严重，逻辑无法连贯", "经验即用即抛，被迫重复背书"]
    
    details = [
        [("低带宽表达：", "人脑完整意图 ≫ 能够被 Prompt 简短文本表达的信息。"),
         ("隐性潜意识：", "工作习惯、风险偏好与审美标准，用户自身亦难以具象列举。")],
        [("信息高度分散：", "聊天记录、业务文档、会议摘要、个人笔记彼此孤立散落。"),
         ("缺乏统领 Context：", "缺乏统一上下文引擎，AI 无法跨工具跨任务贯通逻辑。")],
        [("缺乏 User Model：", "对话即用即抛，历史交互与反馈无法沉淀为个人认知体系。"),
         ("反复冷启动背书：", "每次开启新对话都要重讲背景习惯，AI 无法“越用越聪明”。")]
    ]
    
    warnings = [
        "✖ 结果：Prompt 仅覆盖表层，AI 输出总是缺乏深度契合",
        "✖ 结果：无法整合多源上下文，AI 只能做单点机械响应",
        "✖ 结果：经验无法累积沉淀，用户永远在重复教 AI"
    ]

    for i in range(3):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left_positions[i], Inches(1.8), col_widths, Inches(4.6))
        set_shape_flat_style(card, C_BG_DARK, C_CARD_BORDER)
        
        top_line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left_positions[i], Inches(1.8), col_widths, Inches(0.08))
        set_shape_flat_style(top_line, colors[i])
        
        tx_box = slide.shapes.add_textbox(left_positions[i] + Inches(0.2), Inches(2.0), col_widths - Inches(0.4), Inches(1.4))
        tf = tx_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        
        p0 = tf.paragraphs[0]
        p0.text = pills[i]
        p0.font.size = Pt(11)
        p0.font.bold = True
        p0.font.name = FONT_FAMILY
        p0.font.color.rgb = colors[i]
        
        p1 = tf.add_paragraph()
        p1.text = titles[i]
        p1.font.size = Pt(19)
        p1.font.bold = True
        p1.font.name = FONT_FAMILY
        p1.font.color.rgb = colors[i]
        
        p2 = tf.add_paragraph()
        p2.text = subtitles[i]
        p2.font.size = Pt(10.5)
        p2.font.bold = True
        p2.font.name = FONT_FAMILY
        p2.font.color.rgb = C_DARK

        d_box = slide.shapes.add_textbox(left_positions[i] + Inches(0.2), Inches(3.45), col_widths - Inches(0.4), Inches(1.9))
        dtf = d_box.text_frame
        dtf.word_wrap = True
        dtf.margin_left = dtf.margin_top = dtf.margin_right = dtf.margin_bottom = 0
        for label, content in details[i]:
            dp = dtf.add_paragraph()
            dp.text = f"• {label} {content}"
            dp.font.size = Pt(9.5)
            dp.font.name = FONT_FAMILY
            dp.font.color.rgb = C_MUTED
            dp.space_after = Pt(4)

        warn_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left_positions[i] + Inches(0.15), Inches(5.6), col_widths - Inches(0.3), Inches(0.65))
        set_shape_flat_style(warn_box, C_RED_BG, C_RED_BORDER)
        wtf = warn_box.text_frame
        wtf.word_wrap = True
        wp = wtf.paragraphs[0]
        wp.text = warnings[i]
        wp.font.size = Pt(9.5)
        wp.font.bold = True
        wp.font.name = FONT_FAMILY
        wp.font.color.rgb = C_RED_TEXT

    takeaway = elem.find('div', class_='slide-footer-takeaway')
    if takeaway:
        add_takeaway(slide, takeaway.get_text())

def build_slide_4(slide, elem):
    """Slide 4: 3-Layer System Stack & Contrast."""
    header = elem.find('div', class_='slide-header')
    add_header(slide, 
               header.find('div', class_='slide-tag').get_text(strip=True),
               header.find('h2', class_='slide-title').get_text(strip=True),
               header.find('p', class_='slide-subtitle').get_text(strip=True))

    layers_data = [
        ("LAYER 03｜数字延伸", "Personal Extension 数字延伸", "个人分身·专家分身·组织数字资产", "代表我", C_BLUE),
        ("LAYER 02｜深层标准", "Cognitive Model 认知模型", "理解你的标准、工作偏好与决策模式", "帮我做", C_PURPLE),
        ("LAYER 01｜感知与记忆", "Memory System 记忆系统", "主动感知外部变局并持续沉淀 Context", "帮我听", C_SKY)
    ]
    
    top_pos = Inches(1.8)
    for l_tag, l_title, l_desc, pill_text, l_color in layers_data:
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), top_pos, Inches(5.6), Inches(1.35))
        set_shape_flat_style(card, C_BG_DARK, C_CARD_BORDER)
        
        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.2)
        tf.margin_top = Inches(0.12)
        
        p0 = tf.paragraphs[0]
        p0.text = l_tag
        p0.font.size = Pt(9.5)
        p0.font.bold = True
        p0.font.name = FONT_FAMILY
        p0.font.color.rgb = l_color
        
        p1 = tf.add_paragraph()
        p1.text = l_title
        p1.font.size = Pt(13.5)
        p1.font.bold = True
        p1.font.name = FONT_FAMILY
        p1.font.color.rgb = C_DARK
        
        p2 = tf.add_paragraph()
        p2.text = l_desc
        p2.font.size = Pt(10)
        p2.font.name = FONT_FAMILY
        p2.font.color.rgb = C_MUTED
        
        pill = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(5.1), top_pos + Inches(0.45), Inches(1.1), Inches(0.35))
        set_shape_flat_style(pill, C_HIGHLIGHT_BG, C_HIGHLIGHT_BORDER)
        ptf = pill.text_frame
        pp = ptf.paragraphs[0]
        pp.text = pill_text
        pp.alignment = PP_ALIGN.CENTER
        pp.font.size = Pt(10)
        pp.font.bold = True
        pp.font.name = FONT_FAMILY
        pp.font.color.rgb = l_color
        
        top_pos += Inches(1.5)

    right_card1 = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.8), Inches(5.733), Inches(2.0))
    set_shape_flat_style(right_card1, C_BG_DARK, C_CARD_BORDER)
    tf1 = right_card1.text_frame
    tf1.word_wrap = True
    tf1.margin_left = tf1.margin_top = Inches(0.2)
    p = tf1.paragraphs[0]
    p.text = "场景指令：“帮我写一份汇报。”"
    p.font.size = Pt(11)
    p.font.name = FONT_FAMILY
    p.font.color.rgb = C_MUTED
    p1 = tf1.add_paragraph()
    p1.text = "普通 AI / 普通 Agent："
    p1.font.size = Pt(14)
    p1.font.bold = True
    p1.font.name = FONT_FAMILY
    p1.font.color.rgb = C_MUTED
    p2 = tf1.add_paragraph()
    p2.text = "仅根据单次 Prompt 泛泛生成模板化汇报，缺乏深层上下文。"
    p2.font.size = Pt(11)
    p2.font.name = FONT_FAMILY
    p2.font.color.rgb = C_MUTED

    right_card2 = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(4.0), Inches(5.733), Inches(2.3))
    set_shape_flat_style(right_card2, C_HIGHLIGHT_BG, C_HIGHLIGHT_BORDER)
    tf2 = right_card2.text_frame
    tf2.word_wrap = True
    tf2.margin_left = tf2.margin_top = Inches(0.2)
    p = tf2.paragraphs[0]
    p.text = "场景指令：“帮我写一份汇报。”"
    p.font.size = Pt(11)
    p.font.name = FONT_FAMILY
    p.font.color.rgb = C_BLUE
    p1 = tf2.add_paragraph()
    p1.text = "SoulAgent 个人智能："
    p1.font.size = Pt(14)
    p1.font.bold = True
    p1.font.name = FONT_FAMILY
    p1.font.color.rgb = C_BLUE
    p2 = tf2.add_paragraph()
    p2.text = "自动结合你的历史工作方式、表达偏好、领导关注点、项目背景与一贯决策模式，生成更像你、也更适合你的完美结果。"
    p2.font.size = Pt(11)
    p2.font.name = FONT_FAMILY
    p2.font.color.rgb = C_DARK

    takeaway = elem.find('div', class_='slide-footer-takeaway')
    if takeaway:
        add_takeaway(slide, takeaway.get_text())

def build_slide_5(slide, elem):
    """Slide 5 (v3): 帮我听 · 带回我关注的信息."""
    header = elem.find('div', class_='slide-header')
    add_header(slide, 
               header.find('div', class_='slide-tag').get_text(strip=True),
               header.find('h2', class_='slide-title').get_text(strip=True),
               header.find('p', class_='slide-subtitle').get_text(strip=True))

    col_widths = Inches(3.7)
    left_positions = [Inches(0.8), Inches(4.8), Inches(8.8)]
    card_top = Inches(1.75)
    card_height = Inches(4.0)

    # Column 1: 替我感知海量场景
    c1 = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left_positions[0], card_top, col_widths, card_height)
    set_shape_flat_style(c1, C_WHITE, C_CARD_BORDER)
    
    pill1 = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left_positions[0] + Inches(0.15), card_top + Inches(0.15), Inches(1.6), Inches(0.3))
    set_shape_flat_style(pill1, C_HIGHLIGHT_BG, C_HIGHLIGHT_BORDER)
    p1_tf = pill1.text_frame
    p1_tf.paragraphs[0].text = "替我感知海量场景"
    p1_tf.paragraphs[0].font.size = Pt(9.5)
    p1_tf.paragraphs[0].font.bold = True
    p1_tf.paragraphs[0].font.name = FONT_FAMILY
    p1_tf.paragraphs[0].font.color.rgb = C_BLUE
    p1_tf.paragraphs[0].alignment = PP_ALIGN.CENTER
    
    t1_box = slide.shapes.add_textbox(left_positions[0] + Inches(0.15), card_top + Inches(0.48), col_widths - Inches(0.3), Inches(0.35))
    t1_tf = t1_box.text_frame
    t1_tf.margin_left = t1_tf.margin_top = t1_tf.margin_right = t1_tf.margin_bottom = 0
    p = t1_tf.paragraphs[0]
    p.text = "驻守任意关键信息源"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.name = FONT_FAMILY
    p.font.color.rgb = C_DARK

    sub_items_1 = [
        ("🎤 行业峰会 / 论坛：", "多场并行分论坛无暇分身，AI 替我逐场深度精听。"),
        ("👥 内部会议 / 组会：", "日程冲突无法参会，AI 替我提炼与我相关的决议。"),
        ("📺 B站 / 访谈播客 / 视频：", "数小时深度对谈与长视频，无需手动快进。"),
        ("📚 系列专业课程：", "体系化长课程自动梳理，免去几十小时死磕。")
    ]
    sub_top = card_top + Inches(0.9)
    for title_prefix, desc in sub_items_1:
        s_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left_positions[0] + Inches(0.15), sub_top, col_widths - Inches(0.3), Inches(0.68))
        set_shape_flat_style(s_box, C_CARD_SUB_BG, C_HIGHLIGHT_BORDER)
        stf = s_box.text_frame
        stf.word_wrap = True
        stf.margin_left = Inches(0.1)
        stf.margin_top = Inches(0.06)
        stf.margin_right = Inches(0.1)
        sp = stf.paragraphs[0]
        sp.text = f"{title_prefix}{desc}"
        sp.font.size = Pt(9.5)
        sp.font.name = FONT_FAMILY
        sp.font.color.rgb = C_MUTED
        sub_top += Inches(0.74)

    # Column 2: AI 做了什么
    c2 = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left_positions[1], card_top, col_widths, card_height)
    set_shape_flat_style(c2, C_HIGHLIGHT_BG, C_HIGHLIGHT_BORDER)
    
    pill2 = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left_positions[1] + Inches(0.15), card_top + Inches(0.15), Inches(1.3), Inches(0.3))
    set_shape_flat_style(pill2, C_WHITE, C_HIGHLIGHT_BORDER)
    p2_tf = pill2.text_frame
    p2_tf.paragraphs[0].text = "AI 做了什么"
    p2_tf.paragraphs[0].font.size = Pt(9.5)
    p2_tf.paragraphs[0].font.bold = True
    p2_tf.paragraphs[0].font.name = FONT_FAMILY
    p2_tf.paragraphs[0].font.color.rgb = C_BLUE
    p2_tf.paragraphs[0].alignment = PP_ALIGN.CENTER
    
    t2_box = slide.shapes.add_textbox(left_positions[1] + Inches(0.15), card_top + Inches(0.48), col_widths - Inches(0.3), Inches(0.35))
    t2_tf = t2_box.text_frame
    t2_tf.margin_left = t2_tf.margin_top = t2_tf.margin_right = t2_tf.margin_bottom = 0
    p = t2_tf.paragraphs[0]
    p.text = "多路并发 · 深度提炼"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.name = FONT_FAMILY
    p.font.color.rgb = C_BLUE

    sub_items_2 = [
        ("1️⃣ 替你去听：", "多路音频/视频/会议同时实时转录"),
        ("2️⃣ 提炼干货：", "去除寒暄套话，提炼高浓度核心观点与框架"),
        ("3️⃣ 关联Context：", "自动匹配你的关注点、认知偏好与业务领域")
    ]
    sub_top = card_top + Inches(0.9)
    for title_prefix, desc in sub_items_2:
        s_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left_positions[1] + Inches(0.15), sub_top, col_widths - Inches(0.3), Inches(0.68))
        set_shape_flat_style(s_box, C_WHITE, C_HIGHLIGHT_BORDER)
        stf = s_box.text_frame
        stf.word_wrap = True
        stf.margin_left = Inches(0.1)
        stf.margin_top = Inches(0.06)
        stf.margin_right = Inches(0.1)
        sp = stf.paragraphs[0]
        sp.text = f"{title_prefix} {desc}"
        sp.font.size = Pt(9.5)
        sp.font.name = FONT_FAMILY
        sp.font.color.rgb = C_DARK
        sub_top += Inches(0.74)

    out_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left_positions[1] + Inches(0.15), sub_top, col_widths - Inches(0.3), Inches(0.65))
    set_shape_flat_style(out_box, C_BLUE, None)
    otf = out_box.text_frame
    otf.word_wrap = True
    op = otf.paragraphs[0]
    op.text = "实时输出：只把对你最关键的信息带回来"
    op.font.size = Pt(10)
    op.font.bold = True
    op.font.name = FONT_FAMILY
    op.font.color.rgb = C_WHITE
    op.alignment = PP_ALIGN.CENTER

    # Column 3: 你得到什么
    c3 = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left_positions[2], card_top, col_widths, card_height)
    set_shape_flat_style(c3, C_WHITE, C_CARD_BORDER)
    
    pill3 = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left_positions[2] + Inches(0.15), card_top + Inches(0.15), Inches(1.3), Inches(0.3))
    set_shape_flat_style(pill3, C_GREEN_BG, C_GREEN_BORDER)
    p3_tf = pill3.text_frame
    p3_tf.paragraphs[0].text = "你得到什么"
    p3_tf.paragraphs[0].font.size = Pt(9.5)
    p3_tf.paragraphs[0].font.bold = True
    p3_tf.paragraphs[0].font.name = FONT_FAMILY
    p3_tf.paragraphs[0].font.color.rgb = C_EMERALD
    p3_tf.paragraphs[0].alignment = PP_ALIGN.CENTER
    
    t3_box = slide.shapes.add_textbox(left_positions[2] + Inches(0.15), card_top + Inches(0.48), col_widths - Inches(0.3), Inches(0.35))
    t3_tf = t3_box.text_frame
    t3_tf.margin_left = t3_tf.margin_top = t3_tf.margin_right = t3_tf.margin_bottom = 0
    p = t3_tf.paragraphs[0]
    p.text = "你的第二感知系统"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.name = FONT_FAMILY
    p.font.color.rgb = C_DARK

    sub_items_3 = [
        ("🎯 关键信息直达：", "不漏掉任何与你相关的决策点与新观点"),
        ("⚡ 效率成倍释放：", "原本需要几十小时的死磕，缩短为几分钟速览"),
        ("💡 关联历史认知：", "新信息自动融入个人已有知识网络"),
        ("🚀 输出行动建议：", "不仅是摘要，更给出针对你的行动备忘")
    ]
    sub_top = card_top + Inches(0.9)
    for title_prefix, desc in sub_items_3:
        s_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left_positions[2] + Inches(0.15), sub_top, col_widths - Inches(0.3), Inches(0.68))
        set_shape_flat_style(s_box, C_CARD_SUB_BG, C_GREEN_BORDER)
        stf = s_box.text_frame
        stf.word_wrap = True
        stf.margin_left = Inches(0.1)
        stf.margin_top = Inches(0.06)
        stf.margin_right = Inches(0.1)
        sp = stf.paragraphs[0]
        sp.text = f"{title_prefix}{desc}"
        sp.font.size = Pt(9.5)
        sp.font.name = FONT_FAMILY
        sp.font.color.rgb = C_MUTED
        sub_top += Inches(0.74)

    # Bottom Execution Banner
    banner = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(5.85), Inches(11.733), Inches(0.65))
    set_shape_flat_style(banner, C_CARD_SUB_BG, C_CARD_BORDER)
    btf = banner.text_frame
    btf.word_wrap = True
    btf.margin_left = Inches(0.2)
    btf.margin_right = Inches(2.2)
    btf.margin_top = Inches(0.1)
    bp0 = btf.paragraphs[0]
    bp0.text = "从被动记录到主动情报： 传统工具只是录音转文字流水账； SoulAgent【帮我听】基于你的 Context，精准带回你关注的情报。"
    bp0.font.size = Pt(10)
    bp0.font.bold = True
    bp0.font.name = FONT_FAMILY
    bp0.font.color.rgb = C_DARK

    bp_pill = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(10.5), Inches(5.95), Inches(1.8), Inches(0.4))
    set_shape_flat_style(bp_pill, C_HIGHLIGHT_BG, C_HIGHLIGHT_BORDER)
    bptf = bp_pill.text_frame
    bpp = bptf.paragraphs[0]
    bpp.text = "信息降噪 · 精准触达"
    bpp.alignment = PP_ALIGN.CENTER
    bpp.font.size = Pt(9.5)
    bpp.font.bold = True
    bpp.font.name = FONT_FAMILY
    bpp.font.color.rgb = C_BLUE

    takeaway = elem.find('div', class_='slide-footer-takeaway')
    if takeaway:
        add_takeaway(slide, takeaway.get_text())

def build_slide_6(slide, elem):
    """Slide 6 (v3): 帮我做 · 融入我的认知与思维."""
    header = elem.find('div', class_='slide-header')
    add_header(slide, 
               header.find('div', class_='slide-tag').get_text(strip=True),
               header.find('h2', class_='slide-title').get_text(strip=True),
               header.find('p', class_='slide-subtitle').get_text(strip=True))

    col_widths = Inches(5.7)
    left_positions = [Inches(0.8), Inches(6.8)]
    card_top = Inches(1.75)
    card_height = Inches(3.95)

    # Column 1: 教育场景
    c1 = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left_positions[0], card_top, col_widths, card_height)
    set_shape_flat_style(c1, C_HIGHLIGHT_BG, C_HIGHLIGHT_BORDER)
    
    t1_box = slide.shapes.add_textbox(left_positions[0] + Inches(0.2), card_top + Inches(0.15), col_widths - Inches(2.2), Inches(0.55))
    t1_tf = t1_box.text_frame
    t1_tf.margin_left = t1_tf.margin_top = t1_tf.margin_right = t1_tf.margin_bottom = 0
    p = t1_tf.paragraphs[0]
    p.text = "👨‍🏫 教育场景｜教师智能工作台"
    p.font.size = Pt(13.5)
    p.font.bold = True
    p.font.name = FONT_FAMILY
    p.font.color.rgb = C_BLUE
    p1 = t1_tf.add_paragraph()
    p1.text = "融入教学思维 · 懂教师偏好 · 知学生学情"
    p1.font.size = Pt(9.5)
    p1.font.name = FONT_FAMILY
    p1.font.color.rgb = C_MUTED

    pill1 = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left_positions[0] + Inches(3.8), card_top + Inches(0.15), Inches(1.7), Inches(0.35))
    set_shape_flat_style(pill1, C_WHITE, C_HIGHLIGHT_BORDER)
    p1_tf = pill1.text_frame
    p1_tf.paragraphs[0].text = "作业批改 & 学情诊断"
    p1_tf.paragraphs[0].font.size = Pt(9.5)
    p1_tf.paragraphs[0].font.bold = True
    p1_tf.paragraphs[0].font.name = FONT_FAMILY
    p1_tf.paragraphs[0].font.color.rgb = C_BLUE
    p1_tf.paragraphs[0].alignment = PP_ALIGN.CENTER

    sub_items_1 = [
        ("📝 智能批改作业与针对性讲评", "不仅指出对错，更按老师一贯的讲评逻辑给出有温度、启发式的个性化批语，契合老师的育人标准。"),
        ("👩‍🎓 知晓学生历史轨迹与薄弱点", "自动关联学生过往错题与认知卡点，生成差异化辅导建议，真正实现因材施教。"),
        ("📊 沉淀班级学情与教学复盘", "自动汇总共性薄弱知识点，反哺备课教研，成为老师真正信赖的教学搭档。")
    ]
    sub_top = card_top + Inches(0.75)
    for heading, detail in sub_items_1:
        s_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left_positions[0] + Inches(0.2), sub_top, col_widths - Inches(0.4), Inches(0.95))
        set_shape_flat_style(s_box, C_WHITE, C_HIGHLIGHT_BORDER)
        stf = s_box.text_frame
        stf.word_wrap = True
        stf.margin_left = Inches(0.12)
        stf.margin_top = Inches(0.08)
        stf.margin_right = Inches(0.12)
        sp0 = stf.paragraphs[0]
        sp0.text = heading
        sp0.font.size = Pt(10.5)
        sp0.font.bold = True
        sp0.font.name = FONT_FAMILY
        sp0.font.color.rgb = C_DARK
        sp1 = stf.add_paragraph()
        sp1.text = detail
        sp1.font.size = Pt(9.5)
        sp1.font.name = FONT_FAMILY
        sp1.font.color.rgb = C_MUTED
        sub_top += Inches(1.02)

    # Column 2: 职场场景
    c2 = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left_positions[1], card_top, col_widths, card_height)
    set_shape_flat_style(c2, C_WHITE, C_CARD_BORDER)
    
    t2_box = slide.shapes.add_textbox(left_positions[1] + Inches(0.2), card_top + Inches(0.15), col_widths - Inches(2.2), Inches(0.55))
    t2_tf = t2_box.text_frame
    t2_tf.margin_left = t2_tf.margin_top = t2_tf.margin_right = t2_tf.margin_bottom = 0
    p = t2_tf.paragraphs[0]
    p.text = "💼 职场场景｜个人专属智能助理"
    p.font.size = Pt(13.5)
    p.font.bold = True
    p.font.name = FONT_FAMILY
    p.font.color.rgb = C_DARK
    p1 = t2_tf.add_paragraph()
    p1.text = "理解业务语境 · 懂行文风格 · 知轻重缓急"
    p1.font.size = Pt(9.5)
    p1.font.name = FONT_FAMILY
    p1.font.color.rgb = C_MUTED

    pill2 = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left_positions[1] + Inches(3.8), card_top + Inches(0.15), Inches(1.7), Inches(0.35))
    set_shape_flat_style(pill2, C_BG_DARK, C_CARD_BORDER)
    p2_tf = pill2.text_frame
    p2_tf.paragraphs[0].text = "公文撰写 & 方案构思"
    p2_tf.paragraphs[0].font.size = Pt(9.5)
    p2_tf.paragraphs[0].font.bold = True
    p2_tf.paragraphs[0].font.name = FONT_FAMILY
    p2_tf.paragraphs[0].font.color.rgb = C_DARK
    p2_tf.paragraphs[0].alignment = PP_ALIGN.CENTER

    sub_items_2 = [
        ("✍️ 起草报告、邮件与方案", "融入你一贯的逻辑框架、专业术语与行文语气，生成“像你亲笔写出”的高契合度草稿。"),
        ("🎯 理解意图与隐性上下文", "无需冗长 Prompt，心领神会你的真实目标与偏好，减少反复修改与反复对齐成本。"),
        ("⚡ 复杂任务闭环交付", "从资料检索、逻辑梳理到最终成果物，真正替你分担深度脑力劳动。")
    ]
    sub_top = card_top + Inches(0.75)
    for heading, detail in sub_items_2:
        s_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left_positions[1] + Inches(0.2), sub_top, col_widths - Inches(0.4), Inches(0.95))
        set_shape_flat_style(s_box, C_CARD_SUB_BG, C_CARD_BORDER)
        stf = s_box.text_frame
        stf.word_wrap = True
        stf.margin_left = Inches(0.12)
        stf.margin_top = Inches(0.08)
        stf.margin_right = Inches(0.12)
        sp0 = stf.paragraphs[0]
        sp0.text = heading
        sp0.font.size = Pt(10.5)
        sp0.font.bold = True
        sp0.font.name = FONT_FAMILY
        sp0.font.color.rgb = C_DARK
        sp1 = stf.add_paragraph()
        sp1.text = detail
        sp1.font.size = Pt(9.5)
        sp1.font.name = FONT_FAMILY
        sp1.font.color.rgb = C_MUTED
        sub_top += Inches(1.02)

    # Bottom Banner
    banner = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(5.85), Inches(11.733), Inches(0.65))
    set_shape_flat_style(banner, C_CARD_SUB_BG, C_CARD_BORDER)
    btf = banner.text_frame
    btf.word_wrap = True
    btf.margin_left = Inches(0.2)
    btf.margin_right = Inches(2.2)
    btf.margin_top = Inches(0.1)
    bp0 = btf.paragraphs[0]
    bp0.text = "从指令执行到认知同频： 传统 AI 输出千篇一律的机械套话； SoulAgent【帮我做】深度理解你的思维与标准，交付真正可用的高质量成果。"
    bp0.font.size = Pt(10)
    bp0.font.bold = True
    bp0.font.name = FONT_FAMILY
    bp0.font.color.rgb = C_DARK

    bp_pill = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(10.3), Inches(5.95), Inches(2.0), Inches(0.4))
    set_shape_flat_style(bp_pill, C_HIGHLIGHT_BG, C_HIGHLIGHT_BORDER)
    bptf = bp_pill.text_frame
    bpp = bptf.paragraphs[0]
    bpp.text = "认知同频 · 像你一样思考"
    bpp.alignment = PP_ALIGN.CENTER
    bpp.font.size = Pt(9.5)
    bpp.font.bold = True
    bpp.font.name = FONT_FAMILY
    bpp.font.color.rgb = C_BLUE

    takeaway = elem.find('div', class_='slide-footer-takeaway')
    if takeaway:
        add_takeaway(slide, takeaway.get_text())

def build_slide_7(slide, elem):
    """Slide 7 (v3): 代表我 · 成为我的数字延伸."""
    header = elem.find('div', class_='slide-header')
    add_header(slide, 
               header.find('div', class_='slide-tag').get_text(strip=True),
               header.find('h2', class_='slide-title').get_text(strip=True),
               header.find('p', class_='slide-subtitle').get_text(strip=True))

    col_widths = Inches(5.7)
    left_positions = [Inches(0.8), Inches(6.8)]
    card_top = Inches(1.75)
    card_height = Inches(3.95)

    # Column 1: 专家分身
    c1 = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left_positions[0], card_top, col_widths, card_height)
    set_shape_flat_style(c1, C_HIGHLIGHT_BG, C_HIGHLIGHT_BORDER)
    
    top_line1 = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left_positions[0], card_top, col_widths, Inches(0.08))
    set_shape_flat_style(top_line1, C_BLUE)

    t1_box = slide.shapes.add_textbox(left_positions[0] + Inches(0.2), card_top + Inches(0.15), col_widths - Inches(1.8), Inches(0.55))
    t1_tf = t1_box.text_frame
    t1_tf.margin_left = t1_tf.margin_top = t1_tf.margin_right = t1_tf.margin_bottom = 0
    p = t1_tf.paragraphs[0]
    p.text = "🎓 专家分身｜个人智慧与影响力规模化"
    p.font.size = Pt(13.5)
    p.font.bold = True
    p.font.name = FONT_FAMILY
    p.font.color.rgb = C_BLUE
    p1 = t1_tf.add_paragraph()
    p1.text = "学习思维模式 · 认知结构 · 专业偏好"
    p1.font.size = Pt(9.5)
    p1.font.name = FONT_FAMILY
    p1.font.color.rgb = C_MUTED

    pill1 = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left_positions[0] + Inches(4.3), card_top + Inches(0.15), Inches(1.2), Inches(0.35))
    set_shape_flat_style(pill1, C_WHITE, C_HIGHLIGHT_BORDER)
    p1_tf = pill1.text_frame
    p1_tf.paragraphs[0].text = "智慧资产化"
    p1_tf.paragraphs[0].font.size = Pt(9.5)
    p1_tf.paragraphs[0].font.bold = True
    p1_tf.paragraphs[0].font.name = FONT_FAMILY
    p1_tf.paragraphs[0].font.color.rgb = C_BLUE
    p1_tf.paragraphs[0].alignment = PP_ALIGN.CENTER

    sub_items_1 = [
        ("🧠 核心沉淀：思维逻辑与决策直觉", "不仅是知识检索，更深度沉淀专家的分析框架、专业认知、价值判断与表达偏好，让分身具备专家的思考灵魂。"),
        ("🌐 核心价值：突破精力瓶颈，无限并发赋能", "打破个人时间与精力的物理天花板，从“1 个专家只能服务少数人”，跃升为“1 个专家分身 7×24h 规模化答疑赋能”。"),
        ("🌟 宏观收益：扩大个人影响力 · 普惠造福社会", "让稀缺的顶尖专业智慧无门槛普惠大众，实现专家智慧终身资产化，最大化社会价值与个人品牌影响力。")
    ]
    sub_top = card_top + Inches(0.75)
    for idx, (heading, detail) in enumerate(sub_items_1):
        s_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left_positions[0] + Inches(0.2), sub_top, col_widths - Inches(0.4), Inches(0.95))
        set_shape_flat_style(s_box, C_WHITE if idx < 2 else C_HIGHLIGHT_BG, C_HIGHLIGHT_BORDER)
        stf = s_box.text_frame
        stf.word_wrap = True
        stf.margin_left = Inches(0.12)
        stf.margin_top = Inches(0.08)
        stf.margin_right = Inches(0.12)
        sp0 = stf.paragraphs[0]
        sp0.text = heading
        sp0.font.size = Pt(10)
        sp0.font.bold = True
        sp0.font.name = FONT_FAMILY
        sp0.font.color.rgb = C_BLUE if idx == 2 else C_DARK
        sp1 = stf.add_paragraph()
        sp1.text = detail
        sp1.font.size = Pt(9.5)
        sp1.font.name = FONT_FAMILY
        sp1.font.color.rgb = C_MUTED
        sub_top += Inches(1.02)

    # Column 2: 数字员工
    c2 = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left_positions[1], card_top, col_widths, card_height)
    set_shape_flat_style(c2, C_WHITE, C_CARD_BORDER)
    
    top_line2 = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left_positions[1], card_top, col_widths, Inches(0.08))
    set_shape_flat_style(top_line2, C_EMERALD)

    t2_box = slide.shapes.add_textbox(left_positions[1] + Inches(0.2), card_top + Inches(0.15), col_widths - Inches(1.8), Inches(0.55))
    t2_tf = t2_box.text_frame
    t2_tf.margin_left = t2_tf.margin_top = t2_tf.margin_right = t2_tf.margin_bottom = 0
    p = t2_tf.paragraphs[0]
    p.text = "🏢 数字员工｜团队经验与组织资产沉淀"
    p.font.size = Pt(13.5)
    p.font.bold = True
    p.font.name = FONT_FAMILY
    p.font.color.rgb = C_EMERALD
    p1 = t2_tf.add_paragraph()
    p1.text = "沉淀岗位认知 · SOP · 业务习惯"
    p1.font.size = Pt(9.5)
    p1.font.name = FONT_FAMILY
    p1.font.color.rgb = C_MUTED

    pill2 = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left_positions[1] + Inches(4.3), card_top + Inches(0.15), Inches(1.2), Inches(0.35))
    set_shape_flat_style(pill2, C_GREEN_BG, C_GREEN_BORDER)
    p2_tf = pill2.text_frame
    p2_tf.paragraphs[0].text = "经验资产化"
    p2_tf.paragraphs[0].font.size = Pt(9.5)
    p2_tf.paragraphs[0].font.bold = True
    p2_tf.paragraphs[0].font.name = FONT_FAMILY
    p2_tf.paragraphs[0].font.color.rgb = C_EMERALD
    p2_tf.paragraphs[0].alignment = PP_ALIGN.CENTER

    sub_items_2 = [
        ("📑 核心沉淀：岗位经验与业务直觉", "将核心骨干多年积累的实战经验、审核偏好、风控直觉与业务 SOP 高保真固化，形成组织共享认知。"),
        ("👥 核心价值：业务无缝传承，永不下线的生产力", "人员流动不再造成业务断层，新人即时调用“金牌前任分身”协同；多数字员工组成全天候自主协同的生产力集群。"),
        ("🔒 宏观收益：组织经验永续留存 · 数据不出域", "组织隐性智慧化为永不流失的核心数字资产，并在团队内部持续自我进化，推动组织效能倍数级跃迁。")
    ]
    sub_top = card_top + Inches(0.75)
    for idx, (heading, detail) in enumerate(sub_items_2):
        s_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left_positions[1] + Inches(0.2), sub_top, col_widths - Inches(0.4), Inches(0.95))
        set_shape_flat_style(s_box, C_CARD_SUB_BG if idx < 2 else C_GREEN_BG, C_GREEN_BORDER if idx == 2 else C_CARD_BORDER)
        stf = s_box.text_frame
        stf.word_wrap = True
        stf.margin_left = Inches(0.12)
        stf.margin_top = Inches(0.08)
        stf.margin_right = Inches(0.12)
        sp0 = stf.paragraphs[0]
        sp0.text = heading
        sp0.font.size = Pt(10)
        sp0.font.bold = True
        sp0.font.name = FONT_FAMILY
        sp0.font.color.rgb = C_EMERALD if idx == 2 else C_DARK
        sp1 = stf.add_paragraph()
        sp1.text = detail
        sp1.font.size = Pt(9.5)
        sp1.font.name = FONT_FAMILY
        sp1.font.color.rgb = C_MUTED
        sub_top += Inches(1.02)

    # Bottom Banner
    banner = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(5.85), Inches(11.733), Inches(0.65))
    set_shape_flat_style(banner, C_CARD_SUB_BG, C_CARD_BORDER)
    btf = banner.text_frame
    btf.word_wrap = True
    btf.margin_left = Inches(0.2)
    btf.margin_right = Inches(2.2)
    btf.margin_top = Inches(0.1)
    bp0 = btf.paragraphs[0]
    bp0.text = "从工具到延伸： 传统 AI 只是单次被动应答的外部工具； SoulAgent【代表我】：深度沉淀个人与组织的思维认知 ➔ 专家分身普惠造福社会，数字员工永续组织数字资产。"
    bp0.font.size = Pt(9.5)
    bp0.font.bold = True
    bp0.font.name = FONT_FAMILY
    bp0.font.color.rgb = C_DARK

    bp_pill = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(10.3), Inches(5.95), Inches(2.0), Inches(0.4))
    set_shape_flat_style(bp_pill, C_HIGHLIGHT_BG, C_HIGHLIGHT_BORDER)
    bptf = bp_pill.text_frame
    bpp = bptf.paragraphs[0]
    bpp.text = "智慧资产化 · 价值跃升"
    bpp.alignment = PP_ALIGN.CENTER
    bpp.font.size = Pt(9.5)
    bpp.font.bold = True
    bpp.font.name = FONT_FAMILY
    bpp.font.color.rgb = C_BLUE

    takeaway = elem.find('div', class_='slide-footer-takeaway')
    if takeaway:
        add_takeaway(slide, takeaway.get_text())

def build_slide_8(slide, elem):
    """Slide 8 (v3): SoulAgent 闭环总览."""
    header = elem.find('div', class_='slide-header')
    add_header(slide, 
               header.find('div', class_='slide-tag').get_text(strip=True),
               header.find('h2', class_='slide-title').get_text(strip=True),
               header.find('p', class_='slide-subtitle').get_text(strip=True))

    col_widths = Inches(2.7)
    left_positions = [Inches(0.8), Inches(3.8), Inches(6.8), Inches(9.8)]
    
    steps = [
        ("STEP 01", "帮我听 · 感知情报", "驻守多路现场，带回我关注的高价值情报", C_AMBER),
        ("STEP 02", "帮我做 · 认知同频", "融入个人认知与思维惯性，高契合度执行", C_SKY),
        ("STEP 03", "代表我 · 数字延伸", "专家分身与数字员工，智慧与组织资产规模化", C_INDIGO),
        ("STEP 04", "持续进化", "交互反馈：越使用 ➔ 越懂你 ➔ 越精准", C_BLUE)
    ]
    
    for i, (s_num, s_title, s_desc, s_color) in enumerate(steps):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left_positions[i], Inches(1.8), col_widths, Inches(3.3))
        set_shape_flat_style(card, C_BG_DARK, C_CARD_BORDER)
        
        top_line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left_positions[i], Inches(1.8), col_widths, Inches(0.08))
        set_shape_flat_style(top_line, s_color)
        
        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = Inches(0.15)
        
        p0 = tf.paragraphs[0]
        p0.text = s_num
        p0.alignment = PP_ALIGN.CENTER
        p0.font.size = Pt(11)
        p0.font.bold = True
        p0.font.name = FONT_FAMILY
        p0.font.color.rgb = s_color
        
        p1 = tf.add_paragraph()
        p1.text = s_title
        p1.alignment = PP_ALIGN.CENTER
        p1.font.size = Pt(13.5)
        p1.font.bold = True
        p1.font.name = FONT_FAMILY
        p1.font.color.rgb = C_DARK
        p1.space_after = Pt(8)
        
        p2 = tf.add_paragraph()
        p2.text = s_desc
        p2.alignment = PP_ALIGN.CENTER
        p2.font.size = Pt(10)
        p2.font.name = FONT_FAMILY
        p2.font.color.rgb = C_MUTED

    # Bottom Flywheel Architecture Flow Pill
    flow_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(5.35), Inches(11.733), Inches(1.05))
    set_shape_flat_style(flow_box, C_HIGHLIGHT_BG, C_HIGHLIGHT_BORDER)
    ftf = flow_box.text_frame
    ftf.word_wrap = True
    ftf.margin_left = Inches(0.2)
    ftf.margin_top = Inches(0.15)
    
    fp0 = ftf.paragraphs[0]
    fp0.text = "SoulAgent 个人智能飞轮演进"
    fp0.alignment = PP_ALIGN.CENTER
    fp0.font.size = Pt(11)
    fp0.font.bold = True
    fp0.font.name = FONT_FAMILY
    fp0.font.color.rgb = C_MUTED
    
    fp1 = ftf.add_paragraph()
    fp1.text = "外部世界 ➔ 1. 帮我听（带回我关注的信息） ➔ 2. 帮我做（融入认知与思维） ➔ 3. 代表我（成为我的数字延伸） ➔ 持续进化 Personal Intelligence System"
    fp1.alignment = PP_ALIGN.CENTER
    fp1.font.size = Pt(11)
    fp1.font.bold = True
    fp1.font.name = FONT_FAMILY
    fp1.font.color.rgb = C_BLUE

    takeaway = elem.find('div', class_='slide-footer-takeaway')
    if takeaway:
        add_takeaway(slide, takeaway.get_text())

def convert_html_to_pptx(html_path, pptx_path):
    """Main conversion pipeline."""
    if not os.path.exists(html_path):
        raise FileNotFoundError(f"Input HTML file not found: {html_path}")
        
    print(f"Reading HTML deck from: {html_path}")
    with open(html_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')

    slides_html = soup.find_all('section', class_='slide')
    print(f"Found {len(slides_html)} slides in HTML.")

    # If it's v4 (7 slides), use the v4 builder
    if "v4" in os.path.basename(html_path) or len(slides_html) == 7:
        try:
            from export_bp_v4_to_pptx import convert_v4_html_to_pptx
            convert_v4_html_to_pptx(html_path, pptx_path)
            return
        except ImportError:
            pass

    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_slide_layout = prs.slide_layouts[6]
    
    for i, slide_elem in enumerate(slides_html):
        slide = prs.slides.add_slide(blank_slide_layout)
        slide_num = i + 1
        print(f"  -> Building Slide {slide_num}...")
        
        if slide_num == 1:
            build_slide_1(slide, slide_elem)
        elif slide_num == 2:
            build_slide_2(slide, slide_elem)
        elif slide_num == 3:
            build_slide_3(slide, slide_elem)
        elif slide_num == 4:
            build_slide_4(slide, slide_elem)
        elif slide_num == 5:
            build_slide_5(slide, slide_elem)
        elif slide_num == 6:
            build_slide_6(slide, slide_elem)
        elif slide_num == 7:
            build_slide_7(slide, slide_elem)
        elif slide_num == 8:
            build_slide_8(slide, slide_elem)

    os.makedirs(os.path.dirname(os.path.abspath(pptx_path)), exist_ok=True)
    prs.save(pptx_path)
    print(f"\n✅ SUCCESS: PowerPoint deck generated at:\n   {pptx_path}")

def main():
    default_dir = os.path.dirname(os.path.abspath(__file__))
    default_html = os.path.join(default_dir, "bp v4.html")
    default_pptx = os.path.join(default_dir, "SoulAgent_Business_Plan_v4.pptx")
    
    parser = argparse.ArgumentParser(description="Convert SoulAgent HTML Deck to PPTX")
    parser.add_argument("html", nargs="?", default=default_html, help="Input HTML file path")
    parser.add_argument("output", nargs="?", default=default_pptx, help="Output PPTX file path")
    
    args = parser.parse_args()
    convert_html_to_pptx(args.html, args.output)

if __name__ == "__main__":
    main()

