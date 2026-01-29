"""
Role-Based Access Control Testing Script
Tests all modules/endpoints for each user role and generates accessibility report
"""
import requests
import json
from datetime import datetime

# Base URL for API
BASE_URL = 'http://localhost:8000/api'

# Role credentials
ROLES = {
    'admin': {'email': 'admin@test.com', 'password': 'admin123'},
    'doctor': {'email': 'doctor@test.com', 'password': 'doctor123'},
    'nurse': {'email': 'nurse@test.com', 'password': 'nurse123'},
    'technician': {'email': 'technician@test.com', 'password': 'tech123'},
    'receptionist': {'email': 'receptionist@test.com', 'password': 'reception123'},
    'patient': {'email': 'patient@test.com', 'password': 'patient123'}
}

# Modules to test
MODULES = {
    'Dashboard': {
        'endpoint': '/reports/dashboard-stats/',
        'methods': ['GET']
    },
    'Patients': {
        'endpoint': '/patients/',
        'methods': ['GET', 'POST', 'PUT', 'DELETE']
    },
    'Queue': {
        'endpoint': '/queue/',
        'methods': ['GET', 'POST', 'PUT']
    },
    'Machines': {
        'endpoint': '/machines/',
        'methods': ['GET', 'POST', 'PUT']
    },
    'Sessions': {
        'endpoint': '/queue/sessions/',
        'methods': ['GET', 'POST']
    },
    'Staff': {
        'endpoint': '/auth/users/',
        'methods': ['GET', 'POST']
    },
    'Billing': {
        'endpoint': '/billing/bills/',
        'methods': ['GET', 'POST']
    },
    'Reports': {
        'endpoint': '/reports/patients/',
        'methods': ['GET']
    },
    'Appointments': {
        'endpoint': '/appointments/',
        'methods': ['GET', 'POST']
    }
}

def login(email, password):
    """Login and get authentication token"""
    try:
        response = requests.post(
            f'{BASE_URL}/auth/login/',
            json={'email': email, 'password': password},
            headers={'Content-Type': 'application/json'}
        )
        if response.status_code == 200:
            data = response.json()
            return data.get('access')
        else:
            print(f"❌ Login failed for {email}: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Login error for {email}: {e}")
        return None

def test_endpoint(endpoint, method, token):
    """Test a specific endpoint with given method and token"""
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    url = f'{BASE_URL}{endpoint}'
    
    try:
        if method == 'GET':
            response = requests.get(url, headers=headers, timeout=5)
        elif method == 'POST':
            # Send minimal data for POST requests
            test_data = {}
            response = requests.post(url, headers=headers, json=test_data, timeout=5)
        elif method == 'PUT':
            response = requests.put(url, headers=headers, json={}, timeout=5)
        elif method == 'DELETE':
            response = requests.delete(url, headers=headers, timeout=5)
        else:
            return None, 'Unknown method'
        
        # Consider 200, 201 as success, 400 as schema error but accessible
        if response.status_code in [200, 201]:
            return True, 'Success'
        elif response.status_code == 400:
            return True, 'Accessible (validation error)'
        elif response.status_code == 403:
            return False, 'Forbidden'
        elif response.status_code == 401:
            return False, 'Unauthorized'
        elif response.status_code == 404:
            return None, 'Not Found'
        else:
            return None, f'HTTP {response.status_code}'
            
    except requests.exceptions.Timeout:
        return None, 'Timeout'
    except requests.exceptions.ConnectionError:
        return None, 'Connection Error'
    except Exception as e:
        return None, str(e)[:30]

