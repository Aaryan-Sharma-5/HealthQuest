from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.database import get_db
from bson import ObjectId
import logging
import os
import random

try:
    from google import genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    logging.warning("google-genai not installed. Install with: pip install google-genai")

logger = logging.getLogger(__name__)

ai_bp = Blueprint('ai', __name__, url_prefix='/api/ai')

# Initialize Gemini if available
if GEMINI_AVAILABLE:
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    if GEMINI_API_KEY and GEMINI_API_KEY != 'GEMINI_API_KEY':
        try:
            gemini_client = genai.Client(api_key=GEMINI_API_KEY)
            logger.info("✅ Gemini API initialized successfully")
        except Exception as e:
            logger.warning(f"Failed to initialize Gemini: {e}")
            gemini_client = None
    else:
        gemini_client = None
        logger.warning("⚠️ GEMINI_API_KEY not set in .env file")
else:
    gemini_client = None

# Quest narrative templates for fallback
QUEST_NARRATIVES = {
    'movement': [
        "The ancient forest path beckons. Your body craves motion, warrior. Take {target} steps to unlock its secrets.",
        "The Mountain of Vitality stands before you. Climb {target} steps to reach its peak and claim your reward.",
        "Your rival challenges you to a race! Show your endurance by completing {target} steps today.",
        "The healing springs lie {target} steps away. Your journey to wellness continues."
    ],
    'meditation': [
        "The Temple of Tranquility awaits. Meditate for {target} minutes to restore your inner balance.",
        "Dark thoughts cloud your mind. Spend {target} minutes in meditation to dispel the shadows.",
        "The Wise Elder teaches: 'Peace comes from within.' Meditate {target} minutes to unlock wisdom.",
        "Your mental armor needs repair. {target} minutes of mindfulness will strengthen your resolve."
    ],
    'nutrition': [
        "The Feast Hall of Heroes awaits! Consume {target} healthy meals to fuel your adventure.",
        "Your body is a temple. Honor it with {target} nutritious meals today.",
        "The Dragon of Hunger approaches! Prepare {target} healthy meals to keep your strength.",
        "Ancient recipe scrolls reveal: {target} balanced meals will boost your vitality stat."
    ],
    'hydration': [
        "The Desert of Dehydration threatens! Drink {target} glasses of water to survive.",
        "The Water Goddess smiles upon those who honor her gift. Consume {target} glasses today.",
        "Your HP regeneration is slow. Drink {target} glasses of water to restore full health.",
        "The Crystal Springs offer healing. {target} glasses of pure water await you."
    ],
    'sleep': [
        "The Dreamweaver calls you to rest. Sleep for {target} hours to unlock prophetic visions.",
        "Your energy reserves deplete. Achieve {target} hours of sleep to fully recover.",
        "The Night Guardian protects those who rest. Sleep {target} hours to gain their blessing.",
        "Exhaustion is your enemy. Defeat it with {target} hours of quality sleep."
    ]
}

# Coaching messages based on sentiment
COACHING_MESSAGES = {
    'positive': [
        "Your determination shines bright! Keep this momentum going!",
        "Excellent work, hero! You're leveling up faster than expected!",
        "The gods of wellness smile upon you today!",
        "Your commitment is legendary! Other heroes look up to you!",
        "This is the path of a true champion! Well done!"
    ],
    'neutral': [
        "Every step forward counts. Keep moving!",
        "Consistency is the key to greatness. You're on track!",
        "Your journey continues. Stay focused on your goals!",
        "Progress takes time. You're doing great!",
        "Keep going! Small victories lead to great triumphs!"
    ],
    'negative': [
        "Even heroes face dark days. Tomorrow is a new quest!",
        "Setbacks are temporary. Your strength will return!",
        "The path is tough, but you are tougher. Rest and recover!",
        "Every warrior needs rest. Be kind to yourself today.",
        "Difficult quests make the best stories. Keep fighting!"
    ]
}

def generate_narrative_with_gemini(activity_type, target, user_level=1, user_stats=None):
    """Generate quest narrative using Gemini AI"""
    if not gemini_client:
        return generate_narrative_fallback(activity_type, target, user_level)
    
    try:
        prompt = f"""You are a fantasy RPG dungeon master creating an engaging quest for a health app.

Character Details:
- Level: {user_level}
- Activity Type: {activity_type}
- Goal: {target} {'steps' if activity_type == 'movement' else 'minutes' if activity_type == 'meditation' else 'glasses' if activity_type == 'hydration' else 'meals' if activity_type == 'nutrition' else 'hours'}

Create a short, motivational quest narrative (2-3 sentences, max 60 words) that:
1. Uses fantasy/RPG themes (warriors, temples, ancient paths, magical rewards)
2. Makes the activity sound like an epic adventure
3. Encourages the player to complete the goal
4. Matches the activity type theme

Examples for inspiration:
- Movement: "The ancient forest path beckons your warrior spirit..."
- Meditation: "The Temple of Tranquility calls to your weary mind..."
- Nutrition: "The Feast Hall of Heroes awaits your arrival..."

Write ONLY the quest narrative, no extra commentary."""

        response = gemini_client.models.generate_content(
            model='gemini-1.5-flash',
            contents=prompt
        )
        narrative = response.text.strip()
        
        # Validate length
        if len(narrative.split()) > 70:
            narrative = ' '.join(narrative.split()[:60]) + '...'
        
        logger.info(f"✨ Generated Gemini narrative for {activity_type}")
        return narrative
        
    except Exception as e:
        logger.error(f"Gemini narrative generation failed: {e}")
        return generate_narrative_fallback(activity_type, target, user_level)

