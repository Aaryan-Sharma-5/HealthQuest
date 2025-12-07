from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from app.database import get_db
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

boss_bp = Blueprint('boss', __name__, url_prefix='/api/boss')

# Global boss data
BOSS_DATA = {
    'id': 'boss_001',
    'name': 'The Couch Potato King',
    'maxHP': 10000,
    'description': 'A fearsome beast that feeds on laziness and procrastination. Defeat it with your healthy habits!'
}

@boss_bp.route('', methods=['GET'])
@jwt_required()
def get_boss():
    """Get current boss status"""
    try:
        db = get_db()
        
        # Get or create global boss
        boss = db.bosses.find_one({'boss_id': 'boss_001'})
        
        if not boss:
            # Initialize boss
            boss = {
                'boss_id': 'boss_001',
                'name': BOSS_DATA['name'],
                'current_hp': BOSS_DATA['maxHP'],
                'max_hp': BOSS_DATA['maxHP'],
                'description': BOSS_DATA['description'],
                'created_at': datetime.utcnow(),
                'last_reset': datetime.utcnow(),
                'total_damage_dealt': 0
            }
            db.bosses.insert_one(boss)
        
        # Calculate HP percentage
        hp_percentage = (boss['current_hp'] / boss['max_hp']) * 100 if boss['max_hp'] > 0 else 0
        
        return jsonify({
            'id': boss['boss_id'],
            'name': boss['name'],
            'currentHP': boss['current_hp'],
            'maxHP': boss['max_hp'],
            'hpPercentage': round(hp_percentage, 2),
            'description': boss.get('description', ''),
            'totalDamageDealt': boss.get('total_damage_dealt', 0)
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching boss: {str(e)}")
        return jsonify({'error': 'Failed to fetch boss data'}), 500


@boss_bp.route('/damage', methods=['POST'])
@jwt_required()
def deal_damage():
    """Deal damage to the boss"""
    try:
        db = get_db()
        data = request.get_json()
        damage = data.get('damage', 0)
        
        if damage <= 0:
            return jsonify({'error': 'Invalid damage amount'}), 400
        
        # Get boss
        boss = db.bosses.find_one({'boss_id': 'boss_001'})
        
        if not boss:
            return jsonify({'error': 'Boss not found'}), 404
        
        # Calculate new HP
        new_hp = max(0, boss['current_hp'] - damage)
        boss_defeated = new_hp == 0
        
        # Update boss HP
        update_data = {
            'current_hp': new_hp,
            'total_damage_dealt': boss.get('total_damage_dealt', 0) + damage
        }
        
        # If boss defeated, reset it
        if boss_defeated:
            update_data['current_hp'] = boss['max_hp']
            update_data['last_reset'] = datetime.utcnow()
            update_data['total_damage_dealt'] = 0
        
        db.bosses.update_one(
            {'boss_id': 'boss_001'},
            {'$set': update_data}
        )
        
        return jsonify({
            'success': True,
            'damageDealt': damage,
            'bossDefeated': boss_defeated,
            'currentHP': update_data['current_hp'],
            'maxHP': boss['max_hp']
        }), 200
        
    except Exception as e:
        logger.error(f"Error dealing damage to boss: {str(e)}")
        return jsonify({'error': 'Failed to deal damage'}), 500


@boss_bp.route('/reset', methods=['POST'])
@jwt_required()
def reset_boss():
    """Reset boss HP (admin function)"""
    try:
        db = get_db()
        
        boss = db.bosses.find_one({'boss_id': 'boss_001'})
        
        if not boss:
            return jsonify({'error': 'Boss not found'}), 404
        
        # Reset boss
        db.bosses.update_one(
            {'boss_id': 'boss_001'},
            {'$set': {
                'current_hp': boss['max_hp'],
                'last_reset': datetime.utcnow(),
                'total_damage_dealt': 0
            }}
        )
        
        return jsonify({
            'success': True,
            'message': 'Boss has been reset!'
        }), 200
        
    except Exception as e:
        logger.error(f"Error resetting boss: {str(e)}")
        return jsonify({'error': 'Failed to reset boss'}), 500