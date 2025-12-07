from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.database import get_db
from bson import ObjectId
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

leaderboard_bp = Blueprint('leaderboards', __name__, url_prefix='/api/leaderboards')

@leaderboard_bp.route('/global/xp', methods=['GET'])
def get_global_xp_leaderboard():
    """Get global XP leaderboard"""
    try:
        db = get_db()
        limit = request.args.get('limit', 50, type=int)
        
        # Get top users by XP
        leaderboard = list(db.users.find(
            {},
            {'username': 1, 'currentXP': 1, 'level': 1, 'health': 1, 'maxHealth': 1}
        ).sort('currentXP', -1).limit(limit))
        
        # Add ranking
        ranked_leaderboard = []
        for idx, user in enumerate(leaderboard, 1):
            user['rank'] = idx
            user['totalXP'] = user.get('currentXP', 0) + (user.get('level', 1) - 1) * 100
            user['_id'] = str(user['_id'])
            ranked_leaderboard.append(user)
        
        return jsonify({
            'success': True,
            'leaderboard': ranked_leaderboard,
            'count': len(ranked_leaderboard)
        }), 200
        
    except Exception as e:
        logger.error(f'Failed to fetch global XP leaderboard: {e}')
        return jsonify({'error': 'Failed to fetch leaderboard'}), 500


@leaderboard_bp.route('/global/streaks', methods=['GET'])
def get_global_streak_leaderboard():
    """Get global current streak leaderboard"""
    try:
        db = get_db()
        limit = request.args.get('limit', 50, type=int)
        
        # Get top users by current streak
        leaderboard = list(db.users.find(
            {},
            {'username': 1, 'currentStreak': 1, 'longestStreak': 1, 'level': 1}
        ).sort('currentStreak', -1).limit(limit))
        
        # Add ranking
        ranked_leaderboard = []
        for idx, user in enumerate(leaderboard, 1):
            user['rank'] = idx
            user['_id'] = str(user['_id'])
            ranked_leaderboard.append(user)
        
        return jsonify({
            'success': True,
            'leaderboard': ranked_leaderboard,
            'count': len(ranked_leaderboard)
        }), 200
        
    except Exception as e:
        logger.error(f'Failed to fetch global streak leaderboard: {e}')
        return jsonify({'error': 'Failed to fetch leaderboard'}), 500


@leaderboard_bp.route('/global/quests', methods=['GET'])
def get_global_quest_leaderboard():
    """Get global quest completion leaderboard"""
    try:
        db = get_db()
        limit = request.args.get('limit', 50, type=int)
        
        # Get top users by quests completed
        leaderboard = list(db.users.find(
            {},
            {'username': 1, 'questsCompleted': 1, 'level': 1}
        ).sort('questsCompleted', -1).limit(limit))
        
        # Add ranking
        ranked_leaderboard = []
        for idx, user in enumerate(leaderboard, 1):
            user['rank'] = idx
            user['_id'] = str(user['_id'])
            ranked_leaderboard.append(user)
        
        return jsonify({
            'success': True,
            'leaderboard': ranked_leaderboard,
            'count': len(ranked_leaderboard)
        }), 200
        
    except Exception as e:
        logger.error(f'Failed to fetch global quest leaderboard: {e}')
        return jsonify({'error': 'Failed to fetch leaderboard'}), 500


@leaderboard_bp.route('/weekly/xp', methods=['GET'])
def get_weekly_xp_leaderboard():
    """Get weekly XP leaderboard (based on XP earned this week)"""
    try:
        db = get_db()
        limit = request.args.get('limit', 50, type=int)
        
        # Get XP earned this week from activity logs
        one_week_ago = datetime.utcnow() - timedelta(days=7)
        
        pipeline = [
            {
                '$match': {
                    'timestamp': {'$gte': one_week_ago}
                }
            },
            {
                '$group': {
                    '_id': '$user_id',
                    'weeklyXP': {'$sum': {'$multiply': [{'$toInt': '$multiplier'}, 50]}}
                }
            },
            {
                '$sort': {'weeklyXP': -1}
            },
            {
                '$limit': limit
            },
            {
                '$lookup': {
                    'from': 'users',
                    'localField': '_id',
                    'foreignField': '_id',
                    'as': 'user'
                }
            },
            {
                '$unwind': '$user'
            },
            {
                '$project': {
                    'username': '$user.username',
                    'level': '$user.level',
                    'weeklyXP': 1,
                    '_id': 1
                }
            }
        ]
        
        leaderboard = list(db.activity_logs.aggregate(pipeline))
        
        # Add ranking
        ranked_leaderboard = []
        for idx, user in enumerate(leaderboard, 1):
            user['rank'] = idx
            user['_id'] = str(user['_id'])
            ranked_leaderboard.append(user)
        
        return jsonify({
            'success': True,
            'leaderboard': ranked_leaderboard,
            'count': len(ranked_leaderboard),
            'period': 'weekly'
        }), 200
        
    except Exception as e:
        logger.error(f'Failed to fetch weekly XP leaderboard: {e}')
        return jsonify({'error': 'Failed to fetch leaderboard'}), 500


