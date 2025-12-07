# HealthQuest - Health Motivation Platform

*Periscope Digital Healthcare Hackathon 2025*  
Theme: Health Motivation Platform - Gamified healthy habits with rewards, challenges, and community engagement

## Team VitalNodes
### Team Members:
1. Aaryan Sharma
2. Aditya Choudhuri
3. Akshat Kunder
4. Agniv Dutta 

---

## 🎯 Project Overview

*HealthQuest* is a gamified health motivation platform that transforms healthy living into an engaging RPG-style adventure. It promotes consistent adoption of healthy habits through:

- *Regular Exercise* - Track workouts and movement goals with XP rewards
- *Mindful Eating* - Log nutrition milestones and hydration challenges
- *Meditation & Wellness* - Daily mindfulness missions and breathing exercises
- *Rewards & Achievements* - Level up your health hero through consistent progress
- *Social Challenges* - Community goals and boss battles with other users

### The Problem
People struggle with habit formation and motivation. Traditional health apps lack engagement and social connection, leading to high abandonment rates within weeks.

### Our Solution
*HealthQuest* combines behavioral psychology with RPG gamification to create a highly motivating health platform that:
- Creates a personal health hero avatar that levels up with your habits
- Rewards consistent healthy choices with XP, achievements, and visual progress
- Offers daily adaptive challenges (exercise, nutrition, meditation)
- Enables social engagement through community boss battles
- Maintains long-term motivation through progression systems and rewards

---

## 🏗 Architecture

### Tech Stack
- *Frontend*: React 19 + Vite + Tailwind CSS v4
- *Backend*: Flask 3.0 (Python) + RESTful API
- *Database*: MongoDB (stores user profiles, habits, and progress)
- *AI/ML*: Adaptive challenge difficulty and personalized recommendations
- *Authentication*: JWT-based secure authentication

### System Components

#### 1. *Health Hero System*
Your Personal Avatar
├── Level & XP Progression
├── Health Stats (Strength, Wisdom, Vitality)
├── Habit Tracking (Exercise, Nutrition, Meditation)
├── Achievement Badges
└── Progress Dashboard


#### 2. *Habit & Challenge Module*
- *Exercise Quests*: Step counts, workouts, activity goals
- *Nutrition Quests*: Water intake, meal logging, healthy eating challenges
- *Meditation Quests*: Daily mindfulness, breathing exercises, sleep tracking
- *Adaptive Difficulty*: Challenges scale based on user performance
- *Streaks & Rewards*: Daily bonus multipliers for consistency

#### 3. *Gamification & Rewards Layer*
- *Quest System*: Daily health missions across multiple categories
- *Boss Battles*: Community collective challenges to defeat shared health goals
- *XP & Leveling*: Earn experience points and unlock new levels
- *Achievements*: Badges, milestones, and unlockable rewards
- *Leaderboards*: Social engagement and friendly competition

---

## 🚀 Key Features

### 1. *Health Hero Dashboard*
Your personal health avatar and progress tracker:
- Character profile with stats (Level, XP, Health)
- Visual progress indicators
- Daily habit completion status
- Achievement showcase
- Streak tracking for motivation

### 2. *Quest Board (Daily Challenges)*
Personalized missions across three health categories:
- 🏃‍♂ *Exercise Quests*: Step goals, cardio, strength training
- 🥗 *Nutrition Quests*: Water intake, balanced meals, healthy snacking
- 🧘 *Meditation Quests*: Mindfulness sessions, breathing exercises, sleep goals
- Quests scale in difficulty based on your performance
- Complete quests to earn XP and level up your hero

### 3. *Rewards & Achievements System*
Celebrate your progress:
- XP points for quest completion
- Badges for milestones (First 7-day streak, Level 10, etc.)
- Achievement unlocks for specific challenges
- Leaderboards to compete with friends
- Visual rewards and stat increases

### 4. *Community Boss Battles*
Collective health challenges:
- Boss HP decreases as community completes quests
- Shared goal visualization
- Seasonal challenges with special rewards
- Social motivation through collective progress

### 5. *Analytics Dashboard*
- Quest completion rates
- Mood trend analysis (7-day patterns)
- Streak tracking (consistency metrics)
- Progress visualization

---

## 📊 Data Flow


User Input → Digital Twin Processing → Adaptive Output
   ↓              ↓                        ↓
