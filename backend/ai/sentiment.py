"""
Gemini-first sentiment module with graceful fallbacks and enhanced rule-based analysis.

Returns dict:
{
  "model_used": str,
  "sentiment": "positive"|"negative"|"neutral",
  "score": float,
  "multiplier": float,
  "message": str
}

Behavior:
- Try Transformers first (local ML model) for reliability
- If Gemini API key exists, try Gemini as backup
- Fallback to enhanced rule-based analyzer
- Final fallback to simple rule-based
"""

import os
import re
import json
import random
import requests
from typing import Dict

# ------------------------------------
# Environment Variables
# ------------------------------------
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.0")
HF_MODEL = os.getenv("HF_MODEL", "distilbert-base-uncased-finetuned-sst-2-english")
HF_DEVICE = os.getenv("HF_DEVICE", "cpu")

# Multipliers for game logic
MULTIPLIER_POS = float(os.getenv("MULTIPLIER_POS", 1.2))
MULTIPLIER_NEU = float(os.getenv("MULTIPLIER_NEU", 1.0))
MULTIPLIER_NEG = float(os.getenv("MULTIPLIER_NEG", 0.8))

# Enhanced lexicons with weights
POSITIVE_WORDS = {
    'excellent': 1.5, 'amazing': 1.4, 'wonderful': 1.3, 'fantastic': 1.4,
    'great': 1.2, 'good': 1.0, 'happy': 1.1, 'joyful': 1.2,
    'love': 1.3, 'best': 1.4, 'perfect': 1.5, 'awesome': 1.3,
    'superb': 1.3, 'brilliant': 1.4, 'fabulous': 1.3, 'terrific': 1.3,
    'ecstatic': 1.6, 'thrilled': 1.4, 'delighted': 1.3, 'pleased': 1.1,
    'energized': 1.2, 'motivated': 1.2, 'inspired': 1.3, 'confident': 1.2,
    'strong': 1.1, 'capable': 1.1, 'successful': 1.3, 'winning': 1.4,
    'productive': 1.2, 'optimistic': 1.2, 'cheerful': 1.1, 'upbeat': 1.2,
    'excited': 1.3, 'grateful': 1.2, 'proud': 1.3, 'satisfied': 1.1,
    'content': 1.0, 'peaceful': 1.0, 'calm': 0.9, 'relaxed': 0.9,
    'fresh': 1.0, 'renewed': 1.1, 'revived': 1.2, 'rested': 1.0
}

NEGATIVE_WORDS = {
    'terrible': -1.5, 'awful': -1.4, 'horrible': -1.4, 'dreadful': -1.5,
    'bad': -1.0, 'sad': -1.1, 'depressed': -1.6, 'miserable': -1.5,
    'exhausted': -1.3, 'drained': -1.2, 'tired': -1.1, 'weary': -1.2,
    'anxious': -1.3, 'stressed': -1.3, 'worried': -1.2, 'nervous': -1.2,
    'frustrated': -1.3, 'angry': -1.4, 'annoyed': -1.1, 'irritated': -1.2,
    'overwhelmed': -1.3, 'hopeless': -1.5, 'helpless': -1.4, 'lonely': -1.3,
    'defeated': -1.4, 'failure': -1.5, 'weak': -1.2, 'painful': -1.4,
    'unmotivated': -1.3, 'down': -1.1, 'unhappy': -1.2, 'disappointed': -1.3,
    'discouraged': -1.4, 'disheartened': -1.4, 'upset': -1.2, 'hurt': -1.3,
    'bitter': -1.2, 'resentful': -1.3, 'jealous': -1.3, 'envious': -1.2,
    'guilty': -1.3, 'ashamed': -1.4, 'embarrassed': -1.2, 'regretful': -1.3,
    'fatigued': -1.2, 'sleepy': -1.0, 'lethargic': -1.3, 'sluggish': -1.2
}

# Intensity modifiers
INTENSITY_MODIFIERS = {
    'very': 1.5, 'extremely': 2.0, 'really': 1.3, 'so': 1.2,
    'incredibly': 1.8, 'absolutely': 1.7, 'totally': 1.4,
    'completely': 1.5, 'utterly': 1.6, 'somewhat': 0.7,
    'slightly': 0.5, 'a bit': 0.6, 'kind of': 0.6, 'quite': 1.1,
    'pretty': 1.1, 'fairly': 0.9, 'rather': 1.0, 'highly': 1.4,
    'deeply': 1.3, 'terribly': 1.5, 'awfully': 1.5
}

