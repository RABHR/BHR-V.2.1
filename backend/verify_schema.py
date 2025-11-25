import sqlite3

conn = sqlite3.connect('brainhr.db')
cursor = conn.cursor()

cursor.execute("PRAGMA table_info(employees)")
cols = cursor.fetchall()
print('Employees table columns:')
for col in cols:
    print(f'  {col[1]} ({col[2]})')

cursor.execute("PRAGMA table_info(messages)")
cols = cursor.fetchall()
print('\nMessages table columns:')
for col in cols:
    print(f'  {col[1]} ({col[2]})')

conn.close()
print('\nSchema verification complete!')