Quests       AI Analysis              Personalized
Mood         Difficulty Model         Coaching
Reflection   Sentiment Engine         Adjusted Quests
Activity     Pattern Recognition      Progress Stats


---

## 🎮 User Journey

1. *Sign Up* → Create your health hero
2. *Dashboard* → See your digital twin stats
3. *Daily Quests* → Complete health missions
4. *Reflection* → Share mood with Dungeon Master AI
5. *AI Response* → Get personalized coaching
6. *Level Up* → Watch your health twin grow stronger
7. *Long-term* → Build sustainable healthy habits

---

---

## 💻 Installation & Setup

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB (local or Atlas)

### Quick Start

*1. Backend Setup*
bash
cd backend
pip install -r requirements.txt

# Create .env file
FLASK_ENV=development
JWT_SECRET_KEY=your-secret-key
MONGODB_URI=mongodb://localhost:27017/healthquest
CORS_ORIGINS=http://localhost:5173

# Run server
python app.py


*2. Frontend Setup*
bash
cd frontend
npm install
npm run dev


*3. Access Application*
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

---

## 🔌 API Endpoints

### Authentication
- POST /api/auth/register - Create new user
- POST /api/auth/login - Login user
- GET /api/auth/verify - Verify JWT token

### User (Digital Twin)
- GET /api/user/:id - Get user health twin data
- POST /api/user/:id/xp - Add XP (handles level-ups)

### Quests (Adaptive Missions)
- GET /api/quests - Get daily quests with completion status
- POST /api/quests/:id/complete - Mark quest complete

### Boss Battle
- GET /api/boss - Get boss HP status
- POST /api/boss/damage - Deal damage to boss

### Activity (AI Coach)
- POST /api/activity/log - Submit reflection + get AI analysis
- GET /api/activity/history - Get past mood logs

---

## 🤖 AI Logic

### Sentiment Analysis Engine
python
# Simple but effective keyword-based sentiment analysis
POSITIVE_KEYWORDS = ['great', 'motivated', 'energized', 'accomplished']
NEGATIVE_KEYWORDS = ['tired', 'stressed', 'overwhelmed', 'frustrated']

# Output: sentiment + difficulty multiplier
# Positive → 1.2x difficulty (challenge user)
# Negative → 0.8x difficulty (reduce pressure)
# Neutral → 1.0x difficulty (maintain)


### Adaptive Difficulty System
python
# Tracks 7-day completion rate per quest type
if completion_rate > 0.8:
    difficulty += 1  # Increase challenge
elif completion_rate < 0.4:
    difficulty -= 1  # Reduce pressure

# Maps to real quest targets
Movement: [3000, 5000, 8000, 10000 steps]
Mindfulness: [2min, 5min, 10min, 15min]
Nutrition: [2, 4, 6, 8 glasses water]


---

## 📈 Future Enhancements

### Phase 2 (Post-Hackathon)
- [ ] Wearable device integration (Fitbit, Apple Watch)
- [ ] Food image recognition with nutritional analysis
- [ ] Social features (friend challenges, leaderboards)
- [ ] Advanced ML models for health prediction
- [ ] Corporate wellness dashboard

### Phase 3 (Production)
- [ ] Medical professional integration
- [ ] Health trend prediction algorithms
- [ ] Voice-based reflection logging
- [ ] Custom quest creation by users
- [ ] Mobile app (React Native)

---

## 🎯 Hackathon Deliverables

✅ *Working Prototype*: Full-stack web application  
✅ *AI Integration*: Sentiment analysis + adaptive difficulty   
✅ *Cloud Deployment*: Ready for deployment  
✅ *Demo Flow*: Complete user journey from signup to level-up  
✅ *Pitch Deck*: Problem, solution, tech, demo, future  

---

## 🏆 Why HealthQuest Wins

1. *Addresses Real Problem*: 70% of health app users quit within 2 weeks
2. *Innovative Approach*: First gamified cognitive health twin
3. *Behavioral Psychology*: Based on BJ Fogg Model + Atomic Habits
4. *AI-Driven*: Sentiment analysis creates personalized experience
5. *Scalable*: Architecture supports millions of users
6. *Business Model*: B2C subscriptions + B2B corporate wellness

---

## 📝 License

MIT License - Built for Periscope Digital Healthcare Hackathon 2025

