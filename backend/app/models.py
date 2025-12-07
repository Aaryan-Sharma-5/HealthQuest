from datetime import datetime
import bcrypt

class User:
    """User Model - RPG Hero"""
    
    @staticmethod
    def create(username, email, password, gender='M'):
        """Create a new user"""
        hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        return {
            'username': username,
            'email': email,
            'password': hashed_pw.decode('utf-8'),
            'gender': gender,  # 'M' for Male, 'F' for Female
            'level': 1,
            'current_xp': 0,
            'total_xp': 0,
            'health': 100,
            'max_health': 100,
            'stats': {
                'strength': 10,
                'wisdom': 10,
                'vitality': 10
            },
            'avatar_url': f"https://api.dicebear.com/7.x/lorelei/svg?seed={username}&scale=80&backgroundColor=000000",
            'quests_completed': 0,
            'current_streak': 0,
            'longest_streak': 0,
            'created_at': datetime.utcnow(),
            'last_login': datetime.utcnow()
        }
    
    @staticmethod
    def verify_password(stored_password, provided_password):
        """Verify user password"""
        return bcrypt.checkpw(
            provided_password.encode('utf-8'),
            stored_password.encode('utf-8')
        )
    