"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  Plus,
  LogOut,
  BarChart3,
  Filter,
  Search,
  FolderOpen,
  CheckCircle,
  AlertCircle,
  Edit,
  Briefcase,
  ChevronDown
} from 'lucide-react';
import { adminApi, JobApplication, Job, AdminStats } from '@/lib/adminApi';
import { useRouter } from 'next/navigation';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // States
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [selectedApplications, setSelectedApplications] = useState<number[]>([]);
  const [selectedJobs, setSelectedJobs] = useState<number[]>([]);
  const [filterJobId, setFilterJobId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog states
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState('');
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);
  const [applicantsOpen, setApplicantsOpen] = useState<{ [key: number]: boolean }>({});
  const [selectedApplicantsByJob, setSelectedApplicantsByJob] = useState<{ [key: number]: number[] }>({});
  
  // Employee Management States
  const [employees, setEmployees] = useState<any[]>([]);
  const [timesheets, setTimesheets] = useState<any[]>([]);
  const [visaDocs, setVisaDocs] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [isCreateEmployeeOpen, setIsCreateEmployeeOpen] = useState(false);
  const [isEditEmployeeOpen, setIsEditEmployeeOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  
  // Form states
  const [newJob, setNewJob] = useState({
    title: '',
    location: '',
    description: '',
    visa_constraints: '',
    assessment_url: '',
    job_category: ''
  });

  const [newEmployee, setNewEmployee] = useState({
    username: '',
    password: '',
    employee_name: '',
    email: '',
    employee_id_field: '',
    role: 'employee'
  });

  useEffect(() => {
    checkAuth();
  }, [router]);

  const checkAuth = async () => {
    try {
      const response = await adminApi.checkAuth();
      if (response.logged_in) {
        setIsAuthenticated(true);
        loadDashboardData();
      } else {
        router.push('/admin/login');
      }
    } catch (error) {
      router.push('/admin/login');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      const [applicationsData, jobsData, statsData] = await Promise.all([
        adminApi.getApplications(),
        adminApi.getJobs(),
        adminApi.getStats()
      ]);
      
      setApplications(applicationsData);
      setJobs(jobsData);
      setStats(statsData);
      await loadEmployeeData();
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const loadEmployeeData = async () => {
    try {
      const [employeesData, allTimesheets, allVisaDocs, allActivities, allNotifications] = await Promise.all([
        adminApi.getEmployees(),
        adminApi.getAllTimesheets(),
        adminApi.getAllVisaDocs(),
        adminApi.getAllActivities(),
        adminApi.getAllNotifications()
      ]);
      setEmployees(employeesData);
      setTimesheets(allTimesheets);
      setVisaDocs(allVisaDocs);
      setActivities(allActivities);
      setNotifications(allNotifications);
    } catch (error) {
      console.error('Failed to load employee data:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await adminApi.logout();
      setIsAuthenticated(false);
      // Clear any local state
      setApplications([]);
      setJobs([]);
      setStats(null);
      setSelectedApplications([]);
      setSelectedJobs([]);
      // Redirect to login page
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout API fails, clear local state and redirect
      setIsAuthenticated(false);
      router.push('/admin/login');
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createJob(newJob);
      setNewJob({ title: '', location: '', description: '', visa_constraints: '', assessment_url: '', job_category: '' });
      setIsJobDialogOpen(false);
      setEditingJob(null);
      loadDashboardData();
      alert('Job created successfully!');
    } catch (error) {
      alert('Failed to create job: ' + error);
    }
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setNewJob({
      title: job.title,
      location: job.location,
      description: job.description,
      visa_constraints: job.visa_constraints || '',
      assessment_url: job.assessment_url || '',
      job_category: job.job_category || ''
    });
    setIsJobDialogOpen(true);
  };

  const handleUpdateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;
    
    try {
      // Since there's no update endpoint, we'll create a new job and deactivate the old one
      await adminApi.createJob(newJob);
      await adminApi.deleteJob(editingJob.id);
      
      setNewJob({ title: '', location: '', description: '', visa_constraints: '', assessment_url: '', job_category: '' });
      setIsJobDialogOpen(false);
      setEditingJob(null);
      loadDashboardData();
      alert('Job updated successfully!');
    } catch (error) {
      alert('Failed to update job: ' + error);
    }
  };

  const handleDeleteJobs = async () => {
    if (selectedJobs.length === 0) return;
    
    if (confirm(`Delete ${selectedJobs.length} job(s)?`)) {
      try {
        await Promise.all(selectedJobs.map(id => adminApi.deleteJob(id)));
        setSelectedJobs([]);
        loadDashboardData();
        alert('Jobs deleted successfully!');
      } catch (error) {
        alert('Failed to delete jobs: ' + error);
      }
    }
  };

  const handleDeleteJob = async (jobId: number) => {
    if (confirm('Are you sure you want to delete this job?')) {
      try {
        await adminApi.deleteJob(jobId);
        loadDashboardData();
        alert('Job deleted successfully!');
      } catch (error) {
        alert('Failed to delete job: ' + error);
      }
    }
  };

  const handleDeleteCandidate = async (candidateId: number) => {
    if (confirm('Are you sure you want to delete this candidate?')) {
      try {
        await adminApi.deleteApplication(candidateId);
        setApplications(prev => prev.filter(app => app.id !== candidateId));
        setSelectedApplications(prev => prev.filter(id => id !== candidateId));
        alert('Candidate deleted successfully!');
      } catch (error) {
        alert('Failed to delete candidate: ' + error);
      }
    }
  };

  const handleSelectApplication = (appId: number) => {
    setSelectedApplications(prev => 
      prev.includes(appId) 
        ? prev.filter(id => id !== appId)
        : [...prev, appId]
    );
  };

  const handleSelectAllApplications = () => {
    const filteredApps = getFilteredApplications();
    if (selectedApplications.length === filteredApps.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(filteredApps.map(app => app.id));
    }
  };

  const handleSelectJob = (jobId: number) => {
    setSelectedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const handleSelectAllJobs = () => {
    if (selectedJobs.length === jobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(jobs.map(job => job.id));
    }
  };

  const handleSelectApplicant = (jobId: number, applicantId: number) => {
    setSelectedApplicantsByJob(prev => {
      const current = prev[jobId] || [];
      return {
        ...prev,
        [jobId]: current.includes(applicantId)
          ? current.filter(id => id !== applicantId)
          : [...current, applicantId]
      };
    });
  };

  const handleSelectAllApplicantsForJob = (jobId: number, jobApplicants: JobApplication[]) => {
    setSelectedApplicantsByJob(prev => {
      const current = prev[jobId] || [];
      if (current.length === jobApplicants.length) {
        const newState = { ...prev };
        delete newState[jobId];
        return newState;
      } else {
        return {
          ...prev,
          [jobId]: jobApplicants.map(app => app.id)
        };
      }
    });
  };

  const handleDownloadResume = async (application: JobApplication) => {
    try {
      await adminApi.downloadResume(application.resume_filename);
      handleViewApplication(application);
    } catch (error) {
      alert('Failed to download resume: ' + error);
    }
  };

  const handleBulkDownloadZip = async () => {
    if (selectedApplications.length === 0) return;

    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadStatus('Preparing download...');
    setIsDownloadDialogOpen(true);

    try {
      const selectedApps = applications.filter(app => selectedApplications.includes(app.id));
      
      for (let i = 0; i < selectedApps.length; i++) {
        const app = selectedApps[i];
        setDownloadStatus(`Processing ${app.name}...`);
        setDownloadProgress(((i + 1) / selectedApps.length) * 100);
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setDownloadStatus('Creating ZIP file...');
      await adminApi.downloadMultipleResumes(selectedApplications);
      
      setDownloadStatus('Download complete!');
      setTimeout(() => {
        setIsDownloadDialogOpen(false);
        setIsDownloading(false);
        setDownloadProgress(0);
        setDownloadStatus('');
      }, 2000);

    } catch (error) {
      console.error('Error creating ZIP file:', error);
      setDownloadStatus('Error creating download. Please try again.');
      setTimeout(() => {
        setIsDownloadDialogOpen(false);
        setIsDownloading(false);
        setDownloadProgress(0);
        setDownloadStatus('');
      }, 3000);
    }
  };

  const handleBulkDownloadIndividual = async () => {
    if (selectedApplications.length === 0) return;
    
    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadStatus('Starting individual downloads...');
    setIsDownloadDialogOpen(true);

    const selectedApps = applications.filter(app => selectedApplications.includes(app.id));

    for (let i = 0; i < selectedApps.length; i++) {
      const app = selectedApps[i];
      setDownloadStatus(`Downloading ${app.name}'s resume...`);
      setDownloadProgress(((i + 1) / selectedApps.length) * 100);

      try {
        await adminApi.downloadResume(app.resume_filename);
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error downloading ${app.name}'s resume:`, error);
      }
    }

    setDownloadStatus('All downloads initiated!');
    setTimeout(() => {
      setIsDownloadDialogOpen(false);
      setIsDownloading(false);
      setDownloadProgress(0);
      setDownloadStatus('');
    }, 2000);
  };

  const handleDownloadSelectedResumes = async (jobId: number) => {
    const selectedApplicants = selectedApplicantsByJob[jobId] || [];
    if (selectedApplicants.length === 0) return;

    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadStatus('Preparing downloads...');
    setIsDownloadDialogOpen(true);

    try {
      const selectedApps = applications.filter(app => selectedApplicants.includes(app.id));
      
      for (let i = 0; i < selectedApps.length; i++) {
        const app = selectedApps[i];
        setDownloadStatus(`Processing ${app.name}...`);
        setDownloadProgress(((i + 1) / selectedApps.length) * 100);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setDownloadStatus('Creating ZIP file...');
      await adminApi.downloadMultipleResumes(selectedApplicants);
      
      setDownloadStatus('Download complete!');
      setTimeout(() => {
        setIsDownloadDialogOpen(false);
        setIsDownloading(false);
        setDownloadProgress(0);
        setDownloadStatus('');
        setSelectedApplicantsByJob(prev => {
          const newState = { ...prev };
          delete newState[jobId];
          return newState;
        });
      }, 2000);

    } catch (error) {
      console.error('Error downloading resumes:', error);
      setDownloadStatus('Error creating download. Please try again.');
      setTimeout(() => {
        setIsDownloadDialogOpen(false);
        setIsDownloading(false);
        setDownloadProgress(0);
        setDownloadStatus('');
      }, 3000);
    }
  };

  const handleDownloadApplicantDetails = async (jobId: number) => {
    const selectedApplicants = selectedApplicantsByJob[jobId] || [];
    if (selectedApplicants.length === 0) return;

    try {
      await adminApi.exportToExcel(selectedApplicants);
      setSelectedApplicantsByJob(prev => {
        const newState = { ...prev };
        delete newState[jobId];
        return newState;
      });
    } catch (error) {
      alert('Failed to download details: ' + error);
    }
  };

  const handleBulkDeleteApplications = async () => {
    if (selectedApplications.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedApplications.length} selected candidates? This action cannot be undone.`)) {
      try {
        await adminApi.deleteApplicationsBulk(selectedApplications);
        setApplications(prev => prev.filter(app => !selectedApplications.includes(app.id)));
        setSelectedApplications([]);
        alert('Candidates deleted successfully!');
      } catch (error) {
        alert('Failed to delete candidates: ' + error);
      }
    }
  };

  const handleExportExcel = async () => {
    try {
      await adminApi.exportToExcel(selectedApplications.length > 0 ? selectedApplications : undefined);
    } catch (error) {
      alert('Failed to export Excel: ' + error);
    }
  };

  const handleDownloadDetails = async () => {
    if (selectedApplications.length === 0) return;

    try {
      await adminApi.exportToExcel(selectedApplications);
    } catch (error) {
      alert('Failed to download details: ' + error);
    }
  };

  const handleViewApplication = async (app: JobApplication) => {
    if (!app.viewed) {
      try {
        await adminApi.markApplicationViewed(app.id);
        setApplications(prev => prev.map(a => 
          a.id === app.id ? { ...a, viewed: 1 } : a
        ));
      } catch (error) {
        console.error('Failed to mark as viewed:', error);
      }
    }
  };

  const getFilteredApplications = () => {
    return applications.filter(app => {
      const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.job_title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesJob = filterJobId === 'all' || app.job_id === parseInt(filterJobId);
      return matchesSearch && matchesJob;
    });
  };

  const getStatusBadgeColor = (viewed: number) => {
    return viewed ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
  };

  const clearSelection = () => {
    setSelectedApplications([]);
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createEmployee(newEmployee);
      setNewEmployee({ username: '', password: '', employee_name: '', email: '', employee_id_field: '', role: 'employee' });
      setIsCreateEmployeeOpen(false);
      loadEmployeeData();
      alert('Employee created successfully!');
    } catch (error) {
      alert('Failed to create employee: ' + error);
    }
  };

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;
    try {
      await adminApi.updateEmployee(editingEmployee.id, newEmployee);
      setNewEmployee({ username: '', password: '', employee_name: '', email: '', employee_id_field: '', role: 'employee' });
      setIsEditEmployeeOpen(false);
      setEditingEmployee(null);
      loadEmployeeData();
      alert('Employee updated successfully!');
    } catch (error) {
      alert('Failed to update employee: ' + error);
    }
  };

  const handleDeleteEmployee = async (employeeId: number) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      try {
        await adminApi.deleteEmployee(employeeId);
        loadEmployeeData();
        alert('Employee deleted successfully!');
      } catch (error) {
        alert('Failed to delete employee: ' + error);
      }
    }
  };

  const handleEditEmployee = (employee: any) => {
    setEditingEmployee(employee);
    setNewEmployee({
      username: employee.username,
      password: '',
      employee_name: employee.employee_name,
      email: employee.email || '',
      employee_id_field: employee.employee_id_field || '',
      role: employee.role || 'employee'
    });
    setIsEditEmployeeOpen(true);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const filteredApplications = getFilteredApplications();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Add top padding to account for the fixed header */}
      <div className="pt-24 pb-6 px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Header - positioned to avoid overlap */}
          <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">BrainHR IT Solutions</h1>
              <p className="text-gray-600">Admin Dashboard</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-sm">
                <Users className="w-4 h-4 mr-1" />
                {applications.length} Candidates
              </Badge>
              <Badge variant="outline" className="text-sm">
                <Briefcase className="w-4 h-4 mr-1" />
                {jobs.filter(job => job.active).length} Active Jobs
              </Badge>
              <Button onClick={handleLogout} variant="outline" className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_applications}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unviewed Applications</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.unviewed_applications}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{jobs.filter(job => job.active).length}</div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="candidates" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 overflow-auto">
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="employees">Employees</TabsTrigger>
          </TabsList>

          {/* Candidates Tab */}
          <TabsContent value="candidates" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Candidate Profiles</h2>
            </div>

            {/* Bulk Operations */}
            {selectedApplications.length > 0 && (
              <div className="flex items-center space-x-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">
                    {selectedApplications.length} candidate{selectedApplications.length > 1 ? 's' : ''} selected
                  </p>
                  <p className="text-xs text-blue-700">
                    Choose an action to perform on the selected candidates
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Dialog open={isDownloadDialogOpen} onOpenChange={setIsDownloadDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" onClick={handleBulkDownloadZip}>
                        <FolderOpen className="w-4 h-4 mr-2" />
                        Download as ZIP
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Bulk Download Progress</DialogTitle>
                        <DialogDescription>
                          Downloading resumes for {selectedApplications.length} selected candidates
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>{downloadStatus}</span>
                            <span>{Math.round(downloadProgress)}%</span>
                          </div>
                          <Progress value={downloadProgress} className="w-full" />
                        </div>
                        {downloadProgress === 100 && (
                          <Alert>
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>
                              Download completed successfully! Check your downloads folder.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" onClick={handleBulkDownloadIndividual}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Individual
                  </Button>

                  <Button variant="outline" onClick={handleDownloadDetails} className="text-blue-600 hover:text-blue-800">
                    <FileText className="w-4 h-4 mr-2" />
                    Download Details
                  </Button>

                  <Button variant="destructive" onClick={handleBulkDeleteApplications}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Selected
                  </Button>

                  <Button variant="ghost" onClick={clearSelection}>
                    Clear Selection
                  </Button>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="flex space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search candidates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterJobId} onValueChange={setFilterJobId}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by job" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jobs</SelectItem>
                  {jobs.filter(job => job.active).map((job) => (
                    <SelectItem key={job.id} value={job.id.toString()}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Candidates Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedApplications.length === filteredApplications.length && filteredApplications.length > 0}
                            onCheckedChange={handleSelectAllApplications}
                          />
                        </TableHead>
                        <TableHead>Candidate</TableHead>
                        <TableHead>Job Applied</TableHead>
                        <TableHead>Experience</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Applied Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map((app) => (
                        <TableRow key={app.id} className="hover:bg-gray-50">
                          <TableCell>
                            <Checkbox
                              checked={selectedApplications.includes(app.id)}
                              onCheckedChange={() => handleSelectApplication(app.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{app.name}</div>
                              <div className="text-sm text-gray-500">{app.email}</div>
                              <div className="text-sm text-gray-500">{app.contact_no}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-900">{app.job_title}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-900">{app.experience_years} years</div>
                            <div className="text-sm text-gray-500">{app.location}</div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusBadgeColor(app.viewed)}>
                              {app.viewed ? 'Viewed' : 'New'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {new Date(app.applied_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadResume(app)}
                              >
                                <FileText className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteCandidate(app.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Job Management</h2>
              <Dialog open={isJobDialogOpen} onOpenChange={setIsJobDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingJob(null);
                    setNewJob({ title: '', location: '', description: '', visa_constraints: '', assessment_url: '', job_category: '' });
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Job
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingJob ? 'Edit Job' : 'Create New Job'}</DialogTitle>
                    <DialogDescription>
                      {editingJob ? 'Update the job details below.' : 'Fill in the details to create a new job listing.'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={editingJob ? handleUpdateJob : handleCreateJob} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Job Title</Label>
                        <Input
                          id="title"
                          value={newJob.title}
                          onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                          placeholder="e.g. Senior React Developer"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={newJob.location}
                          onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                          placeholder="e.g. Remote"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Job Description</Label>
                      <Textarea
                        id="description"
                        value={newJob.description}
                        onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                        placeholder="Describe the role and responsibilities..."
                        rows={4}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="job_category">Job Category</Label>
                        <Select 
                          value={newJob.job_category} 
                          onValueChange={(value) => setNewJob({...newJob, job_category: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select job category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="US Jobs">US Jobs</SelectItem>
                            <SelectItem value="Indian Jobs">Indian Jobs</SelectItem>
                            <SelectItem value="Internships">Internships</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="assessment_url">Assessment URL (Optional)</Label>
                        <Input
                          id="assessment_url"
                          type="url"
                          value={newJob.assessment_url}
                          onChange={(e) => setNewJob({...newJob, assessment_url: e.target.value})}
                          placeholder="https://assessment-platform.com/test"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="visa_constraints">Visa Requirements (Optional)</Label>
                      <Textarea
                        id="visa_constraints"
                        value={newJob.visa_constraints}
                        onChange={(e) => setNewJob({...newJob, visa_constraints: e.target.value})}
                        placeholder="Any visa or work authorization requirements..."
                        rows={2}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsJobDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingJob ? 'Update Job' : 'Create Job'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Bulk Job Operations */}
            {selectedJobs.length > 0 && (
              <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">
                    {selectedJobs.length} job{selectedJobs.length > 1 ? 's' : ''} selected
                  </p>
                </div>
                <Button variant="destructive" onClick={handleDeleteJobs}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected
                </Button>
                <Button variant="ghost" onClick={() => setSelectedJobs([])}>
                  Clear Selection
                </Button>
              </div>
            )}

            {/* Jobs Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedJobs.length === jobs.length && jobs.length > 0}
                            onCheckedChange={handleSelectAllJobs}
                          />
                        </TableHead>
                        <TableHead>Job Title</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Applications</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobs.map((job) => {
                        const jobApplicants = applications.filter(app => app.job_id === job.id);
                        return (
                          <React.Fragment key={job.id}>
                            <TableRow className="hover:bg-gray-50">
                              <TableCell>
                                <Checkbox
                                  checked={selectedJobs.includes(job.id)}
                                  onCheckedChange={() => handleSelectJob(job.id)}
                                />
                              </TableCell>
                              <TableCell>
                                <div className="text-sm font-medium text-gray-900">{job.title}</div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-gray-900">{job.location}</div>
                              </TableCell>
                              <TableCell>
                                <button
                                  onClick={() => setApplicantsOpen(prev => ({ ...prev, [job.id]: !prev[job.id] }))}
                                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                                >
                                  <ChevronDown className={`w-4 h-4 transition-transform ${applicantsOpen[job.id] ? 'rotate-180' : ''}`} />
                                  <Badge variant="outline">
                                    {jobApplicants.length} applications
                                  </Badge>
                                </button>
                              </TableCell>
                              <TableCell>
                                <Badge variant={job.active ? 'default' : 'secondary'}>
                                  {job.active ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-gray-500">
                                {new Date(job.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditJob(job)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteJob(job.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>

                            {applicantsOpen[job.id] && (
                              <TableRow className="bg-gray-50">
                                <TableCell colSpan={7}>
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                      <h4 className="font-semibold text-sm">Job Applicants</h4>
                                      {jobApplicants.length > 0 && (
                                        <div className="flex gap-2">
                                          {(selectedApplicantsByJob[job.id] || []).length > 0 && (
                                            <>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDownloadSelectedResumes(job.id)}
                                                className="text-green-600 hover:text-green-800"
                                              >
                                                <Download className="w-4 h-4 mr-1" />
                                                Download Selected Resumes ({(selectedApplicantsByJob[job.id] || []).length})
                                              </Button>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDownloadApplicantDetails(job.id)}
                                                className="text-blue-600 hover:text-blue-800"
                                              >
                                                <FileText className="w-4 h-4 mr-1" />
                                                Download Details ({(selectedApplicantsByJob[job.id] || []).length})
                                              </Button>
                                            </>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    {jobApplicants.length === 0 ? (
                                      <div className="text-center py-4 text-gray-600">No applicants yet</div>
                                    ) : (
                                      <div className="overflow-x-auto">
                                        <Table className="text-sm">
                                          <TableHeader>
                                            <TableRow className="bg-white hover:bg-white">
                                              <TableHead className="w-8">
                                                <Checkbox
                                                  checked={(selectedApplicantsByJob[job.id] || []).length === jobApplicants.length && jobApplicants.length > 0}
                                                  onCheckedChange={() => handleSelectAllApplicantsForJob(job.id, jobApplicants)}
                                                />
                                              </TableHead>
                                              <TableHead>Name</TableHead>
                                              <TableHead>Email</TableHead>
                                              <TableHead>Contact</TableHead>
                                              <TableHead>Location</TableHead>
                                              <TableHead>Experience</TableHead>
                                              <TableHead>Resume</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {jobApplicants.map((applicant) => (
                                              <TableRow key={applicant.id} className="text-xs hover:bg-gray-100">
                                                <TableCell>
                                                  <Checkbox
                                                    checked={(selectedApplicantsByJob[job.id] || []).includes(applicant.id)}
                                                    onCheckedChange={() => handleSelectApplicant(job.id, applicant.id)}
                                                  />
                                                </TableCell>
                                                <TableCell>{applicant.name}</TableCell>
                                                <TableCell>{applicant.email}</TableCell>
                                                <TableCell>{applicant.contact_no || '-'}</TableCell>
                                                <TableCell>{applicant.location || '-'}</TableCell>
                                                <TableCell>{applicant.experience_years ? `${applicant.experience_years}y` : '-'}</TableCell>
                                                <TableCell>
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => adminApi.downloadResume(applicant.resume_filename)}
                                                    className="text-green-600 hover:text-green-800"
                                                  >
                                                    <Download className="w-3 h-3" />
                                                  </Button>
                                                </TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Courses Management</h2>
              <div>
                <Button
                  onClick={() => {
                    console.log("Add Courses button clicked");
                    router.push('/admin/courses');
                  }}
                  className="bg-orange-600 hover:bg-orange-700"
                  type="button"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Courses
                </Button>
              </div>
            </div>
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  <p className="mb-2">Courses management interface is loading...</p>
                  <p className="text-sm">Navigate to the Courses admin page for full course management capabilities.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Employees Tab */}
          <TabsContent value="employees" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Employee Management</h2>
              <Button 
                onClick={() => router.push('/admin/employees')}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Manage Employees
              </Button>
            </div>

            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-600 mb-4">Access the comprehensive employee management system</p>
                <Button 
                  onClick={() => router.push('/admin/employees')}
                  size="lg"
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Go to Employees Management
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
  );
}
