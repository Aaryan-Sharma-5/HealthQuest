from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.database import get_db
from bson import ObjectId
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

activity_bp = Blueprint('activity', __name__, url_prefix='/api/activity')

# Simple sentiment analysis keywords
POSITIVE_KEYWORDS = ['great', 'good', 'amazing', 'excellent', 'happy', 'motivated', 'energized', 'accomplished', 'proud', 'fantastic', 'wonderful', 'awesome', 'perfect', 'love', 'best']
NEGATIVE_KEYWORDS = ['tired', 'bad', 'difficult', 'hard', 'exhausted', 'stressed', 'overwhelmed', 'frustrated', 'sad', 'terrible', 'awful', 'worst', 'hate', 'painful']

def analyze_sentiment(text):
    """Simple sentiment analysis based on keywords"""
    text_lower = text.lower()
    
    positive_count = sum(1 for word in POSITIVE_KEYWORDS if word in text_lower)
    negative_count = sum(1 for word in NEGATIVE_KEYWORDS if word in text_lower)
    
    total = positive_count + negative_count
    
    if total == 0:
        return 'neutral', 1.0
    
    positive_ratio = positive_count / total
    
    if positive_ratio > 0.6:
        sentiment = 'positive'
        multiplier = 1.2
    elif positive_ratio < 0.4:
        sentiment = 'negative'
        multiplier = 0.8
    else:
        sentiment = 'neutral'
        multiplier = 1.0
    
    return sentiment, multiplier


@activity_bp.route('/log', methods=['POST'])
@jwt_required()
def log_activity():
    """Log user activity and get sentiment analysis"""
    try:
        db = get_db()
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        reflection = data.get('reflection', '')
        
        if not reflection or len(reflection.strip()) < 5:
            return jsonify({'error': 'Reflection must be at least 5 characters'}), 400
        
        # Get user
        user = None
        if ObjectId.is_valid(current_user_id):
            user = db.users.find_one({'_id': ObjectId(current_user_id)})
        else:
            user = db.users.find_one({'username': current_user_id})
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Analyze sentiment
        sentiment, multiplier = analyze_sentiment(reflection)
        
        # Log activity (without distance tracking)
        activity_log = {
            'user_id': user['_id'],
            'reflection': reflection,
            'sentiment': sentiment,
            'multiplier': multiplier,
            'category': data.get('category', 'general'),
            'mood': data.get('mood', 3),
            'activities': data.get('activities', {}),
            'timestamp': datetime.utcnow()
        }
        
        db.activities.insert_one(activity_log)
        
        # Calculate XP earned (base 10 XP * multiplier)
        xp_earned = int(10 * multiplier)
        
        # Add XP to user
        db.users.update_one(
            {'_id': user['_id']},
            {
                '$inc': {
                    'current_xp': xp_earned,
                    'total_xp': xp_earned
                }
            }
        )
        
        # Update daily stats (without distance tracking)
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        daily_stat = db.daily_stats.find_one({
            'user_id': user['_id'],
            'date': today
        })
        
        if daily_stat:
            db.daily_stats.update_one(
                {'_id': daily_stat['_id']},
                {
                    '$inc': {
                        'activities_logged': 1,
                        'xp_gained': xp_earned
                    }
                }
            )
        else:
            db.daily_stats.insert_one({
                'user_id': user['_id'],
                'date': today,
                'activities_logged': 1,
                'xp_gained': xp_earned,
                'quests_completed': 0
            })
        
        # Generate AI response based on sentiment
        responses = {
            'positive': [
                "⚔ Your positive energy strengthens your resolve! Quest difficulty reduced by 20%.",
                "✨ The gods smile upon your determination! Bonus XP activated!",
                "🎯 Your optimism is a powerful weapon! Keep this momentum going!"
            ],
            'negative': [
                "🛡 Even heroes face challenges. Quest difficulty adjusted to match your energy.",
                "💪 Your honesty shows strength. Take it one step at a time, warrior.",
                "🔥 Every great hero has tough days. You're still in the fight!"
            ],
            'neutral': [
                "⚡ Steady progress is still progress. Keep moving forward!",
                "🎲 A balanced mindset serves you well. Continue your journey!",
                "🌟 Your consistency is your strength. Maintain the course!"
            ]
        }
        
        import random
        ai_response = random.choice(responses[sentiment])
        
        return jsonify({
            'success': True,
            'sentiment': sentiment,
            'multiplier': multiplier,
            'xpEarned': xp_earned,
            'response': ai_response,
            'timestamp': activity_log['timestamp'].isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error logging activity: {str(e)}")
        return jsonify({'error': 'Failed to log activity'}), 500


@activity_bp.route('/history', methods=['GET'])
@jwt_required()
def get_activity_history():
    """Get user's activity log history"""
    try:
        db = get_db()
        current_user_id = get_jwt_identity()
        
        # Get user
        user = None
        if ObjectId.is_valid(current_user_id):
            user = db.users.find_one({'_id': ObjectId(current_user_id)})
        else:
            user = db.users.find_one({'username': current_user_id})
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get activity logs (last 30 days)
        limit = request.args.get('limit', 50, type=int)
        
        logs = list(db.activities.find(
            {'user_id': user['_id']}
        ).sort('timestamp', -1).limit(limit))
        
        # Format logs
        formatted_logs = []
        for log in logs:
            formatted_logs.append({
                'id': str(log['_id']),
                'reflection': log['reflection'],
                'sentiment': log['sentiment'],
                'multiplier': log['multiplier'],
                'timestamp': log['timestamp'].isoformat()
            })
        
        return jsonify({'logs': formatted_logs}), 200
        
    except Exception as e:
        logger.error(f"Error fetching activity history: {str(e)}")
        return jsonify({'error': 'Failed to fetch activity history'}), 500