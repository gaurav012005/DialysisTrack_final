import requests
import json

BASE_URL = "http://localhost:8000"

def test_endpoints():
    endpoints = [
        "/",
        "/api/health/",
        "/api/server-time/",
        "/api/dashboard/",  # This will require auth
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{BASE_URL}{endpoint}")
            print(f"✅ {endpoint}: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"   Response: {json.dumps(data, indent=2)[:200]}...")
            else:
                print(f"   Error: {response.text}")
                
        except Exception as e:
            print(f"❌ {endpoint}: Failed - {str(e)}")
        
        print("-" * 50)

if __name__ == "__main__":
    test_endpoints()