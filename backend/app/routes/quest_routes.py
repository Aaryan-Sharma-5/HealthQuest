from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.database import get_db
from bson import ObjectId
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

quest_bp = Blueprint('quests', __name__, url_prefix='/api/quests')

# Default quests for all users
DEFAULT_QUESTS = [
    {
        'id': 'quest_1',
        'name': 'Daily Steps',
        'description': 'Walk 10,000 steps today',
        'difficulty': 'Easy',
        'xpReward': 50,
        'category': 'fitness',
        'icon': 'Footprints'
    },
    {
        'id': 'quest_2',
        'name': 'Hydration Hero',
        'description': 'Drink 8 glasses of water',
        'difficulty': 'Medium',
        'xpReward': 75,
        'category': 'nutrition',
        'icon': 'Droplet'
    },
    {
        'id': 'quest_3',
        'name': 'Meditation Master',
        'description': 'Meditate for 15 minutes',
        'difficulty': 'Medium',
        'xpReward': 100,
        'category': 'mental',
        'icon': 'Brain'
    },
    {
        'id': 'quest_4',
        'name': 'Strength Training',
        'description': 'Complete 30 push-ups',
        'difficulty': 'Hard',
        'xpReward': 150,
        'category': 'fitness',
        'icon': 'Dumbbell'
    },
    {
        'id': 'quest_5',
        'name': 'Healthy Meals',
        'description': 'Eat 3 balanced meals',
        'difficulty': 'Easy',
        'xpReward': 50,
        'category': 'nutrition',
        'icon': 'Apple'
    }
]

@quest_bp.route('', methods=['GET'])
@jwt_required()
def get_quests():
    """Get daily quests for user"""
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
        
        # Check if user has quest progress for today
        today = datetime.utcnow().date()
        quest_progress = db.quest_progress.find_one({
            'user_id': user['_id'],
            'date': {'$gte': datetime.combine(today, datetime.min.time())}
        })
        
        # If no progress today, create new quest progress
        if not quest_progress:
            quest_progress = {
                'user_id': user['_id'],
                'date': datetime.utcnow(),
                'completed_quests': []
            }
            db.quest_progress.insert_one(quest_progress)
        
        # Build quest list with completion status
        quests = []
        completed_quest_ids = quest_progress.get('completed_quests', [])
        
        for quest in DEFAULT_QUESTS:
            quests.append({
                **quest,
                'completed': quest['id'] in completed_quest_ids
            })
        
        return jsonify({'quests': quests}), 200
        
    except Exception as e:
        logger.error(f"Error fetching quests: {str(e)}")
        return jsonify({'error': 'Failed to fetch quests'}), 500


@quest_bp.route('/<quest_id>/complete', methods=['POST'])
@jwt_required()
def complete_quest(quest_id):
    """Mark a quest as completed"""
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
        
        # Find the quest
        quest = next((q for q in DEFAULT_QUESTS if q['id'] == quest_id), None)
        if not quest:
            return jsonify({'error': 'Quest not found'}), 404
        
        # Get today's quest progress
        today = datetime.utcnow().date()
        quest_progress = db.quest_progress.find_one({
            'user_id': user['_id'],
            'date': {'$gte': datetime.combine(today, datetime.min.time())}
        })
        
        if not quest_progress:
            quest_progress = {
                'user_id': user['_id'],
                'date': datetime.utcnow(),
                'completed_quests': []
            }
            result = db.quest_progress.insert_one(quest_progress)
            quest_progress['_id'] = result.inserted_id
        
        # Check if already completed
        if quest_id in quest_progress.get('completed_quests', []):
            return jsonify({'error': 'Quest already completed'}), 400
        
        # Mark quest as completed
        db.quest_progress.update_one(
            {'_id': quest_progress['_id']},
            {'$push': {'completed_quests': quest_id}}
        )
        
        # Add XP to user
        current_xp = user.get('current_xp', 0) + quest['xpReward']
        total_xp = user.get('total_xp', 0) + quest['xpReward']
        level = user.get('level', 1)
        next_level_xp = level * 100
        
        leveled_up = False
        
        # Check for level up
        while current_xp >= next_level_xp:
            level += 1
            current_xp -= next_level_xp
            next_level_xp = level * 100
            leveled_up = True
            
            # Increase stats on level up
            stats = user.get('stats', {'strength': 10, 'wisdom': 10, 'vitality': 10})
            stats['strength'] += 2
            stats['wisdom'] += 2
            stats['vitality'] += 2
            
            # Update max health
            max_health = 100 + (level - 1) * 10
            
            db.users.update_one(
                {'_id': user['_id']},
                {'$set': {
                    'stats': stats,
                    'max_health': max_health,
                    'health': max_health
                }}
            )
        
        # Update user XP, level, and quest count
        db.users.update_one(
            {'_id': user['_id']},
            {
                '$set': {
                    'current_xp': current_xp,
                    'total_xp': total_xp,
                    'level': level
                },
                '$inc': {'quests_completed': 1}
            }
        )
        
        # Update daily stats
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        daily_stat = db.daily_stats.find_one({
            'user_id': user['_id'],
            'date': today_start
        })
        
        if daily_stat:
            db.daily_stats.update_one(
                {'_id': daily_stat['_id']},
                {
                    '$inc': {
                        'quests_completed': 1,
                        'xp_gained': quest['xpReward']
                    }
                }
            )
        else:
            db.daily_stats.insert_one({
                'user_id': user['_id'],
                'date': today_start,
                'quests_completed': 1,
                'xp_gained': quest['xpReward'],
                'steps': 0,
                'activities_logged': 0
            })
        
        return jsonify({
            'success': True,
            'xpGained': quest['xpReward'],
            'leveledUp': leveled_up,
            'newLevel': level,
            'currentXP': current_xp,
            'nextLevelXP': level * 100,
            'message': f"Quest '{quest['name']}' completed!"
        }), 200
        
    except Exception as e:
        logger.error(f"Error completing quest: {str(e)}")
        return jsonify({'error': 'Failed to complete quest'}), 500