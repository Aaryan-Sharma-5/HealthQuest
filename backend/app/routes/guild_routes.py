from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.database import get_db
from bson import ObjectId
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

guild_bp = Blueprint('guild', __name__, url_prefix='/api/guild')

@guild_bp.route('/create', methods=['POST'])
@jwt_required()
def create_guild():
    """Create a new guild"""
    try:
        db = get_db()
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        guild_name = data.get('name', '').strip()
        description = data.get('description', '').strip()
        
        if not guild_name:
            return jsonify({'error': 'Guild name is required'}), 400
        
        # Check if user already in a guild
        user = db.users.find_one({'_id': ObjectId(current_user_id)})
        if user and user.get('guild_id'):
            return jsonify({'error': 'You are already in a guild'}), 400
        
        # Check if guild name exists
        existing = db.guilds.find_one({'name': guild_name})
        if existing:
            return jsonify({'error': 'Guild name already taken'}), 400
        
        # Create guild
        guild = {
            'name': guild_name,
            'description': description,
            'leader_id': ObjectId(current_user_id),
            'members': [
                {
                    'user_id': ObjectId(current_user_id),
                    'username': user.get('username'),
                    'level': user.get('level', 1),
                    'role': 'leader',
                    'joined_at': datetime.utcnow()
                }
            ],
            'level': 1,
            'total_xp': 0,
            'current_challenge': None,
            'achievements': [],
            'created_at': datetime.utcnow()
        }
        
        result = db.guilds.insert_one(guild)
        guild['_id'] = str(result.inserted_id)
        
        # Update user with guild_id
        db.users.update_one(
            {'_id': ObjectId(current_user_id)},
            {'$set': {'guild_id': result.inserted_id}}
        )
        
        logger.info(f"Guild created: {guild_name} by user {current_user_id}")
        
        return jsonify({
            'success': True,
            'guild': {
                '_id': guild['_id'],
                'name': guild['name'],
                'description': guild['description'],
                'level': guild['level'],
                'members_count': len(guild['members'])
            }
        }), 201
        
    except Exception as e:
        logger.error(f"Error creating guild: {str(e)}")
        return jsonify({'error': 'Failed to create guild'}), 500


@guild_bp.route('/list', methods=['GET'])
@jwt_required()
def list_guilds():
    """Get list of all guilds"""
    try:
        db = get_db()
        
        guilds = list(db.guilds.find().sort('total_xp', -1).limit(50))
        
        guilds_list = []
        for guild in guilds:
            guilds_list.append({
                '_id': str(guild['_id']),
                'name': guild['name'],
                'description': guild.get('description', ''),
                'level': guild.get('level', 1),
                'total_xp': guild.get('total_xp', 0),
                'members_count': len(guild.get('members', [])),
                'leader_name': guild.get('members', [{}])[0].get('username', 'Unknown'),
                'created_at': guild.get('created_at', datetime.utcnow()).isoformat()
            })
        
        return jsonify({'guilds': guilds_list}), 200
        
    except Exception as e:
        logger.error(f"Error listing guilds: {str(e)}")
        return jsonify({'error': 'Failed to fetch guilds'}), 500


