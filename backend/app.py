import os
import logging
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

from app.config import config
from app.database import init_db

# Import route blueprints
from app.routes.auth_routes import auth_bp
from app.routes.user_routes import user_bp
from app.routes.quest_routes import quest_bp
from app.routes.boss_routes import boss_bp
from app.routes.activity_routes import activity_bp
from app.routes.guild_routes import guild_bp
from app.routes.ai_routes import ai_bp
from app.routes.calendar_routes import calendar_bp
from app.routes.leaderboard_routes import leaderboard_bp

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def create_app(config_name='development'):
    """Application factory pattern"""
    
    # Initialize Flask app
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config[config_name])
    config[config_name].init_app(app)
    
    # Initialize extensions
    CORS(app, 
         origins=app.config['CORS_ORIGINS'], 
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    jwt = JWTManager(app)
    
    # Initialize database
    with app.app_context():
        db_connected = init_db(app)
        if not db_connected:
            logger.warning(" Running without database connection")
        
    # Import recommendations blueprint
    from app.routes.recommendations_routes import recommendations_bp
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(guild_bp)
    app.register_blueprint(ai_bp)
    app.register_blueprint(recommendations_bp)
    app.register_blueprint(quest_bp)
    app.register_blueprint(boss_bp)
    app.register_blueprint(activity_bp)
    app.register_blueprint(calendar_bp)
    app.register_blueprint(leaderboard_bp)
    
    # Root route
    @app.route('/')
    def index():
        return jsonify({
            'message': 'Welcome to HealthQuest API',
            'version': '1.0.0',
            'status': 'running',
            'endpoints': {
                'auth': '/api/auth',
                'user': '/api/user',
                'quests': '/api/quests',
                'activity': '/api/activity',
                'boss': '/api/boss'
            }
        })
    
    # Health check
    @app.route('/health')
    def health_check():
        return jsonify({
            'status': 'healthy',
            'database': 'connected'
        })
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Endpoint not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500
    
    # JWT error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'error': 'Token has expired',
            'message': 'Please login again'
        }), 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({
            'error': 'Invalid token',
            'message': 'Please provide a valid token'
        }), 401
    
    @jwt.unauthorized_loader
    def unauthorized_callback(error):
        return jsonify({
            'error': 'Authorization required',
            'message': 'Please login to access this resource'
        }), 401
    
    logger.info("✅ HealthQuest API initialized successfully")
    
    return app

# Create app instance
app = create_app(os.getenv('FLASK_ENV', 'development'))

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    
    logger.info(f"""
    ╔════════════════════════════════════════╗
    ║      HEALTHQUEST API SERVER            ║
    ╠════════════════════════════════════════╣
    ║  Status: Running                       ║
    ║  Port: {port}                          ║
    ║  URL: http://127.0.0.1:{port}          ║
    ║  Environment: {os.getenv('FLASK_ENV', 'development')}              ║
    ╚════════════════════════════════════════╝
    """)
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=True
    )