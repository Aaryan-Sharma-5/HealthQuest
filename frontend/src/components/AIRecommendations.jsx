import React, { useState, useEffect } from 'react';
import { Brain, Zap, Activity, Apple, Lightbulb, TrendingUp, Sparkles, Wand2, Send, Loader2, Heart, Smile, Frown, Meh } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const AIRecommendations = () => {
  const [insights, setInsights] = useState('');
  const [workoutPlan, setWorkoutPlan] = useState('');
  const [nutritionTips, setNutritionTips] = useState('');
  const [loading, setLoading] = useState({ insights: false, workout: false, nutrition: false, coaching: false });
  const [activeTab, setActiveTab] = useState('coaching');
  const [workoutGoal, setWorkoutGoal] = useState('general');
  
  // Dungeon Master states
  const [reflection, setReflection] = useState('');
  const [coachingMessage, setCoachingMessage] = useState(null);
  const [difficulty, setDifficulty] = useState(null);

  useEffect(() => {
    fetchInitialCoaching();
  }, []);

  const fetchInitialCoaching = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE}/ai/coaching-message`, {
        sentiment: 'neutral'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCoachingMessage(res.data);
    } catch (error) {
      console.error('Failed to get initial coaching:', error);
    }
  };

  const handleCoachingSubmit = async (e) => {
    e.preventDefault();
    if (!reflection.trim()) return;

    setLoading(prev => ({ ...prev, coaching: true }));
    try {
      const token = localStorage.getItem('token');
      
      const coachingRes = await axios.post(`${API_BASE}/ai/coaching-message`, {
        reflection_text: reflection
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const difficultyRes = await axios.post(`${API_BASE}/ai/adapt-difficulty`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCoachingMessage(coachingRes.data);
      setDifficulty(difficultyRes.data);
      setReflection('');
    } catch (error) {
      console.error('Failed to get AI coaching:', error);
    } finally {
      setLoading(prev => ({ ...prev, coaching: false }));
    }
  };

  const fetchHealthInsights = async () => {
    setLoading(prev => ({ ...prev, insights: true }));
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/recommendations/health-insights', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setInsights(data.insights);
      }
    } catch (error) {
      console.error('Error fetching health insights:', error);
      setInsights('Failed to load insights. Please try again later.');
    } finally {
      setLoading(prev => ({ ...prev, insights: false }));
    }
  };

  const fetchWorkoutPlan = async (goal) => {
    setLoading(prev => ({ ...prev, workout: true }));
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/recommendations/workout-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ goal })
      });
      const data = await response.json();
      
      if (data.success) {
        setWorkoutPlan(data.plan);
      }
    } catch (error) {
      console.error('Error fetching workout plan:', error);
      setWorkoutPlan('Failed to generate workout plan. Please try again later.');
    } finally {
      setLoading(prev => ({ ...prev, workout: false }));
    }
  };

  const fetchNutritionTips = async () => {
    setLoading(prev => ({ ...prev, nutrition: true }));
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/recommendations/nutrition-tips', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setNutritionTips(data.tips);
      }
    } catch (error) {
      console.error('Error fetching nutrition tips:', error);
      setNutritionTips('Failed to load nutrition tips. Please try again later.');
    } finally {
      setLoading(prev => ({ ...prev, nutrition: false }));
    }
  };

  const handleWorkoutGoalChange = (goal) => {
    setWorkoutGoal(goal);
    fetchWorkoutPlan(goal);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // Fetch data for tab if not already loaded
    if (tab === 'insights' && !insights) {
      fetchHealthInsights();
    } else if (tab === 'workout' && !workoutPlan) {
      fetchWorkoutPlan(workoutGoal);
    } else if (tab === 'nutrition' && !nutritionTips) {
      fetchNutritionTips();
    }
  };

  const formatText = (text) => {
    if (!text) return null;
    
    // Split by newlines and format
    return text.split('\n').map((line, index) => {
      // Handle headers (markdown style)
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <h3 key={index} className="text-lg font-bold text-purple-300 mt-4 mb-2">
            {line.replace(/\*\*/g, '')}
          </h3>
        );
      }
      
      // Handle bullet points
      if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
        return (
          <li key={index} className="ml-4 text-gray-300 mb-1">
            {line.replace(/^[-•]\s*/, '')}
          </li>
        );
      }
      
      // Regular text
      if (line.trim()) {
        return (
          <p key={index} className="text-gray-300 mb-2">
            {line}
          </p>
        );
      }
      
      return <br key={index} />;
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <Brain className="w-12 h-12 text-purple-400 mr-3" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            AI Health Coach
          </h1>
        </div>
        <p className="text-gray-400">Personalized recommendations powered by Gemini AI</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b-2 border-purple-500/30 overflow-x-auto">
        <button
          onClick={() => handleTabChange('coaching')}
          className={`px-6 py-3 font-semibold transition-all rounded-t-xl ${
            activeTab === 'coaching'
              ? 'bg-purple-500/20 border-b-2 border-purple-400 text-purple-300'
              : 'text-gray-400 hover:text-gray-300 hover:bg-slate-800/50'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI Coach
          </div>
        </button>

        <button
          onClick={() => handleTabChange('insights')}
          className={`px-6 py-3 font-semibold transition-all rounded-t-xl ${
            activeTab === 'insights'
              ? 'bg-purple-500/20 border-b-2 border-purple-400 text-purple-300'
              : 'text-gray-400 hover:text-gray-300 hover:bg-slate-800/50'
          }`}
        >
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Health Insights
          </div>
        </button>

        <button
          onClick={() => handleTabChange('workout')}
          className={`px-6 py-3 font-semibold transition-all rounded-t-xl ${
            activeTab === 'workout'
              ? 'bg-purple-500/20 border-b-2 border-purple-400 text-purple-300'
              : 'text-gray-400 hover:text-gray-300 hover:bg-slate-800/50'
          }`}
        >
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Workout Plan
          </div>
        </button>

        <button
          onClick={() => handleTabChange('nutrition')}
          className={`px-6 py-3 font-semibold transition-all rounded-t-xl ${
            activeTab === 'nutrition'
              ? 'bg-purple-500/20 border-b-2 border-purple-400 text-purple-300'
              : 'text-gray-400 hover:text-gray-300 hover:bg-slate-800/50'
          }`}
        >
          <div className="flex items-center gap-2">
            <Apple className="w-5 h-5" />
            Nutrition Tips
          </div>
        </button>
      </div>

      {/* Content Area */}
      <div className="glass-card p-6 border-2 border-purple-500/30">
        {/* AI Coaching Tab */}
        {activeTab === 'coaching' && (
          <div className="relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-transparent to-pink-500 animate-pulse" style={{ animationDuration: '4s' }}></div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="relative p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border-2 border-purple-500/50">
                  <Wand2 className="w-8 h-8 text-purple-400 animate-pulse" />
                  <div className="absolute inset-0 rounded-xl bg-purple-500/20 blur-xl"></div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 tracking-wide uppercase">AI Dungeon Master</h2>
                  <p className="text-xs text-purple-300/70 uppercase tracking-wider">Your Personal Motivation Coach</p>
                </div>
              </div>

              <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30">
                <p className="text-sm text-slate-300 leading-relaxed">
                  <Sparkles className="w-4 h-4 text-purple-400 inline mr-2" />
                  Share how you're feeling, and our AI will analyze your mood to automatically adjust quest difficulty and provide personalized motivation to keep you on track!
                </p>
              </div>

              <form onSubmit={handleCoachingSubmit} className="space-y-4 mb-6">
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="How are you feeling today? Share your thoughts, challenges, or wins..."
                  className="w-full h-32 px-4 py-3 text-white border-2 rounded-xl resize-none bg-slate-900/60 border-purple-500/30 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:shadow-lg focus:shadow-purple-500/20 transition-all"
                />

                <button
                  type="submit"
                  disabled={loading.coaching || !reflection.trim()}
                  className="flex items-center justify-center w-full px-6 py-4 space-x-2 font-bold text-white transition-all bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-neon-purple hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 uppercase tracking-wide"
                >
                  {loading.coaching ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Analyzing Your Mood...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Get AI Coaching</span>
                    </>
                  )}
                </button>
              </form>

              {/* AI Response */}
              {coachingMessage && (
                <div className="p-6 border-2 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-purple-500/40 shadow-xl shadow-purple-500/20 relative overflow-hidden animate-in">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent animate-pulse" style={{ animationDuration: '3s' }}></div>
                  
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-purple-500/30">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Brain className="w-5 h-5 text-purple-400" />
                      </div>
                      <h3 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 tracking-wide uppercase">AI Analysis Complete</h3>
                      <div className="ml-auto w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                    </div>

                    {/* Sentiment Badge */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-400">Mood Detected:</span>
                      <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
                        coachingMessage.sentiment === 'positive' 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : coachingMessage.sentiment === 'negative' 
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                            : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                      }`}>
                        {coachingMessage.sentiment === 'positive' ? (
                          <><Smile className="w-3.5 h-3.5" /> Positive</>
                        ) : coachingMessage.sentiment === 'negative' ? (
                          <><Frown className="w-3.5 h-3.5" /> Struggling</>
                        ) : (
                          <><Meh className="w-3.5 h-3.5" /> Neutral</>
                        )}
                      </span>
                    </div>

                    {/* Coaching Message */}
                    <div className="p-4 border-l-4 rounded-xl bg-gradient-to-r from-slate-900/80 to-slate-800/80 border-cyan-500 shadow-lg shadow-cyan-500/10">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-cyan-500/20 rounded-lg shrink-0">
                          <Sparkles className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wider text-cyan-300 font-bold mb-2">AI Coaching Message</p>
                          <p className="text-base text-slate-100 leading-relaxed">{coachingMessage.message}</p>
                        </div>
                      </div>
                    </div>

                    {/* Difficulty Adjustment */}
                    {difficulty && (
                      <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-yellow-400" />
                            <span className="text-sm font-bold text-slate-300 uppercase tracking-wide">Quest Difficulty Adjusted</span>
                          </div>
                          <span className={`text-lg font-bold px-3 py-1 rounded-full ${
                            difficulty.difficulty > 1.2 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                            difficulty.difficulty < 0.8 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                            'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          }`}>
                            {(difficulty.difficulty * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                          <div
                            style={{ width: `${difficulty.difficulty * 100}%` }}
                            className={`h-full transition-all duration-1000 ${
                              difficulty.difficulty > 1.2 ? 'bg-gradient-to-r from-red-600 to-red-400' : 
                              difficulty.difficulty < 0.8 ? 'bg-gradient-to-r from-green-600 to-green-400' : 
                              'bg-gradient-to-r from-cyan-500 to-blue-500'
                            }`}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                          </div>
                        </div>
                        {difficulty?.feedback && (
                          <div className="flex items-start gap-2 p-3 mt-3 rounded-lg bg-pink-500/10 border border-pink-500/30">
                            <Heart className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                            <p className="text-sm italic text-pink-200">{difficulty.feedback}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Health Insights Tab */}
        {activeTab === 'insights' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-400" />
                Your Health Analysis
              </h2>
              <button
                onClick={fetchHealthInsights}
                disabled={loading.insights}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {loading.insights ? 'Analyzing...' : 'Refresh Insights'}
              </button>
            </div>

            {loading.insights ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
              </div>
            ) : (
              <div className="prose prose-invert max-w-none">
                {formatText(insights)}
              </div>
            )}
          </div>
        )}

        {/* Workout Plan Tab */}
        {activeTab === 'workout' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Activity className="w-6 h-6 text-blue-400" />
                Your Workout Plan
              </h2>
            </div>

            {/* Goal Selector */}
            <div className="mb-6">
              <label className="block text-gray-300 mb-2 font-semibold">Select Your Goal:</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['general', 'weight_loss', 'strength', 'endurance'].map((goal) => (
                  <button
                    key={goal}
                    onClick={() => handleWorkoutGoalChange(goal)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      workoutGoal === goal
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {goal.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </button>
                ))}
              </div>
            </div>

            {loading.workout ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
              </div>
            ) : (
              <div className="prose prose-invert max-w-none">
                {formatText(workoutPlan)}
              </div>
            )}
          </div>
        )}

        {/* Nutrition Tips Tab */}
        {activeTab === 'nutrition' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Apple className="w-6 h-6 text-red-400" />
                Nutrition Guidance
              </h2>
              <button
                onClick={fetchNutritionTips}
                disabled={loading.nutrition}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {loading.nutrition ? 'Loading...' : 'Refresh Tips'}
              </button>
            </div>

            {loading.nutrition ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
              </div>
            ) : (
              <div className="prose prose-invert max-w-none">
                {formatText(nutritionTips)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Badge */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-900/30 border border-purple-700 rounded-full">
          <Brain className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-purple-300">Powered by Google Gemini AI</span>
        </div>
      </div>
    </div>
  );
};

export default AIRecommendations;