@guild_bp.route('/<guild_id>', methods=['GET'])
@jwt_required()
def get_guild(guild_id):
    """Get guild details"""
    try:
        db = get_db()
        
        guild = db.guilds.find_one({'_id': ObjectId(guild_id)})
        
        if not guild:
            return jsonify({'error': 'Guild not found'}), 404
        
        return jsonify({
            '_id': str(guild['_id']),
            'name': guild['name'],
            'description': guild.get('description', ''),
            'level': guild.get('level', 1),
            'total_xp': guild.get('total_xp', 0),
            'members': [
                {
                    'user_id': str(m['user_id']),
                    'username': m['username'],
                    'level': m.get('level', 1),
                    'role': m.get('role', 'member'),
                    'joined_at': m.get('joined_at', datetime.utcnow()).isoformat()
                }
                for m in guild.get('members', [])
            ],
            'current_challenge': guild.get('current_challenge'),
            'achievements': guild.get('achievements', []),
            'created_at': guild.get('created_at', datetime.utcnow()).isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching guild: {str(e)}")
        return jsonify({'error': 'Failed to fetch guild'}), 500


@guild_bp.route('/<guild_id>/join', methods=['POST'])
@jwt_required()
def join_guild(guild_id):
    """Join a guild"""
    try:
        db = get_db()
        current_user_id = get_jwt_identity()
        
        # Check if user already in a guild
        user = db.users.find_one({'_id': ObjectId(current_user_id)})
        if user and user.get('guild_id'):
            return jsonify({'error': 'You are already in a guild'}), 400
        
        # Check if guild exists
        guild = db.guilds.find_one({'_id': ObjectId(guild_id)})
        if not guild:
            return jsonify({'error': 'Guild not found'}), 404
        
        # Add user to guild
        new_member = {
            'user_id': ObjectId(current_user_id),
            'username': user.get('username'),
            'level': user.get('level', 1),
            'role': 'member',
            'joined_at': datetime.utcnow()
        }
        
        db.guilds.update_one(
            {'_id': ObjectId(guild_id)},
            {'$push': {'members': new_member}}
        )
        
        # Update user with guild_id
        db.users.update_one(
            {'_id': ObjectId(current_user_id)},
            {'$set': {'guild_id': ObjectId(guild_id)}}
        )
        
        logger.info(f"User {current_user_id} joined guild {guild_id}")
        
        return jsonify({
            'success': True,
            'message': f"You have joined {guild['name']}!"
        }), 200
        
    except Exception as e:
        logger.error(f"Error joining guild: {str(e)}")
        return jsonify({'error': 'Failed to join guild'}), 500


@guild_bp.route('/<guild_id>/leave', methods=['POST'])
@jwt_required()
def leave_guild(guild_id):
    """Leave a guild"""
    try:
        db = get_db()
        current_user_id = get_jwt_identity()
        
        guild = db.guilds.find_one({'_id': ObjectId(guild_id)})
        if not guild:
            return jsonify({'error': 'Guild not found'}), 404
        
        # Check if user is the leader
        if str(guild['leader_id']) == current_user_id:
            # Transfer leadership or disband
            if len(guild['members']) > 1:
                # Transfer to next member
                new_leader = next(m for m in guild['members'] if str(m['user_id']) != current_user_id)
                db.guilds.update_one(
                    {'_id': ObjectId(guild_id)},
                    {
                        '$set': {'leader_id': new_leader['user_id']},
                        '$pull': {'members': {'user_id': ObjectId(current_user_id)}}
                    }
                )
                # Update new leader role
                db.guilds.update_one(
                    {'_id': ObjectId(guild_id), 'members.user_id': new_leader['user_id']},
                    {'$set': {'members.$.role': 'leader'}}
                )
            else:
                # Disband guild if leader is only member
                db.guilds.delete_one({'_id': ObjectId(guild_id)})
        else:
            # Remove member
            db.guilds.update_one(
                {'_id': ObjectId(guild_id)},
                {'$pull': {'members': {'user_id': ObjectId(current_user_id)}}}
            )
        
        # Remove guild_id from user
        db.users.update_one(
            {'_id': ObjectId(current_user_id)},
            {'$unset': {'guild_id': ''}}
        )
        
        logger.info(f"User {current_user_id} left guild {guild_id}")
        
        return jsonify({
            'success': True,
            'message': 'You have left the guild'
        }), 200
        
    except Exception as e:
        logger.error(f"Error leaving guild: {str(e)}")
        return jsonify({'error': 'Failed to leave guild'}), 500


@guild_bp.route('/<guild_id>/challenge', methods=['POST'])
@jwt_required()
def start_challenge(guild_id):
    """Start a guild challenge (leader only)"""
    try:
        db = get_db()
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        guild = db.guilds.find_one({'_id': ObjectId(guild_id)})
        if not guild:
            return jsonify({'error': 'Guild not found'}), 404
        
        # Check if user is leader
        if str(guild['leader_id']) != current_user_id:
            return jsonify({'error': 'Only the guild leader can start challenges'}), 403
        
        # Check if there's already an active challenge
        if guild.get('current_challenge') and guild['current_challenge'].get('active'):
            return jsonify({'error': 'A challenge is already active'}), 400
        
        challenge = {
            'title': data.get('title', 'Guild Challenge'),
            'description': data.get('description', ''),
            'goal': data.get('goal', 10000),  # Total steps/points needed
            'progress': 0,
            'active': True,
            'start_date': datetime.utcnow(),
            'end_date': datetime.utcnow(),  # Add days based on challenge type
            'rewards': {
                'xp': data.get('reward_xp', 500),
                'badge': data.get('reward_badge', 'Team Player')
            }
        }
        
        db.guilds.update_one(
            {'_id': ObjectId(guild_id)},
            {'$set': {'current_challenge': challenge}}
        )
        
        logger.info(f"Guild challenge started in {guild_id}")
        
        return jsonify({
            'success': True,
            'challenge': challenge
        }), 200
        
    except Exception as e:
        logger.error(f"Error starting challenge: {str(e)}")
        return jsonify({'error': 'Failed to start challenge'}), 500


@guild_bp.route('/<guild_id>/contribute', methods=['POST'])
@jwt_required()
def contribute_to_challenge(guild_id):
    """Contribute to guild challenge"""
    try:
        db = get_db()
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        contribution = data.get('contribution', 0)
        
        guild = db.guilds.find_one({'_id': ObjectId(guild_id)})
        if not guild:
            return jsonify({'error': 'Guild not found'}), 404
        
        # Check if user is member
        is_member = any(str(m['user_id']) == current_user_id for m in guild.get('members', []))
        if not is_member:
            return jsonify({'error': 'You are not a member of this guild'}), 403
        
        # Update challenge progress
        current_challenge = guild.get('current_challenge')
        if not current_challenge or not current_challenge.get('active'):
            return jsonify({'error': 'No active challenge'}), 400
        
        new_progress = current_challenge['progress'] + contribution
        current_challenge['progress'] = new_progress
        
        # Check if challenge completed
        if new_progress >= current_challenge['goal']:
            current_challenge['active'] = False
            current_challenge['completed'] = True
            current_challenge['completed_at'] = datetime.utcnow()
            
            # Reward all members
            for member in guild['members']:
                db.users.update_one(
                    {'_id': member['user_id']},
                    {'$inc': {'current_xp': current_challenge['rewards']['xp']}}
                )
        
        db.guilds.update_one(
            {'_id': ObjectId(guild_id)},
            {'$set': {'current_challenge': current_challenge}}
        )
        
        return jsonify({
            'success': True,
            'challenge': current_challenge,
            'completed': current_challenge.get('completed', False)
        }), 200
        
    except Exception as e:
        logger.error(f"Error contributing to challenge: {str(e)}")
        return jsonify({'error': 'Failed to contribute'}), 500