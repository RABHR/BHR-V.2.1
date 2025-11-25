#!/usr/bin/env python3
import requests
import json

BASE_URL = "http://localhost:5000"

def test_employee_manager_communication():
    """Test communication between Employee and Manager"""
    print("\n" + "=" * 60)
    print("Testing Employee -> Manager Communication")
    print("=" * 60)
    
    employee_session = requests.Session()
    
    print("\n1. Login as Employee...")
    try:
        response = employee_session.post(
            f"{BASE_URL}/api/employee/login",
            json={"employee_id": "EMP001", "username": "employee1", "password": "password123"}
        )
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {response.json()}")
            emp_id = response.json().get('employee_id')
        else:
            print(f"Response: {response.text}")
            return
    except Exception as e:
        print(f"Error: {e}")
        return

    print("\n2. Get Employee Info...")
    try:
        response = employee_session.get(f"{BASE_URL}/api/employee/me")
        print(f"Status: {response.status_code}")
        emp_info = response.json()
        print(f"Response: {json.dumps(emp_info, indent=2)}")
    except Exception as e:
        print(f"Error: {e}")
        emp_info = None

    print("\n3. Send message from Employee to Manager...")
    try:
        response = employee_session.post(
            f"{BASE_URL}/api/messages",
            json={
                "context": "messages",
                "context_id": 1,
                "message": "Hello Manager, this is from Employee",
                "sender": "employee",
                "sender_name": emp_info['name'] if emp_info else "Employee",
                "sender_id": emp_info['id'] if emp_info else emp_id,
                "sender_type": "employee",
                "receiver_id": 1,
                "receiver_type": "manager"
            }
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Error: {e}")

    print("\n4. Get Employee Messages...")
    try:
        response = employee_session.get(f"{BASE_URL}/api/employee/my-messages")
        print(f"Status: {response.status_code}")
        messages = response.json()
        print(f"Number of messages: {len(messages) if isinstance(messages, list) else 'N/A'}")
        if isinstance(messages, list) and len(messages) > 0:
            print(f"First message - Sender: {messages[0].get('sender_name', 'N/A')}")
            print(f"Full first message: {json.dumps(messages[0], indent=2)}")
    except Exception as e:
        print(f"Error: {e}")


def test_manager_employee_communication():
    """Test communication from Manager to Employee"""
    print("\n" + "=" * 60)
    print("Testing Manager -> Employee Communication")
    print("=" * 60)
    
    manager_session = requests.Session()
    
    print("\n1. Create test manager (if needed)...")
    print("   [Assuming manager with id=1, username=manager1 exists]")
    
    print("\n2. Login as Manager...")
    try:
        response = manager_session.post(
            f"{BASE_URL}/api/manager/login",
            json={"username": "manager1", "password": "password123"}
        )
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {response.json()}")
        else:
            print(f"Response: {response.text}")
            return
    except Exception as e:
        print(f"Error: {e}")
        return

    print("\n3. Get Manager Info...")
    try:
        response = manager_session.get(f"{BASE_URL}/api/manager/me")
        print(f"Status: {response.status_code}")
        mgr_info = response.json()
        print(f"Response: {json.dumps(mgr_info, indent=2)}")
    except Exception as e:
        print(f"Error: {e}")
        mgr_info = None

    print("\n4. Send message from Manager to Employee...")
    try:
        response = manager_session.post(
            f"{BASE_URL}/api/messages",
            json={
                "context": "messages",
                "context_id": 1,
                "message": "Hi Employee, this is from Manager",
                "sender": "manager",
                "sender_name": mgr_info['name'] if mgr_info else "Manager",
                "sender_id": mgr_info['id'] if mgr_info else 1,
                "sender_type": "manager",
                "receiver_id": 1,
                "receiver_type": "employee",
                "employee_id": 1
            }
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Error: {e}")

    print("\n5. Get Manager Messages...")
    try:
        response = manager_session.get(f"{BASE_URL}/api/manager/my-messages")
        print(f"Status: {response.status_code}")
        messages = response.json()
        print(f"Number of messages: {len(messages) if isinstance(messages, list) else 'N/A'}")
        if isinstance(messages, list) and len(messages) > 0:
            for idx, msg in enumerate(messages[:2]):
                print(f"\nMessage {idx+1}:")
                print(f"  Sender: {msg.get('sender_name', 'N/A')}")
                print(f"  Content: {msg.get('message', 'N/A')}")
    except Exception as e:
        print(f"Error: {e}")


def test_admin_employee_communication():
    """Test communication between Admin and Employee"""
    print("\n" + "=" * 60)
    print("Testing Admin -> Employee Communication (View from Employee)")
    print("=" * 60)
    
    employee_session = requests.Session()
    
    print("\n1. Login as Employee...")
    try:
        response = employee_session.post(
            f"{BASE_URL}/api/employee/login",
            json={"employee_id": "EMP001", "username": "employee1", "password": "password123"}
        )
        print(f"Status: {response.status_code}")
        if response.status_code != 200:
            print(f"Login failed: {response.text}")
            return
    except Exception as e:
        print(f"Error: {e}")
        return

    print("\n2. Get Employee Messages (should include admin message)...")
    try:
        response = employee_session.get(f"{BASE_URL}/api/employee/my-messages")
        print(f"Status: {response.status_code}")
        messages = response.json()
        print(f"Number of messages: {len(messages) if isinstance(messages, list) else 'N/A'}")
        
        admin_messages = [m for m in messages if m.get('sender_type') == 'admin'] if isinstance(messages, list) else []
        print(f"Admin messages: {len(admin_messages)}")
        
        if admin_messages:
            print(f"\nFirst admin message:")
            print(f"  Sender: {admin_messages[0].get('sender_name', 'N/A')}")
            print(f"  Content: {admin_messages[0].get('message', 'N/A')}")
            print(f"  Sender Type: {admin_messages[0].get('sender_type', 'N/A')}")
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    print("\n" + "=" * 80)
    print("CROSS-COMMUNICATION TESTING FOR BRAINHR MESSAGING SYSTEM")
    print("=" * 80)
    
    test_employee_manager_communication()
    test_manager_employee_communication()
    test_admin_employee_communication()
    
    print("\n" + "=" * 80)
    print("CROSS-COMMUNICATION TESTING COMPLETE")
    print("=" * 80)
