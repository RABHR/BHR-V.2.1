# Employee Dashboard Testing Guide

## Quick Start

### 1. Start Backend Server
```bash
cd backend
python app.py
```
Backend will run on: `http://localhost:5000`

### 2. Start Frontend Dev Server (in another terminal)
```bash
npm run dev
```
Frontend will run on: `http://localhost:3000`

### 3. Run Both Concurrently
```bash
npm run dev:full
```

---

## Test Scenarios

### Test 1: Manager List Loading ✅
**Endpoint Fixed**: `GET /api/employee/managers`

1. Login as employee
2. Navigate to Employee Dashboard
3. Click "Messages" tab
4. **Expected Result**: Manager dropdown populates successfully

**Verification**: Browser console should NOT show "Failed to get managers" error

---

### Test 2: Timesheet Upload ✅
**Endpoint Fixed**: `POST /api/employee/timesheets`

1. Login as employee
2. Go to "Timesheets" tab
3. Select year, month, week
4. Choose a PDF file
5. Click "Save Timesheet"
6. **Expected Result**: File uploads successfully, appears in "Saved Timesheets"

**Verification**: 
- No upload errors displayed
- Timesheet appears with correct month/year/week
- Status shows "draft"

---

### Test 3: Visa Document Upload ✅
**Endpoint Fixed**: `POST /api/employee/visa-docs`

1. Login as employee
2. Go to "Visa & Docs" tab
3. Enter document name (e.g., "Passport Copy")
4. Enter visa type (e.g., "H1B")
5. Select a file
6. Click "Upload Document"
7. **Expected Result**: Document uploads and appears in list

**Verification**:
- No upload errors
- Document shows in "Uploaded Documents" list
- Document name and visa type are correct

---

### Test 4: Message Visibility ✅
**Endpoints Fixed**: 
- `POST /api/messages` - Creating messages
- `GET /api/messages` - Retrieving messages
- `GET /api/employee/messages` - Employee message list

#### Part A: Employee Sends Message
1. Login as employee
2. Go to "Messages" tab
3. Select a manager from dropdown
4. Type a message
5. Click "Send Message"
6. **Expected Result**: Message sent successfully

#### Part B: Manager Receives Message
1. Login as manager (use manager credentials if available)
2. Check message list
3. **Expected Result**: Employee message appears

#### Part C: Manager Sends Reply
1. As manager, send message back to employee
2. **Expected Result**: Message is recorded

#### Part D: Employee Sees Reply
1. Login back as employee
2. Go to Messages tab
3. **Expected Result**: Manager's reply is visible

**Verification**:
- Messages appear in correct order
- Sender information is correct
- Timestamps are accurate
- No console errors

---

### Test 5: Activity Posting ✅
**Endpoint**: `POST /api/employee/activities`

1. Login as employee
2. Go to "Activities" tab
3. Enter activity name (e.g., "Completed Q4 Review")
4. Enter description (optional)
5. Click "Post Activity"
6. **Expected Result**: Activity appears in list

---

### Test 6: Session Persistence ✅
**Verification**: Credentials are properly maintained

1. Login as employee
2. Perform multiple operations:
   - Upload timesheet
   - Upload visa doc
   - Send message
   - Post activity
3. **Expected Result**: All operations complete without re-authentication

---

## Browser Console Checks

After each test, verify the console has NO errors:

❌ **Should NOT see**:
```
Failed to get managers
Failed to upload timesheet
Failed to upload visa document
Failed to send message
Authentication required
```

✅ **Should see** (if any, only info/debug):
```
Message sent successfully
Timesheet uploaded successfully
Document uploaded successfully
```

---

## Database Verification

### Check Database State
```bash
cd backend
sqlite3 brainhr.db
```

### Verify Employee Records
```sql
SELECT id, username, employee_name FROM employees LIMIT 5;
```

### Verify Timesheet Records
```sql
SELECT * FROM timesheets ORDER BY created_at DESC LIMIT 5;
```

### Verify Messages
```sql
SELECT sender, employee_id, context, message FROM messages ORDER BY created_at DESC LIMIT 5;
```

### Verify Visa Docs
```sql
SELECT * FROM visa_docs ORDER BY created_at DESC LIMIT 5;
```

---

## API Endpoint Testing with cURL

### Test 1: Get Managers (requires session cookie)
```bash
curl -X GET http://localhost:5000/api/employee/managers \
  -H "Cookie: session=YOUR_SESSION_COOKIE" \
  -H "Content-Type: application/json"
```

### Test 2: Create Message
```bash
curl -X POST http://localhost:5000/api/messages \
  -H "Cookie: session=YOUR_SESSION_COOKIE" \
  -H "Content-Type: application/json" \
  -d '{
    "context": "messages",
    "context_id": 1,
    "message": "Test message",
    "sender": "employee",
    "sender_name": "Employee Name"
  }'
```

### Test 3: Get Messages
```bash
curl -X GET "http://localhost:5000/api/messages?context=messages" \
  -H "Cookie: session=YOUR_SESSION_COOKIE" \
  -H "Content-Type: application/json"
```

---

## Troubleshooting

### Issue: "Failed to get managers"
**Solutions**:
1. Check backend is running: `http://localhost:5000`
2. Verify employee is logged in
3. Check browser console for CORS errors
4. Verify database has managers table: `sqlite3 brainhr.db ".tables"`

### Issue: File upload fails
**Solutions**:
1. Check file size is under 5MB
2. Verify file format is supported (PDF for timesheets)
3. Check backend has write permission to `uploads/` folder
4. Review backend error logs

### Issue: Messages not appearing
**Solutions**:
1. Verify recipient manager exists in managers table
2. Check message was actually sent (POST /api/messages returned 201)
3. Verify employee_id is set correctly
4. Check message context is 'messages'

### Issue: Session expires
**Solutions**:
1. Session lifetime is set to 24 hours
2. Verify cookies are enabled in browser
3. Check backend SESSION_COOKIE_HTTPONLY setting
4. Re-login if session expires

---

## Performance Checks

### Check API Response Times
**Good Response Time**: < 500ms

Use browser DevTools > Network tab to verify:
- GET /api/employee/timesheets: Should be < 200ms
- POST /api/employee/timesheets: Should be < 1000ms (file upload)
- GET /api/employee/managers: Should be < 100ms
- POST /api/messages: Should be < 200ms

### Check Database Query Performance
If queries are slow, verify:
1. Index on `messages.employee_id`: `CREATE INDEX idx_messages_employee_id ON messages(employee_id);`
2. Index on `timesheets.employee_id`: `CREATE INDEX idx_timesheets_employee_id ON timesheets(employee_id);`

---

## Sign-Off Checklist

After completing all tests, verify:

- [ ] Employee can login successfully
- [ ] Manager list loads without error
- [ ] Timesheets can be uploaded and viewed
- [ ] Visa documents can be uploaded and viewed
- [ ] Activities can be created and viewed
- [ ] Messages can be sent between employees and managers
- [ ] All operations maintain session
- [ ] No console errors appear
- [ ] All files are stored correctly
- [ ] Database records are created properly

---

## Additional Resources

- **Frontend Code**: `/app/employees/dashboard/page.tsx`
- **API Client**: `/lib/adminApi.ts`
- **Backend**: `/backend/app.py`
- **Database**: `/backend/brainhr.db`

**Documentation**:
- `FIXES_SUMMARY.md` - What was fixed
- `VERIFICATION_REPORT.md` - Full verification details

