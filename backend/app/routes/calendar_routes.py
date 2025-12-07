from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.database import get_db
from bson import ObjectId
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

calendar_bp = Blueprint('calendar', __name__, url_prefix='/api/calendar')

@calendar_bp.route('/<user_id>', methods=['GET'])
@jwt_required()
def get_calendar_data(user_id):
    """Get calendar data for a specific month"""
    try:
        db = get_db()
        
        # Get year and month from query params (default to current)
        year = int(request.args.get('year', datetime.now().year))
        month = int(request.args.get('month', datetime.now().month))
        
        # Get user
        user = None
        if ObjectId.is_valid(user_id):
            user = db.users.find_one({'_id': ObjectId(user_id)})
        else:
            user = db.users.find_one({'username': user_id})
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Calculate date range for the month
        start_date = datetime(year, month, 1)
        if month == 12:
            end_date = datetime(year + 1, 1, 1)
        else:
            end_date = datetime(year, month + 1, 1)
        
        # Build calendar data
        calendar_data = {}
        
        # Get quest progress for the month
        quest_progress = db.quest_progress.find({
            'user_id': user['_id'],
            'date': {
                '$gte': start_date,
                '$lt': end_date
            }
        })
        
        for progress in quest_progress:
            date_key = progress['date'].strftime('%Y-%m-%d')
            if date_key not in calendar_data:
                calendar_data[date_key] = {
                    'date': date_key,
                    'quests_completed': 0,
                    'steps': 0,
                    'xp_gained': 0,
                    'activities_logged': 0,
                    'activities': []
                }
            
            calendar_data[date_key]['quests_completed'] = len(progress.get('completed_quests', []))
        
        # Get activity logs for the month
        activities = db.activities.find({
            'user_id': user['_id'],
            'timestamp': {
                '$gte': start_date,
                '$lt': end_date
            }
        }).sort('timestamp', 1)
        
        for activity in activities:
            date_key = activity['timestamp'].strftime('%Y-%m-%d')
            if date_key not in calendar_data:
                calendar_data[date_key] = {
                    'date': date_key,
                    'quests_completed': 0,
                    'steps': 0,
                    'xp_gained': 0,
                    'activities_logged': 0,
                    'activities': []
                }
            
            calendar_data[date_key]['activities_logged'] += 1
            calendar_data[date_key]['activities'].append({
                'category': activity.get('category', 'general'),
                'reflection': activity.get('reflection', ''),
                'sentiment': activity.get('sentiment', 'neutral'),
                'timestamp': activity['timestamp'].isoformat()
            })
            
            # Add steps if present
            if 'steps' in activity:
                calendar_data[date_key]['steps'] += activity['steps']
        
        # Get daily XP gains (from user activity history if available)
        daily_stats = db.daily_stats.find({
            'user_id': user['_id'],
            'date': {
                '$gte': start_date,
                '$lt': end_date
            }
        })
        
        for stat in daily_stats:
            date_key = stat['date'].strftime('%Y-%m-%d')
            if date_key not in calendar_data:
                calendar_data[date_key] = {
                    'date': date_key,
                    'quests_completed': 0,
                    'steps': 0,
                    'xp_gained': 0,
                    'activities_logged': 0,
                    'activities': []
                }
            
            calendar_data[date_key]['xp_gained'] = stat.get('xp_gained', 0)
            if 'steps' in stat:
                calendar_data[date_key]['steps'] = stat['steps']
        
        return jsonify({
            'calendar': calendar_data,
            'month': month,
            'year': year
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching calendar data: {str(e)}")
        return jsonify({'error': 'Failed to fetch calendar data'}), 500


@calendar_bp.route('/<user_id>/today', methods=['GET'])
@jwt_required()
def get_today_stats(user_id):
    """Get today's statistics for a user"""
    try:
        db = get_db()
        
        # Get user
        user = None
        if ObjectId.is_valid(user_id):
            user = db.users.find_one({'_id': ObjectId(user_id)})
        else:
            user = db.users.find_one({'username': user_id})
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get today's date range
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        tomorrow = today + timedelta(days=1)
        
        # Get today's quest progress
        quest_progress = db.quest_progress.find_one({
            'user_id': user['_id'],
            'date': {'$gte': today, '$lt': tomorrow}
        })
        
        quests_completed = len(quest_progress.get('completed_quests', [])) if quest_progress else 0
        
        # Get today's activities
        activities = list(db.activities.find({
            'user_id': user['_id'],
            'timestamp': {'$gte': today, '$lt': tomorrow}
        }))
        
        total_steps = sum(activity.get('steps', 0) for activity in activities)
        
        # Get today's stats
        daily_stat = db.daily_stats.find_one({
            'user_id': user['_id'],
            'date': today
        })
        
        xp_gained = daily_stat.get('xp_gained', 0) if daily_stat else 0
        
        return jsonify({
            'date': today.strftime('%Y-%m-%d'),
            'quests_completed': quests_completed,
            'steps': total_steps,
            'xp_gained': xp_gained,
            'activities_logged': len(activities)
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching today's stats: {str(e)}")
        return jsonify({'error': 'Failed to fetch today\'s stats'}), 500


@calendar_bp.route('/<user_id>/streak', methods=['GET'])
@jwt_required()
def get_streak(user_id):
    """Get user's current activity streak"""
    try:
        db = get_db()
        
        # Get user
        user = None
        if ObjectId.is_valid(user_id):
            user = db.users.find_one({'_id': ObjectId(user_id)})
        else:
            user = db.users.find_one({'username': user_id})
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Calculate streak by checking consecutive days with activities
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        current_date = today
        streak = 0
        
        while True:
            next_day = current_date + timedelta(days=1)
            
            # Check if there's any activity on this day
            activity_count = db.activities.count_documents({
                'user_id': user['_id'],
                'timestamp': {'$gte': current_date, '$lt': next_day}
            })
            
            if activity_count == 0:
                break
            
            streak += 1
            current_date -= timedelta(days=1)
            
            # Limit to reasonable streak check (e.g., 365 days)
            if streak >= 365:
                break
        
        return jsonify({
            'current_streak': streak,
            'user_id': user_id
        }), 200
        
    except Exception as e:
        logger.error(f"Error calculating streak: {str(e)}")
        return jsonify({'error': 'Failed to calculate streak'}), 500