@leaderboard_bp.route('/friends/<string:user_id>/xp', methods=['GET'])
@jwt_required()
def get_friends_xp_leaderboard(user_id):
    """Get friends XP leaderboard"""
    try:
        db = get_db()
        current_user_id = get_jwt_identity()
        limit = request.args.get('limit', 50, type=int)
        
        # Get user's friends
        user = db.users.find_one({'username': user_id}) or db.users.find_one({'_id': ObjectId(user_id)})
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        friends_list = user.get('friends', [])
        
        # Add current user to list for comparison
        friends_list.append(str(user['_id']))
        
        # Get friend IDs as ObjectIds
        friend_object_ids = []
        for friend in friends_list:
            if isinstance(friend, str):
                if ObjectId.is_valid(friend):
                    friend_object_ids.append(ObjectId(friend))
            else:
                friend_object_ids.append(friend)
        
        # Get leaderboard for friends
        leaderboard = list(db.users.find(
            {'_id': {'$in': friend_object_ids}},
            {'username': 1, 'currentXP': 1, 'level': 1}
        ).sort('currentXP', -1).limit(limit))
        
        # Add ranking
        ranked_leaderboard = []
        for idx, friend in enumerate(leaderboard, 1):
            friend['rank'] = idx
            friend['totalXP'] = friend.get('currentXP', 0) + (friend.get('level', 1) - 1) * 100
            friend['_id'] = str(friend['_id'])
            ranked_leaderboard.append(friend)
        
        return jsonify({
            'success': True,
            'leaderboard': ranked_leaderboard,
            'count': len(ranked_leaderboard),
            'type': 'friends'
        }), 200
        
    except Exception as e:
        logger.error(f'Failed to fetch friends XP leaderboard: {e}')
        return jsonify({'error': 'Failed to fetch leaderboard'}), 500


@leaderboard_bp.route('/friends/<string:user_id>/streaks', methods=['GET'])
@jwt_required()
def get_friends_streak_leaderboard(user_id):
    """Get friends streak leaderboard"""
    try:
        db = get_db()
        current_user_id = get_jwt_identity()
        limit = request.args.get('limit', 50, type=int)
        
        # Get user's friends
        user = db.users.find_one({'username': user_id}) or db.users.find_one({'_id': ObjectId(user_id)})
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        friends_list = user.get('friends', [])
        friends_list.append(str(user['_id']))
        
        # Get friend IDs as ObjectIds
        friend_object_ids = []
        for friend in friends_list:
            if isinstance(friend, str):
                if ObjectId.is_valid(friend):
                    friend_object_ids.append(ObjectId(friend))
            else:
                friend_object_ids.append(friend)
        
        # Get leaderboard for friends
        leaderboard = list(db.users.find(
            {'_id': {'$in': friend_object_ids}},
            {'username': 1, 'currentStreak': 1, 'longestStreak': 1, 'level': 1}
        ).sort('currentStreak', -1).limit(limit))
        
        # Add ranking
        ranked_leaderboard = []
        for idx, friend in enumerate(leaderboard, 1):
            friend['rank'] = idx
            friend['_id'] = str(friend['_id'])
            ranked_leaderboard.append(friend)
        
        return jsonify({
            'success': True,
            'leaderboard': ranked_leaderboard,
            'count': len(ranked_leaderboard),
            'type': 'friends'
        }), 200
        
    except Exception as e:
        logger.error(f'Failed to fetch friends streak leaderboard: {e}')
        return jsonify({'error': 'Failed to fetch leaderboard'}), 500