# Negation words
NEGATIONS = {'not', 'no', 'never', 'none', 'nothing', 'nobody', 
             'nowhere', 'neither', 'cannot', "can't", "won't", 
             "don't", "doesn't", "isn't", "aren't", "wasn't", 
             "weren't", "haven't", "hasn't", "hadn't", "wouldn't",
             "shouldn't", "couldn't", "mightn't", "mustn't"}

# ------------------------------------
# Helper utilities
# ------------------------------------
def pick_multiplier(sentiment: str) -> float:
    if sentiment == "positive":
        return MULTIPLIER_POS
    if sentiment == "negative":
        return MULTIPLIER_NEG
    return MULTIPLIER_NEU

def craft_enhanced_message(sentiment: str, score: float, original_text: str = "") -> str:
    """More varied and context-aware messages"""
    
    positive_messages = [
        f"Great energy detected (+{score:.2f})! You're ready to tackle challenging quests!",
        f"Positive vibes (+{score:.2f})! This momentum will carry you through tough tasks!",
        f"Excellent mood (+{score:.2f})! Perfect time to take on extra XP challenges!",
        f"You're shining (+{score:.2f})! Channel this energy into your next achievement!",
        f"Boost detected (+{score:.2f})! Your motivation will help conquer difficult goals!",
        f"High spirits (+{score:.2f})! Let's aim for ambitious targets today!",
        f"Fantastic mindset (+{score:.2f})! You're primed for success!",
        f"Positive outlook (+{score:.2f})! Great things are within reach!"
    ]
    
    negative_messages = [
        f"I hear you. Let's adjust the difficulty and focus on small, manageable steps.",
        f"Thanks for sharing. We'll take it easy today - consistency over intensity.",
        f"I understand. Let's choose gentle quests that build momentum gradually.",
        f"Noted. We'll ease into things - every small step counts toward progress.",
        f"Received. I'll tailor the challenges to be more accessible right now.",
        f"Understood. Let's start with simple wins to build confidence.",
        f"Thanks for being honest. We'll pace ourselves carefully today.",
        f"Acknowledged. We'll focus on gentle progress and self-care."
    ]
    
    neutral_messages = [
        f"Steady as you go (+{score:.2f}). Perfect for maintaining consistent progress today.",
        f"Balanced mood detected (+{score:.2f}). Great for focusing on routine quests and habits.",
        f"Neutral energy (+{score:.2f}). Let's build momentum with comfortable, achievable tasks.",
        f"Stable mindset (+{score:.2f}). Ideal for working on foundational skills and habits.",
        f"Even keel (+{score:.2f}). A good time to consolidate progress and plan next steps.",
        f"Centered mood (+{score:.2f}). Perfect for steady, reliable advancement.",
        f"Equilibrium detected (+{score:.2f}). Let's maintain this productive balance.",
        f"Level energy (+{score:.2f}). Great for building sustainable habits."
    ]
    
    if sentiment == "positive":
        return random.choice(positive_messages)
    elif sentiment == "negative":
        return random.choice(negative_messages)
    else:
        return random.choice(neutral_messages)

# ------------------------------------
# TRANSFORMERS ANALYZER (Primary)
# ------------------------------------
def analyze_sentiment_transformers(text: str) -> Dict:
    try:
        from transformers import pipeline

        device = -1
        if HF_DEVICE != "cpu":
            try:
                device = int(HF_DEVICE)
            except:
                device = -1

        # Try to load the specified model, fallback to default
        try:
            pipe = pipeline("sentiment-analysis", model=HF_MODEL, device=device)
        except:
            pipe = pipeline("sentiment-analysis", device=device)
            
        result = pipe(text[:512])[0]

        label = result["label"].lower()
        raw_score = float(result["score"])

        # Enhanced sentiment classification
        if "positive" in label:
            score = raw_score
            sentiment = "positive" if score > 0.2 else "neutral"
        elif "negative" in label:
            score = -raw_score
            sentiment = "negative" if score < -0.2 else "neutral"
        elif "neutral" in label:
            score = 0.0
            sentiment = "neutral"
        elif "5 stars" in label or "4 stars" in label:
            score = raw_score
            sentiment = "positive"
        elif "1 star" in label or "2 stars" in label:
            score = -raw_score
            sentiment = "negative"
        else:
            score = 0.0
            sentiment = "neutral"

        return {
            "model_used": f"transformers:{HF_MODEL}",
            "sentiment": sentiment,
            "score": score,
            "message": craft_enhanced_message(sentiment, score, text)
        }

    except ImportError:
        raise RuntimeError("Transformers library not installed")
    except Exception as e:
        raise RuntimeError(f"Transformers error: {e}")

