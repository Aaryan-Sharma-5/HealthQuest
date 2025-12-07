from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.database import get_db
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)

user_bp = Blueprint('user', __name__, url_prefix='/api/user')

@user_bp.route('/<user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    """Get user hero data"""
    try:
        db = get_db()
        
        # Get the authenticated user's ID
        current_user_id = get_jwt_identity()
        
        # Find user by username or ObjectId
        user = None
        if ObjectId.is_valid(current_user_id):
            user = db.users.find_one({'_id': ObjectId(current_user_id)})
        else: 
            user = db.users.find_one({'username': current_user_id})
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Calculate XP for next level
        next_level_xp = user.get('level', 1) * 100
        xp_percentage = (user.get('current_xp', 0) / next_level_xp) * 100 if next_level_xp > 0 else 0
        
        # Return hero data
        return jsonify({
            'id': str(user['_id']),
            'username': user['username'],
            'level': user.get('level', 1),
            'currentXP': user.get('current_xp', 0),
            'nextLevelXP': next_level_xp,
            'xpPercentage': round(xp_percentage, 2),
            'health': user.get('health', 100),
            'maxHealth': user.get('max_health', 100),
            'stats': user.get('stats', {'strength': 10, 'wisdom': 10, 'vitality': 10}),
            'avatarUrl': user.get('avatar_url', ''),
            'questsCompleted': user.get('quests_completed', 0),
            'currentStreak': user.get('current_streak', 0),
            'longestStreak': user.get('longest_streak', 0),
            'healthProfile': user.get('health_profile', {
                'age': '',
                'sex': '',
                'height': '',
                'weight': '',
                'medicalConditions': ''
            })
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching user data: {str(e)}")
        return jsonify({'error': 'Failed to fetch user data'}), 500


@user_bp.route('/<user_id>/xp', methods=['POST'])
@jwt_required()
def add_xp(user_id):
    """Add XP to user and check for level up"""
    try:
        db = get_db()
        data = request.get_json()
        xp_gained = data.get('xp', 0)
        
        # Get current user
        current_user_id = get_jwt_identity()
        user = None
        if ObjectId.is_valid(current_user_id):
            user = db.users.find_one({'_id': ObjectId(current_user_id)})
        else:
            user = db.users.find_one({'username': current_user_id})
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Calculate new XP
        current_xp = user.get('current_xp', 0) + xp_gained
        total_xp = user.get('total_xp', 0) + xp_gained
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
                    'health': max_health  # Restore health on level up
                }}
            )
        
        # Update user XP and level
        db.users.update_one(
            {'_id': user['_id']},
            {'$set': {
                'current_xp': current_xp,
                'total_xp': total_xp,
                'level': level
            }}
        )
        
        return jsonify({
            'success': True,
            'leveledUp': leveled_up,
            'newLevel': level,
            'currentXP': current_xp,
            'nextLevelXP': level * 100
        }), 200
        
    except Exception as e:
        logger.error(f"Error adding XP: {str(e)}")
        return jsonify({'error': 'Failed to add XP'}), 500


@user_bp.route('/<user_id>/health-profile', methods=['PUT'])
@jwt_required()
def update_health_profile(user_id):
    """Update user's health profile with personalized health details"""
    try:
        db = get_db()
        data = request.get_json()
        health_profile = data.get('healthProfile', {})
        
        # Get current user
        current_user_id = get_jwt_identity()
        user = None
        if ObjectId.is_valid(current_user_id):
            user = db.users.find_one({'_id': ObjectId(current_user_id)})
        else:
            user = db.users.find_one({'username': current_user_id})
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Update health profile
        db.users.update_one(
            {'_id': user['_id']},
            {'$set': {
                'health_profile': health_profile
            }}
        )
        
        return jsonify({
            'success': True,
            'message': 'Health profile updated successfully',
            'healthProfile': health_profile
        }), 200
        
    except Exception as e:
        logger.error(f"Error updating health profile: {str(e)}")
        return jsonify({'error': 'Failed to update health profile'}), 500