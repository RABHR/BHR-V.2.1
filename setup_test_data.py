#!/usr/bin/env python3
import sqlite3
from werkzeug.security import generate_password_hash

DB_FILE = 'brainhr.db'

print("Setting up test data...")

conn = sqlite3.connect(DB_FILE)
cursor = conn.cursor()

# Insert test employees
print("\n1. Creating test employees...")
employees = [
    (1, 'employee1', generate_password_hash('password123'), 'John Employee', 'john@company.com', 'EMP001', 'employee'),
    (2, 'employee2', generate_password_hash('password123'), 'Jane Employee', 'jane@company.com', 'EMP002', 'employee'),
]

for emp in employees:
    try:
        cursor.execute('''
            INSERT OR REPLACE INTO employees (id, username, password_hash, employee_name, email, employee_id_field, role)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', emp)
        print(f"   Created employee: {emp[3]} ({emp[1]})")
    except sqlite3.IntegrityError as e:
        print(f"   Employee {emp[3]} already exists")

# Insert test managers
print("\n2. Creating test managers...")
managers = [
    (1, 'manager1', generate_password_hash('password123'), 'John Manager', 'john.manager@company.com'),
    (2, 'manager2', generate_password_hash('password123'), 'Jane Manager', 'jane.manager@company.com'),
]

for mgr in managers:
    try:
        cursor.execute('''
            INSERT OR REPLACE INTO managers (id, username, password_hash, employee_name, email)
            VALUES (?, ?, ?, ?, ?)
        ''', mgr)
        print(f"   Created manager: {mgr[3]} ({mgr[1]})")
    except sqlite3.IntegrityError as e:
        print(f"   Manager {mgr[3]} already exists")

conn.commit()
conn.close()

print("\nTest data setup complete!")
print("\nYou can now use the following credentials:")
print("  Employee: employee1 / password123 (ID: EMP001)")
print("  Employee: employee2 / password123 (ID: EMP002)")
print("  Manager: manager1 / password123")
print("  Manager: manager2 / password123")
print("  Admin: BHRadmin / BHR@6789$")
