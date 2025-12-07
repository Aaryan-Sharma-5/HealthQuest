"""
Sample Login Code for VitalNodes API
This demonstrates how to register and login users
"""

import requests
import json

# Base URL for the API
BASE_URL = "http://localhost:5000"

# ==========================================
# SAMPLE CREDENTIALS
# ==========================================
SAMPLE_CREDENTIALS = {
    "register": {
        "username": "hero_warrior",
        "email": "warrior@vitalnodes.com",
        "password": "SecurePass123"
    },
    "login": {
        "username": "hero_warrior",
        "password": "SecurePass123"
    }
}

# Alternative login methods
SAMPLE_CREDENTIALS_ALT = {
    "login_with_email": {
        "username": "warrior@vitalnodes.com",  # Can use email instead of username
        "password": "SecurePass123"
    }
}

# More sample users
SAMPLE_USERS = [
    {
        "username": "mage_wizard",
        "email": "wizard@vitalnodes.com",
        "password": "MagicSpell456"
    },
    {
        "username": "rogue_shadow",
        "email": "shadow@vitalnodes.com",
        "password": "ShadowRogue789"
    },
    {
        "username": "paladin_light",
        "email": "light@vitalnodes.com",
        "password": "HolyLight321"
    }
]


def register_user(username, email, password):
    """Register a new user"""
    url = f"{BASE_URL}/api/auth/register"
    payload = {
        "username": username,
        "email": email,
        "password": password
    }
    
    try:
        response = requests.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.json()
    except Exception as e:
        print(f"Error registering user: {e}")
        return None


def login_user(username, password):
    """Login a user"""
    url = f"{BASE_URL}/api/auth/login"
    payload = {
        "username": username,
        "password": password
    }
    
    try:
        response = requests.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        result = response.json()
        print(f"Response: {json.dumps(result, indent=2)}")
        
        # Extract and return the access token if successful
        if response.status_code == 200 and 'access_token' in result:
            return result['access_token']
        return None
    except Exception as e:
        print(f"Error logging in user: {e}")
        return None


def verify_token(access_token):
    """Verify a JWT token"""
    url = f"{BASE_URL}/api/auth/verify"
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    try:
        response = requests.get(url, headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.json()
    except Exception as e:
        print(f"Error verifying token: {e}")
        return None


def change_password(access_token, old_password, new_password):
    """Change user password"""
    url = f"{BASE_URL}/api/auth/change-password"
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    payload = {
        "old_password": old_password,
        "new_password": new_password
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.json()
    except Exception as e:
        print(f"Error changing password: {e}")
        return None


# ==========================================
# EXAMPLE USAGE
# ==========================================
if __name__ == "__main__":
    print("=" * 60)
    print("VitalNodes Authentication Sample Code")
    print("=" * 60)
    
    # Example 1: Register a user
    print("\n1. REGISTERING A USER")
    print("-" * 60)
    creds = SAMPLE_CREDENTIALS["register"]
    print(f"Registering: {creds['username']}")
    register_result = register_user(creds["username"], creds["email"], creds["password"])
    
    # Example 2: Login with username
    print("\n2. LOGIN WITH USERNAME")
    print("-" * 60)
    login_creds = SAMPLE_CREDENTIALS["login"]
    print(f"Logging in: {login_creds['username']}")
    access_token = login_user(login_creds["username"], login_creds["password"])
    
    # Example 3: Login with email
    print("\n3. LOGIN WITH EMAIL")
    print("-" * 60)
    email_login = SAMPLE_CREDENTIALS_ALT["login_with_email"]
    print(f"Logging in with email: {email_login['username']}")
    access_token_email = login_user(email_login["username"], email_login["password"])
    
    # Example 4: Verify token
    if access_token:
        print("\n4. VERIFY TOKEN")
        print("-" * 60)
        verify_token(access_token)
    
    # Example 5: Change password
    if access_token:
        print("\n5. CHANGE PASSWORD")
        print("-" * 60)
        change_password(access_token, "SecurePass123", "NewPassword456")
    
    # Print all sample credentials for reference
    print("\n" + "=" * 60)
    print("SAMPLE CREDENTIALS FOR TESTING")
    print("=" * 60)
    print("\nMain Test User:")
    print(json.dumps(SAMPLE_CREDENTIALS["register"], indent=2))
    print("\nAdditional Test Users:")
    for user in SAMPLE_USERS:
        print(f"\n  Username: {user['username']}")
        print(f"  Email: {user['email']}")
        print(f"  Password: {user['password']}")
