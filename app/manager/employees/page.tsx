"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, Edit, Download, ArrowLeft, Search, MessageSquare, Eye, Clock, FileText, AlertCircle, Bell, Users, Lock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { adminApi } from '@/lib/adminApi';
import { NotificationBell } from '@/components/NotificationBell';
import { MessageGroupedByUser } from '@/components/MessageGroupedByUser';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function EmployeesManagerPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [employees, setEmployees] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('timesheets');
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [view, setView] = useState<'employees' | 'managers'>('employees');
  const [managerInfo, setManagerInfo] = useState<any>(null);
  
  const [employeeData, setEmployeeData] = useState<{ [key: number]: any }>({});
  const [loadingEmployeeData, setLoadingEmployeeData] = useState<boolean>(false);
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreateManagerOpen, setIsCreateManagerOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    employee_name: '',
    email: '',
    employee_id_field: '',
    role: 'employee'
  });

  const [managerFormData, setManagerFormData] = useState({
    username: '',
    password: '',
    employee_name: '',
    email: ''
  });

  const [selectedDocs, setSelectedDocs] = useState<number[]>([]);
  const [selectedTimesheets, setSelectedTimesheets] = useState<number[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [messageContext, setMessageContext] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [messageLoading, setMessageLoading] = useState(false);
  const [messageFilter, setMessageFilter] = useState<'all' | 'sent' | 'received'>('all');
  const [isSendMessageOpen, setIsSendMessageOpen] = useState(false);
  const [sendMessageForm, setSendMessageForm] = useState({
    recipient: '',
    message: ''
  });
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    try {
      const response = await adminApi.managerCheckAuth();
      if (response.logged_in) {
        setIsAuthenticated(true);
        try {
          const manager = await adminApi.getManagerInfo();
          setManagerInfo(manager);
        } catch (managerInfoError) {
          console.error('Failed to fetch manager info:', managerInfoError);
        }
        loadEmployees();
      } else {
        router.push('/manager/login');
      }
    } catch (error) {
      router.push('/manager/login');
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const [employeesData, managersData] = await Promise.all([
        adminApi.getEmployees(),
        adminApi.getManagers()
      ]);
      setEmployees(Array.isArray(employeesData) ? employeesData : []);
      setManagers(Array.isArray(managersData) ? managersData : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const selectEmployee = async (emp: any) => {
    setSelectedEmployee(emp);
    setSelectedDocs([]);
    setSelectedTimesheets([]);
    setMessageContext(null);
    setNewMessage('');
    setActiveTab('timesheets');
    if (!employeeData[emp.id]) {
      await loadEmployeeData(emp.id);
    }
  };

  const loadEmployeeData = async (empId: number) => {
    try {
      setLoadingEmployeeData(true);
      const [timesheets, visaDocs, activities, notifications, messages] = await Promise.all([
        adminApi.getAllTimesheets(empId),
        adminApi.getAllVisaDocs(empId),
        adminApi.getAllActivities(empId),
        adminApi.getAllNotifications(empId),
        adminApi.getAllEmployeeMessages(empId),
      ]);
      
      setEmployeeData(prev => ({
        ...prev,
        [empId]: {
          timesheets: timesheets,
          visaDocs: visaDocs,
          activities: activities,
          notifications: notifications,
          messages: messages,
        }
      }));
    } catch (err) {
      console.error('Failed to load employee data:', err);
      setError('Failed to load employee data');
    } finally {
      setLoadingEmployeeData(false);
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await adminApi.createEmployee(formData);
      setFormData({ username: '', password: '', employee_name: '', email: '', employee_id_field: '', role: 'employee' });
      setIsCreateOpen(false);
      setSuccess('Employee created successfully!');
      loadEmployees();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateManager = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await adminApi.createManager(managerFormData);
      setManagerFormData({ username: '', password: '', employee_name: '', email: '' });
      setIsCreateManagerOpen(false);
      setSuccess('Manager created successfully!');
      loadEmployees();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create manager');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditEmployee = (emp: any) => {
    setEditingEmployee(emp);
    setFormData({
      username: emp.username,
      password: '',
      employee_name: emp.employee_name,
      email: emp.email || '',
      employee_id_field: emp.employee_id_field || '',
      role: emp.role || 'employee'
    });
    setIsEditOpen(true);
  };

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;
    setIsSubmitting(true);
    try {
      await adminApi.updateEmployee(editingEmployee.id, formData);
      setFormData({ username: '', password: '', employee_name: '', email: '', employee_id_field: '', role: 'employee' });
      setIsEditOpen(false);
      setEditingEmployee(null);
      setSuccess('Employee updated successfully!');
      loadEmployees();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (empId: number) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      try {
        await adminApi.deleteEmployee(empId);
        setSuccess('Employee deleted successfully!');
        loadEmployees();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete employee');
      }
    }
  };

  const handleDownloadVisaDocs = async () => {
    if (selectedDocs.length === 0 || !selectedEmployee) return;

    try {
      setIsDownloading(true);
      const data = employeeData[selectedEmployee.id]?.visaDocs || [];
      const docsToDownload = data.filter((doc: any) => selectedDocs.includes(doc.id));

      if (docsToDownload.length === 1) {
        await adminApi.downloadVisaDoc(docsToDownload[0].id);
      } else {
        await adminApi.downloadMultipleVisaDocs(docsToDownload.map((d: any) => d.id));
      }

      setSelectedDocs([]);
    } catch (err) {
      setError('Failed to download documents');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSelectDoc = (docId: number) => {
    setSelectedDocs(prev => 
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleSelectAllDocs = (docs: any[]) => {
    if (selectedDocs.length === docs.length) {
      setSelectedDocs([]);
    } else {
      setSelectedDocs(docs.map((d: any) => d.id));
    }
  };

  const handleDownloadTimesheets = async () => {
    if (selectedTimesheets.length === 0) return;

    try {
      setIsDownloading(true);
      if (selectedTimesheets.length === 1) {
        await adminApi.downloadTimesheet(selectedTimesheets[0]);
      } else {
        await adminApi.downloadMultipleTimesheets(selectedTimesheets);
      }
      setSelectedTimesheets([]);
    } catch (err) {
      setError('Failed to download timesheets');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSelectTimesheet = (tsId: number) => {
    setSelectedTimesheets(prev => 
      prev.includes(tsId)
        ? prev.filter(id => id !== tsId)
        : [...prev, tsId]
    );
  };

  const handleSelectAllTimesheets = (timesheets: any[]) => {
    if (selectedTimesheets.length === timesheets.length) {
      setSelectedTimesheets([]);
    } else {
      setSelectedTimesheets(timesheets.map((ts: any) => ts.id));
    }
  };

  const handleSendMessage = async (context: string) => {
    if (!newMessage.trim() || !selectedEmployee) return;
    setMessageLoading(true);
    try {
      await adminApi.createMessage({
        context,
        context_id: selectedEmployee.id,
        message: newMessage,
        sender: 'manager',
        sender_name: managerInfo?.name || 'Manager',
        sender_id: managerInfo?.id,
        sender_type: 'manager',
        receiver_id: selectedEmployee.id,
        receiver_type: 'employee',
        employee_id: selectedEmployee.id
      });
      setNewMessage('');
      setMessageContext(null);
      setSuccess('Message sent successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message');
    } finally {
      setMessageLoading(false);
    }
  };

  const handleSendDirectMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendMessageForm.recipient || !sendMessageForm.message.trim()) {
      setError('Please select a recipient and enter a message');
      return;
    }

    setIsSendingMessage(true);
    try {
      const [type, id] = sendMessageForm.recipient.split('-');
      const recipientId = parseInt(id);
      await adminApi.createMessage({
        context: 'direct_message',
        context_id: recipientId,
        message: sendMessageForm.message,
        sender: 'manager',
        sender_name: managerInfo?.name || 'Manager',
        sender_id: managerInfo?.id,
        sender_type: 'manager',
        receiver_id: recipientId,
        receiver_type: type === 'employee' ? 'employee' : 'manager'
      });
      setSendMessageForm({ recipient: '', message: '' });
      setIsSendMessageOpen(false);
      setSuccess('Message sent successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const getGroupedTimesheets = (empId: number) => {
    const timesheets = employeeData[empId]?.timesheets || [];
    const grouped: { [key: string]: { [key: string]: any[] } } = {};
    
    timesheets.forEach((ts: any) => {
      if (!grouped[ts.year]) grouped[ts.year] = {};
      if (!grouped[ts.year][ts.month]) grouped[ts.year][ts.month] = [];
      grouped[ts.year][ts.month].push(ts);
    });
    
    return grouped;
  };

  const filteredEmployees = employees.filter(emp => 
    emp.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredManagers = managers.filter(mgr => 
    mgr.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mgr.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mgr.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentList = view === 'employees' ? filteredEmployees : filteredManagers;

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-20">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/manager')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Manager
            </Button>
            <h1 className="text-3xl font-bold">{view === 'employees' ? 'Employees' : 'Managers'} Management</h1>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell userType="manager" onRefresh={() => selectedEmployee && loadEmployeeData(selectedEmployee.id)} />
            <div className="flex gap-2">
              <Button
                variant={view === 'employees' ? 'default' : 'outline'}
                onClick={() => {
                  setView('employees');
                  setSelectedEmployee(null);
                }}
                className={view === 'employees' ? 'bg-orange-600 hover:bg-orange-700' : ''}
              >
                Employees
              </Button>
              <Button
                variant={view === 'managers' ? 'default' : 'outline'}
                onClick={() => {
                  setView('managers');
                  setSelectedEmployee(null);
                }}
                className={view === 'managers' ? 'bg-orange-600 hover:bg-orange-700' : ''}
              >
                Managers
              </Button>
            </div>
            {view === 'employees' ? (
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Employee
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Employee</DialogTitle>
                <DialogDescription>Add a new employee account</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateEmployee} className="space-y-4">
                <div>
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="employee_name">Employee Name *</Label>
                  <Input
                    id="employee_name"
                    value={formData.employee_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, employee_name: e.target.value }))}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="employee_id_field">Employee ID *</Label>
                  <Input
                    id="employee_id_field"
                    value={formData.employee_id_field}
                    onChange={(e) => setFormData(prev => ({ ...prev, employee_id_field: e.target.value }))}
                    required
                    disabled={isSubmitting}
                    placeholder="e.g., EMP001"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateOpen(false);
                      setFormData({ username: '', password: '', employee_name: '', email: '', employee_id_field: '', role: 'employee' });
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="bg-orange-600 hover:bg-orange-700">
                    Create Employee
                  </Button>
                </div>
              </form>
            </DialogContent>
            </Dialog>
            ) : (
            <Dialog open={isCreateManagerOpen} onOpenChange={setIsCreateManagerOpen}>
              <DialogTrigger asChild>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Manager
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Manager</DialogTitle>
                  <DialogDescription>Add a new manager account</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateManager} className="space-y-4">
                  <div>
                    <Label htmlFor="manager_username">Username *</Label>
                    <Input
                      id="manager_username"
                      value={managerFormData.username}
                      onChange={(e) => setManagerFormData(prev => ({ ...prev, username: e.target.value }))}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <Label htmlFor="manager_password">Password *</Label>
                    <Input
                      id="manager_password"
                      type="password"
                      value={managerFormData.password}
                      onChange={(e) => setManagerFormData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <Label htmlFor="manager_name">Manager Name *</Label>
                    <Input
                      id="manager_name"
                      value={managerFormData.employee_name}
                      onChange={(e) => setManagerFormData(prev => ({ ...prev, employee_name: e.target.value }))}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <Label htmlFor="manager_email">Email</Label>
                    <Input
                      id="manager_email"
                      type="email"
                      value={managerFormData.email}
                      onChange={(e) => setManagerFormData(prev => ({ ...prev, email: e.target.value }))}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsCreateManagerOpen(false);
                        setManagerFormData({ username: '', password: '', employee_name: '', email: '' });
                      }}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="bg-orange-600 hover:bg-orange-700">
                      Create Manager
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-4 gap-6 min-h-[600px]">
          <div className="col-span-1 bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="h-4 w-4 text-gray-400 absolute mt-3 ml-3 pointer-events-none" />
                <Input
                  placeholder={view === 'employees' ? 'Search employees...' : 'Search managers...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="overflow-y-auto max-h-[600px]">
              {loading ? (
                <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
              ) : currentList.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No {view === 'employees' ? 'employees' : 'managers'} found
                </div>
              ) : (
                currentList.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => selectEmployee(item)}
                    className={`w-full text-left p-3 border-b hover:bg-blue-50 transition-colors ${selectedEmployee?.id === item.id ? 'bg-blue-100 border-l-4 border-blue-500' : ''}`}
                  >
                    <p className="font-medium text-sm">{item.employee_name}</p>
                    <p className="text-xs text-gray-500">{item.username}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="col-span-3 bg-white rounded-lg shadow">
            {!selectedEmployee ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                <p>Select a {view === 'employees' ? 'employee' : 'manager'} to view details</p>
              </div>
            ) : view === 'managers' ? (
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Manager Details</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-gray-600">Name</Label>
                    <p className="font-medium">{selectedEmployee.employee_name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Username</Label>
                    <p className="font-medium">{selectedEmployee.username}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Email</Label>
                    <p className="font-medium">{selectedEmployee.email || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Created</Label>
                    <p className="font-medium">
                      {new Date(selectedEmployee.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ) : loadingEmployeeData ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                <p>Loading employee data...</p>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-5 rounded-none border-b">
                  <TabsTrigger value="timesheets" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="hidden sm:inline">Timesheets</span>
                  </TabsTrigger>
                  <TabsTrigger value="visa" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Visa & Docs</span>
                  </TabsTrigger>
                  <TabsTrigger value="activities" className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Activities</span>
                  </TabsTrigger>
                  <TabsTrigger value="messages" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span className="hidden sm:inline">Messages</span>
                  </TabsTrigger>
                  <TabsTrigger value="ids" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    <span className="hidden sm:inline">ID/PWDs</span>
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-y-auto p-6">
                  <TabsContent value="timesheets" className="space-y-4 m-0">
                    <TimesheetsTab empId={selectedEmployee.id} data={employeeData[selectedEmployee.id]} selectedTimesheets={selectedTimesheets} onSelectTimesheet={handleSelectTimesheet} onSelectAllTimesheets={handleSelectAllTimesheets} onDownload={handleDownloadTimesheets} isDownloading={isDownloading} messageContext={messageContext} setMessageContext={setMessageContext} newMessage={newMessage} setNewMessage={setNewMessage} onSendMessage={handleSendMessage} messageLoading={messageLoading} />
                  </TabsContent>

                  <TabsContent value="visa" className="space-y-4 m-0">
                    <VisaDocsTab empId={selectedEmployee.id} data={employeeData[selectedEmployee.id]} selectedDocs={selectedDocs} onSelectDoc={handleSelectDoc} onSelectAllDocs={handleSelectAllDocs} onDownload={handleDownloadVisaDocs} isDownloading={isDownloading} messageContext={messageContext} setMessageContext={setMessageContext} newMessage={newMessage} setNewMessage={setNewMessage} onSendMessage={handleSendMessage} messageLoading={messageLoading} />
                  </TabsContent>

                  <TabsContent value="activities" className="space-y-4 m-0">
                    <ActivitiesTab empId={selectedEmployee.id} data={employeeData[selectedEmployee.id]} messageContext={messageContext} setMessageContext={setMessageContext} newMessage={newMessage} setNewMessage={setNewMessage} onSendMessage={handleSendMessage} messageLoading={messageLoading} />
                  </TabsContent>

                  <TabsContent value="messages" className="space-y-4 m-0">
                    <MessagesTab empId={selectedEmployee.id} data={employeeData[selectedEmployee.id]} messageFilter={messageFilter} setMessageFilter={setMessageFilter} employees={employees} managers={managers} onOpenSendMessage={() => setIsSendMessageOpen(true)} />
                  </TabsContent>

                  <TabsContent value="ids" className="space-y-4 m-0">
                    <IDPWDTab employee={selectedEmployee} onDeleteEmployee={handleDeleteEmployee} />
                  </TabsContent>
                </div>
              </Tabs>
            )}
          </div>
        </div>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Employee</DialogTitle>
              <DialogDescription>Update employee information</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateEmployee} className="space-y-4">
              <div>
                <Label htmlFor="edit-username">Username *</Label>
                <Input
                  id="edit-username"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="edit-password">Password (leave empty to keep current)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="edit-employee_name">Employee Name *</Label>
                <Input
                  id="edit-employee_name"
                  value={formData.employee_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, employee_name: e.target.value }))}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditOpen(false);
                    setEditingEmployee(null);
                    setFormData({ username: '', password: '', employee_name: '', email: '', employee_id_field: '', role: 'employee' });
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-orange-600 hover:bg-orange-700">
                  Update Employee
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isSendMessageOpen} onOpenChange={setIsSendMessageOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Send Message</DialogTitle>
              <DialogDescription>Send a message to any employee or manager</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSendDirectMessage} className="space-y-4">
              <div>
                <Label htmlFor="recipient">Send To</Label>
                <Select 
                  value={sendMessageForm.recipient}
                  onValueChange={(value) => setSendMessageForm(prev => ({ ...prev, recipient: value }))}
                  disabled={isSendingMessage}
                >
                  <SelectTrigger id="recipient">
                    <SelectValue placeholder="Select recipient..." />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">EMPLOYEES</div>
                    {employees.map((emp: any) => (
                      <SelectItem key={`emp-${emp.id}`} value={`emp-${emp.id}`}>
                        {emp.employee_name} ({emp.username})
                      </SelectItem>
                    ))}
                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 mt-2">MANAGERS</div>
                    {managers.map((mgr: any) => (
                      <SelectItem key={`mgr-${mgr.id}`} value={`mgr-${mgr.id}`}>
                        {mgr.employee_name} ({mgr.username})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Type your message here..."
                  value={sendMessageForm.message}
                  onChange={(e) => setSendMessageForm(prev => ({ ...prev, message: e.target.value }))}
                  disabled={isSendingMessage}
                  rows={6}
                  className="resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsSendMessageOpen(false)}
                  disabled={isSendingMessage}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSendingMessage}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSendingMessage ? 'Sending...' : 'Send Message'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}



function TimesheetsTab({ empId, data, selectedTimesheets, onSelectTimesheet, onSelectAllTimesheets, onDownload, isDownloading, messageContext, setMessageContext, newMessage, setNewMessage, onSendMessage, messageLoading }: any) {
  const timesheets = data?.timesheets || [];
  const grouped: { [key: string]: { [key: string]: any[] } } = {};
  
  timesheets.forEach((ts: any) => {
    if (!grouped[ts.year]) grouped[ts.year] = {};
    if (!grouped[ts.year][ts.month]) grouped[ts.year][ts.month] = [];
    grouped[ts.year][ts.month].push(ts);
  });

  const allTimesheets = timesheets.flat();

  return (
    <div className="space-y-4">
      {timesheets.length > 0 && (
        <div className="flex items-center gap-2 bg-white border rounded-lg p-3">
          <Checkbox 
            checked={selectedTimesheets.length === allTimesheets.length && allTimesheets.length > 0}
            onCheckedChange={() => onSelectAllTimesheets(allTimesheets)}
          />
          <span className="text-sm font-medium text-gray-600">Select All ({selectedTimesheets.length}/{allTimesheets.length})</span>
          {selectedTimesheets.length > 0 && (
            <Button 
              size="sm" 
              className="ml-auto bg-blue-600 hover:bg-blue-700"
              onClick={onDownload}
              disabled={isDownloading}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Selected ({selectedTimesheets.length})
            </Button>
          )}
        </div>
      )}

      {Object.keys(grouped).length === 0 ? (
        <p className="text-gray-500 text-center py-8">No timesheets submitted</p>
      ) : (
        Object.keys(grouped)
          .sort((a, b) => parseInt(b) - parseInt(a))
          .map(year => (
            <div key={year} className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3">Year {year}</h3>
              <div className="space-y-3">
                {Object.keys(grouped[year])
                  .sort((a, b) => parseInt(b) - parseInt(a))
                  .map(month => (
                    <div key={month} className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-medium mb-2">{MONTH_NAMES[parseInt(month) - 1]} {year}</h4>
                      <div className="space-y-2">
                        {grouped[year][month].map((ts: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-3 bg-gray-50 p-3 rounded">
                            <Checkbox 
                              checked={selectedTimesheets.includes(ts.id)}
                              onCheckedChange={() => onSelectTimesheet(ts.id)}
                            />
                            <div className="flex-1">
                              <p className="text-sm text-gray-600">Week {ts.week}</p>
                              <p className="text-xs text-gray-500 mt-1">Submitted: {new Date(ts.submitted_at).toLocaleDateString()}</p>
                            </div>
                            <Badge variant={ts.status === 'submitted' ? 'default' : 'secondary'}>{ts.status}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))
      )}
      
      <div className="border-t pt-4 mt-6">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setMessageContext(messageContext === 'timesheets' ? null : 'timesheets')}
          className="gap-2"
        >
          <MessageSquare className="h-4 w-4" />
          {messageContext === 'timesheets' ? 'Hide' : 'Send'} Message
        </Button>
        {messageContext === 'timesheets' && (
          <div className="mt-4 space-y-2">
            <Textarea 
              placeholder="Type your message to employee..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setMessageContext(null)}>Cancel</Button>
              <Button onClick={() => onSendMessage('timesheets')} disabled={messageLoading}>
                Send Message
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function VisaDocsTab({ empId, data, selectedDocs, onSelectDoc, onSelectAllDocs, onDownload, isDownloading, messageContext, setMessageContext, newMessage, setNewMessage, onSendMessage, messageLoading }: any) {
  const docs = data?.visaDocs || [];

  return (
    <div className="space-y-4">
      {docs.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No visa documents uploaded</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-2 text-left">
                  <Checkbox 
                    checked={selectedDocs.length === docs.length && docs.length > 0}
                    onCheckedChange={() => onSelectAllDocs(docs)}
                  />
                </th>
                <th className="px-4 py-2 text-left">File Name</th>
                <th className="px-4 py-2 text-left">Visa Type</th>
                <th className="px-4 py-2 text-left">Uploaded Date</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((doc: any) => (
                <tr key={doc.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <Checkbox 
                      checked={selectedDocs.includes(doc.id)}
                      onCheckedChange={() => onSelectDoc(doc.id)}
                    />
                  </td>
                  <td className="px-4 py-2">{doc.doc_name}</td>
                  <td className="px-4 py-2">{doc.visa_type || '-'}</td>
                  <td className="px-4 py-2 text-xs text-gray-500">{new Date(doc.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedDocs.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={() => onDownload()} disabled={isDownloading} className="gap-2">
            <Download className="h-4 w-4" />
            Download Selected ({selectedDocs.length})
          </Button>
        </div>
      )}

      <div className="border-t pt-4 mt-6">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setMessageContext(messageContext === 'visa' ? null : 'visa')}
          className="gap-2"
        >
          <MessageSquare className="h-4 w-4" />
          {messageContext === 'visa' ? 'Hide' : 'Send'} Message
        </Button>
        {messageContext === 'visa' && (
          <div className="mt-4 space-y-2">
            <Textarea 
              placeholder="Type your message to employee..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setMessageContext(null)}>Cancel</Button>
              <Button onClick={() => onSendMessage('visa')} disabled={messageLoading}>
                Send Message
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ActivitiesTab({ empId, data, messageContext, setMessageContext, newMessage, setNewMessage, onSendMessage, messageLoading }: any) {
  const activities = data?.activities || [];
  const [selectedActivity, setSelectedActivity] = useState<any>(null);

  return (
    <div className="space-y-4">
      {activities.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No activities posted</p>
      ) : (
        <div className="space-y-3">
          {[...activities].reverse().map((activity: any, idx: number) => (
            <button
              key={idx} 
              onClick={() => setSelectedActivity(activity)}
              className="w-full text-left border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors"
            >
              <h4 className="font-semibold text-blue-600 cursor-pointer hover:underline">{activity.activity_name}</h4>
              <p className="text-sm text-gray-700 mt-2 line-clamp-2">{activity.activity_description}</p>
              <p className="text-xs text-gray-500 mt-3">
                {new Date(activity.created_at).toLocaleString()}
              </p>
            </button>
          ))}
        </div>
      )}

      <Dialog open={!!selectedActivity} onOpenChange={(open) => !open && setSelectedActivity(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedActivity?.activity_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-600 text-sm">Description</Label>
              <p className="mt-2 text-gray-700 whitespace-pre-wrap">{selectedActivity?.activity_description}</p>
            </div>
            <div>
              <Label className="text-gray-600 text-sm">Posted</Label>
              <p className="mt-2 text-sm text-gray-500">
                {selectedActivity && new Date(selectedActivity.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="border-t pt-4 mt-6">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setMessageContext(messageContext === 'activities' ? null : 'activities')}
          className="gap-2"
        >
          <MessageSquare className="h-4 w-4" />
          {messageContext === 'activities' ? 'Hide' : 'Send'} Message
        </Button>
        {messageContext === 'activities' && (
          <div className="mt-4 space-y-2">
            <Textarea 
              placeholder="Type your message to employee..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setMessageContext(null)}>Cancel</Button>
              <Button onClick={() => onSendMessage('activities')} disabled={messageLoading}>
                Send Message
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationsTab({ empId, data }: any) {
  const notifications = data?.notifications || [];

  return (
    <div className="space-y-4">
      {notifications.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No notifications</p>
      ) : (
        <div className="space-y-3">
          {[...notifications].reverse().map((notif: any, idx: number) => (
            <div key={idx} className="border rounded-lg p-4 bg-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold">{notif.title}</p>
                  <p className="text-sm text-gray-700 mt-1">{notif.message}</p>
                  <p className="text-xs text-gray-500 mt-3">
                    {new Date(notif.created_at).toLocaleString()}
                  </p>
                </div>
                <Badge variant={notif.status === 'read' ? 'secondary' : 'default'}>
                  {notif.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MessagesTab({ empId, data, messageFilter, setMessageFilter, employees, managers, onOpenSendMessage }: any) {
  const allMessages = data?.messages || [];
  const sentMessages = allMessages.filter((msg: any) => msg.sender === 'admin');
  const receivedMessages = allMessages.filter((msg: any) => msg.sender !== 'admin');
  
  const filteredMessages = messageFilter === 'sent' ? sentMessages : messageFilter === 'received' ? receivedMessages : allMessages;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b pb-4">
        <Button
          variant={messageFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMessageFilter('all')}
        >
          All Messages
        </Button>
        <Button
          variant={messageFilter === 'sent' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMessageFilter('sent')}
        >
          Sent ({sentMessages.length})
        </Button>
        <Button
          variant={messageFilter === 'received' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMessageFilter('received')}
        >
          Received ({receivedMessages.length})
        </Button>
        <Button 
          onClick={onOpenSendMessage}
          className="bg-blue-600 hover:bg-blue-700"
          size="sm"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Send Message
        </Button>
      </div>

      <MessageGroupedByUser messages={filteredMessages} />
    </div>
  );
}

function IDPWDTab({ employee, onDeleteEmployee }: any) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    email: employee.email || '',
    password: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleEditCredentials = async () => {
    if (!editForm.email) {
      alert('Please fill in all fields');
      return;
    }
    try {
      setIsProcessing(true);
      await adminApi.updateEmployee(employee.id, editForm);
      alert('Credentials updated successfully');
      setIsEditOpen(false);
    } catch (err) {
      alert('Failed to update credentials');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (confirm(`Are you sure you want to delete employee ${employee.employee_name}? This action cannot be undone.`)) {
      try {
        setIsProcessing(true);
        await onDeleteEmployee(employee.id);
      } catch (err) {
        alert('Failed to delete employee');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Employee Credentials</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label className="text-gray-600 text-sm">Employee Name</Label>
              <p className="font-semibold text-gray-900 mt-1">{employee.employee_name}</p>
            </div>
            <div>
              <Label className="text-gray-600 text-sm">Email</Label>
              <p className="font-semibold text-gray-900 mt-1">{employee.email || '-'}</p>
            </div>
            <div>
              <Label className="text-gray-600 text-sm">Employee ID</Label>
              <p className="font-semibold text-gray-900 mt-1 font-mono bg-gray-50 p-2 rounded">{employee.employee_id_field || 'Not Set'}</p>
            </div>
            <div>
              <Label className="text-gray-600 text-sm">Username</Label>
              <p className="font-semibold text-gray-900 mt-1 font-mono bg-gray-50 p-2 rounded">{employee.username}</p>
            </div>
            <div>
              <Label className="text-gray-600 text-sm">Password</Label>
              <p className="font-semibold text-gray-900 mt-1 font-mono bg-gray-50 p-2 rounded">{employee.password || '••••••••'}</p>
              <p className="text-xs text-gray-500 mt-1">Use &quot;Edit Credentials&quot; to change password</p>
            </div>
          </div>
          <div className="border-t pt-4 flex gap-2">
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-orange-600 hover:text-orange-800"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Credentials
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Employee Credentials</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-username" className="text-gray-600">Username (cannot be changed)</Label>
                    <Input
                      id="edit-username"
                      value={employee.username}
                      disabled
                      className="bg-gray-100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      disabled={isProcessing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-password">New Password (optional)</Label>
                    <Input
                      id="edit-password"
                      type="password"
                      placeholder="Leave blank to keep current password"
                      value={editForm.password}
                      onChange={(e) => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                      disabled={isProcessing}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isProcessing}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleEditCredentials} 
                      disabled={isProcessing}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-red-600 hover:text-red-800"
              onClick={handleDeleteEmployee}
              disabled={isProcessing}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Employee
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
