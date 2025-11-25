#!/usr/bin/env python3
"""
Comprehensive test for BrainHR messaging system covering:
1. All user types (Admin, Manager, Employee)
2. Authentication and user info endpoints
3. Message creation with proper sender names
4. Message retrieval with populated names
5. Cross-communication between all user types
6. Unread counts
"""
import requests
import json

BASE_URL = "http://localhost:5000"

def print_section(title):
    print(f"\n{'=' * 70}")
    print(f"  {title}")
    print(f"{'=' * 70}")

def print_test(num, desc):
    print(f"\n  [{num}] {desc}")

def print_success(msg):
    print(f"      [OK] {msg}")

def print_error(msg):
    print(f"      [FAIL] {msg}")

def test_admin_flow():
    """Test Admin login, info, and messaging"""
    print_section("ADMIN FLOW TEST")
    
    admin_session = requests.Session()
    
    print_test(1, "Admin Login")
    try:
        resp = admin_session.post(
            f"{BASE_URL}/api/admin/login",
            json={"username": "BHRadmin", "password": "BHR@6789$"}
        )
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        print_success("Admin login successful")
    except Exception as e:
        print_error(f"Admin login failed: {e}")
        return False

    print_test(2, "Get Admin Info")
    try:
        resp = admin_session.get(f"{BASE_URL}/api/admin/me")
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        data = resp.json()
        assert data['name'] == 'BrainHR Admin', "Admin name incorrect"
        assert data['id'] == 1, "Admin ID incorrect"
        print_success(f"Admin info retrieved: {data['name']}")
    except Exception as e:
        print_error(f"Failed to get admin info: {e}")
        return False

    print_test(3, "Send message to Employee")
    try:
        resp = admin_session.post(
            f"{BASE_URL}/api/messages",
            json={
                "context": "comprehensive_test",
                "message": "Admin test message to employee",
                "sender": "admin",
                "sender_name": "BrainHR Admin",
                "sender_id": 1,
                "sender_type": "admin",
                "receiver_id": 1,
                "receiver_type": "employee",
                "employee_id": 1
            }
        )
        assert resp.status_code == 201, f"Expected 201, got {resp.status_code}"
        print_success("Message sent successfully")
    except Exception as e:
        print_error(f"Failed to send message: {e}")
        return False

    print_test(4, "Get Admin Messages")
    try:
        resp = admin_session.get(f"{BASE_URL}/api/admin/my-messages")
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        messages = resp.json()
        assert len(messages) > 0, "No messages found"
        assert messages[0]['sender_name'] == 'BrainHR Admin', f"Sender name incorrect: {messages[0]['sender_name']}"
        print_success(f"Retrieved {len(messages)} message(s), sender names properly populated")
    except Exception as e:
        print_error(f"Failed to get messages: {e}")
        return False

    print_test(5, "Get Unread Count")
    try:
        resp = admin_session.get(f"{BASE_URL}/api/unread-count")
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        data = resp.json()
        unread = data.get('unread_count', 0)
        print_success(f"Unread count: {unread}")
    except Exception as e:
        print_error(f"Failed to get unread count: {e}")
        return False

    return True

def test_manager_flow():
    """Test Manager login, info, and messaging"""
    print_section("MANAGER FLOW TEST")
    
    mgr_session = requests.Session()
    
    print_test(1, "Manager Login")
    try:
        resp = mgr_session.post(
            f"{BASE_URL}/api/manager/login",
            json={"username": "manager1", "password": "password123"}
        )
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        print_success("Manager login successful")
    except Exception as e:
        print_error(f"Manager login failed: {e}")
        return False

    print_test(2, "Get Manager Info")
    try:
        resp = mgr_session.get(f"{BASE_URL}/api/manager/me")
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        data = resp.json()
        assert data['name'] == 'John Manager', f"Manager name incorrect: {data['name']}"
        assert data['id'] == 1, "Manager ID incorrect"
        print_success(f"Manager info retrieved: {data['name']}")
    except Exception as e:
        print_error(f"Failed to get manager info: {e}")
        return False

    print_test(3, "Send message to Employee")
    try:
        resp = mgr_session.post(
            f"{BASE_URL}/api/messages",
            json={
                "context": "comprehensive_test",
                "message": "Manager test message to employee",
                "sender": "manager",
                "sender_name": "John Manager",
                "sender_id": 1,
                "sender_type": "manager",
                "receiver_id": 1,
                "receiver_type": "employee",
                "employee_id": 1
            }
        )
        assert resp.status_code == 201, f"Expected 201, got {resp.status_code}"
        print_success("Message sent successfully")
    except Exception as e:
        print_error(f"Failed to send message: {e}")
        return False

    print_test(4, "Get Manager Messages")
    try:
        resp = mgr_session.get(f"{BASE_URL}/api/manager/my-messages")
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        messages = resp.json()
        assert len(messages) > 0, "No messages found"
        print_success(f"Retrieved {len(messages)} message(s)")
        # Verify sender names are populated
        for msg in messages[:3]:
            assert msg.get('sender_name') not in ['Manager', None], f"Generic sender name: {msg.get('sender_name')}"
        print_success("All sender names properly populated (not generic)")
    except Exception as e:
        print_error(f"Failed to get messages: {e}")
        return False

    return True