def generate_narrative_fallback(activity_type, target, user_level=1):
    """Fallback narrative generation using templates"""
    if activity_type not in QUEST_NARRATIVES:
        activity_type = 'movement'
    
    templates = QUEST_NARRATIVES[activity_type]
    template = random.choice(templates)
    
    return template.format(target=target)

# Keep old function for backwards compatibility
def generate_narrative(activity_type, target, user_level=1):
    """Generate quest narrative (uses Gemini if available)"""
    return generate_narrative_with_gemini(activity_type, target, user_level)


def get_coaching_message_with_gemini(sentiment, reflection_text=None, user_stats=None):
    """Get AI coaching message using Gemini"""
    if not gemini_client or not reflection_text:
        return get_coaching_message_fallback(sentiment)
    
    try:
        mood_context = {
            'positive': 'The user is feeling great and motivated',
            'negative': 'The user is struggling or feeling down',
            'neutral': 'The user has a neutral, balanced mood'
        }
        
        prompt = f"""You are an empathetic health coach for a gamified wellness RPG app.

User Context:
- Current Mood: {mood_context.get(sentiment, 'neutral')}
- Recent Reflection: "{reflection_text[:200]}"

Provide a SHORT motivational message (1-2 sentences, max 30 words) that:
1. Acknowledges their current state
2. Provides encouragement or advice
3. Uses light RPG/fantasy language (hero, warrior, quest)
4. Is warm and supportive

Write ONLY the coaching message, nothing else."""

        response = gemini_client.models.generate_content(
            model='gemini-1.5-flash',
            contents=prompt
        )
        message = response.text.strip()
        
        # Validate length
        if len(message.split()) > 35:
            message = ' '.join(message.split()[:30]) + '!'
        
        logger.info(f"✨ Generated Gemini coaching for {sentiment} sentiment")
        return message
        
    except Exception as e:
        logger.error(f"Gemini coaching generation failed: {e}")
        return get_coaching_message_fallback(sentiment)

def get_coaching_message_fallback(sentiment):
    """Fallback coaching message using templates"""
    if sentiment not in COACHING_MESSAGES:
        sentiment = 'neutral'
    
    return random.choice(COACHING_MESSAGES[sentiment])

# Keep old function for backwards compatibility
def get_coaching_message(sentiment):
    """Get motivational coaching message (uses Gemini if available)"""
    return get_coaching_message_fallback(sentiment)


def adapt_difficulty(completion_history):
    """Adapt quest difficulty based on user performance"""
    if not completion_history or len(completion_history) < 3:
        return 1.0  # Default difficulty
    
    recent = completion_history[-7:]  # Last 7 days
    avg_completion = sum(recent) / len(recent)
    
    if avg_completion > 0.8:
        # User is crushing it - increase difficulty
        return min(2.0, 1.0 + (avg_completion - 0.8) * 2)
    elif avg_completion < 0.4:
        # User is struggling - decrease difficulty
        return max(0.5, avg_completion + 0.3)
    else:
        # Balanced performance
        return 1.0


@ai_bp.route('/generate-narrative', methods=['POST'])
@jwt_required()
def generate_quest_narrative():
    """Generate AI-powered quest narrative"""
    try:
        data = request.get_json()
        activity_type = data.get('activity_type', 'movement')
        target = data.get('target', 5000)
        
        db = get_db()
        current_user_id = get_jwt_identity()
        user = db.users.find_one({'_id': ObjectId(current_user_id)})
        
        user_level = user.get('level', 1) if user else 1
        
        # Try to use external AI service if configured
        ai_service_url = os.getenv('AI_SERVICE_URL')
        
        if ai_service_url:
            # TODO: Call external AI service (OpenAI/Gemini)
            # For now, use template-based generation
            pass
        
        # Use template-based generation
        narrative = generate_narrative(activity_type, target, user_level)
        
        return jsonify({
            'success': True,
            'narrative': narrative,
            'activity_type': activity_type,
            'target': target
        }), 200
        
    except Exception as e:
        logger.error(f"Error generating narrative: {str(e)}")
        return jsonify({'error': 'Failed to generate narrative'}), 500


