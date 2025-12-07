from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from flask import current_app, g
import logging

logger = logging.getLogger(__name__)

class Database:
    """MongoDB Database Handler"""
    
    def __init__(self):
        self.client = None
        self.db = None
    
    def connect(self, uri):
        """Connect to MongoDB"""
        try:
            self.client = MongoClient(uri, serverSelectionTimeoutMS=5000)
            # Test connection
            self.client.admin.command('ping')
            
            # Extract database name from URI
            db_name = uri.split('/')[-1].split('?')[0]
            self.db = self.client[db_name]
            
            logger.info(f"Connected to MongoDB: {db_name}")
            self._create_indexes()
            return True
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            logger.error(f"MongoDB connection failed: {str(e)}")
            return False
    
    def _create_indexes(self):
        """Create database indexes for performance"""
        try:
            # Users collection indexes
            self.db.users.create_index("username", unique=True)
            self.db.users.create_index("email", unique=True)
            
            # Quests collection indexes
            self.db.quests.create_index([("user_id", 1), ("date", -1)])
            self.db.quests.create_index("is_completed")
            
            # Activities collection indexes
            self.db.activities.create_index([("user_id", 1), ("timestamp", -1)])
            
            # Boss collection indexes
            self.db.bosses.create_index("is_active")
            
            # Quest progress collection indexes
            self.db.quest_progress.create_index([("user_id", 1), ("date", -1)])
            
            # Activity logs collection indexes
            self.db.activity_logs.create_index([("user_id", 1), ("timestamp", -1)])
            
            # Guilds collection indexes
            self.db.guilds.create_index("owner_id")
            self.db.guilds.create_index("name", unique=True)
            
            logger.info("Database indexes created")
        except Exception as e:
            logger.warning(f"Index creation warning: {str(e)}")
    
    def get_collection(self, collection_name):
        """Get a specific collection"""
        if self.db is None:
            raise Exception("Database not connected")
        return self.db[collection_name]
    
    @property
    def users(self):
        """Users collection"""
        return self.get_collection('users')
    
    @property
    def quests(self):
        """Quests collection"""
        return self.get_collection('quests')
    
    @property
    def bosses(self):
        """Bosses collection"""
        return self.get_collection('bosses')
    
    @property
    def activities(self):
        """Activities collection"""
        return self.get_collection('activities')
    
    @property
    def quest_progress(self):
        """Quest progress collection"""
        return self.get_collection('quest_progress')
    
    @property
    def activity_logs(self):
        """Activity logs collection"""
        return self.get_collection('activity_logs')
    
    @property
    def daily_stats(self):
        """Daily stats collection"""
        return self.get_collection('daily_stats')
    
    @property
    def guilds(self):
        """Guilds collection"""
        return self.get_collection('guilds')

# Global database instance
db_instance = Database()

def get_db():
    """Get database instance (Flask context aware)"""
    if 'db' not in g:
        g.db = db_instance
    return g.db

def init_db(app):
    """Initialize database with Flask app"""
    with app.app_context():
        success = db_instance.connect(app.config['MONGO_URI'])
        if not success:
            logger.error("Failed to connect to MongoDB. Check your connection string.")
        return success
