"""
AI-powered health recommendations using Gemini API
Provides personalized insights, workout plans, nutrition advice, and sleep optimization
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime, timedelta
import os
import logging

# Import Gemini with fallback
try:
    from google import genai
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    if GEMINI_API_KEY and GEMINI_API_KEY != 'your_gemini_api_key_here':
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
        GEMINI_AVAILABLE = True
        logging.info("✅ Gemini API initialized for recommendations")
    else:
        gemini_client = None
        GEMINI_AVAILABLE = False
        logging.warning("⚠️ Gemini API key not configured - recommendations will use fallback")
except ImportError:
    gemini_client = None
    GEMINI_AVAILABLE = False
    logging.warning("⚠️ google-genai not installed - recommendations will use fallback")

from app.database import get_db

recommendations_bp = Blueprint('recommendations', __name__, url_prefix='/api/recommendations')
logger = logging.getLogger(__name__)


def get_user_activity_summary(user_id, days=7):
    """Get user's recent activity data for analysis"""
    db = get_db()
    
    # Get user data
    user = db.users.find_one({'_id': ObjectId(user_id)})
    if not user:
        return None
    
    # Get recent activities
    start_date = datetime.utcnow() - timedelta(days=days)
    activities = list(db.activities.find({
        'user_id': user_id,
        'timestamp': {'$gte': start_date}
    }).sort('timestamp', -1))
    
    # Calculate averages
    avg_steps = 0
    avg_meditation = 0
    avg_water = 0
    avg_sleep = 0
    
    if activities:
        total_steps = sum(a.get('steps', 0) for a in activities)
        total_meditation = sum(a.get('meditation_minutes', 0) for a in activities)
        total_water = sum(a.get('water_glasses', 0) for a in activities)
        total_sleep = sum(a.get('sleep_hours', 0) for a in activities)
        
        count = len(activities)
        avg_steps = total_steps / count
        avg_meditation = total_meditation / count
        avg_water = total_water / count
        avg_sleep = total_sleep / count
    
    return {
        'user': {
            'level': user.get('level', 1),
            'xp': user.get('xp', 0),
            'streak': user.get('streak', 0),
            'health': user.get('health', 100),
            'stamina': user.get('stamina', 100)
        },
        'activities': {
            'days_logged': len(activities),
            'avg_steps': int(avg_steps),
            'avg_meditation': int(avg_meditation),
            'avg_water': int(avg_water),
            'avg_sleep': round(avg_sleep, 1)
        }
    }


def generate_health_insights_with_gemini(user_summary):
    """Generate personalized health insights using Gemini"""
    if not gemini_client:
        return generate_health_insights_fallback(user_summary)
    
    try:
        user_data = user_summary['user']
        activity_data = user_summary['activities']
        
        prompt = f"""You are a professional health coach analyzing a user's wellness data.

User Profile:
- Level: {user_data['level']} (shows long-term engagement)
- Current Streak: {user_data['streak']} days
- Health: {user_data['health']}% | Stamina: {user_data['stamina']}%

Recent Activity ({activity_data['days_logged']} days):
- Daily Steps: {activity_data['avg_steps']} avg
- Meditation: {activity_data['avg_meditation']} min/day avg
- Water Intake: {activity_data['avg_water']} glasses/day avg  
- Sleep: {activity_data['avg_sleep']} hours/night avg

Provide 3-4 SHORT, actionable insights (bullet points):
1. Celebrate what they're doing well
2. Identify ONE area for improvement
3. Suggest a specific, achievable next step
4. Give encouragement in RPG terms (optional)

Keep each point under 20 words. Be warm and supportive."""

        response = gemini_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        insights = response.text.strip()
        
        logger.info(f"✨ Generated Gemini health insights for user")
        return insights
        
    except Exception as e:
        logger.error(f"Gemini insight generation failed: {e}")
        return generate_health_insights_fallback(user_summary)


def generate_health_insights_fallback(user_summary):
    """Fallback health insights using template logic"""
    insights = []
    activity_data = user_summary['activities']
    user_data = user_summary['user']
    
    # Steps analysis
    if activity_data['avg_steps'] >= 8000:
        insights.append("✅ Excellent movement! You're crushing your step goals.")
    elif activity_data['avg_steps'] >= 5000:
        insights.append("👍 Good movement routine. Try adding 1000 more steps daily.")
    else:
        insights.append("🚶 Let's boost movement: aim for 5000 steps to start.")
    
    # Sleep analysis
    if activity_data['avg_sleep'] >= 7.5:
        insights.append("😴 Great sleep habits! Recovery is key to progress.")
    elif activity_data['avg_sleep'] >= 6:
        insights.append("💤 Sleep could improve. Try for 7-8 hours nightly.")
    else:
        insights.append("⚠️ Prioritize sleep! Aim for 7+ hours for better recovery.")
    
    # Streak encouragement
    if user_data['streak'] >= 7:
        insights.append(f"🔥 {user_data['streak']}-day streak! You're on a roll, hero!")
    elif user_data['streak'] >= 3:
        insights.append(f"⭐ {user_data['streak']}-day streak going! Keep it up!")
    
    return '\n'.join(insights)