@leaderboard_bp.route('/friends/<string:user_id>/quests', methods=['GET'])
@jwt_required()
def get_friends_quest_leaderboard(user_id):
    """Get friends quest completion leaderboard"""
    try:
        db = get_db()
        current_user_id = get_jwt_identity()
        limit = request.args.get('limit', 50, type=int)
        
        # Get user's friends
        user = db.users.find_one({'username': user_id}) or db.users.find_one({'_id': ObjectId(user_id)})
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        friends_list = user.get('friends', [])
        friends_list.append(str(user['_id']))
        
        # Get friend IDs as ObjectIds
        friend_object_ids = []
        for friend in friends_list:
            if isinstance(friend, str):
                if ObjectId.is_valid(friend):
                    friend_object_ids.append(ObjectId(friend))
            else:
                friend_object_ids.append(friend)
        
        # Get leaderboard for friends
        leaderboard = list(db.users.find(
            {'_id': {'$in': friend_object_ids}},
            {'username': 1, 'questsCompleted': 1, 'level': 1}
        ).sort('questsCompleted', -1).limit(limit))
        
        # Add ranking
        ranked_leaderboard = []
        for idx, friend in enumerate(leaderboard, 1):
            friend['rank'] = idx
            friend['_id'] = str(friend['_id'])
            ranked_leaderboard.append(friend)
        
        return jsonify({
            'success': True,
            'leaderboard': ranked_leaderboard,
            'count': len(ranked_leaderboard),
            'type': 'friends'
        }), 200
        
    except Exception as e:
        logger.error(f'Failed to fetch friends quest leaderboard: {e}')
        return jsonify({'error': 'Failed to fetch leaderboard'}), 500


@leaderboard_bp.route('/user-rank/<string:user_id>', methods=['GET'])
def get_user_rank(user_id):
    """Get user's rank in different categories"""
    try:
        db = get_db()
        
        # Get user
        user = db.users.find_one({'username': user_id}) or db.users.find_one({'_id': ObjectId(user_id)})
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        user_xp = user.get('currentXP', 0)
        user_streak = user.get('currentStreak', 0)
        user_quests = user.get('questsCompleted', 0)
        
        # Get XP rank
        xp_rank = db.users.count_documents({'currentXP': {'$gt': user_xp}}) + 1
        
        # Get streak rank
        streak_rank = db.users.count_documents({'currentStreak': {'$gt': user_streak}}) + 1
        
        # Get quests rank
        quests_rank = db.users.count_documents({'questsCompleted': {'$gt': user_quests}}) + 1
        
        return jsonify({
            'success': True,
            'username': user['username'],
            'ranks': {
                'xp': xp_rank,
                'streak': streak_rank,
                'quests': quests_rank
            },
            'scores': {
                'xp': user_xp,
                'streak': user_streak,
                'quests': user_quests
            }
        }), 200
        
    except Exception as e:
        logger.error(f'Failed to get user rank: {e}')
        return jsonify({'error': 'Failed to get user rank'}), 500


@leaderboard_bp.route('/guild/<user_id>/xp', methods=['GET'])
@jwt_required()
def get_guild_xp_leaderboard(user_id):
    """Get guild XP leaderboard for user's guild"""
    try:
        db = get_db()
        
        # Get user's guild
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user or not user.get('guild_id'):
            return jsonify({'error': 'User not in a guild'}), 404
        
        guild_id = user['guild_id']
        guild = db.guilds.find_one({'_id': ObjectId(guild_id)})
        if not guild:
            return jsonify({'error': 'Guild not found'}), 404
        
        # Get all guild members
        member_ids = [m['user_id'] for m in guild.get('members', [])]
        
        # Get users sorted by XP
        leaderboard = list(db.users.find(
            {'_id': {'$in': member_ids}},
            {'username': 1, 'currentXP': 1, 'level': 1}
        ).sort('currentXP', -1))
        
        # Add ranking
        ranked_leaderboard = []
        for idx, user in enumerate(leaderboard, 1):
            user['rank'] = idx
            user['totalXP'] = user.get('currentXP', 0) + (user.get('level', 1) - 1) * 100
            user['_id'] = str(user['_id'])
            ranked_leaderboard.append(user)
        
        return jsonify({
            'success': True,
            'guild_name': guild['name'],
            'leaderboard': ranked_leaderboard,
            'count': len(ranked_leaderboard)
        }), 200
        
    except Exception as e:
        logger.error(f'Failed to fetch guild XP leaderboard: {e}')
        return jsonify({'error': 'Failed to fetch leaderboard'}), 500