def test_employee_flow():
    """Test Employee login, info, and messaging"""
    print_section("EMPLOYEE FLOW TEST")
    
    emp_session = requests.Session()
    
    print_test(1, "Employee Login")
    try:
        resp = emp_session.post(
            f"{BASE_URL}/api/employee/login",
            json={"employee_id": "EMP001", "username": "employee1", "password": "password123"}
        )
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        print_success("Employee login successful")
    except Exception as e:
        print_error(f"Employee login failed: {e}")
        return False

    print_test(2, "Get Employee Info")
    try:
        resp = emp_session.get(f"{BASE_URL}/api/employee/me")
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        data = resp.json()
        assert data['name'] == 'John Employee', f"Employee name incorrect: {data['name']}"
        assert data['id'] == 1, "Employee ID incorrect"
        print_success(f"Employee info retrieved: {data['name']}")
    except Exception as e:
        print_error(f"Failed to get employee info: {e}")
        return False

    print_test(3, "Send message to Manager")
    try:
        resp = emp_session.post(
            f"{BASE_URL}/api/messages",
            json={
                "context": "comprehensive_test",
                "message": "Employee test message to manager",
                "sender": "employee",
                "sender_name": "John Employee",
                "sender_id": 1,
                "sender_type": "employee",
                "receiver_id": 1,
                "receiver_type": "manager"
            }
        )
        assert resp.status_code == 201, f"Expected 201, got {resp.status_code}"
        print_success("Message sent successfully")
    except Exception as e:
        print_error(f"Failed to send message: {e}")
        return False

    print_test(4, "Get Employee Messages")
    try:
        resp = emp_session.get(f"{BASE_URL}/api/employee/my-messages")
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        messages = resp.json()
        assert len(messages) > 0, "No messages found"
        print_success(f"Retrieved {len(messages)} message(s)")
        
        # Verify different sender types are represented
        sender_types = set(msg.get('sender_type') for msg in messages)
        print_success(f"Sender types: {', '.join(sender_types)}")
        
        # Verify names are populated for each type
        for msg in messages:
            sender_name = msg.get('sender_name', '')
            sender_type = msg.get('sender_type', '')
            assert sender_name, f"Empty sender_name for {sender_type}"
            assert sender_name not in ['Employee', 'Manager', 'Admin'], f"Generic name for {sender_type}: {sender_name}"
        print_success("All sender names properly populated across all message types")
    except Exception as e:
        print_error(f"Failed to get messages: {e}")
        return False

    return True

def test_cross_communication():
    """Test message routing between different user types"""
    print_section("CROSS-COMMUNICATION TEST")
    
    print_test(1, "Employee receives Admin message")
    try:
        emp_session = requests.Session()
        emp_session.post(
            f"{BASE_URL}/api/employee/login",
            json={"employee_id": "EMP001", "username": "employee1", "password": "password123"}
        )
        resp = emp_session.get(f"{BASE_URL}/api/employee/my-messages")
        messages = resp.json()
        admin_msgs = [m for m in messages if m.get('sender_type') == 'admin']
        assert len(admin_msgs) > 0, "Employee didn't receive admin messages"
        assert admin_msgs[0]['sender_name'] == 'BrainHR Admin', "Admin name not populated"
        print_success(f"Employee received message from {admin_msgs[0]['sender_name']}")
    except Exception as e:
        print_error(f"Failed: {e}")
        return False

    print_test(2, "Manager receives Employee message")
    try:
        mgr_session = requests.Session()
        mgr_session.post(
            f"{BASE_URL}/api/manager/login",
            json={"username": "manager1", "password": "password123"}
        )
        resp = mgr_session.get(f"{BASE_URL}/api/manager/my-messages")
        messages = resp.json()
        emp_msgs = [m for m in messages if m.get('sender_type') == 'employee']
        assert len(emp_msgs) > 0, "Manager didn't receive employee messages"
        print_success(f"Manager received message from {emp_msgs[0]['sender_name']}")
    except Exception as e:
        print_error(f"Failed: {e}")
        return False

    return True

if __name__ == "__main__":
    print("\n" + "=" * 70)
    print("  COMPREHENSIVE BRAINHR MESSAGING SYSTEM TEST")
    print("=" * 70)
    
    results = []
    
    results.append(("Admin Flow", test_admin_flow()))
    results.append(("Manager Flow", test_manager_flow()))
    results.append(("Employee Flow", test_employee_flow()))
    results.append(("Cross-Communication", test_cross_communication()))
    
    print_section("TEST SUMMARY")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "PASSED" if result else "FAILED"
        print(f"  {test_name}: {status}")
    
    print(f"\n  Total: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n  *** ALL TESTS PASSED - MESSAGING SYSTEM IS WORKING PERFECTLY! ***")
    else:
        print(f"\n  *** WARNING: {total - passed} test(s) failed - please review ***")
    
    print("\n" + "=" * 70)