def generate_workout_plan_with_gemini(user_summary, goal='general'):
    """Generate personalized workout recommendations using Gemini"""
    if not gemini_client:
        return generate_workout_plan_fallback(user_summary, goal)
    
    try:
        user_data = user_summary['user']
        activity_data = user_summary['activities']
        
        prompt = f"""You are a certified fitness trainer creating a workout plan for a gamified health app user.

User Profile:
- Fitness Level: {user_data['level']} (beginner=1-5, intermediate=6-15, advanced=16+)
- Current Activity: {activity_data['avg_steps']} daily steps avg
- Goal: {goal}

Create a simple 3-day workout plan (bullet points only):
- Day 1: [Exercise type] - [Duration/reps]
- Day 2: [Exercise type] - [Duration/reps]  
- Day 3: [Exercise type] - [Duration/reps]

Requirements:
1. Match difficulty to their level (don't overload beginners)
2. Include variety (cardio, strength, flexibility)
3. Keep it achievable (10-30 minutes per session)
4. No equipment needed (bodyweight exercises)
5. Add ONE motivational tip at the end

Keep total response under 100 words."""

        response = gemini_client.models.generate_content(
            model='gemini-1.5-flash',
            contents=prompt
        )
        plan = response.text.strip()
        
        logger.info(f"✨ Generated Gemini workout plan for {goal} goal")
        return plan
        
    except Exception as e:
        logger.error(f"Gemini workout generation failed: {e}")
        return generate_workout_plan_fallback(user_summary, goal)


def generate_workout_plan_fallback(user_summary, goal='general'):
    """Fallback workout plan using templates"""
    user_level = user_summary['user']['level']
    
    if user_level <= 5:
        return """**Beginner Plan:**
- Day 1: 15-min walk + 10 squats + 5 push-ups (wall or knees)
- Day 2: 10-min stretching + 20 jumping jacks + plank hold (20 sec)
- Day 3: 20-min walk + 15 lunges + 10 arm circles

💪 Start slow and build consistency!"""
    elif user_level <= 15:
        return """**Intermediate Plan:**
- Day 1: 20-min jog + 20 squats + 10 push-ups + 30-sec plank
- Day 2: 15-min HIIT (30 sec work/30 sec rest) + 15 burpees
- Day 3: 30-min walk/jog + 20 lunges + 15 mountain climbers

⚡ Challenge yourself but listen to your body!"""
    else:
        return """**Advanced Plan:**
- Day 1: 30-min run + 30 squats + 20 push-ups + 1-min plank
- Day 2: 20-min HIIT + 20 burpees + 20 mountain climbers + 30 crunches
- Day 3: 40-min cardio + 30 lunges (each leg) + 25 jump squats

🔥 You're unstoppable, warrior!"""


@recommendations_bp.route('/health-insights', methods=['GET'])
@jwt_required()
def get_health_insights():
    """Get personalized health insights based on recent activity"""
    try:
        current_user_id = get_jwt_identity()
        
        # Get user activity summary
        summary = get_user_activity_summary(current_user_id, days=7)
        if not summary:
            return jsonify({'error': 'User not found'}), 404
        
        # Generate insights using Gemini or fallback
        insights = generate_health_insights_with_gemini(summary)
        
        return jsonify({
            'success': True,
            'insights': insights,
            'summary': summary,
            'ai_powered': GEMINI_AVAILABLE
        }), 200
        
    except Exception as e:
        logger.error(f"Error generating health insights: {str(e)}")
        return jsonify({'error': 'Failed to generate insights'}), 500


@recommendations_bp.route('/workout-plan', methods=['POST'])
@jwt_required()
def get_workout_plan():
    """Get personalized workout recommendations"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        goal = data.get('goal', 'general')  # general, weight_loss, strength, endurance
        
        # Get user activity summary
        summary = get_user_activity_summary(current_user_id, days=7)
        if not summary:
            return jsonify({'error': 'User not found'}), 404
        
        # Generate workout plan using Gemini or fallback
        plan = generate_workout_plan_with_gemini(summary, goal)
        
        return jsonify({
            'success': True,
            'plan': plan,
            'goal': goal,
            'user_level': summary['user']['level'],
            'ai_powered': GEMINI_AVAILABLE
        }), 200
        
    except Exception as e:
        logger.error(f"Error generating workout plan: {str(e)}")
        return jsonify({'error': 'Failed to generate workout plan'}), 500


@recommendations_bp.route('/nutrition-tips', methods=['GET'])
@jwt_required()
def get_nutrition_tips():
    """Get personalized nutrition recommendations"""
    try:
        current_user_id = get_jwt_identity()
        
        # Get user activity summary
        summary = get_user_activity_summary(current_user_id, days=7)
        if not summary:
            return jsonify({'error': 'User not found'}), 404
        
        if gemini_client:
            activity_data = summary['activities']
            user_data = summary['user']
            
            prompt = f"""You are a registered dietitian providing nutrition advice for a health app user.

User Profile:
- Activity Level: {activity_data['avg_steps']} daily steps
- Water Intake: {activity_data['avg_water']} glasses/day
- Fitness Level: Level {user_data['level']}

Provide 4-5 SHORT nutrition tips (bullet points):
1. Comment on their hydration (water intake)
2. Suggest protein intake based on activity level
3. Recommend pre/post workout snacks
4. Give ONE easy meal idea
5. Add a fun nutrition fact

Keep each tip under 20 words. Be encouraging!"""

            response = gemini_client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt
            )
            tips = response.text.strip()
        else:
            # Fallback tips
            tips = """**Nutrition Basics:**
- Aim for 8 glasses of water daily to stay hydrated
- Include protein in every meal (eggs, chicken, beans, tofu)
- Pre-workout: banana + almond butter for quick energy
- Post-workout: protein shake or Greek yogurt within 30 mins
- Quick meal: Grilled chicken + quinoa + steamed veggies"""
        
        return jsonify({
            'success': True,
            'tips': tips,
            'ai_powered': GEMINI_AVAILABLE
        }), 200
        
    except Exception as e:
        logger.error(f"Error generating nutrition tips: {str(e)}")
        return jsonify({'error': 'Failed to generate nutrition tips'}), 500
