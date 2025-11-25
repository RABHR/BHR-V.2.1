import sqlite3
import logging

DB_FILE = 'brainhr.db'
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def verify_database():
    """Verify all required tables and fields exist"""
    try:
        with sqlite3.connect(DB_FILE) as conn:
            cursor = conn.cursor()
            
            required_tables = [
                'employees', 'timesheets', 'visa_docs', 'activities',
                'messages', 'managers', 'notifications'
            ]
            
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
            existing_tables = [row[0] for row in cursor.fetchall()]
            
            missing = [t for t in required_tables if t not in existing_tables]
            if missing:
                logger.error(f"Missing tables: {missing}")
                return False
            
            logger.info(f"✓ All required tables exist: {required_tables}")
            
            cursor.execute("PRAGMA table_info(messages)")
            message_fields = [col[1] for col in cursor.fetchall()]
            required_fields = ['id', 'sender', 'employee_id', 'context', 'context_id', 'message']
            missing_fields = [f for f in required_fields if f not in message_fields]
            
            if missing_fields:
                logger.error(f"Messages table missing fields: {missing_fields}")
                return False
            
            logger.info(f"✓ Messages table has all required fields")
            
            return True
    except Exception as e:
        logger.error(f"Database verification failed: {e}")
        return False

if __name__ == '__main__':
    success = verify_database()
    if success:
        logger.info("✓ Database schema verification PASSED")
    else:
        logger.info("✗ Database schema verification FAILED")