# ------------------------------------
# GEMINI ANALYZER (Backup)
# ------------------------------------
def analyze_sentiment_gemini(text: str) -> Dict:
    """
    Uses Google Gemini (AI Studio key starting with AI...) to analyze sentiment.
    Returns:
      { model_used, sentiment, score, message }
    """
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY not set")

    system_instruction = (
        "You are a sentiment analysis assistant. Given the user's short text, return EXACTLY one JSON object "
        "with these fields:\n"
        "- sentiment: one of positive, negative, neutral\n"
        "- score: a number from -1.0 to 1.0\n"
        "- message: a short encouraging message.\n"
        "Return ONLY JSON. No explanations."
    )

    user_prompt = f"Text: '''{text}'''\n\nReturn EXACT JSON."

    # Gemini REST endpoint
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"

    payload = {
        "contents": [
            {"role": "system", "parts": [{"text": system_instruction}]},
            {"role": "user", "parts": [{"text": user_prompt}]}
        ]
    }

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {GEMINI_API_KEY}"
    }

    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=12)
        resp.raise_for_status()
        data = resp.json()

        # Extract the model response text
        raw_text = data["candidates"][0]["content"]["parts"][0]["text"]

        # Extract JSON substring
        m = re.search(r"(\{.*\})", raw_text, flags=re.DOTALL)
        raw_json = m.group(1) if m else raw_text

        parsed = json.loads(raw_json)

        sentiment = parsed.get("sentiment", "neutral")
        score = float(parsed.get("score", 0.0))
        message = parsed.get("message") or craft_enhanced_message(sentiment, score, text)

        return {
            "model_used": f"gemini:{GEMINI_MODEL}",
            "sentiment": sentiment,
            "score": score,
            "message": message
        }

    except Exception as e:
        raise RuntimeError(f"Gemini error: {e}")

# ------------------------------------
# ENHANCED RULE-BASED ANALYZER
# ------------------------------------
def analyze_sentiment_enhanced_rulebased(text: str) -> Dict:
    """Enhanced rule-based sentiment with intensity modifiers and phrases"""
    
    words = re.findall(r"\b[\w']+\b", text.lower())
    score = 0.0
    intensity = 1.0
    negate_next = False
    word_count = 0
    
    for i, word in enumerate(words):
        clean_word = re.sub(r'[^\w]', '', word)
        
        if not clean_word:
            continue
            
        word_count += 1
        
        # Check for intensity modifiers
        if clean_word in INTENSITY_MODIFIERS:
            intensity = INTENSITY_MODIFIERS[clean_word]
            continue
        
        # Check for negations
        if clean_word in NEGATIONS:
            negate_next = True
            continue
        
        # Check positive words
        if clean_word in POSITIVE_WORDS:
            word_score = POSITIVE_WORDS[clean_word] * intensity
            if negate_next:
                word_score = -word_score * 0.7
            score += word_score
        
        # Check negative words
        elif clean_word in NEGATIVE_WORDS:
            word_score = NEGATIVE_WORDS[clean_word] * intensity
            if negate_next:
                word_score = -word_score * 0.7
            score += word_score
        
        # Reset modifiers
        intensity = 1.0
        negate_next = False
    
    # Check for common phrases
    text_lower = text.lower()
    if any(phrase in text_lower for phrase in ["not bad", "not too bad", "could be worse"]):
        score += 0.3
    if any(phrase in text_lower for phrase in ["not great", "not good", "not happy"]):
        score -= 0.3
    if any(phrase in text_lower for phrase in ["so so", "meh", "okay", "alright"]):
        score = max(-0.1, min(0.1, score))
    
    # Normalize score
    if word_count > 0:
        normalized_score = max(-1.0, min(1.0, score / max(word_count, 3)))
    else:
        normalized_score = 0.0
    
    # Determine sentiment with adjusted thresholds
    if normalized_score > 0.25:
        sentiment = "positive"
    elif normalized_score < -0.25:
        sentiment = "negative"
    else:
        sentiment = "neutral"
    
    return {
        "model_used": "enhanced-rule-based",
        "sentiment": sentiment,
        "score": normalized_score,
        "message": craft_enhanced_message(sentiment, normalized_score, text)
    }