@ai_bp.route('/coaching-message', methods=['POST'])
@jwt_required()
def get_coaching():
    """Get AI coaching message based on user state"""
    try:
        data = request.get_json()
        sentiment = data.get('sentiment', 'neutral')
        reflection_text = data.get('reflection_text', '')
        
        db = get_db()
        current_user_id = get_jwt_identity()
        user = db.users.find_one({'_id': ObjectId(current_user_id)})
        user_stats = {
            'level': user.get('level', 1),
            'xp': user.get('xp', 0),
            'streak': user.get('streak', 0)
        } if user else None
        
        # Analyze sentiment if text provided
        if reflection_text:
            # Simple keyword-based sentiment (can be enhanced with real AI)
            text_lower = reflection_text.lower()
            positive_words = ['good', 'great', 'happy', 'motivated', 'accomplished', 'proud']
            negative_words = ['tired', 'difficult', 'stressed', 'hard', 'exhausted', 'frustrated']
            
            pos_count = sum(1 for word in positive_words if word in text_lower)
            neg_count = sum(1 for word in negative_words if word in text_lower)
            
            if pos_count > neg_count:
                sentiment = 'positive'
            elif neg_count > pos_count:
                sentiment = 'negative'
            else:
                sentiment = 'neutral'
        
        # Use Gemini for personalized coaching if reflection provided
        if reflection_text:
            message = get_coaching_message_with_gemini(sentiment, reflection_text, user_stats)
        else:
            message = get_coaching_message_fallback(sentiment)
        
        return jsonify({
            'success': True,
            'message': message,
            'sentiment': sentiment
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting coaching message: {str(e)}")
        return jsonify({'error': 'Failed to get coaching message'}), 500


@ai_bp.route('/adapt-difficulty', methods=['POST'])
@jwt_required()
def adapt_quest_difficulty():
    """Get adaptive difficulty multiplier based on performance"""
    try:
        db = get_db()
        current_user_id = get_jwt_identity()
        
        # Get recent quest completion history
        recent_activities = list(
            db.activity_logs.find({'user_id': ObjectId(current_user_id)})
            .sort('date', -1)
            .limit(7)
        )
        
        # Calculate completion rates
        completion_history = []
        for activity in recent_activities:
            # Count completed tasks vs total tasks
            total_tasks = len(activity.get('activities', {}))
            completed_tasks = sum(1 for v in activity.get('activities', {}).values() if v > 0)
            completion_rate = completed_tasks / total_tasks if total_tasks > 0 else 0
            completion_history.append(completion_rate)
        
        difficulty = adapt_difficulty(completion_history)
        
        # Provide feedback message
        if difficulty > 1.2:
            feedback = "You're crushing your goals! Here's a greater challenge!"
        elif difficulty < 0.8:
            feedback = "Let's ease up a bit. Progress is more important than perfection!"
        else:
            feedback = "You're on the perfect track! Keep up the great work!"
        
        return jsonify({
            'success': True,
            'difficulty': difficulty,
            'feedback': feedback,
            'completion_history': completion_history
        }), 200
        
    except Exception as e:
        logger.error(f"Error adapting difficulty: {str(e)}")
        return jsonify({'error': 'Failed to adapt difficulty'}), 500


@ai_bp.route('/generate-quest', methods=['POST'])
@jwt_required()
def generate_personalized_quest():
    """Generate a personalized quest with AI narrative"""
    try:
        db = get_db()
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        user = db.users.find_one({'_id': ObjectId(current_user_id)})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get difficulty multiplier
        difficulty = data.get('difficulty', 1.0)
        activity_type = data.get('activity_type', 'movement')
        
        # Base targets
        base_targets = {
            'movement': 5000,
            'meditation': 10,
            'nutrition': 3,
            'hydration': 8,
            'sleep': 7
        }
        
        target = int(base_targets.get(activity_type, 5000) * difficulty)
        narrative = generate_narrative(activity_type, target, user.get('level', 1))
        
        # Calculate rewards
        base_xp = 50
        xp_reward = int(base_xp * difficulty * 1.5)
        
        quest = {
            'user_id': ObjectId(current_user_id),
            'type': 'daily',
            'status': 'active',
            'title': f"{activity_type.title()} Challenge",
            'narrative': narrative,
            'activity_type': activity_type,
            'target': target,
            'progress': 0,
            'difficulty': difficulty,
            'rewards': {
                'xp': xp_reward,
                'gold': int(xp_reward * 0.2)
            },
            'created_at': datetime.utcnow()
        }
        
        result = db.quests.insert_one(quest)
        quest['_id'] = str(result.inserted_id)
        
        logger.info(f"AI-generated quest created for user {current_user_id}")
        
        return jsonify({
            'success': True,
            'quest': {
                '_id': quest['_id'],
                'title': quest['title'],
                'narrative': quest['narrative'],
                'activity_type': quest['activity_type'],
                'target': quest['target'],
                'difficulty': quest['difficulty'],
                'rewards': quest['rewards']
            }
        }), 201
        
    except Exception as e:
        logger.error(f"Error generating quest: {str(e)}")
        return jsonify({'error': 'Failed to generate quest'}), 500


from datetime import datetime
