import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Main App Component
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <Header />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/create-profile" element={<CreateProfile />} />
            <Route path="/dashboard/:userId" element={<Dashboard />} />
            <Route path="/matches/:userId" element={<MatchesPage />} />
            <Route path="/goals/:userId" element={<GoalsPage />} />
            <Route path="/insights/:userId" element={<InsightsPage />} />
            <Route path="/linkedin" element={<LinkedInIntegration />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

// Header Component
const Header = () => {
  return (
    <header className="bg-white shadow-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                MentorMatch AI
              </h1>
              <p className="text-xs text-gray-500">Intelligent Career Mentorship</p>
            </div>
          </Link>
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Home
            </Link>
            <Link to="/create-profile" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Join Platform
            </Link>
            <Link to="/linkedin" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              LinkedIn Integration
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

// Landing Page
const LandingPage = () => {
  const [stats, setStats] = useState({ profiles: 0, matches: 0, sessions: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/profiles`);
      const profiles = response.data;
      setStats({
        profiles: profiles.length,
        matches: Math.floor(profiles.length * 0.7),
        sessions: Math.floor(profiles.length * 0.4)
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              AI-Powered Career
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                Mentorship Platform
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform your career with intelligent mentor matching, AI-driven insights, 
              and personalized growth recommendations. Built for the future of professional development.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/create-profile" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Start Your Journey
              </Link>
              <Link 
                to="/linkedin" 
                className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Import from LinkedIn
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{stats.profiles}+</div>
              <div className="text-gray-600">Active Professionals</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">{stats.matches}+</div>
              <div className="text-gray-600">AI-Powered Matches</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">{stats.sessions}+</div>
              <div className="text-gray-600">Mentorship Sessions</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              AI-Native Features for Professional Growth
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Every feature is powered by artificial intelligence to provide personalized, 
              data-driven career development experiences.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon="🧠"
              title="Smart Matching Algorithm"
              description="AI analyzes skills, goals, personality, and industry to find perfect mentor-mentee pairs with explainable match scores."
            />
            <FeatureCard 
              icon="📊"
              title="Career Insights Dashboard"
              description="Real-time analytics on your professional growth with AI-generated recommendations and market trend analysis."
            />
            <FeatureCard 
              icon="🎯"
              title="Intelligent Goal Tracking"
              description="OKR-style goal management with AI-suggested milestones and progress tracking for measurable career advancement."
            />
            <FeatureCard 
              icon="💬"
              title="AI Session Planning"
              description="Automatically generated meeting agendas, conversation starters, and follow-up action items for productive sessions."
            />
            <FeatureCard 
              icon="🔗"
              title="LinkedIn Integration"
              description="Seamless profile import and network analysis to identify mentorship opportunities within your professional connections."
            />
            <FeatureCard 
              icon="📈"
              title="Predictive Career Analytics"
              description="AI-powered predictions on career paths, skill demands, and networking opportunities based on market data."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of professionals using AI to accelerate their career growth through intelligent mentorship.
          </p>
          <Link 
            to="/create-profile" 
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Create Your AI-Enhanced Profile
          </Link>
        </div>
      </section>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

// Create Profile Component
const CreateProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'mentee',
    current_position: '',
    industry: '',
    experience_years: '',
    skills: '',
    goals: '',
    bio: '',
    interests: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const profileData = {
        ...formData,
        experience_years: parseInt(formData.experience_years),
        skills: formData.skills.split(',').map(s => s.trim()),
        goals: formData.goals.split(',').map(g => g.trim()),
        interests: formData.interests.split(',').map(i => i.trim())
      };
      
      const response = await axios.post(`${API}/profiles`, profileData);
      navigate(`/dashboard/${response.data.id}`);
    } catch (error) {
      console.error('Error creating profile:', error);
      alert('Error creating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Create Your AI-Enhanced Profile
          </h2>
          <p className="text-gray-600">
            Tell us about yourself and let our AI analyze your profile for intelligent mentorship matching.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="mentee">Mentee (Seeking Guidance)</option>
                <option value="mentor">Mentor (Offering Guidance)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Years of Experience
              </label>
              <input
                type="number"
                name="experience_years"
                value={formData.experience_years}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Position
              </label>
              <input
                type="text"
                name="current_position"
                value={formData.current_position}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <input
                type="text"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills (comma-separated)
            </label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="e.g., Leadership, Python, Project Management, Data Analysis"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Career Goals (comma-separated)
            </label>
            <input
              type="text"
              name="goals"
              value={formData.goals}
              onChange={handleChange}
              placeholder="e.g., Leadership development, Technical skills, Career transition"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Professional Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Professional Interests (comma-separated)
            </label>
            <input
              type="text"
              name="interests"
              value={formData.interests}
              onChange={handleChange}
              placeholder="e.g., Innovation, Startups, AI, Sustainability"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Profile with AI Analysis...' : 'Create AI-Enhanced Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard = () => {
  const { userId } = useParams();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [userId]);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/${userId}`);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Dashboard data not available.</p>
      </div>
    );
  }

  const { profile, stats, recent_goals, recent_matches, upcoming_sessions, recent_insights } = dashboardData;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {profile.name}!
        </h1>
        <p className="text-blue-100 mb-4">
          {profile.current_position} • {profile.industry} • {profile.experience_years} years experience
        </p>
        <div className="flex flex-wrap gap-2">
          {profile.ai_analysis?.skill_strengths?.map((skill, index) => (
            <span key={index} className="bg-white/20 px-3 py-1 rounded-full text-sm">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Active Goals" 
          value={stats.active_goals} 
          icon="🎯"
          color="blue"
        />
        <StatCard 
          title="Completed Goals" 
          value={stats.completed_goals} 
          icon="✅"
          color="green"
        />
        <StatCard 
          title="Average Progress" 
          value={`${stats.avg_progress}%`} 
          icon="📈"
          color="purple"
        />
        <StatCard 
          title="Total Matches" 
          value={stats.total_matches} 
          icon="🤝"
          color="pink"
        />
        <StatCard 
          title="Upcoming Sessions" 
          value={stats.upcoming_sessions} 
          icon="📅"
          color="indigo"
        />
        <StatCard 
          title="Completed Sessions" 
          value={stats.completed_sessions} 
          icon="💼"
          color="teal"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Link 
          to={`/matches/${userId}`}
          className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-100 text-center"
        >
          <div className="text-2xl mb-2">🔍</div>
          <div className="font-semibold text-gray-900">Find Matches</div>
        </Link>
        <Link 
          to={`/goals/${userId}`}
          className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-100 text-center"
        >
          <div className="text-2xl mb-2">🎯</div>
          <div className="font-semibold text-gray-900">Manage Goals</div>
        </Link>
        <Link 
          to={`/insights/${userId}`}
          className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-100 text-center"
        >
          <div className="text-2xl mb-2">📊</div>
          <div className="font-semibold text-gray-900">Career Insights</div>
        </Link>
        <Link 
          to="/linkedin"
          className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-100 text-center"
        >
          <div className="text-2xl mb-2">🔗</div>
          <div className="font-semibold text-gray-900">LinkedIn Tools</div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {recent_insights && recent_insights.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              🧠 AI Career Insights
            </h3>
            <div className="space-y-4">
              {recent_insights.slice(0, 3).map((insight, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium text-gray-900">{insight.title}</h4>
                  <p className="text-sm text-gray-600">{insight.description}</p>
                  <div className="text-xs text-blue-600 mt-1">
                    Confidence: {Math.round(insight.confidence_score * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {recent_goals && recent_goals.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              🎯 Recent Goals
            </h3>
            <div className="space-y-4">
              {recent_goals.slice(0, 3).map((goal, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900">{goal.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{goal.category}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-4">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{goal.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    pink: 'from-pink-500 to-pink-600',
    indigo: 'from-indigo-500 to-indigo-600',
    teal: 'from-teal-500 to-teal-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center">
        <div className={`bg-gradient-to-r ${colorClasses[color]} w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl mr-4`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

// Matches Page
const MatchesPage = () => {
  const { userId } = useParams();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  const findMatches = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/matches/${userId}`);
      setMatches(response.data.matches || []);
    } catch (error) {
      console.error('Error finding matches:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          AI-Powered Mentor Matching
        </h1>
        <p className="text-gray-600 mb-6">
          Our AI analyzes your profile to find the perfect mentorship matches based on skills, goals, and compatibility.
        </p>
        <button
          onClick={findMatches}
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
        >
          {loading ? 'Finding Matches...' : 'Find AI Matches'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {matches.map((match, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{match.mentor_name}</h3>
                <p className="text-gray-600">{match.mentor_position}</p>
                <p className="text-sm text-gray-500">{match.mentor_industry} • {match.mentor_experience} years exp</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(match.match_score * 100)}%
                </div>
                <div className="text-sm text-gray-500">Match Score</div>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Why this match?</h4>
              <ul className="space-y-1">
                {match.match_reasons.map((reason, reasonIndex) => (
                  <li key={reasonIndex} className="text-sm text-gray-600 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
            
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              Connect with Mentor
            </button>
          </div>
        ))}
      </div>

      {matches.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-gray-600">Click "Find AI Matches" to discover your perfect mentorship matches!</p>
        </div>
      )}
    </div>
  );
};

// Goals Page
const GoalsPage = () => {
  const { userId } = useParams();
  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'skill',
    target_date: ''
  });

  useEffect(() => {
    fetchGoals();
  }, [userId]);

  const fetchGoals = async () => {
    try {
      const response = await axios.get(`${API}/goals/${userId}`);
      setGoals(response.data);
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/goals`, {
        ...formData,
        user_id: userId,
        target_date: new Date(formData.target_date).toISOString()
      });
      setShowForm(false);
      setFormData({ title: '', description: '', category: 'skill', target_date: '' });
      fetchGoals();
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Career Goals</h1>
          <p className="text-gray-600">Track your professional development with AI-powered recommendations</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          + Add Goal
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">Create New Goal</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Goal Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="skill">Skill Development</option>
                  <option value="career">Career Advancement</option>
                  <option value="networking">Networking</option>
                  <option value="leadership">Leadership</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Date</label>
              <input
                type="date"
                value={formData.target_date}
                onChange={(e) => setFormData({...formData, target_date: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Goal with AI Recommendations
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {goals.map((goal, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{goal.title}</h3>
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">
                  {goal.category}
                </span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{goal.progress}%</div>
                <div className="text-sm text-gray-500">Progress</div>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4">{goal.description}</p>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>{goal.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full" 
                  style={{width: `${goal.progress}%`}}
                ></div>
              </div>
            </div>

            {goal.ai_recommendations && goal.ai_recommendations.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">🤖 AI Recommendations</h4>
                <ul className="space-y-1">
                  {goal.ai_recommendations.slice(0, 3).map((rec, recIndex) => (
                    <li key={recIndex} className="text-sm text-gray-600 flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {goals.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🎯</div>
          <p className="text-gray-600">No goals yet. Create your first goal to get AI-powered recommendations!</p>
        </div>
      )}
    </div>
  );
};

// Career Insights Page
const InsightsPage = () => {
  const { userId } = useParams();
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/insights/${userId}`);
      setInsights(response.data.insights || []);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          AI Career Insights
        </h1>
        <p className="text-gray-600 mb-6">
          Get personalized career recommendations powered by AI analysis of your profile and market trends.
        </p>
        <button
          onClick={generateInsights}
          disabled={loading}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
        >
          {loading ? 'Generating Insights...' : 'Generate AI Insights'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {insights.map((insight, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-xl mr-4">
                  {insight.insight_type === 'skill_gap' ? '🎯' : 
                   insight.insight_type === 'market_trend' ? '📈' :
                   insight.insight_type === 'career_path' ? '🛤️' : '🤝'}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{insight.title}</h3>
                  <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full mt-1">
                    {insight.insight_type.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-purple-600">
                  {Math.round(insight.confidence_score * 100)}%
                </div>
                <div className="text-xs text-gray-500">Confidence</div>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4">{insight.description}</p>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">🚀 Recommended Actions</h4>
              <ul className="space-y-2">
                {insight.recommendations.map((rec, recIndex) => (
                  <li key={recIndex} className="text-sm text-gray-600 flex items-start">
                    <span className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {insights.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🧠</div>
          <p className="text-gray-600">Click "Generate AI Insights" to get personalized career recommendations!</p>
        </div>
      )}
    </div>
  );
};

// LinkedIn Integration Page
const LinkedInIntegration = () => {
  const [networkAnalysis, setNetworkAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeNetwork = async () => {
    setLoading(true);
    try {
      // Using demo user ID for simulation
      const response = await axios.get(`${API}/linkedin/network-analysis/demo-user`);
      setNetworkAnalysis(response.data);
    } catch (error) {
      console.error('Error analyzing network:', error);
    } finally {
      setLoading(false);
    }
  };

  const simulateImport = () => {
    alert('LinkedIn profile import simulation completed! In a real implementation, this would connect to LinkedIn API.');
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          LinkedIn Integration
        </h1>
        <p className="text-gray-600 mb-6">
          Enhance your mentorship experience with LinkedIn data integration and network analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center text-white text-2xl mx-auto mb-4">
              👤
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Import LinkedIn Profile</h3>
            <p className="text-gray-600 mb-4">
              Automatically populate your profile with LinkedIn data including experience, skills, and connections.
            </p>
            <button
              onClick={simulateImport}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Import from LinkedIn
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center text-white text-2xl mx-auto mb-4">
              🔍
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Network Analysis</h3>
            <p className="text-gray-600 mb-4">
              Analyze your LinkedIn network to discover mentorship opportunities and industry insights.
            </p>
            <button
              onClick={analyzeNetwork}
              disabled={loading}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'Analyze Network'}
            </button>
          </div>
        </div>
      </div>

      {networkAnalysis && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Network Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{networkAnalysis.total_connections}</div>
                <div className="text-gray-600">Total Connections</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{networkAnalysis.potential_mentors}</div>
                <div className="text-gray-600">Potential Mentors</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{networkAnalysis.networking_events?.length || 0}</div>
                <div className="text-gray-600">Relevant Events</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Industry Breakdown</h3>
              <div className="space-y-3">
                {Object.entries(networkAnalysis.industry_breakdown).map(([industry, percentage]) => (
                  <div key={industry}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{industry}</span>
                      <span>{percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{width: `${percentage}%`}}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Mentorship Opportunities</h3>
              <div className="space-y-4">
                {networkAnalysis.mentorship_opportunities?.map((opportunity, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900">{opportunity.name}</h4>
                    <p className="text-sm text-gray-600">{opportunity.position}</p>
                    <p className="text-sm text-gray-500">{opportunity.company}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-blue-600">{opportunity.mutual_connections} mutual connections</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        opportunity.match_potential === 'High' ? 'bg-green-100 text-green-800' :
                        opportunity.match_potential === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {opportunity.match_potential} Match
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;