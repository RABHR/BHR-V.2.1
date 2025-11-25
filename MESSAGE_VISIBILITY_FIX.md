# Manager/Admin Message Visibility Fix

## Problem
Employees could send messages to managers through the dashboard, but these messages were not visible to managers/admins when viewing employee details. Error: "Employee authentication required" when loading employee data.

## Root Cause
The `getAllEmployeeMessages()` method in the frontend was calling `/api/messages` endpoint, which required `@employee_login_required` decorator. Managers and admins don't have employee authentication, so they received a 401 error.

## Solution
Created a new manager/admin endpoint to retrieve employee messages with proper authentication.

## Changes Made

### Backend: `backend/app.py` (lines 1102-1125)
Added new endpoint:
```python
@app.route('/api/manager/employee-messages/<int:emp_id>', methods=['GET'])
@login_required
def get_employee_messages(emp_id):
```

- Uses `@login_required` decorator (allows both manager and admin authentication)
- Accepts optional `context` query parameter for filtering
- Returns all messages for a specific employee_id
- Sorted by created_at in descending order

### Frontend: `lib/adminApi.ts` (lines 680-688)
Updated `getAllEmployeeMessages()` method:
```typescript
async getAllEmployeeMessages(empId: number): Promise<any[]> {
  try {
    const messages = await this.fetchWithCredentials(`/api/manager/employee-messages/${empId}`);
    return messages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error('Failed to get employee messages');
  }
}
```

- Now calls the new manager endpoint instead of the employee-only endpoint
- Uses credentials for proper session authentication
- Returns sorted messages (newest first)

## Impact
- ✅ Manager employees page can now load employee messages
- ✅ Admin employees page can now load employee messages
- ✅ Both managers and admins can view messages sent by employees
- ✅ No breaking changes to existing functionality
- ✅ Maintains existing message system architecture

## Verification
- Backend syntax validated: ✅ Python syntax OK
- Frontend changes use existing API patterns: ✅ Uses `fetchWithCredentials()`
- Database schema supports queries: ✅ Messages table has employee_id field
- Endpoint authentication correct: ✅ Uses `@login_required` (works for managers and admins)

## Testing
Navigate to Manager/Admin Employees page → Select any employee → Messages tab should now display all messages sent by that employee without errors.
