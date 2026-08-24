#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Export bp v4.html to PowerPoint (pptx) with all text contents preserved cleanly.
"""

import os
import sys
from bs4 import BeautifulSoup
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.dml.color import RGBColor

# Colors
C_DARK = RGBColor(15, 23, 42)          # #0f172a
C_MUTED = RGBColor(71, 85, 105)        # #475569
C_BLUE = RGBColor(37, 99, 235)         # #2563eb
C_SKY = RGBColor(2, 132, 199)          # #0284c7
C_PURPLE = RGBColor(124, 58, 237)      # #7c3aed
C_EMERALD = RGBColor(5, 150, 105)      # #059669
C_WHITE = RGBColor(255, 255, 255)
C_BG_CARD = RGBColor(255, 255, 255)
C_BG_SUB = RGBColor(248, 250, 252)     # #f8fafc
C_BORDER = RGBColor(226, 232, 240)     # #e2e8f0
C_HIGHLIGHT_BG = RGBColor(239, 246, 255)
C_HIGHLIGHT_BORDER = RGBColor(191, 219, 254)
C_RED_BG = RGBColor(255, 241, 242)
C_RED_BORDER = RGBColor(254, 202, 202)
C_RED_TEXT = RGBColor(159, 18, 57)

FONT_FAMILY = "Noto Sans SC"

def set_shape_style(shape, fill_color, border_color=None, border_width_pt=1):
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill_color
    if border_color:
        shape.line.color.rgb = border_color
        shape.line.width = Pt(border_width_pt)
    else:
        shape.line.fill.background()

def add_header(slide, tag_text, title_text, subtitle_text):
    top = Inches(0.4)
    if tag_text:
        tx = slide.shapes.add_textbox(Inches(0.8), top, Inches(11.733), Inches(0.3))
        tf = tx.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = tag_text
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.name = FONT_FAMILY
        p.font.color.rgb = C_BLUE
        top += Inches(0.26)

    if title_text:
        tx = slide.shapes.add_textbox(Inches(0.8), top, Inches(11.733), Inches(0.45))
        tf = tx.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = title_text
        p.font.size = Pt(18)
        p.font.bold = True
        p.font.name = FONT_FAMILY
        p.font.color.rgb = C_DARK
        top += Inches(0.38)

    if subtitle_text:
        tx = slide.shapes.add_textbox(Inches(0.8), top, Inches(11.733), Inches(0.4))
        tf = tx.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = subtitle_text
        p.font.size = Pt(10.5)
        p.font.name = FONT_FAMILY
        p.font.color.rgb = C_MUTED

def add_takeaway(slide, takeaway_text):
    box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.65), Inches(11.733), Inches(0.55))
    set_shape_style(box, C_HIGHLIGHT_BG, C_HIGHLIGHT_BORDER)
    tf = box.text_frame
    tf.word_wrap = True
    tf.margin_left = Inches(0.2)
    tf.margin_right = Inches(0.2)
    tf.margin_top = Inches(0.08)
    p = tf.paragraphs[0]
    clean_text = takeaway_text.replace("“", "").replace("”", "").strip()
    p.text = "“ " + clean_text + " ”"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.name = FONT_FAMILY
    p.font.color.rgb = C_BLUE

def build_v4_slide_1(slide, elem):
    # Slide 1: Cover
    hero_tag = elem.find('div', class_='slide-tag').get_text(strip=True) if elem.find('div', class_='slide-tag') else "Personal Intelligence System"
    hero_title = elem.find('h1', class_='hero-title').get_text(strip=True) if elem.find('h1', class_='hero-title') else "SoulAgent"
    hero_slogan = elem.find('div', class_='hero-slogan').get_text(strip=True) if elem.find('div', class_='hero-slogan') else "从千人一面的通用智能，到千人千面的个人智能"
    
    # Tag
    tx = slide.shapes.add_textbox(Inches(0.8), Inches(1.8), Inches(11.733), Inches(0.4))
    p = tx.text_frame.paragraphs[0]
    p.text = hero_tag
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.name = FONT_FAMILY
    p.font.color.rgb = C_BLUE

    # Title
    tx = slide.shapes.add_textbox(Inches(0.8), Inches(2.3), Inches(11.733), Inches(1.2))
    p = tx.text_frame.paragraphs[0]
    p.text = hero_title
    p.font.size = Pt(54)
    p.font.bold = True
    p.font.name = FONT_FAMILY
    p.font.color.rgb = C_DARK

    # Slogan
    tx = slide.shapes.add_textbox(Inches(0.8), Inches(3.6), Inches(11.733), Inches(0.6))
    p = tx.text_frame.paragraphs[0]
    p.text = hero_slogan
    p.font.size = Pt(22)
    p.font.bold = True
    p.font.name = FONT_FAMILY
    p.font.color.rgb = C_DARK

    # Keywords
    kw_elems = elem.find_all('div', class_='keyword-pill')
    keywords = [kw.get_text(strip=True) for kw in kw_elems] or ["记住你", "理解你", "适应你", "替你行动"]
    left = Inches(0.8)
    for kw in keywords:
        pill = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, Inches(4.6), Inches(1.8), Inches(0.45))
        set_shape_style(pill, C_HIGHLIGHT_BG, C_HIGHLIGHT_BORDER)
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
        add_takeaway(slide, takeaway.get_text(strip=True))

def build_v4_slide_2(slide, elem):
    # Slide 2: Industry Evolution (3 Cards: Past, Present, Future)
    header = elem.find('div', class_='slide-header')
    add_header(slide,
               header.find('div', class_='slide-tag').get_text(strip=True) if header.find('div', class_='slide-tag') else "",
               header.find('h2', class_='slide-title').get_text(strip=True) if header.find('h2', class_='slide-title') else "",
               header.find('p', class_='slide-subtitle').get_text(strip=True) if header.find('p', class_='slide-subtitle') else "")

    cards_data = [
        {
            "tag": "过去",
            "title": "大语言模型",
            "subtitle": "ChatGPT · 豆包 · DeepSeek",
            "inter": "交互方式：你问我答（单次被动响应）",
            "nature": "能力本质：海量通用数据概率生成",
            "example_q": "你说：“帮我写一份业务汇报PPT大纲”",
            "example_a": "AI：给出通用的PPT标准大纲框架（需你自己从头填补业务内容）。",
            "summary": "“能回答问题，但无法执行任务”",
            "color": RGBColor(100, 116, 139),
            "bg": C_BG_SUB
        },
        {
            "tag": "当前",
            "title": "智能体 (Agent)",
            "subtitle": "Claude Code · WorkBuddy · Manus",
            "inter": "交互方式：你下令我执行（多步工具调用）",
            "nature": "能力本质：任务驱动的自动流程调度",
            "example_q": "你说：“读这5个文件，提取Q3营收做成PPT发邮件给张总”",
            "example_a": "AI：调用工具自动抽取并排版发送，但必须指令完备，无法理解隐形需求、不具备个性化风格。",
            "summary": "“能做很多事，但需要给全背景和详细指引”",
            "color": C_PURPLE,
            "bg": C_BG_SUB
        },
        {
            "tag": "未来",
            "title": "个人智能",
            "subtitle": "SoulAgent",
            "inter": "交互方式：意图感知 + 主动协同（隐性理解）",
            "nature": "能力本质：用户认知模型 + 长期 Context",
            "example_q": "你说：“周一跟张总的复盘会帮我准备下”",
            "example_a": "AI：通过近期交互识别相关内容重点，结合历史方案反馈，理解你的汇报偏好，直接生成贴合你立场的专属方案草稿。",
            "summary": "“懂做事，懂业务上下文，更懂你的心思”",
            "color": C_BLUE,
            "bg": C_HIGHLIGHT_BG
        }
    ]

    left_pos = [Inches(0.8), Inches(4.8), Inches(8.8)]
    col_w = Inches(3.7)

    for i, c in enumerate(cards_data):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left_pos[i], Inches(1.6), col_w, Inches(5.1))
        border_c = C_HIGHLIGHT_BORDER if i == 2 else C_BORDER
        set_shape_style(card, c["bg"], border_c)

        # Top bar
        top_bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left_pos[i], Inches(1.6), col_w, Inches(0.08))
        set_shape_style(top_bar, c["color"])

        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0.18)

        # Tag
        p = tf.paragraphs[0]
        p.text = f"【 {c['tag']} 】"
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.name = FONT_FAMILY
        p.font.color.rgb = c["color"]

        # Title
        p1 = tf.add_paragraph()
        p1.text = c["title"]
        p1.font.size = Pt(16)
        p1.font.bold = True
        p1.font.name = FONT_FAMILY
        p1.font.color.rgb = c["color"]

        # Subtitle
        p2 = tf.add_paragraph()
        p2.text = c["subtitle"]
        p2.font.size = Pt(9.5)
        p2.font.name = FONT_FAMILY
        p2.font.color.rgb = C_MUTED
        p2.space_after = Pt(8)

        # Details
        p3 = tf.add_paragraph()
        p3.text = f"• {c['inter']}\n• {c['nature']}"
        p3.font.size = Pt(9.5)
        p3.font.name = FONT_FAMILY
        p3.font.color.rgb = C_DARK
        p3.space_after = Pt(8)

        # Example
        p4 = tf.add_paragraph()
        p4.text = f"具象场景：\n{c['example_q']}\n➔ {c['example_a']}"
        p4.font.size = Pt(9)
        p4.font.name = FONT_FAMILY
        p4.font.color.rgb = C_MUTED
        p4.space_after = Pt(8)

        # Summary
        p5 = tf.add_paragraph()
        p5.text = c["summary"]
        p5.font.size = Pt(10)
        p5.font.bold = True
        p5.font.name = FONT_FAMILY
        p5.font.color.rgb = c["color"]
        p5.alignment = PP_ALIGN.CENTER

def build_v4_slide_3(slide, elem):
    # Slide 3: Three Pain Points (3 Rows)
    header = elem.find('div', class_='slide-header')
    add_header(slide,
               header.find('div', class_='slide-tag').get_text(strip=True) if header.find('div', class_='slide-tag') else "",
               header.find('h2', class_='slide-title').get_text(strip=True) if header.find('h2', class_='slide-title') else "",
               header.find('p', class_='slide-subtitle').get_text(strip=True) if header.find('p', class_='slide-subtitle') else "")

    pains = [
        {
            "tag": "痛点 01 ｜ 表达门槛高",
            "title": "写不好 Prompt",
            "desc": "高质量 Prompt 门槛极高，通用模板难以适配个性化业务；人脑中的背景与隐性偏好，无法仅凭简短指令完整表达。",
            "dilemma": "现实困境：意图难言尽。简单提问只得空泛套话，反复调试提示词耗时费力，沟通成本远超预期。",
            "warn": "过度依赖提示词技巧\n门槛高、调试累，难达预期",
            "color": C_PURPLE
        },
        {
            "tag": "痛点 02 ｜ 缺乏统一中枢",
            "title": "信息碎片化",
            "desc": "日常会议、行业视听与专业材料分散各处，缺乏统一的感知与沉淀中枢；传统 AI 仅能被动等待投喂，无法主动捕捉关键增量。",
            "dilemma": "现实困境：脉络难串联。高价值情报与工作上下文随用随散，无法沉淀为连贯完整的业务脉络。",
            "warn": "高价值碎片随用随散\n被动孤立响应，难以沉淀",
            "color": C_SKY
        },
        {
            "tag": "痛点 03 ｜ 缺乏认知沉淀",
            "title": "记忆死记硬背",
            "desc": "现存记忆机制多停留在零散事实记录，未能真正理解用户的思考框架、工作标准与价值判断。",
            "dilemma": "现实困境：决策难同频。面对复杂新任务时，缺乏智能的自适应调用机制，不知何时用、用多少，依然无法像你一样精准决策。",
            "warn": "记事实未学思维\n缺乏认知模型，难以自主决策",
            "color": C_BLUE
        }
    ]

    top_positions = [Inches(1.65), Inches(3.2), Inches(4.75)]
    for i, p in enumerate(pains):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), top_positions[i], Inches(11.733), Inches(1.4))
        set_shape_style(card, C_BG_CARD, C_BORDER)

        # Left stripe
        stripe = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), top_positions[i], Inches(0.1), Inches(1.4))
        set_shape_style(stripe, p["color"])

        # Col 1: Title & Tag
        tx1 = slide.shapes.add_textbox(Inches(1.1), top_positions[i] + Inches(0.15), Inches(2.5), Inches(1.1))
        tf1 = tx1.text_frame
        tf1.word_wrap = True
        tf1.margin_left = tf1.margin_top = 0
        pp0 = tf1.paragraphs[0]
        pp0.text = p["tag"]
        pp0.font.size = Pt(9.5)
        pp0.font.bold = True
        pp0.font.name = FONT_FAMILY
        pp0.font.color.rgb = p["color"]
        pp1 = tf1.add_paragraph()
        pp1.text = p["title"]
        pp1.font.size = Pt(15)
        pp1.font.bold = True
        pp1.font.name = FONT_FAMILY
        pp1.font.color.rgb = C_DARK

        # Col 2: Description & Dilemma
        tx2 = slide.shapes.add_textbox(Inches(3.7), top_positions[i] + Inches(0.12), Inches(6.0), Inches(1.15))
        tf2 = tx2.text_frame
        tf2.word_wrap = True
        tf2.margin_left = tf2.margin_top = 0
        pp2 = tf2.paragraphs[0]
        pp2.text = p["desc"]
        pp2.font.size = Pt(9.5)
        pp2.font.name = FONT_FAMILY
        pp2.font.color.rgb = C_DARK
        pp2.space_after = Pt(3)
        pp3 = tf2.add_paragraph()
        pp3.text = p["dilemma"]
        pp3.font.size = Pt(9)
        pp3.font.bold = True
        pp3.font.name = FONT_FAMILY
        pp3.font.color.rgb = C_MUTED

        # Col 3: Warning Box
        w_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(9.9), top_positions[i] + Inches(0.18), Inches(2.4), Inches(1.0))
        set_shape_style(w_box, C_RED_BG, C_RED_BORDER)
        wtf = w_box.text_frame
        wtf.word_wrap = True
        wtf.margin_left = wtf.margin_right = Inches(0.1)
        wp = wtf.paragraphs[0]
        wp.text = p["warn"]
        wp.font.size = Pt(9)
        wp.font.bold = True
        wp.font.name = FONT_FAMILY
        wp.font.color.rgb = C_RED_TEXT
        wp.alignment = PP_ALIGN.CENTER

def build_v4_slide_4(slide, elem):
    # Slide 4: 6 Sessions Evolution Grid
    header = elem.find('div', class_='slide-header')
    add_header(slide,
               header.find('div', class_='slide-tag').get_text(strip=True) if header.find('div', class_='slide-tag') else "",
               header.find('h2', class_='slide-title').get_text(strip=True) if header.find('h2', class_='slide-title') else "",
               header.find('p', class_='slide-subtitle').get_text(strip=True) if header.find('p', class_='slide-subtitle') else "")

    sessions = [
        {
            "num": "01",
            "title": "Session 01 ｜ 第一次写周报",
            "pill": "输入 80 字",
            "dialog": "你说：“帮我写份汇报发给张总，多放数据，结论放最前面，不要客套话。”",
            "mem": "🗄️ 写入记忆：张总角色、本周业务增长数据、当前项目背景",
            "cog": "🧠 写入认知：给张总汇报的习惯：先说结论、用数据说话、不要客套话",
            "highlight": False
        },
        {
            "num": "02",
            "title": "Session 02 ｜ 听 2 小时行业会",
            "pill": "帮我听",
            "dialog": "你说：“把今天 2 小时的 AI 峰会录音听一下，挑跟我相关的发我。”",
            "mem": "🗄️ 写入记忆：行业峰会核心观点、竞品新动态、关键时间戳",
            "cog": "🧠 写入认知：我的关注点：重点看模型落地和端侧产品，跳过开场寒暄",
            "highlight": False
        },
        {
            "num": "03",
            "title": "Session 03 ｜ 修改方案提要求",
            "pill": "立规矩",
            "dialog": "你说：“方案太散了，以后只要做方案，必须按‘背景-问题-解法-排期’四个板块来。”",
            "mem": "🗄️ 写入记忆：本次方案存在的问题和修改后的最终版本",
            "cog": "🧠 写入认知：我做方案的固定规矩：必须严格按四板块结构展开",
            "highlight": False
        },
        {
            "num": "04",
            "title": "Session 04 ｜ 整理开会纪要",
            "pill": "会后协同",
            "dialog": "你说：“把刚才 5 个人的开会录音整理成纪要，发给大家。”",
            "mem": "🗄️ 写入记忆：参会人员姓名、会上争论的问题、定下来的 3 个待办",
            "cog": "🧠 写入认知：整理会议的习惯：分歧客观记录、待办写清责任人和截止时间",
            "highlight": False
        },
        {
            "num": "05",
            "title": "Session 05 ｜ 起草新项目方案",
            "pill": "输入 10 个字",
            "dialog": "你说：“帮我起草一份新项目的立项方案。”",
            "mem": "🗄️ 调用记忆：新项目的基本目标和相关业务背景",
            "cog": "🧠 应用认知：自动套用 Session 03 的“四板块”规矩，不用再教一遍",
            "highlight": False
        },
        {
            "num": "06",
            "title": "Session 06 ｜ 主动提醒（用上以前听到的）",
            "pill": "主动提醒 · 0字",
            "dialog": "AI 主动找你：“你正在看的方案，跟上周你让我听的行业峰会里嘉宾讲的坑一模一样，我把要点给你翻出来了！”",
            "mem": "🗄️ 写入记忆：当前技术方案与历史会议内容的关联记录",
            "cog": "🧠 写入认知：发现相关业务风险时，主动调取历史听到的资料提醒我",
            "highlight": True
        }
    ]

    left_positions = [Inches(0.8), Inches(4.8), Inches(8.8), Inches(0.8), Inches(4.8), Inches(8.8)]
    top_positions = [Inches(1.65), Inches(1.65), Inches(1.65), Inches(3.9), Inches(3.9), Inches(3.9)]
    col_w = Inches(3.7)
    card_h = Inches(2.1)

    for i, s in enumerate(sessions):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left_positions[i], top_positions[i], col_w, card_h)
        bg = C_HIGHLIGHT_BG if s["highlight"] else C_BG_CARD
        border_c = C_HIGHLIGHT_BORDER if s["highlight"] else C_BORDER
        set_shape_style(card, bg, border_c)

        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0.12)

        # Header: Title + Pill
        p0 = tf.paragraphs[0]
        p0.text = f"{s['title']}  [{s['pill']}]"
        p0.font.size = Pt(10)
        p0.font.bold = True
        p0.font.name = FONT_FAMILY
        p0.font.color.rgb = C_BLUE if s["highlight"] else C_DARK
        p0.space_after = Pt(3)

        # Dialog
        p1 = tf.add_paragraph()
        p1.text = s["dialog"]
        p1.font.size = Pt(8.5)
        p1.font.name = FONT_FAMILY
        p1.font.color.rgb = C_MUTED
        p1.space_after = Pt(4)

        # Mem
        p2 = tf.add_paragraph()
        p2.text = s["mem"]
        p2.font.size = Pt(8)
        p2.font.name = FONT_FAMILY
        p2.font.color.rgb = C_EMERALD
        p2.space_after = Pt(2)

        # Cog
        p3 = tf.add_paragraph()
        p3.text = s["cog"]
        p3.font.size = Pt(8)
        p3.font.name = FONT_FAMILY
        p3.font.color.rgb = C_PURPLE

    takeaway = elem.find('div', class_='slide-footer-takeaway')
    if takeaway:
        add_takeaway(slide, takeaway.get_text(strip=True))

def build_v4_slide_5(slide, elem):
    # Slide 5: 帮我听 (P5)
    header = elem.find('div', class_='slide-header')
    add_header(slide,
               header.find('div', class_='slide-tag').get_text(strip=True) if header.find('div', class_='slide-tag') else "",
               header.find('h2', class_='slide-title').get_text(strip=True) if header.find('h2', class_='slide-title') else "",
               header.find('p', class_='slide-subtitle').get_text(strip=True) if header.find('p', class_='slide-subtitle') else "")

    cols_data = [
        {
            "tag": "替我感知海量场景",
            "title": "驻守任意关键信息源",
            "items": [
                "🎤 行业峰会 / 论坛：多场并行分论坛无暇分身，AI 替我逐场深度精听。",
                "🚀 发布会 & 行业直播：实时追踪新品发布、竞对动态与行业路演。",
                "📺 B站 / 访谈播客 / 视频：数小时深度对谈与长视频，无需手动快进。",
                "📚 系列专业课程：体系化长课程自动梳理，免去几十小时死磕。"
            ],
            "color": C_BLUE,
            "bg": C_BG_CARD
        },
        {
            "tag": "AI 在后台做什么",
            "title": "深度理解与精准过滤",
            "items": [
                "🔍 全量长音视频多模态解析：深度理解讲者演讲逻辑、展示图表与数据论据。",
                "⚡ 智能过滤口水冗余：剔除客套暖场、无意义寒暄与无关插曲，直击干货结论。",
                "🎯 实时匹配个人 Context：对照你当前负责的业务方向、技术课题与关注焦点定向捕捉。"
            ],
            "color": C_PURPLE,
            "bg": C_HIGHLIGHT_BG
        },
        {
            "tag": "会带给我什么",
            "title": "即时可用的专属成果",
            "items": [
                "⏱️ 极致释放个人精力：省下数小时盯盘听会时间，同时掌握多领域全局动态，绝不错失要点。",
                "📑 结构化专属知识卡片：带时间戳的核心观点、论据金句与全景脑图，3 分钟即可速览。",
                "💡 业务关联与决策素材：自动识别与我相关，提供后续思考与行动参考。"
            ],
            "color": C_EMERALD,
            "bg": C_BG_CARD
        }
    ]

    left_pos = [Inches(0.8), Inches(4.8), Inches(8.8)]
    col_w = Inches(3.7)

    for i, c in enumerate(cols_data):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left_pos[i], Inches(1.65), col_w, Inches(4.8))
        set_shape_style(card, c["bg"], C_BORDER)

        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0.18)

        p0 = tf.paragraphs[0]
        p0.text = f"【 {c['tag']} 】"
        p0.font.size = Pt(10)
        p0.font.bold = True
        p0.font.name = FONT_FAMILY
        p0.font.color.rgb = c["color"]

        p1 = tf.add_paragraph()
        p1.text = c["title"]
        p1.font.size = Pt(14)
        p1.font.bold = True
        p1.font.name = FONT_FAMILY
        p1.font.color.rgb = C_DARK
        p1.space_after = Pt(10)

        for item in c["items"]:
            p = tf.add_paragraph()
            p.text = f"• {item}"
            p.font.size = Pt(9.5)
            p.font.name = FONT_FAMILY
            p.font.color.rgb = C_MUTED
            p.space_after = Pt(8)

    takeaway = elem.find('div', class_='slide-footer-takeaway')
    if takeaway:
        add_takeaway(slide, takeaway.get_text(strip=True))

def build_v4_slide_6(slide, elem):
    # Slide 6: 帮我做 (P6)
    header = elem.find('div', class_='slide-header')
    add_header(slide,
               header.find('div', class_='slide-tag').get_text(strip=True) if header.find('div', class_='slide-tag') else "",
               header.find('h2', class_='slide-title').get_text(strip=True) if header.find('h2', class_='slide-title') else "",
               header.find('p', class_='slide-subtitle').get_text(strip=True) if header.find('p', class_='slide-subtitle') else "")

    scenes = [
        {
            "tag": "教育场景 ｜ 教师智能工作台",
            "subtag": "融入教学思维 · 懂教师偏好 · 知学生学情",
            "pill": "作业批改 & 学情诊断",
            "items": [
                ("📝 智能批改作业与针对性讲评", "不仅指出对错，更按老师一贯的讲评逻辑给出有温度、启发式的个性化批语，契合老师的育人标准。"),
                ("👩‍🎓 知晓学生历史轨迹与薄弱点", "自动关联学生过往错题与认知卡点，生成差异化辅导建议，真正实现因材施教。"),
                ("📊 班级共性态势与教学调整", "提炼全班共性易错项，辅助班主任调整下周教学重点与家校沟通策略。")
            ],
            "color": C_BLUE,
            "bg": C_HIGHLIGHT_BG
        },
        {
            "tag": "工作场景 ｜ PPT 策划与智能生成",
            "subtag": "懂汇报场景 · 懂侧重风格 · 懂表达习惯",
            "pill": "场景定制 & 汇报生成",
            "items": [
                ("🎯 适配不同场景与侧重点", "给领导汇报重商业价值与结论，技术评审重架构与落地路径，对外提案重痛点与收益，自动匹配侧重点。"),
                ("🎨 契合个人风格与叙事习惯", "理解你一贯的逻辑结构（结论先行/金字塔原理）、语言风格与排版审美，彻底摆脱千篇一律的通用模板。"),
                ("📑 结合历史沉淀与项目 Context", "自动调取过往业务数据与项目背景，生成论据扎实、逻辑自洽的高质量 PPT，极大减少排版与修改成本。")
            ],
            "color": C_PURPLE,
            "bg": C_BG_CARD
        }
    ]

    left_pos = [Inches(0.8), Inches(6.8)]
    col_w = Inches(5.7)

    for i, s in enumerate(scenes):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left_pos[i], Inches(1.65), col_w, Inches(4.1))
        set_shape_style(card, s["bg"], C_BORDER)

        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0.18)

        p0 = tf.paragraphs[0]
        p0.text = f"{s['tag']}   [{s['pill']}]"
        p0.font.size = Pt(13)
        p0.font.bold = True
        p0.font.name = FONT_FAMILY
        p0.font.color.rgb = s["color"]

        p1 = tf.add_paragraph()
        p1.text = s["subtag"]
        p1.font.size = Pt(9.5)
        p1.font.name = FONT_FAMILY
        p1.font.color.rgb = C_MUTED
        p1.space_after = Pt(8)

        for h, d in s["items"]:
            p = tf.add_paragraph()
            p.text = f"• {h}\n  {d}"
            p.font.size = Pt(9.5)
            p.font.name = FONT_FAMILY
            p.font.color.rgb = C_DARK
            p.space_after = Pt(6)

    # Banner
    banner = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(5.85), Inches(11.733), Inches(0.65))
    set_shape_style(banner, C_BG_SUB, C_BORDER)
    btf = banner.text_frame
    btf.word_wrap = True
    btf.margin_left = Inches(0.2)
    btf.margin_top = Inches(0.1)
    bp = btf.paragraphs[0]
    bp.text = "对比传统 AI：仅凭单次 Prompt 生成机械套话，需大量人工返工；\nSoulAgent【帮我做】：融入个人认知 + 历史思维脉络 + 业务专业逻辑 ➔ 一次成稿即达可用标准。"
    bp.font.size = Pt(9.5)
    bp.font.bold = True
    bp.font.name = FONT_FAMILY
    bp.font.color.rgb = C_DARK

    takeaway = elem.find('div', class_='slide-footer-takeaway')
    if takeaway:
        add_takeaway(slide, takeaway.get_text(strip=True))

def build_v4_slide_7(slide, elem):
    # Slide 7: 代表我 (P7)
    header = elem.find('div', class_='slide-header')
    add_header(slide,
               header.find('div', class_='slide-tag').get_text(strip=True) if header.find('div', class_='slide-tag') else "",
               header.find('h2', class_='slide-title').get_text(strip=True) if header.find('h2', class_='slide-title') else "",
               header.find('p', class_='slide-subtitle').get_text(strip=True) if header.find('p', class_='slide-subtitle') else "")

    roles = [
        {
            "tag": "🎓 专家分身 ｜ 个人智慧与影响力规模化",
            "subtag": "学习思维模式 · 认知结构 · 专业偏好",
            "pill": "智慧资产化",
            "items": [
                ("🧠 核心沉淀：思维逻辑与决策直觉", "不仅是知识检索，更深度沉淀专家的分析框架、专业认知、价值判断与表达偏好，让分身具备专家的思考灵魂。"),
                ("🌐 核心价值：突破精力瓶颈，无限并发赋能", "打破个人时间与精力的物理天花板，从“1 个专家只能服务少数人”，跃升为“1 个专家分身 7×24h 规模化答疑赋能”。"),
                ("🌟 宏观收益：扩大个人影响力 · 普惠造福社会", "让稀缺的顶尖专业智慧无门槛普惠大众，实现专家智慧终身资产化，最大化社会价值与个人品牌影响力。")
            ],
            "color": C_BLUE,
            "bg": C_HIGHLIGHT_BG
        },
        {
            "tag": "🏢 数字员工 ｜ 团队经验与组织资产沉淀",
            "subtag": "沉淀岗位认知 · SOP · 业务习惯",
            "pill": "经验资产化",
            "items": [
                ("📑 核心沉淀：岗位经验与业务直觉", "将核心骨干多年积累的实战经验、审核偏好、风控直觉与业务 SOP 高保真固化，形成组织共享认知。"),
                ("👥 核心价值：业务无缝传承，永不下线的生产力", "人员流动不再造成业务断层，新人即时调用“金牌前任分身”协同；多数字员工组成全天候自主协同的生产力集群。"),
                ("🔒 宏观收益：组织经验永续留存 · 数据不出域", "组织隐性智慧化为永不流失的核心数字资产，并在团队内部持续自我进化，推动组织效能倍数级跃迁。")
            ],
            "color": C_EMERALD,
            "bg": C_BG_CARD
        }
    ]

    left_pos = [Inches(0.8), Inches(6.8)]
    col_w = Inches(5.7)

    for i, r in enumerate(roles):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left_pos[i], Inches(1.65), col_w, Inches(4.1))
        set_shape_style(card, r["bg"], C_BORDER)

        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0.18)

        p0 = tf.paragraphs[0]
        p0.text = f"{r['tag']}   [{r['pill']}]"
        p0.font.size = Pt(13)
        p0.font.bold = True
        p0.font.name = FONT_FAMILY
        p0.font.color.rgb = r["color"]

        p1 = tf.add_paragraph()
        p1.text = r["subtag"]
        p1.font.size = Pt(9.5)
        p1.font.name = FONT_FAMILY
        p1.font.color.rgb = C_MUTED
        p1.space_after = Pt(8)

        for h, d in r["items"]:
            p = tf.add_paragraph()
            p.text = f"• {h}\n  {d}"
            p.font.size = Pt(9.5)
            p.font.name = FONT_FAMILY
            p.font.color.rgb = C_DARK
            p.space_after = Pt(6)

    # Banner
    banner = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(5.85), Inches(11.733), Inches(0.65))
    set_shape_style(banner, C_BG_SUB, C_BORDER)
    btf = banner.text_frame
    btf.word_wrap = True
    btf.margin_left = Inches(0.2)
    btf.margin_top = Inches(0.1)
    bp = btf.paragraphs[0]
    bp.text = "从工具到延伸：传统 AI 只是单次被动应答的外部工具；\nSoulAgent【代表我】：深度沉淀个人与组织的思维认知 ➔ 专家分身普惠造福社会，数字员工永续组织数字资产。"
    bp.font.size = Pt(9.5)
    bp.font.bold = True
    bp.font.name = FONT_FAMILY
    bp.font.color.rgb = C_DARK

    takeaway = elem.find('div', class_='slide-footer-takeaway')
    if takeaway:
        add_takeaway(slide, takeaway.get_text(strip=True))

def convert_v4_html_to_pptx(html_path, pptx_path):
    if not os.path.exists(html_path):
        raise FileNotFoundError(f"Input HTML file not found: {html_path}")

    print(f"Reading HTML deck from: {html_path}")
    with open(html_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')

    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    slides_html = soup.find_all('section', class_='slide')
    print(f"Found {len(slides_html)} slides in HTML.")

    builders = [
        build_v4_slide_1,
        build_v4_slide_2,
        build_v4_slide_3,
        build_v4_slide_4,
        build_v4_slide_5,
        build_v4_slide_6,
        build_v4_slide_7,
    ]

    for i, slide_elem in enumerate(slides_html):
        slide = prs.slides.add_slide(blank_layout)
        slide_num = i + 1
        print(f"  -> Building Slide {slide_num}...")
        if i < len(builders):
            builders[i](slide, slide_elem)

    os.makedirs(os.path.dirname(os.path.abspath(pptx_path)), exist_ok=True)
    prs.save(pptx_path)
    print(f"\n✅ SUCCESS: PowerPoint deck generated at:\n   {pptx_path}")

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    input_html = os.path.join(current_dir, "bp v4.html")
    output_pptx = os.path.join(current_dir, "SoulAgent_Business_Plan_v4.pptx")
    convert_v4_html_to_pptx(input_html, output_pptx)
