from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import asyncio
from emergentintegrations.llm.chat import LlmChat, UserMessage
import json
import random
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# AI Chat setup
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# Create the main app without a prefix
app = FastAPI(title="MentorMatch AI", description="AI-Powered Career Mentorship Platform")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Pydantic Models
class UserProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    role: str  # "mentor" or "mentee"
    current_position: str
    industry: str
    experience_years: int
    skills: List[str]
    goals: List[str]
    bio: str
    interests: List[str]
    communication_style: Optional[str] = None
    ai_analysis: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserProfileCreate(BaseModel):
    name: str
    email: str
    role: str
    current_position: str
    industry: str
    experience_years: int
    skills: List[str]
    goals: List[str]
    bio: str
    interests: List[str]

class Goal(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    description: str
    category: str  # "skill", "career", "networking", "leadership"
    target_date: datetime
    milestones: List[Dict[str, Any]] = []
    progress: float = 0.0
    ai_recommendations: List[str] = []
    status: str = "active"  # "active", "completed", "paused"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class GoalCreate(BaseModel):
    user_id: str
    title: str
    description: str
    category: str
    target_date: datetime

class MentorshipMatch(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    mentor_id: str
    mentee_id: str
    match_score: float
    match_reasons: List[str]
    status: str = "pending"  # "pending", "accepted", "active", "completed", "declined"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class MentorshipSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    match_id: str
    mentor_id: str
    mentee_id: str
    scheduled_time: datetime
    duration_minutes: int = 60
    agenda: List[str] = []
    notes: str = ""
    action_items: List[str] = []
    ai_insights: Optional[Dict[str, Any]] = None
    status: str = "scheduled"  # "scheduled", "completed", "cancelled"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class SessionCreate(BaseModel):
    match_id: str
    scheduled_time: datetime
    duration_minutes: int = 60

class CareerInsight(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    insight_type: str  # "skill_gap", "market_trend", "career_path", "networking"
    title: str
    description: str
    recommendations: List[str]
    confidence_score: float
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Helper Functions
def clean_mongo_doc(doc):
    """Remove MongoDB ObjectId fields from documents"""
    if isinstance(doc, dict):
        # Remove _id field if it exists
        if '_id' in doc:
            del doc['_id']
        # Recursively clean nested documents
        for key, value in doc.items():
            if isinstance(value, dict):
                doc[key] = clean_mongo_doc(value)
            elif isinstance(value, list):
                doc[key] = [clean_mongo_doc(item) if isinstance(item, dict) else item for item in value]
    return doc

def clean_mongo_list(docs):
    """Clean a list of MongoDB documents"""
    return [clean_mongo_doc(doc) for doc in docs]

# AI Helper Functions
async def get_ai_chat():
    """Initialize AI chat with system message"""
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"mentormatch_{datetime.now().timestamp()}",
        system_message="""You are an AI career advisor and mentorship expert. You help analyze professional profiles, 
        match mentors with mentees, provide career insights, and generate personalized recommendations. 
        Always provide practical, actionable advice focused on professional growth and career development."""
    ).with_model("openai", "gpt-4o-mini")
    return chat

async def analyze_user_profile_ai(profile_data: dict) -> dict:
    """AI analysis of user profile for insights and recommendations"""
    try:
        chat = await get_ai_chat()
        
        prompt = f"""
        Analyze this professional profile and provide insights:
        
        Name: {profile_data['name']}
        Role: {profile_data['role']}
        Position: {profile_data['current_position']}
        Industry: {profile_data['industry']}
        Experience: {profile_data['experience_years']} years
        Skills: {', '.join(profile_data['skills'])}
        Goals: {', '.join(profile_data['goals'])}
        Bio: {profile_data['bio']}
        Interests: {', '.join(profile_data['interests'])}
        
        Provide a JSON response with:
        1. "communication_style": Inferred communication style (collaborative, direct, analytical, creative)
        2. "skill_strengths": Top 3 skill areas
        3. "growth_areas": 3 areas for improvement
        4. "career_stage": Assessment of career stage
        5. "mentorship_readiness": Score 1-10 for giving/receiving mentorship
        6. "personality_traits": 3 key professional traits
        """
        
        message = UserMessage(text=prompt)
        response = await chat.send_message(message)
        
        # Parse AI response
        try:
            analysis = json.loads(response)
        except:
            # Fallback parsing if JSON isn't properly formatted
            analysis = {
                "communication_style": "collaborative",
                "skill_strengths": ["leadership", "technical", "communication"],
                "growth_areas": ["networking", "strategic thinking", "industry knowledge"],
                "career_stage": "mid-level",
                "mentorship_readiness": 7,
                "personality_traits": ["analytical", "growth-oriented", "collaborative"]
            }
        
        return analysis
    except Exception as e:
        logging.error(f"AI profile analysis error: {e}")
        return {
            "communication_style": "collaborative",
            "skill_strengths": [],
            "growth_areas": [],
            "career_stage": "unknown",
            "mentorship_readiness": 5,
            "personality_traits": []
        }

def calculate_match_score(mentor_profile: dict, mentee_profile: dict) -> tuple[float, List[str]]:
    """Calculate mentorship match score using AI and similarity algorithms"""
    try:
        reasons = []
        score = 0.0
        
        # Industry alignment (20%)
        if mentor_profile.get('industry') == mentee_profile.get('industry'):
            score += 0.2
            reasons.append(f"Same industry: {mentor_profile.get('industry')}")
        
        # Experience gap (15%) - mentor should have more experience
        exp_gap = mentor_profile.get('experience_years', 0) - mentee_profile.get('experience_years', 0)
        if exp_gap >= 3:
            score += 0.15
            reasons.append(f"Good experience gap: {exp_gap} years")
        elif exp_gap >= 1:
            score += 0.1
            reasons.append(f"Moderate experience gap: {exp_gap} years")
        
        # Skills overlap (25%)
        mentor_skills = set(mentor_profile.get('skills', []))
        mentee_goals_skills = set()
        for goal in mentee_profile.get('goals', []):
            mentee_goals_skills.update(goal.lower().split())
        
        skill_overlap = len(mentor_skills.intersection(mentee_goals_skills))
        if skill_overlap > 0:
            skill_score = min(skill_overlap / 5, 0.25)
            score += skill_score
            reasons.append(f"Skills alignment: {skill_overlap} matching areas")
        
        # Communication style compatibility (15%)
        mentor_style = mentor_profile.get('ai_analysis', {}).get('communication_style', '')
        mentee_style = mentee_profile.get('ai_analysis', {}).get('communication_style', '')
        if mentor_style and mentee_style:
            compatible_styles = {
                'collaborative': ['collaborative', 'analytical'],
                'direct': ['direct', 'analytical'],
                'analytical': ['analytical', 'collaborative', 'direct'],
                'creative': ['creative', 'collaborative']
            }
            if mentee_style in compatible_styles.get(mentor_style, []):
                score += 0.15
                reasons.append(f"Compatible communication styles: {mentor_style}-{mentee_style}")
        
        # Interest alignment (15%)
        mentor_interests = set(mentor_profile.get('interests', []))
        mentee_interests = set(mentee_profile.get('interests', []))
        interest_overlap = len(mentor_interests.intersection(mentee_interests))
        if interest_overlap > 0:
            interest_score = min(interest_overlap / 3, 0.15)
            score += interest_score
            reasons.append(f"Shared interests: {interest_overlap} common areas")
        
        # Mentorship readiness (10%)
        mentor_readiness = mentor_profile.get('ai_analysis', {}).get('mentorship_readiness', 5)
        mentee_readiness = mentee_profile.get('ai_analysis', {}).get('mentorship_readiness', 5)
        readiness_score = (mentor_readiness + mentee_readiness) / 20
        score += readiness_score * 0.1
        
        return round(score, 2), reasons
    except Exception as e:
        logging.error(f"Match score calculation error: {e}")
        return 0.5, ["Basic compatibility assessment"]

async def generate_session_agenda_ai(mentor_profile: dict, mentee_profile: dict, session_number: int = 1) -> List[str]:
    """Generate AI-powered session agenda"""
    try:
        chat = await get_ai_chat()
        
        prompt = f"""
        Create a mentorship session agenda for:
        
        Mentor: {mentor_profile['name']} - {mentor_profile['current_position']} ({mentor_profile['experience_years']} years exp)
        Mentee: {mentee_profile['name']} - {mentee_profile['current_position']} ({mentee_profile['experience_years']} years exp)
        
        Mentee Goals: {', '.join(mentee_profile['goals'])}
        Session Number: {session_number}
        
        Generate 4-6 specific agenda items for a 60-minute session. Focus on actionable discussions.
        Return as a JSON array of strings.
        """
        
        message = UserMessage(text=prompt)
        response = await chat.send_message(message)
        
        try:
            agenda = json.loads(response)
            return agenda
        except:
            return [
                "Welcome and check-in (10 min)",
                "Review goals and progress (15 min)",
                "Skill development discussion (20 min)",
                "Career strategy and next steps (10 min)",
                "Action items and follow-up (5 min)"
            ]
    except Exception as e:
        logging.error(f"AI agenda generation error: {e}")
        return ["Goal review", "Skill discussion", "Action planning"]

async def generate_career_insights_ai(user_profile: dict) -> List[dict]:
    """Generate AI-powered career insights"""
    try:
        chat = await get_ai_chat()
        
        prompt = f"""
        Generate career insights for this professional:
        
        Profile: {user_profile['name']}
        Position: {user_profile['current_position']}
        Industry: {user_profile['industry']}
        Experience: {user_profile['experience_years']} years
        Skills: {', '.join(user_profile['skills'])}
        Goals: {', '.join(user_profile['goals'])}
        
        Generate 3-4 career insights as JSON array with:
        - insight_type: "skill_gap", "market_trend", "career_path", or "networking"
        - title: Brief insight title
        - description: Detailed explanation
        - recommendations: Array of 2-3 actionable recommendations
        - confidence_score: 0.0-1.0 confidence in the insight
        """
        
        message = UserMessage(text=prompt)
        response = await chat.send_message(message)
        
        try:
            insights = json.loads(response)
            return insights
        except:
            return [
                {
                    "insight_type": "skill_gap",
                    "title": "Emerging Technology Skills",
                    "description": "Based on market trends, consider developing skills in emerging technologies relevant to your field.",
                    "recommendations": ["Take online courses", "Join professional communities", "Attend industry conferences"],
                    "confidence_score": 0.8
                }
            ]
    except Exception as e:
        logging.error(f"AI insights generation error: {e}")
        return []

# API Endpoints
@api_router.get("/")
async def root():
    return {"message": "MentorMatch AI - Your Intelligent Career Mentorship Platform"}

@api_router.post("/profiles", response_model=UserProfile)
async def create_profile(profile_data: UserProfileCreate):
    """Create a new user profile with AI analysis"""
    try:
        # Create profile
        profile_dict = profile_data.dict()
        profile_dict['id'] = str(uuid.uuid4())
        profile_dict['created_at'] = datetime.utcnow()
        profile_dict['updated_at'] = datetime.utcnow()
        
        # Get AI analysis
        ai_analysis = await analyze_user_profile_ai(profile_dict)
        profile_dict['ai_analysis'] = ai_analysis
        profile_dict['communication_style'] = ai_analysis.get('communication_style')
        
        # Save to database
        await db.user_profiles.insert_one(profile_dict)
        
        return UserProfile(**profile_dict)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating profile: {str(e)}")

@api_router.get("/profiles", response_model=List[UserProfile])
async def get_profiles():
    """Get all user profiles"""
    try:
        profiles = await db.user_profiles.find().to_list(1000)
        cleaned_profiles = clean_mongo_list(profiles)
        return [UserProfile(**profile) for profile in cleaned_profiles]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching profiles: {str(e)}")

@api_router.get("/profiles/{profile_id}", response_model=UserProfile)
async def get_profile(profile_id: str):
    """Get specific user profile"""
    try:
        profile = await db.user_profiles.find_one({"id": profile_id})
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        return UserProfile(**profile)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching profile: {str(e)}")

@api_router.post("/matches/{mentee_id}")
async def find_matches(mentee_id: str):
    """Find mentor matches for a mentee using AI"""
    try:
        # Get mentee profile
        mentee = await db.user_profiles.find_one({"id": mentee_id, "role": "mentee"})
        if not mentee:
            raise HTTPException(status_code=404, detail="Mentee profile not found")
        
        # Get all mentors
        mentors = await db.user_profiles.find({"role": "mentor"}).to_list(1000)
        
        matches = []
        for mentor in mentors:
            score, reasons = calculate_match_score(mentor, mentee)
            if score > 0.3:  # Minimum match threshold
                match = {
                    "id": str(uuid.uuid4()),
                    "mentor_id": mentor["id"],
                    "mentee_id": mentee_id,
                    "match_score": score,
                    "match_reasons": reasons,
                    "status": "pending",
                    "created_at": datetime.utcnow(),
                    "mentor_name": mentor["name"],
                    "mentor_position": mentor["current_position"],
                    "mentor_industry": mentor["industry"],
                    "mentor_experience": mentor["experience_years"]
                }
                matches.append(match)
        
        # Sort by match score descending
        matches.sort(key=lambda x: x["match_score"], reverse=True)
        
        # Save top 5 matches to database
        for match in matches[:5]:
            match_data = {k: v for k, v in match.items() if k not in ["mentor_name", "mentor_position", "mentor_industry", "mentor_experience"]}
            await db.mentorship_matches.insert_one(match_data)
        
        return {"matches": matches[:10]}  # Return top 10 for display
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error finding matches: {str(e)}")

@api_router.post("/goals", response_model=Goal)
async def create_goal(goal_data: GoalCreate):
    """Create a new goal with AI recommendations"""
    try:
        goal_dict = goal_data.dict()
        goal_dict['id'] = str(uuid.uuid4())
        goal_dict['created_at'] = datetime.utcnow()
        
        # Get AI recommendations
        chat = await get_ai_chat()
        prompt = f"""
        Generate 3-5 specific, actionable recommendations for this career goal:
        
        Title: {goal_dict['title']}
        Description: {goal_dict['description']}
        Category: {goal_dict['category']}
        Target Date: {goal_dict['target_date']}
        
        Return as JSON array of recommendation strings.
        """
        
        message = UserMessage(text=prompt)
        response = await chat.send_message(message)
        
        try:
            recommendations = json.loads(response)
            goal_dict['ai_recommendations'] = recommendations
        except:
            goal_dict['ai_recommendations'] = ["Set specific milestones", "Find relevant resources", "Track progress weekly"]
        
        await db.goals.insert_one(goal_dict)
        return Goal(**goal_dict)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating goal: {str(e)}")

@api_router.get("/goals/{user_id}", response_model=List[Goal])
async def get_user_goals(user_id: str):
    """Get all goals for a user"""
    try:
        goals = await db.goals.find({"user_id": user_id}).to_list(1000)
        return [Goal(**goal) for goal in goals]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching goals: {str(e)}")

@api_router.post("/sessions", response_model=MentorshipSession)
async def create_session(session_data: SessionCreate):
    """Create a mentorship session with AI-generated agenda"""
    try:
        # Get match details
        match = await db.mentorship_matches.find_one({"id": session_data.match_id})
        if not match:
            raise HTTPException(status_code=404, detail="Match not found")
        
        # Get mentor and mentee profiles
        mentor = await db.user_profiles.find_one({"id": match["mentor_id"]})
        mentee = await db.user_profiles.find_one({"id": match["mentee_id"]})
        
        # Count existing sessions for agenda customization
        session_count = await db.mentorship_sessions.count_documents({"match_id": session_data.match_id})
        
        # Generate AI agenda
        agenda = await generate_session_agenda_ai(mentor, mentee, session_count + 1)
        
        # Create session
        session_dict = session_data.dict()
        session_dict.update({
            "id": str(uuid.uuid4()),
            "mentor_id": match["mentor_id"],
            "mentee_id": match["mentee_id"],
            "agenda": agenda,
            "created_at": datetime.utcnow()
        })
        
        await db.mentorship_sessions.insert_one(session_dict)
        return MentorshipSession(**session_dict)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating session: {str(e)}")

@api_router.get("/insights/{user_id}")
async def get_career_insights(user_id: str):
    """Generate AI-powered career insights for a user"""
    try:
        # Get user profile
        profile = await db.user_profiles.find_one({"id": user_id})
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        # Check if insights exist and are recent (less than 7 days old)
        week_ago = datetime.utcnow() - timedelta(days=7)
        existing_insights = await db.career_insights.find({
            "user_id": user_id,
            "created_at": {"$gte": week_ago}
        }).to_list(100)
        
        if existing_insights:
            return {"insights": clean_mongo_list(existing_insights)}
        
        # Generate new insights
        ai_insights = await generate_career_insights_ai(profile)
        
        # Save insights
        insights = []
        for insight_data in ai_insights:
            insight = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "created_at": datetime.utcnow(),
                **insight_data
            }
            await db.career_insights.insert_one(insight)
            insights.append(clean_mongo_doc(insight))
        
        return {"insights": insights}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating insights: {str(e)}")

@api_router.get("/dashboard/{user_id}")
async def get_dashboard_data(user_id: str):
    """Get comprehensive dashboard data for a user"""
    try:
        # Get user profile
        profile = await db.user_profiles.find_one({"id": user_id})
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        # Get goals
        goals = await db.goals.find({"user_id": user_id}).to_list(100)
        
        # Get matches
        if profile["role"] == "mentee":
            matches = await db.mentorship_matches.find({"mentee_id": user_id}).to_list(100)
        else:
            matches = await db.mentorship_matches.find({"mentor_id": user_id}).to_list(100)
        
        # Get sessions
        sessions = await db.mentorship_sessions.find({
            "$or": [{"mentor_id": user_id}, {"mentee_id": user_id}]
        }).to_list(100)
        
        # Get recent insights
        insights = await db.career_insights.find({"user_id": user_id}).sort("created_at", -1).limit(5).to_list(5)
        
        # Calculate stats
        active_goals = len([g for g in goals if g.get("status", "active") == "active"])
        completed_goals = len([g for g in goals if g.get("status", "active") == "completed"])
        avg_progress = sum([g.get("progress", 0) for g in goals]) / len(goals) if goals else 0
        
        upcoming_sessions = [s for s in sessions if s.get("scheduled_time", datetime.utcnow()) > datetime.utcnow() and s.get("status", "scheduled") == "scheduled"]
        completed_sessions = [s for s in sessions if s.get("status", "scheduled") == "completed"]
        
        return {
            "profile": clean_mongo_doc(profile),
            "stats": {
                "active_goals": active_goals,
                "completed_goals": completed_goals,
                "avg_progress": round(avg_progress, 1),
                "total_matches": len(matches),
                "upcoming_sessions": len(upcoming_sessions),
                "completed_sessions": len(completed_sessions)
            },
            "recent_goals": clean_mongo_list(goals[:5]),
            "recent_matches": clean_mongo_list(matches[:5]),
            "upcoming_sessions": clean_mongo_list(upcoming_sessions[:3]),
            "recent_insights": clean_mongo_list(insights)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching dashboard data: {str(e)}")

# LinkedIn Integration Simulation Endpoints
@api_router.post("/linkedin/import-profile")
async def import_linkedin_profile(linkedin_data: dict):
    """Simulate LinkedIn profile import"""
    try:
        # This would normally integrate with LinkedIn API
        # For demo purposes, we'll simulate the data transformation
        
        simulated_profile = {
            "name": linkedin_data.get("name", "LinkedIn User"),
            "email": linkedin_data.get("email", "user@linkedin.com"),
            "role": "mentee",  # Default
            "current_position": linkedin_data.get("headline", "Professional"),
            "industry": linkedin_data.get("industry", "Technology"),
            "experience_years": 5,  # Calculated from experience
            "skills": linkedin_data.get("skills", ["Leadership", "Strategy", "Communication"]),
            "goals": ["Career advancement", "Skill development", "Network expansion"],
            "bio": linkedin_data.get("summary", "Passionate professional seeking growth opportunities"),
            "interests": ["Professional development", "Innovation", "Networking"]
        }
        
        return {"message": "LinkedIn profile imported successfully", "profile": simulated_profile}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error importing LinkedIn profile: {str(e)}")

@api_router.get("/linkedin/network-analysis/{user_id}")
async def analyze_linkedin_network(user_id: str):
    """Simulate LinkedIn network analysis for mentorship opportunities"""
    try:
        # Simulate network analysis
        network_insights = {
            "total_connections": random.randint(500, 2000),
            "industry_breakdown": {
                "Technology": 35,
                "Finance": 20,
                "Healthcare": 15,
                "Education": 12,
                "Other": 18
            },
            "potential_mentors": random.randint(15, 50),
            "mentorship_opportunities": [
                {
                    "name": "Sarah Johnson",
                    "position": "Senior VP of Engineering",
                    "company": "TechCorp",
                    "mutual_connections": 5,
                    "match_potential": "High"
                },
                {
                    "name": "Michael Chen",
                    "position": "Director of Product",
                    "company": "InnovateAI",
                    "mutual_connections": 3,
                    "match_potential": "Medium"
                }
            ],
            "networking_events": [
                {
                    "name": "AI in Career Development Summit",
                    "date": "2024-12-15",
                    "location": "San Francisco",
                    "relevant_connections": 12
                }
            ]
        }
        
        return network_insights
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing network: {str(e)}")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()