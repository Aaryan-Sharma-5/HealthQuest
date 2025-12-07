from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import datetime
from bson import ObjectId
import re

from app.database import get_db
from app.models import User

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Validate password strength"""
    if len(password) < 6:
        return False, "Password must be at least 6 characters"
    return True, ""

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        # Validate input
        username = data.get('username', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        gender = data.get('gender', 'M').upper()  # Default to Male if not specified
        
        if not username or not email or not password:
            return jsonify({'error': 'Username, email, and password are required'}), 400
        
        if len(username) < 3:
            return jsonify({'error': 'Username must be at least 3 characters'}), 400
        
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        if gender not in ['M', 'F']:
            return jsonify({'error': 'Gender must be either M or F'}), 400
        
        is_valid, msg = validate_password(password)
        if not is_valid:
            return jsonify({'error': msg}), 400
        
        # Check if user exists
        db = get_db()
        users_collection = db.get_collection('users')
        
        if users_collection.find_one({'username': username}):
            return jsonify({'error': 'Username already exists'}), 409
        
        if users_collection.find_one({'email': email}):
            return jsonify({'error': 'Email already registered'}), 409
        
        # Create user with gender
        user_data = User.create(username, email, password, gender)
        result = users_collection.insert_one(user_data)
        
        # Generate token
        access_token = create_access_token(identity=str(result.inserted_id))
        
        # Return user data (without password)
        user_data.pop('password')
        user_data['_id'] = str(result.inserted_id)
        
        # Convert any other ObjectId fields to strings
        for key, value in user_data.items():
            if isinstance(value, ObjectId):
                user_data[key] = str(value)
        
        return jsonify({
            'message': 'User registered successfully',
            'access_token': access_token,
            'user': user_data
        }), 201
        
    except Exception as e:
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()
        
        username_or_email = data.get('username', '').strip()
        password = data.get('password', '')
        
        if not username_or_email or not password:
            return jsonify({'error': 'Username/email and password are required'}), 400
        
        # Find user
        db = get_db()
        users_collection = db.get_collection('users')
        
        # Try to find by username or email
        user = users_collection.find_one({
            '$or': [
                {'username': username_or_email},
                {'email': username_or_email.lower()}
            ]
        })
        
        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Verify password
        if not User.verify_password(user['password'], password):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Update last login
        users_collection.update_one(
            {'_id': user['_id']},
            {'$set': {'last_login': datetime.utcnow()}}
        )
        
        # Generate token
        access_token = create_access_token(identity=str(user['_id']))
        
        # Return user data (without password)
        user.pop('password')
        user['_id'] = str(user['_id'])
        
        # Convert any other ObjectId fields to strings
        for key, value in user.items():
            if isinstance(value, ObjectId):
                user[key] = str(value)
        
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': user
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Login failed: {str(e)}'}), 500

@auth_bp.route('/verify', methods=['GET'])
@jwt_required()
def verify_token():
    """Verify JWT token and return user data"""
    try:
        user_id = get_jwt_identity()
        
        db = get_db()
        users_collection = db.get_collection('users')
        
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Return user data (without password)
        user.pop('password', None)
        user['_id'] = str(user['_id'])
        
        # Convert any other ObjectId fields to strings
        for key, value in user.items():
            if isinstance(value, ObjectId):
                user[key] = str(value)
        
        return jsonify({
            'valid': True,
            'user': user
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Token verification failed: {str(e)}'}), 500

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Change user password"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        old_password = data.get('old_password', '')
        new_password = data.get('new_password', '')
        
        if not old_password or not new_password:
            return jsonify({'error': 'Old and new passwords are required'}), 400
        
        is_valid, msg = validate_password(new_password)
        if not is_valid:
            return jsonify({'error': msg}), 400
        
        db = get_db()
        users_collection = db.get_collection('users')
        
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Verify old password
        if not User.verify_password(user['password'], old_password):
            return jsonify({'error': 'Incorrect old password'}), 401
        
        # Hash new password
        import bcrypt
        hashed_pw = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
        
        # Update password
        users_collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'password': hashed_pw.decode('utf-8')}}
        )
        
        return jsonify({'message': 'Password changed successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': f'Password change failed: {str(e)}'}), 500