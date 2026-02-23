import os
import json
import re
import time
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=os.getenv("GOOGLE_API_KEY"),
    temperature=0.1,
    max_retries=3
)


def rule_based_spam_score(text):
    score = 0
    
    # Too many links
    if len(re.findall(r"http[s]?://", text)) > 1:
        score += 0.4
    
    # Repeated characters
    if re.search(r"(.)\1{4,}", text):
        score += 0.3
    
    # All caps
    if text.isupper():
        score += 0.2
    
    # Repeated words
    words = text.lower().split()
    if len(words) != len(set(words)):
        score += 0.1

    return min(score, 1.0)


def llm_moderation(text):
    prompt = f"""
    You are a strict academic content moderation AI.
    
    Classify the message into one of:
    SAFE
    HATE_SPEECH
    HARASSMENT
    SPAM
    SEXUAL
    VIOLENCE
    
    Message:
    "{text}"
    
    Return ONLY valid JSON:
    {{
        "label": "...",
        "confidence": number_between_0_and_1
    }}
    """

    try:
        response = llm.invoke(prompt)
        return json.loads(response.content)
    except Exception as e:
        if "429" in str(e):
            time.sleep(60)
            response = llm.invoke(prompt)
            return json.loads(response.content)
        return {"label": "ERROR", "confidence": 0}


def moderate_text(text):
    llm_result = llm_moderation(text)
    spam_score = rule_based_spam_score(text)

    # If rule-based spam high → override
    if spam_score > 0.6:
        return {
            "label": "SPAM",
            "confidence": spam_score,
            "blocked": True,
            "source": "rule_based"
        }

    # LLM decision
    blocked = False
    if llm_result["label"] != "SAFE" and llm_result["confidence"] > 0.7:
        blocked = True

    return {
        "label": llm_result["label"],
        "confidence": llm_result["confidence"],
        "blocked": blocked,
        "source": "llm"
    }