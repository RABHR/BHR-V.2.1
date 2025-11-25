with open('backend/app.py', 'r') as f:
    content = f.read()

old = """@app.route('/api/employee/managers', methods=['GET'])
def get_employee_managers():"""

new = """@app.route('/api/employee/managers', methods=['GET'])
@employee_login_required
def get_employee_managers():"""

content = content.replace(old, new)

with open('backend/app.py', 'w') as f:
    f.write(content)

print('Fixed!')
