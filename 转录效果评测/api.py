import os
from openai import OpenAI

# 初始化 OpenAI 客户端（支持自定义 base_url，可适配各类大模型服务商）
client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY", "YOUR_API_KEY_HERE"),
    base_url=os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1")  # 如果使用中转、Claude/DeepSeek 或国内服务商，可在此处修改
)

# 对话历史与当前 prompt 定义（已包含一轮历史对话）
messages = [
    {
        "role": "system",
        "content": "SYSTEM_PROMPT_PLACEHOLDER"  # [系统提示词占位符]
    },
    # --- 第一轮历史对话（占位符） ---
    {
        "role": "user",
        "content": "HISTORICAL_USER_MESSAGE_PLACEHOLDER"  # [历史对话：第一轮用户输入]
    },
    {
        "role": "assistant",
        "content": "HISTORICAL_ASSISTANT_RESPONSE_PLACEHOLDER"  # [历史对话：第一轮AI回复]
    },
    # -----------------------------
    
    # 当前轮新输入
    {
        "role": "user",
        "content": "CURRENT_USER_MESSAGE_PLACEHOLDER"  # [当前轮用户新输入]
    }
]

def main():
    # 调用的模型名称占位符（例如: gpt-4o, claude-3-5-sonnet, deepseek-chat 等）
    model_name = "gpt-4o"
    
    try:
        print(f"正在向模型 [{model_name}] 发送请求...")
        
        response = client.chat.completions.create(
            model=model_name,
            messages=messages,
            temperature=0.7,
            # stream=True,  # 如需流式输出可取消注释并修改下方打印逻辑
        )
        
        # 获取并打印回复内容
        reply = response.choices[0].message.content
        print("\n=== AI 回复 ===")
        print(reply)
        
    except Exception as e:
        print(f"\n请求发生错误: {e}")

if __name__ == "__main__":
    main()
