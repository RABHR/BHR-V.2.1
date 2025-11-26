# app.py - BrainHR IT Solutions Backend (FULLY IMPLEMENTED)
import os
import sys
import logging
import sqlite3
import zipfile
import tempfile
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from datetime import datetime, timedelta
from functools import wraps
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename
from flask import Flask, request, jsonify, session, send_file, make_response
from flask_cors import CORS
import pandas as pd
from dotenv import load_dotenv

# Configure basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Flask app + config
app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'a-very-secret-key-that-should-be-in-env')

# --- CORS + Session configuration (dynamic based on FRONTEND_URL) ---
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
# Ensure FRONTEND_URL includes protocol (http:// or https://)
if not (FRONTEND_URL.startswith("http://") or FRONTEND_URL.startswith("https://")):
    FRONTEND_URL = "http://" + FRONTEND_URL

is_frontend_https = FRONTEND_URL.startswith("https://")

# CORS: allow only the configured frontend origin and support credentials
CORS(app, resources={r"/api/*": {"origins": [FRONTEND_URL], "supports_credentials": True}})

# Session cookie config:
# - In production (frontend served over HTTPS) use Secure + SameSite=None to allow cross-site cookies
# - In development (http localhost) use Secure=False and SameSite=Lax
app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SECURE=is_frontend_https,
    SESSION_COOKIE_SAMESITE=('None' if is_frontend_https else 'Lax'),
    PERMANENT_SESSION_LIFETIME=timedelta(days=1)
)

# Admin credentials
ADMIN_USERNAME = "BHRadmin"
ADMIN_PASSWORD_HASH = generate_password_hash("BHR@6789$")

# File Upload config
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5MB

# Database file name
DB_FILE = 'brainhr.db'

