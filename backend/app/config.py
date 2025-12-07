import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'supersecretkey')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwtsecretkey')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    
    # MongoDB Configuration
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/healthquest')
    
    # Server Configuration
    PORT = int(os.getenv('PORT', 5000))
    cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:5173')
    CORS_ORIGINS = [origin.strip() for origin in cors_origins.split(',')]
    
    # Game Configuration
    BASE_XP_PER_LEVEL = 100
    XP_MULTIPLIER = 1.5
    MAX_LEVEL = 100
    
    # Boss Configuration
    BOSS_HP_BASE = 10000
    BOSS_DAMAGE_PER_QUEST = 100
    
    # Quest Configuration
    DAILY_QUEST_COUNT = 5
    QUEST_TYPES = ['steps', 'meditation', 'water', 'sleep', 'exercise']
    
    @staticmethod
    def init_app(app):
        pass

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False

class TestingConfig(Config):
    """Testing configuration"""
    DEBUG = True
    TESTING = True
    MONGO_URI = 'mongodb://localhost:27017/healthquest_test'

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}