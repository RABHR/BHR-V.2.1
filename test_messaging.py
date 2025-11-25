#!/usr/bin/env python3
import requests
import json

BASE_URL = "http://localhost:5000"
session = requests.Session()

print("=" * 60)
print("Testing BrainHR Messaging System")
print("=" * 60)

print("\n1. Login as Admin...")
try:
    response = session.post(
        f"{BASE_URL}/api/admin/login",
        json={"username": "BHRadmin", "password": "BHR@6789$"}
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")

print("\n2. Get Admin Info...")
try:
    response = session.get(f"{BASE_URL}/api/admin/me")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    admin_info = response.json()
except Exception as e:
    print(f"Error: {e}")
    admin_info = None

print("\n3. Get Admin Messages...")
try:
    response = session.get(f"{BASE_URL}/api/admin/my-messages")
    print(f"Status: {response.status_code}")
    messages = response.json()
    print(f"Number of messages: {len(messages) if isinstance(messages, list) else 'N/A'}")
    if isinstance(messages, list) and len(messages) > 0:
        print(f"First message: {json.dumps(messages[0], indent=2)}")
    else:
        print(f"Response: {messages}")
except Exception as e:
    print(f"Error: {e}")

print("\n4. Create a test message from Admin to Employee...")
try:
    response = session.post(
        f"{BASE_URL}/api/messages",
        json={
            "context": "test",
            "context_id": 1,
            "message": "Test message from BrainHR Admin",
            "sender": "admin",
            "sender_name": admin_info['name'] if admin_info else "BrainHR Admin",
            "sender_id": admin_info['id'] if admin_info else 1,
            "sender_type": "admin",
            "receiver_id": 1,
            "receiver_type": "employee",
            "employee_id": 1
        }
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")

print("\n5. Get Admin Messages Again (should have the new message)...")
try:
    response = session.get(f"{BASE_URL}/api/admin/my-messages")
    print(f"Status: {response.status_code}")
    messages = response.json()
    print(f"Number of messages: {len(messages) if isinstance(messages, list) else 'N/A'}")
    if isinstance(messages, list) and len(messages) > 0:
        print(f"First message sender_name: {messages[0].get('sender_name', 'N/A')}")
        print(f"Full first message: {json.dumps(messages[0], indent=2)}")
except Exception as e:
    print(f"Error: {e}")

print("\n6. Logout Admin...")
try:
    response = session.post(f"{BASE_URL}/api/admin/logout")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")

print("\n" + "=" * 60)
print("Testing Complete")
print("=" * 60)