def init_db():
    """Initialize the SQLite database."""
    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS applications (
                id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL,
                contact_no TEXT, linkedin TEXT, location TEXT, visa_status TEXT,
                relocation TEXT, experience_years REAL, job_id INTEGER, job_title TEXT,
                resume_filename TEXT, applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                viewed INTEGER DEFAULT 0
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS jobs (
                id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, location TEXT NOT NULL,
                description TEXT NOT NULL, visa_constraints TEXT, active INTEGER DEFAULT 1,
                assessment_url TEXT, job_category TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS courses (
                id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, category TEXT NOT NULL,
                description TEXT, thumbnail_url TEXT, video_url TEXT, key_skills TEXT,
                programming_languages TEXT, course_duration TEXT, total_sessions TEXT,
                session_duration TEXT, level TEXT, target_audience TEXT, mode TEXT,
                course_contents TEXT, what_you_will_learn TEXT, archived INTEGER DEFAULT 0, 
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS course_enrollments (
                id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL,
                contact_no TEXT NOT NULL, course_id INTEGER NOT NULL, course_title TEXT,
                enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (course_id) REFERENCES courses(id)
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS employees (
                id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL, password TEXT, employee_name TEXT NOT NULL, email TEXT,
                employee_id_field TEXT UNIQUE, role TEXT DEFAULT 'employee',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, created_by_admin INTEGER DEFAULT 1
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS timesheets (
                id INTEGER PRIMARY KEY AUTOINCREMENT, employee_id INTEGER NOT NULL,
                year INTEGER NOT NULL, month INTEGER NOT NULL, week INTEGER NOT NULL,
                filename TEXT NOT NULL, file_path TEXT NOT NULL, status TEXT DEFAULT 'draft',
                submitted_at TIMESTAMP, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (employee_id) REFERENCES employees(id)
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS visa_docs (
                id INTEGER PRIMARY KEY AUTOINCREMENT, employee_id INTEGER NOT NULL,
                filename TEXT NOT NULL, file_path TEXT NOT NULL, doc_name TEXT NOT NULL,
                visa_type TEXT, submitted_at TIMESTAMP, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (employee_id) REFERENCES employees(id)
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS activities (
                id INTEGER PRIMARY KEY AUTOINCREMENT, employee_id INTEGER NOT NULL,
                activity_name TEXT NOT NULL, activity_description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (employee_id) REFERENCES employees(id)
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT, employee_id INTEGER NOT NULL,
                type TEXT NOT NULL, title TEXT NOT NULL, description TEXT,
                related_id INTEGER, status TEXT DEFAULT 'new', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (employee_id) REFERENCES employees(id)
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT, sender TEXT NOT NULL,
                sender_name TEXT, employee_id INTEGER, context TEXT NOT NULL, context_id INTEGER, message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (employee_id) REFERENCES employees(id)
            )
        ''')
        
        try:
            cursor.execute('ALTER TABLE courses ADD COLUMN archived INTEGER DEFAULT 0')
        except sqlite3.OperationalError:
            pass
        
        try:
            cursor.execute('ALTER TABLE jobs ADD COLUMN assessment_url TEXT')
        except sqlite3.OperationalError:
            pass
        
        try:
            cursor.execute('ALTER TABLE jobs ADD COLUMN job_category TEXT')
        except sqlite3.OperationalError:
            pass
        
        cursor.execute('PRAGMA table_info(employees)')
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'employee_id_field' not in columns:
            try:
                cursor.execute('ALTER TABLE employees ADD COLUMN employee_id_field TEXT UNIQUE')
            except sqlite3.OperationalError as e:
                logger.warning(f"Could not add employee_id_field: {e}")
        
        if 'role' not in columns:
            try:
                cursor.execute('ALTER TABLE employees ADD COLUMN role TEXT DEFAULT "employee"')
            except sqlite3.OperationalError as e:
                logger.warning(f"Could not add role: {e}")
        
        try:
            cursor.execute('ALTER TABLE messages ADD COLUMN sender_id INTEGER')
        except sqlite3.OperationalError:
            pass
        
        try:
            cursor.execute('ALTER TABLE messages ADD COLUMN sender_type TEXT DEFAULT "employee"')
        except sqlite3.OperationalError:
            pass
        
        try:
            cursor.execute('ALTER TABLE messages ADD COLUMN receiver_id INTEGER')
        except sqlite3.OperationalError:
            pass
        
        try:
            cursor.execute('ALTER TABLE messages ADD COLUMN receiver_type TEXT DEFAULT "employee"')
        except sqlite3.OperationalError:
            pass
        
        try:
            cursor.execute('ALTER TABLE messages ADD COLUMN is_read INTEGER DEFAULT 0')
        except sqlite3.OperationalError:
            pass
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS managers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                employee_name TEXT NOT NULL,
                email TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()

init_db()

# ---------- Helpers ----------
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'admin_logged_in' not in session and 'manager_logged_in' not in session:
            logger.warning("Authentication required for a protected route.")
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

def employee_login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'employee_logged_in' not in session:
            logger.warning("Employee authentication required for a protected route.")
            return jsonify({'error': 'Employee authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

def manager_login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'manager_logged_in' not in session:
            logger.warning("Manager authentication required for a protected route.")
            return jsonify({'error': 'Manager authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

def admin_only_login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'admin_logged_in' not in session:
            logger.warning("Admin authentication required for a protected route.")
            return jsonify({'error': 'Admin authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'pdf', 'doc', 'docx'}

def populate_sender_names(messages):
    """Fetch and populate actual sender names from database based on sender_type and sender_id"""
    if not messages:
        return messages
    
    with sqlite3.connect(DB_FILE) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        for msg in messages:
            if not msg.get('sender_id') or msg.get('sender_name') in ['Admin', 'Manager', 'Employee']:
                sender_type = msg.get('sender_type', 'employee')
                sender_id = msg.get('sender_id')
                
                if sender_type == 'employee' and sender_id:
                    cursor.execute('SELECT employee_name FROM employees WHERE id = ?', (sender_id,))
                    result = cursor.fetchone()
                    if result:
                        msg['sender_name'] = result['employee_name']
                elif sender_type == 'manager' and sender_id:
                    cursor.execute('SELECT employee_name FROM managers WHERE id = ?', (sender_id,))
                    result = cursor.fetchone()
                    if result:
                        msg['sender_name'] = result['employee_name']
                elif sender_type == 'admin':
                    msg['sender_name'] = 'BrainHR Admin'
    
    return messages

def send_application_email(application_data, resume_path):
    """Sends email notification for a new application."""
    try:
        smtp_server = os.getenv('SMTP_SERVER')
        smtp_port = int(os.getenv('SMTP_PORT', 587))
        smtp_user = os.getenv('SMTP_USER')
        smtp_password = os.getenv('SMTP_PASSWORD')
        recipient_email = os.getenv('HR_EMAIL', 'hr@brainhritsolutions.com')

        if not all([smtp_server, smtp_user, smtp_password]):
            logger.warning("SMTP settings not configured. Skipping email notification.")
            return

        msg = MIMEMultipart()
        msg['From'] = smtp_user
        msg['To'] = recipient_email
        msg['Subject'] = f"New Application: {application_data['name']} for {application_data['job_title']}"

        body = "A new job application has been received.\n\n"
        for key, value in application_data.items():
            body += f"{key.replace('_', ' ').title()}: {value}\n"
        msg.attach(MIMEText(body, 'plain'))

        if resume_path and os.path.exists(resume_path):
            with open(resume_path, "rb") as attachment:
                part = MIMEBase('application', 'octet-stream')
                part.set_payload(attachment.read())
            encoders.encode_base64(part)
            part.add_header('Content-Disposition', f"attachment; filename= {os.path.basename(resume_path)}")
            msg.attach(part)

        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
        logger.info(f"Application email sent successfully to {recipient_email}")

    except Exception as e:
        logger.error(f"Failed to send application email: {e}")


# ---------- Root & Health ----------
@app.route('/')
def root():
    return jsonify(message="BrainHR Backend is running.")

@app.route('/health')
def health():
    return jsonify(status="healthy")

@app.route('/uploads/<filename>')
def download_file(filename):
    try:
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(filename))
        if os.path.exists(file_path):
            return send_file(file_path, as_attachment=False)
        return jsonify({'error': 'File not found'}), 404
    except Exception as e:
        logger.error(f"Error serving file: {e}")
        return jsonify({'error': 'File not found'}), 404

# ---------- Auth ----------
# ===== Replace admin login handler =====
@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    # accept json or form-encoded
    data = request.get_json(silent=True)
    if not data:
        data = request.form.to_dict()

    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'username and password required'}), 400

    # existing admin check (keeps your current ADMIN_USERNAME / ADMIN_PASSWORD_HASH logic)
    if username == ADMIN_USERNAME and check_password_hash(ADMIN_PASSWORD_HASH, password):
        session.permanent = True
        session['admin_logged_in'] = True
        session['admin_id'] = 1
        session['admin_username'] = username
        logger.info("Admin login successful.")
        resp = make_response(jsonify({'ok': True, 'admin': {'id': session['admin_id'], 'username': session['admin_username']}}))
        return resp

    logger.warning("Invalid admin login attempt.")
    return jsonify({'error': 'Invalid credentials'}), 401
# =======================================

@app.route('/api/admin/logout', methods=['POST'])
@login_required
def admin_logout():
    session.pop('admin_logged_in', None)
    session.pop('admin_id', None)
    session.pop('admin_username', None)
    logger.info("Admin logout successful.")
    return jsonify({'success': True})

@app.route('/api/admin/check', methods=['GET'])
def admin_check():
    is_logged_in = 'admin_logged_in' in session or 'manager_logged_in' in session
    return jsonify({'logged_in': is_logged_in})

@app.route('/api/admin/me', methods=['GET'])
@admin_only_login_required
def get_admin_info():
    return jsonify({
        'id': session.get('admin_id'),
        'username': session.get('admin_username'),
        'name': 'BrainHR Admin'
    })

# ---------- Manager Auth ----------
# ===== Replace manager login handler =====
@app.route('/api/manager/login', methods=['POST'])
def manager_login():
    data = request.get_json(silent=True)
    if not data:
        data = request.form.to_dict()

    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'username and password required'}), 400

    try:
        with sqlite3.connect(DB_FILE) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM managers WHERE username = ?', (username,))
            manager = cursor.fetchone()

        if manager and check_password_hash(manager['password_hash'], password):
            session.permanent = True
            session['manager_logged_in'] = True
            session['manager_id'] = manager['id']
            session['manager_username'] = manager['username']
            logger.info(f"Manager login successful: {username}")
            resp = make_response(jsonify({'ok': True, 'manager': {'id': session['manager_id'], 'username': session['manager_username']}}))
            return resp

        logger.warning(f"Invalid manager login attempt: {username}")
        return jsonify({'error': 'Invalid credentials'}), 401
    except Exception as e:
        logger.error(f"Manager login error: {e}")
        return jsonify({'error': str(e)}), 500
# =======================================

@app.route('/api/manager/logout', methods=['POST'])
@manager_login_required
def manager_logout():
    session.pop('manager_logged_in', None)
    session.pop('manager_id', None)
    session.pop('manager_username', None)
    logger.info("Manager logout successful.")
    return jsonify({'success': True})

@app.route('/api/manager/check', methods=['GET'])
def manager_check():
    is_logged_in = 'manager_logged_in' in session
    manager_id = session.get('manager_id')
    return jsonify({'logged_in': is_logged_in, 'manager_id': manager_id})

@app.route('/api/manager/me', methods=['GET'])
@manager_login_required
def get_manager_info():
    try:
        manager_id = session.get('manager_id')
        with sqlite3.connect(DB_FILE) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute('SELECT id, username, employee_name FROM managers WHERE id = ?', (manager_id,))
            manager = cursor.fetchone()
        
        if manager:
            return jsonify({
                'id': manager['id'],
                'username': manager['username'],
                'name': manager['employee_name']
            })
        return jsonify({'error': 'Manager not found'}), 404
    except Exception as e:
        logger.error(f"Get manager info error: {e}")
        return jsonify({'error': str(e)}), 500

# ---------- Employee Auth ----------
# ===== Replace employee login handler =====
@app.route('/api/employee/login', methods=['POST'])
def employee_login():
    data = request.get_json(silent=True)
    if not data:
        data = request.form.to_dict()

    employee_id_field = data.get('employee_id') or data.get('employee_id_field')  # accept either key
    username = data.get('username')
    password = data.get('password')

    if not employee_id_field or not username or not password:
        return jsonify({'error': 'Employee ID, username, and password are required'}), 400

    try:
        with sqlite3.connect(DB_FILE) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM employees WHERE employee_id_field = ? AND username = ?', (employee_id_field, username))
            employee = cursor.fetchone()

        if employee and check_password_hash(employee['password_hash'], password):
            session.permanent = True
            session['employee_logged_in'] = True
            session['employee_id'] = employee['id']
            session['employee_username'] = employee['username']
            logger.info(f"Employee login successful: {employee_id_field} / {username}")
            resp = make_response(jsonify({'ok': True, 'employee': {'id': session['employee_id'], 'username': session['employee_username']}}))
            return resp

        logger.warning(f"Invalid employee login attempt: {employee_id_field} / {username}")
        return jsonify({'error': 'Invalid credentials'}), 401
    except Exception as e:
        logger.error(f"Employee login error: {e}")
        return jsonify({'error': str(e)}), 500
# =======================================

@app.route('/api/employee/logout', methods=['POST'])
def employee_logout():
    session.pop('employee_logged_in', None)
    session.pop('employee_id', None)
    session.pop('employee_username', None)
    logger.info("Employee logout successful.")
    return jsonify({'success': True})

@app.route('/api/employee/check', methods=['GET'])
def employee_check():
    is_logged_in = 'employee_logged_in' in session
    employee_id = session.get('employee_id')
    return jsonify({'logged_in': is_logged_in, 'employee_id': employee_id})

@app.route('/api/employee/me', methods=['GET'])
@employee_login_required
def get_employee_info():
    try:
        employee_id = session.get('employee_id')
        with sqlite3.connect(DB_FILE) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute('SELECT id, username, employee_name FROM employees WHERE id = ?', (employee_id,))
            employee = cursor.fetchone()
        
        if employee:
            return jsonify({
                'id': employee['id'],
                'username': employee['username'],
                'name': employee['employee_name']
            })
        return jsonify({'error': 'Employee not found'}), 404
    except Exception as e:
        logger.error(f"Get employee info error: {e}")
        return jsonify({'error': str(e)}), 500

# ---------- Employee Management (Admin) ----------
@app.route('/api/admin/employees', methods=['GET'])
@login_required
def get_employees():
    try:
        with sqlite3.connect(DB_FILE) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute('SELECT id, username, password, employee_name, email, employee_id_field, role, created_at FROM employees ORDER BY created_at DESC')
            employees = [dict(row) for row in cursor.fetchall()]
        return jsonify(employees)
    except Exception as e:
        logger.error(f"Get employees error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/employees', methods=['POST'])
@login_required
def create_employee():
    try:
        data = request.get_json()
        if not data or not all(k in data for k in ['username', 'password', 'employee_name', 'employee_id_field']):
            return jsonify({'error': 'Missing required fields: username, password, employee_name, employee_id_field'}), 400
        
        password_hash = generate_password_hash(data['password'])
        
        with sqlite3.connect(DB_FILE) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO employees (username, password_hash, password, employee_name, email, employee_id_field, role)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (data['username'], password_hash, data['password'], data['employee_name'], data.get('email', ''), data['employee_id_field'], data.get('role', 'employee')))
            conn.commit()
            employee_id = cursor.lastrowid
        
        logger.info(f"Employee created: {data['username']}")
        return jsonify({'success': True, 'employee_id': employee_id}), 201
    except sqlite3.IntegrityError as e:
        if 'employee_id_field' in str(e):
            return jsonify({'error': 'Employee ID already exists'}), 400
        return jsonify({'error': 'Username already exists'}), 400
    except Exception as e:
        logger.error(f"Create employee error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/employees/<int:employee_id>', methods=['PUT'])
@login_required
def update_employee(employee_id):
    try:
        data = request.get_json()
        
        with sqlite3.connect(DB_FILE) as conn:
            cursor = conn.cursor()
            
            if 'password' in data and data['password']:
                password_hash = generate_password_hash(data['password'])
                cursor.execute('''
                    UPDATE employees SET password_hash = ?, password = ?, employee_name = ?, email = ?, employee_id_field = ?, role = ?
                    WHERE id = ?
                ''', (password_hash, data['password'], data.get('employee_name', ''), data.get('email', ''), data.get('employee_id_field', ''), data.get('role', 'employee'), employee_id))
            else:
                cursor.execute('''
                    UPDATE employees SET employee_name = ?, email = ?, employee_id_field = ?, role = ?
                    WHERE id = ?
                ''', (data.get('employee_name', ''), data.get('email', ''), data.get('employee_id_field', ''), data.get('role', 'employee'), employee_id))
            
            conn.commit()
        
        logger.info(f"Employee updated: {employee_id}")
        return jsonify({'success': True})
    except sqlite3.IntegrityError as e:
        if 'employee_id_field' in str(e):
            return jsonify({'error': 'Employee ID already exists'}), 400
        return jsonify({'error': 'Update failed due to duplicate value'}), 400
    except Exception as e:
        logger.error(f"Update employee error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/employees/<int:employee_id>', methods=['DELETE'])
@login_required
def delete_employee(employee_id):
    try:
        with sqlite3.connect(DB_FILE) as conn:
            cursor = conn.cursor()
            cursor.execute('DELETE FROM employees WHERE id = ?', (employee_id,))
            conn.commit()
        
        logger.info(f"Employee deleted: {employee_id}")
        return jsonify({'success': True})
    except Exception as e:
        logger.error(f"Delete employee error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/employees/<int:employee_id>/reset-password', methods=['POST'])
@login_required
def reset_employee_password(employee_id):
    try:
        import secrets
        import string
        temp_password = ''.join(secrets.choice(string.ascii_letters + string.digits + '!@#$%') for _ in range(12))
        password_hash = generate_password_hash(temp_password)
        
        with sqlite3.connect(DB_FILE) as conn:
            cursor = conn.cursor()
            cursor.execute('UPDATE employees SET password_hash = ? WHERE id = ?', (password_hash, employee_id))
            conn.commit()
        
        logger.info(f"Employee password reset: {employee_id}")
        return jsonify({'temporary_password': temp_password})
    except Exception as e:
        logger.error(f"Reset password error: {e}")
        return jsonify({'error': str(e)}), 500

# ---------- Manager Management (Admin) ----------
@app.route('/api/admin/managers', methods=['GET'])
@login_required
def get_managers():
    try:
        with sqlite3.connect(DB_FILE) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute('SELECT id, username, employee_name, email, created_at FROM managers ORDER BY created_at DESC')
            managers = [dict(row) for row in cursor.fetchall()]
        return jsonify(managers)
    except Exception as e:
        logger.error(f"Get managers error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/managers', methods=['POST'])
@login_required
def create_manager():
    try:
        data = request.get_json()
        if not data or not all(k in data for k in ['username', 'password', 'employee_name']):
            return jsonify({'error': 'Missing required fields: username, password, employee_name'}), 400
        
        password_hash = generate_password_hash(data['password'])
        
        with sqlite3.connect(DB_FILE) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO managers (username, password_hash, employee_name, email)
                VALUES (?, ?, ?, ?)
            ''', (data['username'], password_hash, data['employee_name'], data.get('email', '')))
            conn.commit()
            manager_id = cursor.lastrowid
        
        logger.info(f"Manager created: {data['username']}")
        return jsonify({'success': True, 'manager_id': manager_id}), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Username already exists'}), 400
    except Exception as e:
        logger.error(f"Create manager error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/managers/<int:manager_id>', methods=['PUT'])
@login_required
def update_manager(manager_id):
    try:
        data = request.get_json()
        
        with sqlite3.connect(DB_FILE) as conn:
            cursor = conn.cursor()
            
            if 'password' in data:
                password_hash = generate_password_hash(data['password'])
                cursor.execute('''
                    UPDATE managers SET password_hash = ?, employee_name = ?, email = ?
                    WHERE id = ?
                ''', (password_hash, data.get('employee_name', ''), data.get('email', ''), manager_id))
            else:
                cursor.execute('''
                    UPDATE managers SET employee_name = ?, email = ?
                    WHERE id = ?
                ''', (data.get('employee_name', ''), data.get('email', ''), manager_id))
            
            conn.commit()
        
        logger.info(f"Manager updated: {manager_id}")
        return jsonify({'success': True})
    except Exception as e:
        logger.error(f"Update manager error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/managers/<int:manager_id>', methods=['DELETE'])
@login_required
def delete_manager(manager_id):
    try:
        with sqlite3.connect(DB_FILE) as conn:
            cursor = conn.cursor()
            cursor.execute('DELETE FROM managers WHERE id = ?', (manager_id,))
            conn.commit()
        
        logger.info(f"Manager deleted: {manager_id}")
        return jsonify({'success': True})
    except Exception as e:
        logger.error(f"Delete manager error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/managers/<int:manager_id>/reset-password', methods=['POST'])
@login_required
def reset_manager_password(manager_id):
    try:
        import secrets
        import string
        temp_password = ''.join(secrets.choice(string.ascii_letters + string.digits + '!@#$%') for _ in range(12))
        password_hash = generate_password_hash(temp_password)
        
        with sqlite3.connect(DB_FILE) as conn:
            cursor = conn.cursor()
            cursor.execute('UPDATE managers SET password_hash = ? WHERE id = ?', (password_hash, manager_id))
            conn.commit()
        
        logger.info(f"Manager password reset: {manager_id}")
        return jsonify({'temporary_password': temp_password})
    except Exception as e:
        logger.error(f"Reset manager password error: {e}")
        return jsonify({'error': str(e)}), 500

# ---------- Timesheets API ----------
@app.route('/api/employee/timesheets', methods=['GET'])
@employee_login_required
def get_employee_timesheets():
    try:
        employee_id = session.get('employee_id')
        with sqlite3.connect(DB_FILE) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM timesheets WHERE employee_id = ? ORDER BY year DESC, month DESC, week DESC
            ''', (employee_id,))
            timesheets = [dict(row) for row in cursor.fetchall()]
        return jsonify(timesheets)
    except Exception as e:
        logger.error(f"Get timesheets error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/employee/timesheets', methods=['POST'])
@employee_login_required
def upload_timesheet():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'File is required'}), 400
        
        file = request.files['file']
        year = request.form.get('year')
        month = request.form.get('month')
        week = request.form.get('week')
        
        if not all([year, month, week]):
            return jsonify({'error': 'Missing required fields: year, month, week'}), 400
        
        employee_id = session.get('employee_id')
        filename = secure_filename(f"timesheet_{year}_{month}_{week}_{datetime.now().timestamp()}.pdf")
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        with sqlite3.connect(DB_FILE) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO timesheets (employee_id, year, month, week, filename, file_path, status)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (employee_id, year, month, week, filename, file_path, 'draft'))
            conn.commit()
            timesheet_id = cursor.lastrowid
        
        return jsonify({'success': True, 'timesheet_id': timesheet_id}), 201
    except Exception as e:
        logger.error(f"Upload timesheet error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/employee/timesheets/<int:timesheet_id>/submit', methods=['POST'])
@employee_login_required
def submit_timesheet(timesheet_id):
    try:
        employee_id = session.get('employee_id')
        with sqlite3.connect(DB_FILE) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE timesheets SET status = ?, submitted_at = CURRENT_TIMESTAMP
                WHERE id = ? AND employee_id = ?
            ''', ('submitted', timesheet_id, employee_id))
            conn.commit()
        
        with sqlite3.connect(DB_FILE) as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT year, month, week FROM timesheets WHERE id = ?', (timesheet_id,))
            ts = cursor.fetchone()
            
            cursor.execute('''
                INSERT INTO notifications (employee_id, type, title, description, related_id)
                VALUES (?, ?, ?, ?, ?)
            ''', (employee_id, 'timesheet', f'Timesheet submitted for Week {ts[2]}, Month {ts[1]}, Year {ts[0]}',
                  f'Your timesheet for week {ts[2]} of month {ts[1]} in year {ts[0]} has been submitted.', timesheet_id))
            conn.commit()
        
        return jsonify({'success': True})
    except Exception as e:
        logger.error(f"Submit timesheet error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/timesheets', methods=['GET'])
@login_required
def get_all_timesheets():
    try:
        employee_id = request.args.get('employee_id')
        query = '''
            SELECT ts.*, e.employee_name, e.username FROM timesheets ts
            JOIN employees e ON ts.employee_id = e.id
        '''
        params = []
        if employee_id:
            query += ' WHERE ts.employee_id = ?'
            params.append(employee_id)
        query += ' ORDER BY ts.year DESC, ts.month DESC, ts.week DESC'
        
        with sqlite3.connect(DB_FILE) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(query, params)
            timesheets = [dict(row) for row in cursor.fetchall()]
        return jsonify(timesheets)
    except Exception as e:
        logger.error(f"Get all timesheets error: {e}")
        return jsonify({'error': str(e)}), 500

# ---------- Visa Docs API ----------
@app.route('/api/employee/visa-docs', methods=['GET'])
@employee_login_required
def get_employee_visa_docs():
    try:
        employee_id = session.get('employee_id')
        with sqlite3.connect(DB_FILE) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM visa_docs WHERE employee_id = ? ORDER BY created_at DESC
            ''', (employee_id,))
            docs = [dict(row) for row in cursor.fetchall()]
        return jsonify(docs)
    except Exception as e:
        logger.error(f"Get visa docs error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/employee/visa-docs', methods=['POST'])
@employee_login_required
def upload_visa_doc():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'File is required'}), 400
        
        file = request.files['file']
        doc_name = request.form.get('doc_name')
        visa_type = request.form.get('visa_type', '')
        
        if not doc_name:
            return jsonify({'error': 'Document name is required'}), 400
        
        employee_id = session.get('employee_id')
        filename = secure_filename(f"visa_doc_{employee_id}_{datetime.now().timestamp()}_{file.filename}")
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        with sqlite3.connect(DB_FILE) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO visa_docs (employee_id, filename, file_path, doc_name, visa_type)
                VALUES (?, ?, ?, ?, ?)
            ''', (employee_id, filename, file_path, doc_name, visa_type))
            conn.commit()
            doc_id = cursor.lastrowid
        
        return jsonify({'success': True, 'doc_id': doc_id}), 201
    except Exception as e:
        logger.error(f"Upload visa doc error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/visa-docs', methods=['GET'])
@login_required
def get_all_visa_docs():
    try:
        employee_id = request.args.get('employee_id')
        query = '''
            SELECT vd.*, e.employee_name, e.username FROM visa_docs vd
            JOIN employees e ON vd.employee_id = e.id
        '''
        params = []
        if employee_id:
            query += ' WHERE vd.employee_id = ?'
            params.append(employee_id)
        query += ' ORDER BY vd.created_at DESC'
        
        with sqlite3.connect(DB_FILE) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(query, params)
            docs = [dict(row) for row in cursor.fetchall()]
        return jsonify(docs)
    except Exception as e:
        logger.error(f"Get all visa docs error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/visa-docs/download/<int:doc_id>')
@login_required
def download_visa_doc(doc_id):
    try:
        with sqlite3.connect(DB_FILE) as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT filename, file_path FROM visa_docs WHERE id = ?', (doc_id,))
            doc = cursor.fetchone()
        
        if not doc or not os.path.exists(doc[1]):
            return jsonify({'error': 'Document not found'}), 404
        
        return send_file(doc[1], as_attachment=True, download_name=doc[0])
    except Exception as e:
        logger.error(f"Download visa doc error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/visa-docs/download-multiple', methods=['POST'])
@login_required
def download_multiple_visa_docs():
    try:
        doc_ids = request.get_json().get('doc_ids', [])
        if not doc_ids:
            return jsonify({'error': 'No documents selected'}), 400
        
        with sqlite3.connect(DB_FILE) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(f"SELECT * FROM visa_docs WHERE id IN ({','.join('?' for _ in doc_ids)})", doc_ids)
            docs = cursor.fetchall()
        
        memory_file = tempfile.SpooledTemporaryFile()
        with zipfile.ZipFile(memory_file, 'w', zipfile.ZIP_DEFLATED) as zf:
            for doc in docs:
                if os.path.exists(doc['file_path']):
                    zf.write(doc['file_path'], doc['filename'])
        memory_file.seek(0)
        
        response = make_response(send_file(memory_file, mimetype='application/zip', as_attachment=True, download_name='visa_docs.zip'))
        response.headers['Content-Disposition'] = 'attachment; filename=visa_docs.zip'
        return response
    except Exception as e:
        logger.error(f"Download multiple visa docs error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/timesheets/download/<int:timesheet_id>', methods=['GET'])
@login_required
def download_timesheet(timesheet_id):
    try:
        with sqlite3.connect(DB_FILE) as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT filename, file_path FROM timesheets WHERE id = ?', (timesheet_id,))
            ts = cursor.fetchone()
        
        if not ts or not os.path.exists(ts[1]):
            return jsonify({'error': 'Timesheet not found'}), 404
        
        return send_file(ts[1], as_attachment=True, download_name=ts[0])
    except Exception as e:
        logger.error(f"Download timesheet error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/timesheets/download-multiple', methods=['POST'])
@login_required
def download_multiple_timesheets():
    try:
        ts_ids = request.get_json().get('timesheet_ids', [])
        if not ts_ids:
            return jsonify({'error': 'No timesheets selected'}), 400
        
        with sqlite3.connect(DB_FILE) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(f"SELECT * FROM timesheets WHERE id IN ({','.join('?' for _ in ts_ids)})", ts_ids)
            timesheets = cursor.fetchall()
        
        memory_file = tempfile.SpooledTemporaryFile()
        with zipfile.ZipFile(memory_file, 'w', zipfile.ZIP_DEFLATED) as zf:
            for ts in timesheets:
                if os.path.exists(ts['file_path']):
                    zf.write(ts['file_path'], ts['filename'])
        memory_file.seek(0)
        
        response = make_response(send_file(memory_file, mimetype='application/zip', as_attachment=True, download_name='timesheets.zip'))
        response.headers['Content-Disposition'] = 'attachment; filename=timesheets.zip'
        return response
    except Exception as e:
        logger.error(f"Download multiple timesheets error: {e}")
        return jsonify({'error': str(e)}), 500

# ---------- Activities API ----------
@app.route('/api/employee/activities', methods=['GET'])
@employee_login_required
def get_employee_activities():
    try:
        employee_id = session.get('employee_id')
        with sqlite3.connect(DB_FILE) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM activities WHERE employee_id = ? ORDER BY created_at DESC
            ''', (employee_id,))
            activities = [dict(row) for row in cursor.fetchall()]
        return jsonify(activities)
    except Exception as e:
        logger.error(f"Get activities error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/employee/activities', methods=['POST'])
@employee_login_required
def create_activity():
    try:
        data = request.get_json()
        if not data or not all(k in data for k in ['activity_name']):
            return jsonify({'error': 'activity_name is required'}), 400
        
        employee_id = session.get('employee_id')
        
        with sqlite3.connect(DB_FILE) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO activities (employee_id, activity_name, activity_description)
                VALUES (?, ?, ?)
            ''', (employee_id, data['activity_name'], data.get('activity_description', '')))
            conn.commit()
            activity_id = cursor.lastrowid
        
        with sqlite3.connect(DB_FILE) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO notifications (employee_id, type, title, description, related_id)
                VALUES (?, ?, ?, ?, ?)
            ''', (employee_id, 'activity', f'Activity: {data["activity_name"]}',
                  f'You have posted a new activity: {data["activity_name"]}', activity_id))
            conn.commit()
        
        return jsonify({'success': True, 'activity_id': activity_id}), 201
    except Exception as e:
        logger.error(f"Create activity error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/employee/messages', methods=['GET'])
@employee_login_required
def get_employee_messages():
    try:
        employee_id = session.get('employee_id')
        
        query = 'SELECT * FROM messages WHERE employee_id = ? ORDER BY created_at DESC'
        
        with sqlite3.connect(DB_FILE) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(query, (employee_id,))
            messages = [dict(row) for row in cursor.fetchall()]
        return jsonify(messages)
    except Exception as e:
        logger.error(f"Get messages error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/employee/managers', methods=['GET'])
@employee_login_required
def get_employee_managers():
    try:
        with sqlite3.connect(DB_FILE) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute('SELECT id, username, employee_name FROM managers ORDER BY employee_name')
            recipients = [dict(row) for row in cursor.fetchall()]
        return jsonify(recipients)
    except Exception as e:
        logger.error(f"Get managers error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/activities', methods=['GET'])
@login_required
def get_all_activities():
    try:
        employee_id = request.args.get('employee_id')
        query = '''
            SELECT a.*, e.employee_name, e.username FROM activities a
            JOIN employees e ON a.employee_id = e.id
        '''
        params = []
        if employee_id:
            query += ' WHERE a.employee_id = ?'
            params.append(employee_id)
        query += ' ORDER BY a.created_at DESC'
        
        with sqlite3.connect(DB_FILE) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(query, params)
            activities = [dict(row) for row in cursor.fetchall()]
        return jsonify(activities)
    except Exception as e:
        logger.error(f"Get all activities error: {e}")
        return jsonify({'error': str(e)}), 500

# ---------- Notifications API ----------
@app.route('/api/admin/notifications', methods=['GET'])
@login_required
def get_all_notifications():
    try:
        employee_id = request.args.get('employee_id')
        query = '''
            SELECT n.*, e.employee_name, e.username FROM notifications n
            JOIN employees e ON n.employee_id = e.id
        '''
        params = []
        if employee_id:
            query += ' WHERE n.employee_id = ?'
            params.append(employee_id)
        query += ' ORDER BY n.created_at DESC'
        
        with sqlite3.connect(DB_FILE) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(query, params)
            notifications = [dict(row) for row in cursor.fetchall()]
        return jsonify(notifications)
    except Exception as e:
        logger.error(f"Get all notifications error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/notifications/<int:notif_id>/mark-read', methods=['POST'])
@login_required
def mark_notification_read(notif_id):
    try:
        with sqlite3.connect(DB_FILE) as conn:
            cursor = conn.cursor()
            cursor.execute('UPDATE notifications SET status = ? WHERE id = ?', ('read', notif_id))
            conn.commit()
        return jsonify({'success': True})
    except Exception as e:
        logger.error(f"Mark notification read error: {e}")
        return jsonify({'error': str(e)}), 500

# ---------- Messages API ----------
@app.route('/api/messages', methods=['POST'])
def create_message():
    try:
        data = request.get_json()
        if not data or not all(k in data for k in ['context', 'message']):
            return jsonify({'error': 'Missing required fields'}), 400
        
        sender = data.get('sender', 'employee')
        sender_name = data.get('sender_name', 'Unknown')
        sender_id = data.get('sender_id')
        sender_type = data.get('sender_type', 'employee')
        receiver_id = data.get('receiver_id')
        receiver_type = data.get('receiver_type', 'employee')
        
        if sender_type == 'employee' and not sender_id:
            sender_id = session.get('employee_id')
        if sender_type == 'manager' and not sender_id:
            sender_id = session.get('manager_id')
        if sender_type == 'admin' and not sender_id:
            sender_id = session.get('admin_id')
        
        employee_id = data.get('employee_id')
        if not employee_id and receiver_type == 'employee':
            employee_id = receiver_id
        
        with sqlite3.connect(DB_FILE) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            if sender_name in ['Admin', 'Manager', 'Employee', 'Unknown'] and sender_id:
                if sender_type == 'employee':
                    cursor.execute('SELECT employee_name FROM employees WHERE id = ?', (sender_id,))
                    result = cursor.fetchone()
                    if result:
                        sender_name = result['employee_name']
                elif sender_type == 'manager':
                    cursor.execute('SELECT employee_name FROM managers WHERE id = ?', (sender_id,))
                    result = cursor.fetchone()
                    if result:
                        sender_name = result['employee_name']
                elif sender_type == 'admin':
                    sender_name = 'BrainHR Admin'
            
            cursor.execute('''
                INSERT INTO messages (sender, sender_name, sender_id, sender_type, employee_id, receiver_id, receiver_type, context, context_id, message, is_read)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (sender, sender_name, sender_id, sender_type, employee_id, receiver_id, receiver_type, data['context'], data.get('context_id'), data['message'], 0))
            conn.commit()
            message_id = cursor.lastrowid
        
        return jsonify({'success': True, 'message_id': message_id}), 201
    except Exception as e:
        logger.error(f"Create message error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/messages/mark-read/<int:msg_id>', methods=['POST'])
def mark_message_read(msg_id):
    try:
        with sqlite3.connect(DB_FILE) as conn:
            cursor = conn.cursor()
            cursor.execute('UPDATE messages SET is_read = 1 WHERE id = ?', (msg_id,))
            conn.commit()
        return jsonify({'success': True})
    except Exception as e:
        logger.error(f"Mark read error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/employee/my-messages', methods=['GET'])
@employee_login_required
def employee_get_messages():
    try:
        employee_id = session.get('employee_id')
        context = request.args.get('context')
        
        query = '''SELECT * FROM messages 
                   WHERE (employee_id = ? AND receiver_type = 'employee') 
                   OR (sender_id = ? AND sender_type = 'employee')'''
        params = [employee_id, employee_id]
        
        if context:
            query = '''SELECT * FROM messages 
                       WHERE context = ? AND ((employee_id = ? AND receiver_type = 'employee') 
                       OR (sender_id = ? AND sender_type = 'employee'))'''
            params = [context, employee_id, employee_id]
        
        query += ' ORDER BY created_at DESC'
        
        with sqlite3.connect(DB_FILE) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(query, params)
            messages = [dict(row) for row in cursor.fetchall()]
        
        messages = populate_sender_names(messages)
        return jsonify(messages)
    except Exception as e:
        logger.error(f"Get employee messages error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/manager/my-messages', methods=['GET'])
@manager_login_required
def manager_get_messages():
    try:
        manager_id = session.get('manager_id')
        context = request.args.get('context')
        
        query = '''SELECT * FROM messages 
                   WHERE (receiver_id = ? AND receiver_type = 'manager') 
                   OR (sender_id = ? AND sender_type = 'manager')'''
        params = [manager_id, manager_id]
        
        if context:
            query = '''SELECT * FROM messages 
                       WHERE context = ? AND ((receiver_id = ? AND receiver_type = 'manager') 
                       OR (sender_id = ? AND sender_type = 'manager'))'''
            params = [context, manager_id, manager_id]
        
        query += ' ORDER BY created_at DESC'
        
        with sqlite3.connect(DB_FILE) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(query, params)
            messages = [dict(row) for row in cursor.fetchall()]
        
        messages = populate_sender_names(messages)
        return jsonify(messages)
    except Exception as e:
        logger.error(f"Get manager messages error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/my-messages', methods=['GET'])
@admin_only_login_required
def admin_get_messages():
    try:
        admin_id = session.get('admin_id')
        context = request.args.get('context')
        
        query = '''SELECT * FROM messages 
                   WHERE (receiver_id = ? AND receiver_type = 'admin') 
                   OR (sender_id = ? AND sender_type = 'admin')'''
        params = [admin_id, admin_id]
        
        if context:
            query = '''SELECT * FROM messages 
                       WHERE context = ? AND ((receiver_id = ? AND receiver_type = 'admin') 
                       OR (sender_id = ? AND sender_type = 'admin'))'''
            params = [context, admin_id, admin_id]
        
        query += ' ORDER BY created_at DESC'
        
        with sqlite3.connect(DB_FILE) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(query, params)
            messages = [dict(row) for row in cursor.fetchall()]
        
        messages = populate_sender_names(messages)
        return jsonify(messages)
    except Exception as e:
        logger.error(f"Get admin messages error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/unread-count', methods=['GET'])
def get_unread_count():
    try:
        employee_id = session.get('employee_id')
        manager_id = session.get('manager_id')
        admin_id = session.get('admin_id')
        
        unread_count = 0
        
        with sqlite3.connect(DB_FILE) as conn:
            cursor = conn.cursor()
            
            if employee_id:
                cursor.execute('''SELECT COUNT(*) FROM messages 
                               WHERE is_read = 0 AND employee_id = ? AND receiver_type = 'employee' ''', (employee_id,))
                unread_count = cursor.fetchone()[0]
            elif manager_id:
                cursor.execute('''SELECT COUNT(*) FROM messages 
                               WHERE is_read = 0 AND receiver_id = ? AND receiver_type = 'manager' ''', (manager_id,))
                unread_count = cursor.fetchone()[0]
            elif admin_id:
                cursor.execute('''SELECT COUNT(*) FROM messages 
                               WHERE is_read = 0 AND receiver_id = ? AND receiver_type = 'admin' ''', (admin_id,))
                unread_count = cursor.fetchone()[0]
        
        return jsonify({'unread_count': unread_count})
    except Exception as e:
        logger.error(f"Get unread count error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/messages', methods=['GET'])
@employee_login_required
def get_messages():
    try:
        employee_id = session.get('employee_id')
        context = request.args.get('context')
        context_id = request.args.get('context_id')
        
        query = 'SELECT * FROM messages WHERE context = ? AND (employee_id = ? OR context_id = ?)'
        params = [context, employee_id, employee_id]
        
        if context_id:
            query = 'SELECT * FROM messages WHERE context = ? AND context_id = ?'
            params = [context, context_id]
        
        query += ' ORDER BY created_at DESC'
        
        with sqlite3.connect(DB_FILE) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(query, params)
            messages = [dict(row) for row in cursor.fetchall()]
        
        messages = populate_sender_names(messages)
        return jsonify(messages)
    except Exception as e:
        logger.error(f"Get messages error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/manager/employee-messages/<int:emp_id>', methods=['GET'])
@login_required
def manager_get_employee_messages(emp_id):
    try:
        context = request.args.get('context')
        
        query = 'SELECT * FROM messages WHERE employee_id = ?'
        params = [emp_id]
        
        if context:
            query = 'SELECT * FROM messages WHERE employee_id = ? AND context = ?'
            params = [emp_id, context]
        
        query += ' ORDER BY created_at DESC'
        
        with sqlite3.connect(DB_FILE) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(query, params)
            messages = [dict(row) for row in cursor.fetchall()]
        
        messages = populate_sender_names(messages)
        return jsonify(messages)
    except Exception as e:
        logger.error(f"Get employee messages error: {e}")
        return jsonify({'error': str(e)}), 500

# ---------- Public Jobs ----------
@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    with sqlite3.connect(DB_FILE) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM jobs WHERE active = 1 ORDER BY created_at DESC')
        jobs = [dict(row) for row in cursor.fetchall()]
    return jsonify(jobs)

# ---------- Apply (public) ----------
@app.route('/api/apply', methods=['POST'])
def apply_job():
    try:
        if 'resume' not in request.files:
            return jsonify({'error': 'Resume file is required'}), 400

        file = request.files['resume']
        if file.filename == '' or not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Please upload PDF, DOC, or DOCX.'}), 400

        form_data = request.form.to_dict()
        required_fields = ['name', 'email', 'contact_no', 'job_id', 'job_title', 'location', 'visa_status', 'relocation']
        missing_fields = [field for field in required_fields if not form_data.get(field)]
        if missing_fields:
            return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400

        filename = secure_filename(f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename}")
        resume_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(resume_path)

        with sqlite3.connect(DB_FILE) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO applications (name, email, contact_no, linkedin, location, visa_status, relocation, 
                                         experience_years, job_id, job_title, resume_filename)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                form_data.get('name'), form_data.get('email'), form_data.get('contact_no'),
                form_data.get('linkedin'), form_data.get('location'), form_data.get('visa_status'),
                form_data.get('relocation'), form_data.get('experience_years'),
                form_data.get('job_id'), form_data.get('job_title'), filename
            ))
            conn.commit()
        
        # Send email notification
        send_application_email(form_data, resume_path)

        return jsonify({'success': True, 'message': 'Application submitted successfully'})

    except Exception as e:
        logger.error(f"Apply error: {e}")
        return jsonify({'error': str(e)}), 500

# ---------- Admin Dashboard ----------
@app.route('/api/admin/stats', methods=['GET'])
@login_required
def get_stats():
    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT COUNT(*) FROM applications')
        total_applications = cursor.fetchone()[0]
        cursor.execute('SELECT COUNT(*) FROM applications WHERE viewed = 0')
        unviewed_applications = cursor.fetchone()[0]
        cursor.execute('SELECT COUNT(*) FROM jobs WHERE active = 1')
        active_jobs = cursor.fetchone()[0]
    return jsonify({
        'total_applications': total_applications,
        'unviewed_applications': unviewed_applications,
        'active_jobs': active_jobs
    })

# ---------- Admin Jobs ----------
@app.route('/api/admin/jobs', methods=['GET'])
@login_required
def get_all_jobs():
    with sqlite3.connect(DB_FILE) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute('''
            SELECT j.*, COUNT(a.id) as application_count
            FROM jobs j
            LEFT JOIN applications a ON j.id = a.job_id
            GROUP BY j.id
            ORDER BY j.created_at DESC
        ''')
        jobs = [dict(row) for row in cursor.fetchall()]
    return jsonify(jobs)

@app.route('/api/admin/jobs', methods=['POST'])
@login_required
def create_job():
    data = request.get_json()
    if not data or not all(k in data for k in ['title', 'location', 'description']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO jobs (title, location, description, visa_constraints, assessment_url, job_category) VALUES (?, ?, ?, ?, ?, ?)',
            (data['title'], data['location'], data['description'], data.get('visa_constraints', ''), data.get('assessment_url', ''), data.get('job_category', ''))
        )
        conn.commit()
        job_id = cursor.lastrowid
    return jsonify({'success': True, 'job_id': job_id}), 201

@app.route('/api/admin/jobs/<int:job_id>', methods=['DELETE'])
@login_required
def delete_job(job_id):
    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.cursor()
        cursor.execute('UPDATE jobs SET active = 0 WHERE id = ?', (job_id,))
        conn.commit()
    return jsonify({'success': True, 'message': 'Job deactivated.'})

@app.route('/api/admin/jobs/delete', methods=['POST'])
@login_required
def delete_jobs_bulk():
    data = request.get_json()
    job_ids = data.get('job_ids', [])
    if not job_ids:
        return jsonify({'error': 'No job IDs provided'}), 400
    
    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.cursor()
        cursor.execute(f"UPDATE jobs SET active = 0 WHERE id IN ({','.join('?' for _ in job_ids)})", job_ids)
        conn.commit()
    return jsonify({'success': True, 'message': f'{len(job_ids)} jobs deactivated.'})

@app.route('/api/admin/applications/<int:app_id>', methods=['DELETE'])
@login_required
def delete_application(app_id):
    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.cursor()
        cursor.execute('DELETE FROM applications WHERE id = ?', (app_id,))
        conn.commit()
    return jsonify({'success': True, 'message': 'Application deleted.'})

@app.route('/api/admin/applications/delete', methods=['POST'])
@login_required
def delete_applications_bulk():
    data = request.get_json()
    app_ids = data.get('application_ids', [])
    if not app_ids:
        return jsonify({'error': 'No application IDs provided'}), 400
    
    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.cursor()
        cursor.execute(f"DELETE FROM applications WHERE id IN ({','.join('?' for _ in app_ids)})", app_ids)
        conn.commit()
    return jsonify({'success': True, 'message': f'{len(app_ids)} applications deleted.'})

# ---------- Admin Applications ----------
@app.route('/api/admin/applications', methods=['GET'])
@login_required
def get_applications():
    job_id_filter = request.args.get('job_id')
    query = 'SELECT * FROM applications'
    params = []
    if job_id_filter and job_id_filter != 'all':
        query += ' WHERE job_id = ?'
        params.append(job_id_filter)
    query += ' ORDER BY applied_at DESC'

    with sqlite3.connect(DB_FILE) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(query, params)
        applications = [dict(row) for row in cursor.fetchall()]
    return jsonify(applications)

@app.route('/api/admin/applications/<int:app_id>/view', methods=['POST'])
@login_required
def mark_application_viewed(app_id):
    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.cursor()
        cursor.execute('UPDATE applications SET viewed = 1 WHERE id = ?', (app_id,))
        conn.commit()
    return jsonify({'success': True})

# ---------- File & Data Export ----------
@app.route('/api/admin/download/resume/<path:filename>')
@login_required
def download_resume(filename):
    try:
        # Mark as viewed when downloaded
        with sqlite3.connect(DB_FILE) as conn:
            cursor = conn.cursor()
            cursor.execute('UPDATE applications SET viewed = 1 WHERE resume_filename = ?', (filename,))
            conn.commit()
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        if not os.path.exists(file_path):
            return jsonify({'error': 'Resume file not found'}), 404
        return send_file(file_path, as_attachment=True)
    except FileNotFoundError:
        return jsonify({'error': 'Resume file not found'}), 404
        return jsonify({'error': 'File not found'}), 404

@app.route('/api/admin/download/resumes', methods=['POST'])
@login_required
def download_multiple_resumes():
    app_ids = request.get_json().get('application_ids', [])
    if not app_ids:
        return jsonify({'error': 'No applications selected'}), 400

    with sqlite3.connect(DB_FILE) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(f"SELECT name, resume_filename FROM applications WHERE id IN ({','.join('?' for _ in app_ids)})", app_ids)
        apps = cursor.fetchall()
        # Mark as viewed
        cursor.execute(f"UPDATE applications SET viewed = 1 WHERE id IN ({','.join('?' for _ in app_ids)})", app_ids)
        conn.commit()

    memory_file = tempfile.SpooledTemporaryFile()
    with zipfile.ZipFile(memory_file, 'w', zipfile.ZIP_DEFLATED) as zf:
        for app_data in apps:
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], app_data['resume_filename'])
            if os.path.exists(file_path):
                zip_filename = f"{app_data['name'].replace(' ', '_')}_{app_data['resume_filename']}"
                zf.write(file_path, zip_filename)
    memory_file.seek(0)
    
    response = make_response(send_file(memory_file, mimetype='application/zip', as_attachment=True, download_name='resumes.zip'))
    response.headers['Content-Disposition'] = 'attachment; filename=selected_resumes.zip'
    return response

@app.route('/api/admin/export/excel', methods=['POST'])
@login_required
def export_applications_excel():
    app_ids = request.get_json().get('application_ids', [])
    
    query = '''
        SELECT name, email, contact_no, linkedin, location, visa_status, 
               relocation, experience_years, job_title, applied_at
        FROM applications
    '''
    params = []
    if app_ids:
        query += f" WHERE id IN ({','.join('?' for _ in app_ids)})"
        params.extend(app_ids)
    query += ' ORDER BY applied_at DESC'

    with sqlite3.connect(DB_FILE) as conn:
        df = pd.read_sql_query(query, conn, params=params)
        
        # Create a temporary file to save the Excel
        with tempfile.NamedTemporaryFile(suffix='.xlsx', delete=False) as tmp:
            df.to_excel(tmp.name, index=False)
            tmp_path = tmp.name
            
        try:
            return send_file(
                tmp_path,
                as_attachment=True,
                download_name='applications.xlsx',
                mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
        finally:
            # Clean up the temp file
            try:
                os.unlink(tmp_path)
            except:
                pass

    output = tempfile.SpooledTemporaryFile()
    writer = pd.ExcelWriter(output, engine='xlsxwriter')
    df.to_excel(writer, index=False, sheet_name='Applications')
    writer.close()
    output.seek(0)

    response = make_response(send_file(output, mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'))
    response.headers['Content-Disposition'] = 'attachment; filename=applications.xlsx'
    return response

# ---------- Courses API ----------
@app.route('/api/admin/courses', methods=['GET'])
@login_required
def get_courses():
    category = request.args.get('category')
    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.cursor()
        if category:
            cursor.execute('SELECT * FROM courses WHERE category = ? AND archived = 0 ORDER BY created_at DESC', (category,))
        else:
            cursor.execute('SELECT * FROM courses WHERE archived = 0 ORDER BY created_at DESC')
        courses = cursor.fetchall()
    courses_list = []
    for c in courses:
        courses_list.append({
            'id': c[0], 'title': c[1], 'category': c[2], 'description': c[3],
            'thumbnail_url': c[4], 'video_url': c[5], 'key_skills': c[6],
            'programming_languages': c[7], 'course_duration': c[8], 'total_sessions': c[9],
            'session_duration': c[10], 'level': c[11], 'target_audience': c[12],
            'mode': c[13], 'course_contents': c[14], 'what_you_will_learn': c[15]
        })
    return jsonify(courses_list)

@app.route('/api/admin/courses', methods=['POST'])
@login_required
def create_course():
    # Handle both JSON and FormData uploads
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form.to_dict()
    
    if not data or not all(k in data for k in ['title', 'category']):
        return jsonify({'error': 'Missing required fields: title and category'}), 400
    
    # Handle file upload
    thumbnail_url = data.get('thumbnail_url', '')
    if 'thumbnail' in request.files:
        file = request.files['thumbnail']
        if file and file.filename:
            filename = secure_filename(f"{datetime.now().timestamp()}_{file.filename}")
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            thumbnail_url = f"/uploads/{filename}"
    
    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.cursor()
        cursor.execute(
            '''INSERT INTO courses (title, category, description, thumbnail_url, video_url, key_skills, 
               programming_languages, course_duration, total_sessions, session_duration, level, 
               target_audience, mode, course_contents, what_you_will_learn) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            (data['title'], data['category'], data.get('description', ''), thumbnail_url, 
             data.get('video_url', ''), data.get('key_skills', ''), data.get('programming_languages', ''),
             data.get('course_duration', ''), data.get('total_sessions', ''), data.get('session_duration', ''),
             data.get('level', 'Beginner'), data.get('target_audience', ''), data.get('mode', 'Virtual'),
             data.get('course_contents', ''), data.get('what_you_will_learn', ''))
        )
        conn.commit()
        course_id = cursor.lastrowid
    return jsonify({'success': True, 'course_id': course_id}), 201

@app.route('/api/admin/courses/<int:course_id>', methods=['PUT'])
@login_required
def update_course(course_id):
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form.to_dict()
    
    if not data or not all(k in data for k in ['title', 'category']):
        return jsonify({'error': 'Missing required fields: title and category'}), 400
    
    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT thumbnail_url FROM courses WHERE id = ?', (course_id,))
        result = cursor.fetchone()
        if not result:
            return jsonify({'error': 'Course not found'}), 404
        
        thumbnail_url = result[0]
        
        if 'thumbnail' in request.files:
            file = request.files['thumbnail']
            if file and file.filename:
                filename = secure_filename(f"{datetime.now().timestamp()}_{file.filename}")
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                thumbnail_url = f"/uploads/{filename}"
        elif 'thumbnail_url' in data and data['thumbnail_url']:
            thumbnail_url = data['thumbnail_url']
        
        cursor.execute(
            '''UPDATE courses SET title=?, category=?, description=?, thumbnail_url=?, video_url=?, 
               key_skills=?, programming_languages=?, course_duration=?, total_sessions=?, 
               session_duration=?, level=?, target_audience=?, mode=?, course_contents=?, 
               what_you_will_learn=? WHERE id=?''',
            (data['title'], data['category'], data.get('description', ''), thumbnail_url,
             data.get('video_url', ''), data.get('key_skills', ''), data.get('programming_languages', ''),
             data.get('course_duration', ''), data.get('total_sessions', ''), data.get('session_duration', ''),
             data.get('level', 'Beginner'), data.get('target_audience', ''), data.get('mode', 'Virtual'),
             data.get('course_contents', ''), data.get('what_you_will_learn', ''), course_id)
        )
        conn.commit()
    
    return jsonify({'success': True, 'message': 'Course updated.', 'course_id': course_id})

@app.route('/api/admin/courses/<int:course_id>/archive', methods=['POST'])
@login_required
def archive_course(course_id):
    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.cursor()
        cursor.execute('UPDATE courses SET archived = 1 WHERE id = ?', (course_id,))
        conn.commit()
    return jsonify({'success': True, 'message': 'Course archived.'})

@app.route('/api/admin/courses/<int:course_id>', methods=['DELETE'])
@login_required
def delete_course(course_id):
    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.cursor()
        cursor.execute('DELETE FROM courses WHERE id = ?', (course_id,))
        conn.commit()
    return jsonify({'success': True, 'message': 'Course deleted.'})

@app.route('/api/public/courses', methods=['GET'])
def get_public_courses():
    category = request.args.get('category')
    search = request.args.get('search', '').lower()
    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.cursor()
        if category:
            cursor.execute('SELECT * FROM courses WHERE category = ? ORDER BY created_at DESC', (category,))
        else:
            cursor.execute('SELECT * FROM courses ORDER BY created_at DESC')
        courses = cursor.fetchall()
    
    result = []
    for c in courses:
        result.append({
            'id': c[0], 'title': c[1], 'category': c[2], 'description': c[3],
            'thumbnail_url': c[4], 'video_url': c[5], 'key_skills': c[6],
            'programming_languages': c[7], 'course_duration': c[8], 'total_sessions': c[9],
            'session_duration': c[10], 'level': c[11], 'target_audience': c[12],
            'mode': c[13], 'course_contents': c[14], 'what_you_will_learn': c[15]
        })
    result_final = result
    
    if search:
        result_final = [c for c in result_final if search in c['title'].lower() or search in c.get('description', '').lower()]
    
    return jsonify(result_final)

# ---------- Course Enrollments API ----------
@app.route('/api/enroll', methods=['POST'])
def enroll_course():
    try:
        form_data = request.form.to_dict()
        required_fields = ['name', 'email', 'contact_no', 'course_id', 'course_title']
        if not all(field in form_data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400

        with sqlite3.connect(DB_FILE) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO course_enrollments (name, email, contact_no, course_id, course_title)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                form_data.get('name'), form_data.get('email'), form_data.get('contact_no'),
                form_data.get('course_id'), form_data.get('course_title')
            ))
            conn.commit()
        
        return jsonify({'success': True, 'message': 'Enrollment submitted successfully'})

    except Exception as e:
        logger.error(f"Enrollment error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/enrollments/<int:course_id>', methods=['GET'])
@login_required
def get_course_enrollments(course_id):
    try:
        with sqlite3.connect(DB_FILE) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM course_enrollments 
                WHERE course_id = ? 
                ORDER BY enrolled_at DESC
            ''', (course_id,))
            enrollments = [dict(row) for row in cursor.fetchall()]
        return jsonify(enrollments)
    except Exception as e:
        logger.error(f"Get enrollments error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/enrollments/export/excel', methods=['POST'])
@login_required
def export_enrollments_excel():
    try:
        data = request.get_json() or {}
        course_id = data.get('course_id')
        enrollment_ids = data.get('enrollment_ids', [])
        
        with sqlite3.connect(DB_FILE) as conn:
            if enrollment_ids:
                placeholders = ','.join('?' * len(enrollment_ids))
                query = f'SELECT * FROM course_enrollments WHERE id IN ({placeholders})'
                cursor = conn.cursor()
                cursor.execute(query, enrollment_ids)
            else:
                cursor = conn.cursor()
                cursor.execute('SELECT * FROM course_enrollments WHERE course_id = ?', (course_id,))
            
            rows = cursor.fetchall()
            columns = [description[0] for description in cursor.description]
        
        df = pd.DataFrame(rows, columns=columns)
        output = pd.ExcelWriter('temp_enrollments.xlsx', engine='openpyxl')
        df.to_excel(output, sheet_name='Enrollments', index=False)
        output.close()
        
        response = make_response(send_file('temp_enrollments.xlsx', mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'))
        response.headers['Content-Disposition'] = 'attachment; filename=enrollments.xlsx'
        return response
    except Exception as e:
        logger.error(f"Export enrollments error: {e}")
        return jsonify({'error': str(e)}), 500

# ---------- Error Handlers ----------
@app.errorhandler(404)
def not_found_error(error):
    return jsonify({'error': 'Not Found', 'path': request.path}), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"500 Internal Server Error: {error}")
    return jsonify({'error': 'Internal Server Error'}), 500

# ---------- Run ----------
#if __name__ == '__main__':
#    logger.info("Starting Flask server on http://0.0.0.0:5000")
#    app.run(host='0.0.0.0', port=5000, debug=True)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get("FLASK_DEBUG", "False").lower() in ("1","true","yes")
    logger = app.logger
    logger.info(f"Starting Flask server on http://0.0.0.0:{port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
