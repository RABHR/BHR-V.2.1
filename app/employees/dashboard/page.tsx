"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { adminApi } from '@/lib/adminApi';
import { LogOut, Plus, Upload, CheckCircle, AlertCircle, MessageSquare, Badge as BadgeIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { NotificationBell } from '@/components/NotificationBell';
import { MessageGroupedByUser } from '@/components/MessageGroupedByUser';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function EmployeeDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timesheets');

  const [timesheets, setTimesheets] = useState<any[]>([]);
  const [visaDocs, setVisaDocs] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [employeeInfo, setEmployeeInfo] = useState<any>(null);

  const [timesheetForm, setTimesheetForm] = useState({
    file: null as File | null,
    year: new Date().getFullYear().toString(),
    month: '1',
    week: '1'
  });

  const [visaDocForm, setVisaDocForm] = useState({
    file: null as File | null,
    doc_name: '',
    visa_type: ''
  });

  const [activityForm, setActivityForm] = useState({
    activity_name: '',
    activity_description: ''
  });

  const [replyForm, setReplyForm] = useState({
    selectedManager: '',
    message: ''
  });

  const [message, setMessage] = useState({ type: '', text: '' });
  const [isReplyLoading, setIsReplyLoading] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await adminApi.employeeCheckAuth();
      if (!response.logged_in) {
        router.push('/employees/login');
      } else {
        setIsAuthenticated(true);
        try {
          const employee = await adminApi.getEmployeeInfo();
          setEmployeeInfo(employee);
        } catch (employeeInfoError) {
          console.error('Failed to fetch employee info:', employeeInfoError);
        }
        loadDashboardData();
      }
    } catch (error) {
      router.push('/employees/login');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      const [timesheetsData, visaDocsData, activitiesData, messagesData, managersData] = await Promise.all([
        adminApi.getEmployeeTimesheets(),
        adminApi.getEmployeeVisaDocs(),
        adminApi.getEmployeeActivities(),
        adminApi.getEmployeeMessages(),
        adminApi.getEmployeeManagers()
      ]);
      setTimesheets(timesheetsData);
      setVisaDocs(visaDocsData);
      setActivities(activitiesData);
      setMessages(messagesData);
      setManagers(managersData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await adminApi.employeeLogout();
      router.push('/employees');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyForm.selectedManager || !replyForm.message.trim()) {
      setMessage({ type: 'error', text: 'Please select a manager and enter a message' });
      return;
    }

    setIsReplyLoading(true);
    try {
      await adminApi.createMessage({
        context: 'messages',
        context_id: parseInt(replyForm.selectedManager),
        message: replyForm.message,
        sender: 'employee',
        sender_name: employeeInfo?.name || 'Employee',
        sender_id: employeeInfo?.id,
        sender_type: 'employee',
        receiver_id: parseInt(replyForm.selectedManager),
        receiver_type: 'manager'
      });
      
      setReplyForm({ selectedManager: '', message: '' });
      setMessage({ type: 'success', text: 'Message sent successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      loadDashboardData();
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessage({ type: 'error', text: 'Failed to send message' });
    } finally {
      setIsReplyLoading(false);
    }
  };

  const handleUploadTimesheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!timesheetForm.file) {
      setMessage({ type: 'error', text: 'Please select a file' });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', timesheetForm.file);
      formData.append('year', timesheetForm.year);
      formData.append('month', timesheetForm.month);
      formData.append('week', timesheetForm.week);

      await adminApi.uploadTimesheet(formData);
      setMessage({ type: 'success', text: 'Timesheet uploaded successfully' });
      setTimesheetForm({ file: null, year: new Date().getFullYear().toString(), month: '1', week: '1' });
      loadDashboardData();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to upload timesheet' });
    }
  };

  const handleSubmitTimesheet = async (timesheetId: number) => {
    try {
      await adminApi.submitTimesheet(timesheetId);
      setMessage({ type: 'success', text: 'Timesheet submitted successfully' });
      loadDashboardData();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to submit timesheet' });
    }
  };

  const handleUploadVisaDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visaDocForm.file || !visaDocForm.doc_name) {
      setMessage({ type: 'error', text: 'Please select a file and enter a document name' });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', visaDocForm.file);
      formData.append('doc_name', visaDocForm.doc_name);
      formData.append('visa_type', visaDocForm.visa_type);

      await adminApi.uploadVisaDoc(formData);
      setMessage({ type: 'success', text: 'Visa document uploaded successfully' });
      setVisaDocForm({ file: null, doc_name: '', visa_type: '' });
      loadDashboardData();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to upload document' });
    }
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityForm.activity_name) {
      setMessage({ type: 'error', text: 'Please enter an activity name' });
      return;
    }

    try {
      await adminApi.createActivity({
        activity_name: activityForm.activity_name,
        activity_description: activityForm.activity_description
      });
      setMessage({ type: 'success', text: 'Activity posted successfully' });
      setActivityForm({ activity_name: '', activity_description: '' });
      loadDashboardData();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to post activity' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center"><p className="text-gray-600">Loading...</p></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-20">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Employee Dashboard</h1>
          <div className="flex items-center gap-3">
            <NotificationBell userType="employee" onRefresh={loadDashboardData} />
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {message.text && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className="mb-6">
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
            <TabsTrigger value="visa-docs">Visa & Docs</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              Messages {messages.length > 0 && <Badge className="ml-1 bg-red-500">{messages.length}</Badge>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timesheets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Timesheet</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUploadTimesheet} className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="year">Year</Label>
                      <Select value={timesheetForm.year} onValueChange={(val) => setTimesheetForm(prev => ({ ...prev, year: val }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[2023, 2024, 2025, 2026].map(y => (
                            <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="month">Month</Label>
                      <Select value={timesheetForm.month} onValueChange={(val) => setTimesheetForm(prev => ({ ...prev, month: val }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                            <SelectItem key={m} value={m.toString()}>{MONTH_NAMES[m - 1]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="week">Week</Label>
                      <Select value={timesheetForm.week} onValueChange={(val) => setTimesheetForm(prev => ({ ...prev, week: val }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4].map(w => (
                            <SelectItem key={w} value={w.toString()}>Week {w}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="file">Select Timesheet File (PDF)</Label>
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setTimesheetForm(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                    />
                  </div>
                  <Button type="submit" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Save Timesheet
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Saved Timesheets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {timesheets.length === 0 ? (
                    <p className="text-gray-500">No timesheets uploaded yet</p>
                  ) : (
                    timesheets.map(ts => (
                      <div key={ts.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-semibold">{MONTH_NAMES[ts.month - 1]} {ts.year}, Week {ts.week}</p>
                          <p className="text-sm text-gray-500">Status: {ts.status}</p>
                        </div>
                        {ts.status === 'draft' && (
                          <Button onClick={() => handleSubmitTimesheet(ts.id)} size="sm">Submit</Button>
                        )}
                        {ts.status === 'submitted' && (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            Submitted
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visa-docs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Visa & Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUploadVisaDoc} className="space-y-4">
                  <div>
                    <Label htmlFor="doc_name">Document Name</Label>
                    <Input
                      id="doc_name"
                      value={visaDocForm.doc_name}
                      onChange={(e) => setVisaDocForm(prev => ({ ...prev, doc_name: e.target.value }))}
                      placeholder="e.g., Passport, Visa Application"
                    />
                  </div>
                  <div>
                    <Label htmlFor="visa_type">Visa Type Being Processed</Label>
                    <Input
                      id="visa_type"
                      value={visaDocForm.visa_type}
                      onChange={(e) => setVisaDocForm(prev => ({ ...prev, visa_type: e.target.value }))}
                      placeholder="e.g., H1B, L1B, Green Card"
                    />
                  </div>
                  <div>
                    <Label htmlFor="visa_file">Select File</Label>
                    <Input
                      id="visa_file"
                      type="file"
                      onChange={(e) => setVisaDocForm(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                    />
                  </div>
                  <Button type="submit" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Document
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Uploaded Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {visaDocs.length === 0 ? (
                    <p className="text-gray-500">No documents uploaded yet</p>
                  ) : (
                    visaDocs.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-semibold">{doc.doc_name}</p>
                          {doc.visa_type && <p className="text-sm text-gray-500">Visa: {doc.visa_type}</p>}
                          <p className="text-xs text-gray-400">{new Date(doc.created_at).toLocaleDateString()}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => adminApi.downloadVisaDoc(doc.id)}
                        >
                          Download
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Post Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateActivity} className="space-y-4">
                  <div>
                    <Label htmlFor="activity_name">Activity Name</Label>
                    <Input
                      id="activity_name"
                      value={activityForm.activity_name}
                      onChange={(e) => setActivityForm(prev => ({ ...prev, activity_name: e.target.value }))}
                      placeholder="Activity title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="activity_description">Activity Description</Label>
                    <Textarea
                      id="activity_description"
                      value={activityForm.activity_description}
                      onChange={(e) => setActivityForm(prev => ({ ...prev, activity_description: e.target.value }))}
                      placeholder="Describe your activity in detail"
                      rows={4}
                    />
                  </div>
                  <Button type="submit" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Post Activity
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.length === 0 ? (
                    <p className="text-gray-500">No activities posted yet</p>
                  ) : (
                    activities.map(activity => (
                      <div key={activity.id} className="p-4 border rounded-lg">
                        <p className="font-semibold">{activity.activity_name}</p>
                        {activity.activity_description && (
                          <p className="text-sm text-gray-600 mt-2">{activity.activity_description}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(activity.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <MessageGroupedByUser messages={messages} onRefresh={loadDashboardData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Send Reply to Manager</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendReply} className="space-y-4">
                  <div>
                    <Label htmlFor="manager-select">Select Manager/Admin</Label>
                    <Select 
                      value={replyForm.selectedManager}
                      onValueChange={(value) => setReplyForm(prev => ({ ...prev, selectedManager: value }))}
                      disabled={isReplyLoading}
                    >
                      <SelectTrigger id="manager-select">
                        <SelectValue placeholder="Choose a manager or admin" />
                      </SelectTrigger>
                      <SelectContent>
                        {managers.map((mgr: any) => (
                          <SelectItem key={mgr.id} value={mgr.id.toString()}>
                            {mgr.employee_name} ({mgr.username})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="reply-message">Message</Label>
                    <Textarea
                      id="reply-message"
                      placeholder="Type your reply here..."
                      value={replyForm.message}
                      onChange={(e) => setReplyForm(prev => ({ ...prev, message: e.target.value }))}
                      disabled={isReplyLoading}
                      rows={4}
                    />
                  </div>
                  <Button type="submit" disabled={isReplyLoading} className="bg-blue-600 hover:bg-blue-700">
                    {isReplyLoading ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