@leaderboard_bp.route('/guild/<user_id>/streaks', methods=['GET'])
@jwt_required()
def get_guild_streak_leaderboard(user_id):
    """Get guild streak leaderboard for user's guild"""
    try:
        db = get_db()
        
        # Get user's guild
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user or not user.get('guild_id'):
            return jsonify({'error': 'User not in a guild'}), 404
        
        guild_id = user['guild_id']
        guild = db.guilds.find_one({'_id': ObjectId(guild_id)})
        if not guild:
            return jsonify({'error': 'Guild not found'}), 404
        
        # Get all guild members
        member_ids = [m['user_id'] for m in guild.get('members', [])]
        
        # Get users sorted by current streak
        leaderboard = list(db.users.find(
            {'_id': {'$in': member_ids}},
            {'username': 1, 'currentStreak': 1, 'level': 1}
        ).sort('currentStreak', -1))
        
        # Add ranking
        ranked_leaderboard = []
        for idx, user in enumerate(leaderboard, 1):
            user['rank'] = idx
            user['_id'] = str(user['_id'])
            ranked_leaderboard.append(user)
        
        return jsonify({
            'success': True,
            'guild_name': guild['name'],
            'leaderboard': ranked_leaderboard,
            'count': len(ranked_leaderboard)
        }), 200
        
    except Exception as e:
        logger.error(f'Failed to fetch guild streak leaderboard: {e}')
        return jsonify({'error': 'Failed to fetch leaderboard'}), 500


@leaderboard_bp.route('/guild/<user_id>/quests', methods=['GET'])
@jwt_required()
def get_guild_quest_leaderboard(user_id):
    """Get guild quest leaderboard for user's guild"""
    try:
        db = get_db()
        
        # Get user's guild
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user or not user.get('guild_id'):
            return jsonify({'error': 'User not in a guild'}), 404
        
        guild_id = user['guild_id']
        guild = db.guilds.find_one({'_id': ObjectId(guild_id)})
        if not guild:
            return jsonify({'error': 'Guild not found'}), 404
        
        # Get all guild members
        member_ids = [m['user_id'] for m in guild.get('members', [])]
        
        # Get users sorted by quests completed
        leaderboard = list(db.users.find(
            {'_id': {'$in': member_ids}},
            {'username': 1, 'questsCompleted': 1, 'level': 1}
        ).sort('questsCompleted', -1))
        
        # Add ranking
        ranked_leaderboard = []
        for idx, user in enumerate(leaderboard, 1):
            user['rank'] = idx
            user['_id'] = str(user['_id'])
            ranked_leaderboard.append(user)
        
        return jsonify({
            'success': True,
            'guild_name': guild['name'],
            'leaderboard': ranked_leaderboard,
            'count': len(ranked_leaderboard)
        }), 200
        
    except Exception as e:
        logger.error(f'Failed to fetch guild quest leaderboard: {e}')
        return jsonify({'error': 'Failed to fetch leaderboard'}), 500


@leaderboard_bp.route('/guild/<user_id>/user-rank', methods=['GET'])
@jwt_required()
def get_guild_user_rank(user_id):
    """Get user's rank in their guild"""
    try:
        db = get_db()
        
        # Get user's guild
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user or not user.get('guild_id'):
            return jsonify({'error': 'User not in a guild'}), 404
        
        guild_id = user['guild_id']
        guild = db.guilds.find_one({'_id': ObjectId(guild_id)})
        if not guild:
            return jsonify({'error': 'Guild not found'}), 404
        
        # Get all guild members
        member_ids = [m['user_id'] for m in guild.get('members', [])]
        
        user_xp = user.get('currentXP', 0)
        user_streak = user.get('currentStreak', 0)
        user_quests = user.get('questsCompleted', 0)
        
        # Get guild ranks
        xp_rank = db.users.count_documents({
            '_id': {'$in': member_ids},
            'currentXP': {'$gt': user_xp}
        }) + 1
        
        streak_rank = db.users.count_documents({
            '_id': {'$in': member_ids},
            'currentStreak': {'$gt': user_streak}
        }) + 1
        
        quests_rank = db.users.count_documents({
            '_id': {'$in': member_ids},
            'questsCompleted': {'$gt': user_quests}
        }) + 1
        
        return jsonify({
            'success': True,
            'guild_name': guild['name'],
            'username': user['username'],
            'ranks': {
                'xp': xp_rank,
                'streak': streak_rank,
                'quests': quests_rank
            },
            'scores': {
                'xp': user_xp,
                'streak': user_streak,
                'quests': user_quests
            }
        }), 200
        
    except Exception as e:
        logger.error(f'Failed to get guild user rank: {e}')
        return jsonify({'error': 'Failed to get user rank'}), 500