# ------------------------------------
# SIMPLE RULE-BASED ANALYZER (Fallback)
# ------------------------------------
def analyze_sentiment_rulebased(text: str) -> Dict:
    """Simple rule-based fallback for extreme cases"""
    words = re.findall(r"\b[\w']+\b", (text or "").lower())
    pos = sum(1 for w in words if w in POSITIVE_WORDS)
    neg = sum(1 for w in words if w in NEGATIVE_WORDS)
    score = 0.0
    if pos + neg > 0:
        score = (pos - neg) / max(1, pos + neg)
    
    # Check for neutral indicators
    if any(word in ["ok", "okay", "meh", "fine", "alright"] for word in words):
        sentiment = "neutral"
        score = 0.0
    elif score > 0.15:
        sentiment = "positive"
    elif score < -0.15:
        sentiment = "negative"
    else:
        sentiment = "neutral"
        
    return {
        "model_used": "simple-rule-based", 
        "sentiment": sentiment, 
        "score": score, 
        "message": craft_enhanced_message(sentiment, score, text)
    }

# ------------------------------------
# MAIN FACADE
# ------------------------------------
def analyze_sentiment(text: str) -> Dict:
    text = (text or "").strip()

    if not text:
        sentiment = "neutral"
        score = 0.0
        return {
            "model_used": "none",
            "sentiment": sentiment,
            "score": score,
            "multiplier": pick_multiplier(sentiment),
            "message": craft_enhanced_message(sentiment, score, "")
        }

    # 1) Transformers (Primary - most reliable)
    try:
        res = analyze_sentiment_transformers(text)
        sentiment = res["sentiment"]
        score = float(res["score"])
        return {
            "model_used": res["model_used"],
            "sentiment": sentiment,
            "score": score,
            "multiplier": pick_multiplier(sentiment),
            "message": res["message"]
        }
    except Exception as e:
        print("Transformers failed:", e)

    # 2) Gemini (if API key exists)
    if GEMINI_API_KEY:
        try:
            res = analyze_sentiment_gemini(text)
            sentiment = res["sentiment"]
            score = float(res["score"])
            return {
                "model_used": res["model_used"],
                "sentiment": sentiment,
                "score": score,
                "multiplier": pick_multiplier(sentiment),
                "message": res["message"]
            }
        except Exception as e:
            print("Gemini failed:", e)

    # 3) Enhanced rule-based
    try:
        res = analyze_sentiment_enhanced_rulebased(text)
        sentiment = res["sentiment"]
        score = float(res["score"])
        return {
            "model_used": res["model_used"],
            "sentiment": sentiment,
            "score": score,
            "multiplier": pick_multiplier(sentiment),
            "message": res["message"]
        }
    except Exception as e:
        print("Enhanced rule-based failed:", e)

    # 4) Simple rule-based fallback
    res = analyze_sentiment_rulebased(text)
    sentiment = res["sentiment"]
    score = float(res["score"])
    return {
        "model_used": "simple-rule-based",
        "sentiment": sentiment,
        "score": score,
        "multiplier": pick_multiplier(sentiment),
        "message": res["message"]
    }

# Standalone test
if __name__ == "__main__":
    tests = [
        "I'm exhausted after work",
        "I feel great and energized",
        "meh",
        "I'm feeling absolutely fantastic today!",
        "This is terrible, I can't handle it.",
        "I'm okay, nothing special.",
        "Extremely motivated and ready to conquer!",
        "Not feeling great, but not terrible either.",
        "I'm incredibly frustrated with this situation.",
        "Had a wonderful day full of achievements.",
        "Feeling a bit anxious about tomorrow.",
        "Super excited for what's coming next!",
        "Absolutely devastated by the news.",
        "Overjoyed with my progress so far!",
        "Somewhat tired but pushing through.",
        "Completely drained after that effort.",
        "Really happy with how things turned out.",
        "It's not bad, actually pretty good!",
        "Could be better, could be worse."
    ]
    
    print("=" * 60)
    print("Enhanced Sentiment Analysis Test")
    print("=" * 60)
    
    for i, t in enumerate(tests, 1):
        print(f"\nTest {i}: '{t}'")
        result = analyze_sentiment(t)
        print(f"Model: {result['model_used']}")
        print(f"Sentiment: {result['sentiment']} (Score: {result['score']:.3f})")
        print(f"Multiplier: {result['multiplier']}")
        print(f"Message: {result['message']}")
        print("-" * 40)