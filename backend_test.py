#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime, timedelta
import time

class MentorMatchAPITester:
    def __init__(self, base_url="https://work-innovator.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_profiles = []
        self.created_goals = []
        self.created_matches = []

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED {details}")
        else:
            print(f"❌ {name} - FAILED {details}")
        return success

    def test_api_root(self):
        """Test API root endpoint"""
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f" | Message: {data.get('message', 'No message')}"
            return self.log_test("API Root Endpoint", success, details)
        except Exception as e:
            return self.log_test("API Root Endpoint", False, f"Error: {str(e)}")

    def test_create_mentor_profile(self):
        """Test creating a mentor profile with AI analysis"""
        try:
            mentor_data = {
                "name": "Sarah Johnson",
                "email": "sarah.johnson@example.com",
                "role": "mentor",
                "current_position": "Senior Software Engineer",
                "industry": "Technology",
                "experience_years": 8,
                "skills": ["Python", "Leadership", "Machine Learning", "Team Management"],
                "goals": ["Mentoring junior developers", "Technical leadership", "AI/ML expertise"],
                "bio": "Experienced software engineer passionate about mentoring and AI technologies. Led multiple teams and projects in fintech and healthcare domains.",
                "interests": ["Artificial Intelligence", "Team Building", "Innovation", "Startups"]
            }
            
            response = requests.post(f"{self.api_url}/profiles", json=mentor_data, timeout=15)
            success = response.status_code == 200
            
            if success:
                profile = response.json()
                self.created_profiles.append(profile)
                has_ai_analysis = profile.get('ai_analysis') is not None
                details = f"Status: {response.status_code} | Profile ID: {profile.get('id')} | AI Analysis: {'Yes' if has_ai_analysis else 'No'}"
                
                # Check AI analysis fields
                if has_ai_analysis:
                    ai_analysis = profile['ai_analysis']
                    required_fields = ['communication_style', 'skill_strengths', 'growth_areas', 'career_stage', 'mentorship_readiness']
                    missing_fields = [field for field in required_fields if field not in ai_analysis]
                    if missing_fields:
                        details += f" | Missing AI fields: {missing_fields}"
                    else:
                        details += f" | Communication Style: {ai_analysis.get('communication_style')}"
            else:
                details = f"Status: {response.status_code} | Error: {response.text}"
                
            return self.log_test("Create Mentor Profile with AI Analysis", success, details)
        except Exception as e:
            return self.log_test("Create Mentor Profile with AI Analysis", False, f"Error: {str(e)}")

    def test_create_mentee_profile(self):
        """Test creating a mentee profile with AI analysis"""
        try:
            mentee_data = {
                "name": "Alex Chen",
                "email": "alex.chen@example.com", 
                "role": "mentee",
                "current_position": "Junior Developer",
                "industry": "Technology",
                "experience_years": 2,
                "skills": ["JavaScript", "React", "Node.js", "Problem Solving"],
                "goals": ["Senior developer role", "Leadership skills", "System design expertise"],
                "bio": "Enthusiastic junior developer eager to grow technical and leadership skills. Interested in full-stack development and system architecture.",
                "interests": ["Web Development", "System Architecture", "Career Growth", "Technology Trends"]
            }
            
            response = requests.post(f"{self.api_url}/profiles", json=mentee_data, timeout=15)
            success = response.status_code == 200
            
            if success:
                profile = response.json()
                self.created_profiles.append(profile)
                has_ai_analysis = profile.get('ai_analysis') is not None
                details = f"Status: {response.status_code} | Profile ID: {profile.get('id')} | AI Analysis: {'Yes' if has_ai_analysis else 'No'}"
            else:
                details = f"Status: {response.status_code} | Error: {response.text}"
                
            return self.log_test("Create Mentee Profile with AI Analysis", success, details)
        except Exception as e:
            return self.log_test("Create Mentee Profile with AI Analysis", False, f"Error: {str(e)}")

    def test_get_profiles(self):
        """Test retrieving all profiles"""
        try:
            response = requests.get(f"{self.api_url}/profiles", timeout=10)
            success = response.status_code == 200
            
            if success:
                profiles = response.json()
                details = f"Status: {response.status_code} | Total Profiles: {len(profiles)}"
                if len(profiles) > 0:
                    mentors = [p for p in profiles if p.get('role') == 'mentor']
                    mentees = [p for p in profiles if p.get('role') == 'mentee']
                    details += f" | Mentors: {len(mentors)} | Mentees: {len(mentees)}"
            else:
                details = f"Status: {response.status_code} | Error: {response.text}"
                
            return self.log_test("Get All Profiles", success, details)
        except Exception as e:
            return self.log_test("Get All Profiles", False, f"Error: {str(e)}")

    def test_ai_matching_system(self):
        """Test AI-powered mentor matching"""
        if len(self.created_profiles) < 2:
            return self.log_test("AI Matching System", False, "Need at least 2 profiles (mentor and mentee)")
        
        try:
            # Find a mentee profile
            mentee_profile = None
            for profile in self.created_profiles:
                if profile.get('role') == 'mentee':
                    mentee_profile = profile
                    break
            
            if not mentee_profile:
                return self.log_test("AI Matching System", False, "No mentee profile found")
            
            mentee_id = mentee_profile['id']
            response = requests.post(f"{self.api_url}/matches/{mentee_id}", timeout=20)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                matches = data.get('matches', [])
                details = f"Status: {response.status_code} | Matches Found: {len(matches)}"
                
                if len(matches) > 0:
                    match = matches[0]
                    self.created_matches.append(match)
                    match_score = match.get('match_score', 0)
                    reasons = match.get('match_reasons', [])
                    details += f" | Top Match Score: {match_score} | Reasons: {len(reasons)}"
                    
                    # Check match quality
                    if match_score > 0.5:
                        details += " | High Quality Match"
                    elif match_score > 0.3:
                        details += " | Medium Quality Match"
                    else:
                        details += " | Low Quality Match"
            else:
                details = f"Status: {response.status_code} | Error: {response.text}"
                
            return self.log_test("AI Matching System", success, details)
        except Exception as e:
            return self.log_test("AI Matching System", False, f"Error: {str(e)}")

    def test_create_goal_with_ai_recommendations(self):
        """Test creating a goal with AI recommendations"""
        if len(self.created_profiles) == 0:
            return self.log_test("Create Goal with AI Recommendations", False, "No profiles available")
        
        try:
            user_id = self.created_profiles[0]['id']
            goal_data = {
                "user_id": user_id,
                "title": "Master System Design",
                "description": "Learn advanced system design patterns and architecture principles to become a senior engineer",
                "category": "skill",
                "target_date": (datetime.now() + timedelta(days=180)).isoformat()
            }
            
            response = requests.post(f"{self.api_url}/goals", json=goal_data, timeout=15)
            success = response.status_code == 200
            
            if success:
                goal = response.json()
                self.created_goals.append(goal)
                ai_recommendations = goal.get('ai_recommendations', [])
                details = f"Status: {response.status_code} | Goal ID: {goal.get('id')} | AI Recommendations: {len(ai_recommendations)}"
                
                if len(ai_recommendations) > 0:
                    details += f" | Sample Recommendation: '{ai_recommendations[0][:50]}...'"
            else:
                details = f"Status: {response.status_code} | Error: {response.text}"
                
            return self.log_test("Create Goal with AI Recommendations", success, details)
        except Exception as e:
            return self.log_test("Create Goal with AI Recommendations", False, f"Error: {str(e)}")

    def test_get_user_goals(self):
        """Test retrieving user goals"""
        if len(self.created_profiles) == 0:
            return self.log_test("Get User Goals", False, "No profiles available")
        
        try:
            user_id = self.created_profiles[0]['id']
            response = requests.get(f"{self.api_url}/goals/{user_id}", timeout=10)
            success = response.status_code == 200
            
            if success:
                goals = response.json()
                details = f"Status: {response.status_code} | Goals Found: {len(goals)}"
                
                if len(goals) > 0:
                    goal = goals[0]
                    details += f" | Sample Goal: '{goal.get('title')}' | Category: {goal.get('category')}"
            else:
                details = f"Status: {response.status_code} | Error: {response.text}"
                
            return self.log_test("Get User Goals", success, details)
        except Exception as e:
            return self.log_test("Get User Goals", False, f"Error: {str(e)}")

    def test_generate_career_insights(self):
        """Test AI-powered career insights generation"""
        if len(self.created_profiles) == 0:
            return self.log_test("Generate Career Insights", False, "No profiles available")
        
        try:
            user_id = self.created_profiles[0]['id']
            response = requests.get(f"{self.api_url}/insights/{user_id}", timeout=20)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                insights = data.get('insights', [])
                details = f"Status: {response.status_code} | Insights Generated: {len(insights)}"
                
                if len(insights) > 0:
                    insight = insights[0]
                    insight_type = insight.get('insight_type')
                    confidence = insight.get('confidence_score', 0)
                    recommendations = insight.get('recommendations', [])
                    details += f" | Type: {insight_type} | Confidence: {confidence} | Recommendations: {len(recommendations)}"
            else:
                details = f"Status: {response.status_code} | Error: {response.text}"
                
            return self.log_test("Generate Career Insights", success, details)
        except Exception as e:
            return self.log_test("Generate Career Insights", False, f"Error: {str(e)}")

    def test_dashboard_data(self):
        """Test comprehensive dashboard data retrieval"""
        if len(self.created_profiles) == 0:
            return self.log_test("Dashboard Data", False, "No profiles available")
        
        try:
            user_id = self.created_profiles[0]['id']
            response = requests.get(f"{self.api_url}/dashboard/{user_id}", timeout=15)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                profile = data.get('profile')
                stats = data.get('stats', {})
                details = f"Status: {response.status_code} | Profile: {'Yes' if profile else 'No'}"
                
                if stats:
                    details += f" | Active Goals: {stats.get('active_goals', 0)}"
                    details += f" | Total Matches: {stats.get('total_matches', 0)}"
                    details += f" | Avg Progress: {stats.get('avg_progress', 0)}%"
            else:
                details = f"Status: {response.status_code} | Error: {response.text}"
                
            return self.log_test("Dashboard Data", success, details)
        except Exception as e:
            return self.log_test("Dashboard Data", False, f"Error: {str(e)}")

    def test_linkedin_integration(self):
        """Test LinkedIn integration simulation"""
        try:
            # Test profile import simulation
            linkedin_data = {
                "name": "LinkedIn User",
                "email": "linkedin@example.com",
                "headline": "Product Manager",
                "industry": "Technology",
                "skills": ["Product Management", "Strategy", "Analytics"],
                "summary": "Experienced product manager with focus on user experience"
            }
            
            response = requests.post(f"{self.api_url}/linkedin/import-profile", json=linkedin_data, timeout=10)
            import_success = response.status_code == 200
            
            # Test network analysis
            response2 = requests.get(f"{self.api_url}/linkedin/network-analysis/demo-user", timeout=10)
            analysis_success = response2.status_code == 200
            
            success = import_success and analysis_success
            details = f"Import: {'✓' if import_success else '✗'} | Analysis: {'✓' if analysis_success else '✗'}"
            
            if analysis_success:
                data = response2.json()
                total_connections = data.get('total_connections', 0)
                potential_mentors = data.get('potential_mentors', 0)
                details += f" | Connections: {total_connections} | Potential Mentors: {potential_mentors}"
                
            return self.log_test("LinkedIn Integration", success, details)
        except Exception as e:
            return self.log_test("LinkedIn Integration", False, f"Error: {str(e)}")

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting MentorMatch AI Backend API Tests")
        print("=" * 60)
        
        # Basic connectivity
        self.test_api_root()
        
        # Profile management with AI
        self.test_create_mentor_profile()
        time.sleep(2)  # Allow AI processing time
        self.test_create_mentee_profile()
        time.sleep(2)  # Allow AI processing time
        self.test_get_profiles()
        
        # AI-powered features
        self.test_ai_matching_system()
        time.sleep(2)  # Allow AI processing time
        self.test_create_goal_with_ai_recommendations()
        time.sleep(2)  # Allow AI processing time
        self.test_get_user_goals()
        self.test_generate_career_insights()
        time.sleep(3)  # Allow AI processing time for insights
        
        # Dashboard and integration
        self.test_dashboard_data()
        self.test_linkedin_integration()
        
        # Summary
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed! Backend API is working correctly.")
            return 0
        else:
            failed_tests = self.tests_run - self.tests_passed
            print(f"⚠️  {failed_tests} test(s) failed. Please check the issues above.")
            return 1

def main():
    tester = MentorMatchAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())