def generate_report():
    """Generate comprehensive access control report"""
    print("="*80)
    print("DIALYSISTRACK - ROLE-BASED ACCESS CONTROL TEST")
    print("="*80)
    print(f"Test Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Backend URL: {BASE_URL}")
    print("="*80)
    
    # Results storage
    results = {}
    
    # Test each role
    for role_name, credentials in ROLES.items():
        print(f"\n{'='*80}")
        print(f"🔍 TESTING ROLE: {role_name.upper()}")
        print(f"{'='*80}")
        
        # Login
        token = login(credentials['email'], credentials['password'])
        if not token:
            print(f"❌ Could not login as {role_name}")
            results[role_name] = {'login': False, 'modules': {}}
            continue
        
        print(f"✅ Login successful for {role_name}")
        results[role_name] = {'login': True, 'modules': {}}
        
        # Test each module
        for module_name, module_config in MODULES.items():
            endpoint = module_config['endpoint']
            methods = module_config['methods']
            
            module_results = {}
            
            for method in methods:
                success, message = test_endpoint(endpoint, method, token)
                module_results[method] = {
                    'success': success,
                    'message': message
                }
                
                # Print result
                if success is True:
                    symbol = '✓'
                    color = '✅'
                elif success is False:
                    symbol = '✗'
                    color = '❌'
                else:
                    symbol = '?'
                    color = '⚠️'
                
                print(f"  {color} {module_name:20} {method:6} | {message}")
            
            results[role_name]['modules'][module_name] = module_results
    
    # Generate summary table
    print("\n" + "="*80)
    print("SUMMARY TABLE - MODULE ACCESS BY ROLE")
    print("="*80)
    print("Legend: ✓ = Allowed | ✗ = Denied | ? = Error/Unknown")
    print("="*80)
    
    # Header
    header = f"{'Module':<20}"
    for role in ROLES.keys():
        header += f"{role.capitalize():<15}"
    print(header)
    print("-"*80)
    
    # For each module, show which roles have access
    for module_name in MODULES.keys():
        row = f"{module_name:<20}"
        for role_name in ROLES.keys():
            if role_name in results and results[role_name]['login']:
                module_data = results[role_name]['modules'].get(module_name, {})
                
                # Check if ANY method succeeded
                has_access = any(
                    method_data['success'] is True 
                    for method_data in module_data.values()
                )
                
                if has_access:
                    row += f"{'✓ Yes':<15}"
                else:
                    # Check if explicitly denied
                    has_denial = any(
                        method_data['success'] is False 
                        for method_data in module_data.values()
                    )
                    if has_denial:
                        row += f"{'✗ No':<15}"
                    else:
                        row += f"{'? Error':<15}"
            else:
                row += f"{'- N/A':<15}"
        print(row)
    
    # Generate detailed report file
    report_file = 'testing/access_control_report.txt'
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write("="*80 + "\n")
        f.write("DIALYSISTRACK - DETAILED ACCESS CONTROL REPORT\n")
        f.write("="*80 + "\n")
        f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write("="*80 + "\n\n")
        
        for role_name, role_data in results.items():
            f.write(f"\n{'='*80}\n")
            f.write(f"ROLE: {role_name.upper()}\n")
            f.write(f"{'='*80}\n")
            f.write(f"Login: {'✅ Success' if role_data['login'] else '❌ Failed'}\n\n")
            
            if role_data['login']:
                for module_name, module_data in role_data['modules'].items():
                    f.write(f"\n  {module_name}:\n")
                    for method, method_data in module_data.items():
                        success = method_data['success']
                        message = method_data['message']
                        symbol = '✅' if success is True else ('❌' if success is False else '⚠️')
                        f.write(f"    {symbol} {method:6} | {message}\n")
    
    print(f"\n📄 Detailed report saved to: {report_file}")
    
    # Generate markdown report
    md_file = 'testing/ACCESS_CONTROL_MATRIX.md'
    with open(md_file, 'w', encoding='utf-8') as f:
        f.write("# DialysisTrack - Access Control Matrix\n\n")
        f.write(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        f.write("## Summary\n\n")
        f.write("| Module | Admin | Doctor | Nurse | Technician | Receptionist | Patient |\n")
        f.write("|--------|-------|--------|-------|------------|--------------|--------|\n")
        
        for module_name in MODULES.keys():
            row = f"| {module_name} |"
            for role_name in ROLES.keys():
                if role_name in results and results[role_name]['login']:
                    module_data = results[role_name]['modules'].get(module_name, {})
                    has_access = any(
                        method_data['success'] is True 
                        for method_data in module_data.values()
                    )
                    row += f" {'✅' if has_access else '❌'} |"
                else:
                    row += " ⚠️ |"
            f.write(row + "\n")
        
        f.write("\n## Detailed Permissions\n\n")
        
        for role_name, role_data in results.items():
            f.write(f"\n### {role_name.upper()}\n\n")
            if role_data['login']:
                for module_name, module_data in role_data['modules'].items():
                    f.write(f"\n**{module_name}**\n")
                    for method, method_data in module_data.items():
                        success = method_data['success']
                        message = method_data['message']
                        symbol = '✅' if success is True else ('❌' if success is False else '⚠️')
                        f.write(f"- {symbol} `{method}` - {message}\n")
    
    print(f"📄 Markdown report saved to: {md_file}")
    
    print("\n" + "="*80)
    print("✅ TESTING COMPLETE")
    print("="*80)

if __name__ == '__main__':
    print("\n🚀 Starting Role-Based Access Control Tests...")
    print("⚠️  Make sure the backend server is running on http://localhost:8000")
    
    try:
        # Check if server is running
        response = requests.get(f'{BASE_URL}/auth/', timeout=2)
        if response.status_code == 200:
            print("✅ Backend server is running\n")
            generate_report()
        else:
            print("⚠️  Backend server responded but might have issues")
            generate_report()
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Cannot connect to backend server")
        print("   Please start the server: cd backend && python manage.py runserver")
    except Exception as e:
        print(f"❌ ERROR: {e}")
