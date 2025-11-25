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

export default function ManagerDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [selectedApplications, setSelectedApplications] = useState<number[]>([]);
  const [selectedJobs, setSelectedJobs] = useState<number[]>([]);
  const [filterJobId, setFilterJobId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState('');
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);
  const [applicantsOpen, setApplicantsOpen] = useState<{ [key: number]: boolean }>({});
  const [selectedApplicantsByJob, setSelectedApplicantsByJob] = useState<{ [key: number]: number[] }>({});
  
  const [employees, setEmployees] = useState<any[]>([]);
  const [timesheets, setTimesheets] = useState<any[]>([]);
  const [visaDocs, setVisaDocs] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  const [newJob, setNewJob] = useState({
    title: '',
    location: '',
    description: '',
    visa_constraints: '',
    assessment_url: '',
    job_category: ''
  });

  useEffect(() => {
    checkAuth();
  }, [router]);

  const checkAuth = async () => {
    try {
      const response = await adminApi.managerCheckAuth();
      if (response.logged_in) {
        setIsAuthenticated(true);
        loadDashboardData();
      } else {
        router.push('/manager/login');
      }
    } catch (error) {
      router.push('/manager/login');
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
      await adminApi.managerLogout();
      setIsAuthenticated(false);
      setApplications([]);
      setJobs([]);
      setStats(null);
      setSelectedApplications([]);
      setSelectedJobs([]);
      router.push('/manager/login');
    } catch (error) {
      console.error('Logout failed:', error);
      setIsAuthenticated(false);
      router.push('/manager/login');
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

  const handleDownloadDetails = async () => {
    if (selectedApplications.length === 0) return;

    const selectedApps = applications.filter(app => selectedApplications.includes(app.id));
    const csvContent = [
      ['Name', 'Email', 'Contact', 'Location', 'Experience', 'Job Applied', 'Visa Status', 'Applied Date'],
      ...selectedApps.map(app => [
        app.name,
        app.email,
        app.contact_no,
        app.location,
        `${app.experience_years} years`,
        app.job_title,
        app.visa_status,
        new Date(app.applied_at).toLocaleDateString()
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'candidate-details.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleDownloadSelectedResumes = async (jobId: number) => {
    const selectedIds = selectedApplicantsByJob[jobId] || [];
    if (selectedIds.length === 0) return;

    try {
      await adminApi.downloadMultipleResumes(selectedIds);
    } catch (error) {
      alert('Failed to download resumes: ' + error);
    }
  };

  const handleDownloadApplicantDetails = async (jobId: number) => {
    const selectedIds = selectedApplicantsByJob[jobId] || [];
    const selectedApps = applications.filter(app => selectedIds.includes(app.id));

    const csvContent = [
      ['Name', 'Email', 'Contact', 'Location', 'Experience', 'Visa Status', 'Applied Date'],
      ...selectedApps.map(app => [
        app.name,
        app.email,
        app.contact_no,
        app.location,
        `${app.experience_years} years`,
        app.visa_status,
        new Date(app.applied_at).toLocaleDateString()
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `applicants-${jobId}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleViewApplication = async (application: JobApplication) => {
    if (!application.viewed) {
      try {
        await adminApi.markApplicationViewed(application.id);
        setApplications(prev =>
          prev.map(app =>
            app.id === application.id ? { ...app, viewed: 1 } : app
          )
        );
      } catch (error) {
        console.error('Failed to mark application as viewed:', error);
      }
    }
  };

  const handleBulkDeleteApplications = async () => {
    if (selectedApplications.length === 0) return;

    if (confirm(`Delete ${selectedApplications.length} candidate(s)?`)) {
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

  const clearSelection = () => {
    setSelectedApplications([]);
  };

  const getFilteredApplications = () => {
    return applications.filter(app => {
      const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterJobId === 'all' || app.job_id === parseInt(filterJobId);
      return matchesSearch && matchesFilter;
    });
  };

  const getStatusBadgeColor = (viewed: number) => {
    return viewed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  const filteredApplications = getFilteredApplications();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">You must be logged in to access the manager dashboard.</p>
            <Button onClick={() => router.push('/manager/login')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-20">
      <div className="container mx-auto px-4">
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-gray-900">BrainHR Manager Dashboard</h1>
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

            {selectedApplications.length > 0 && (
              <div className="flex items-center space-x-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">
                    {selectedApplications.length} candidate{selectedApplications.length > 1 ? 's' : ''} selected
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
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>{downloadStatus}</span>
                            <span>{Math.round(downloadProgress)}%</span>
                          </div>
                          <Progress value={downloadProgress} className="w-full" />
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" onClick={handleBulkDownloadIndividual}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Individual
                  </Button>

                  <Button variant="outline" onClick={handleDownloadDetails}>
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
                        <Input
                          id="job_category"
                          value={newJob.job_category}
                          onChange={(e) => setNewJob({...newJob, job_category: e.target.value})}
                          placeholder="e.g. IT, Finance"
                        />
                      </div>
                      <div>
                        <Label htmlFor="visa_constraints">Visa Constraints</Label>
                        <Input
                          id="visa_constraints"
                          value={newJob.visa_constraints}
                          onChange={(e) => setNewJob({...newJob, visa_constraints: e.target.value})}
                          placeholder="e.g. Visa sponsorship available"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="assessment_url">Assessment URL</Label>
                      <Input
                        id="assessment_url"
                        value={newJob.assessment_url}
                        onChange={(e) => setNewJob({...newJob, assessment_url: e.target.value})}
                        placeholder="e.g. https://assessment.example.com"
                        type="url"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <Button type="button" variant="outline" onClick={() => setIsJobDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                        {editingJob ? 'Update Job' : 'Create Job'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

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
                        <TableHead>Applicants</TableHead>
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
              <Button
                onClick={() => router.push('/manager/courses')}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Courses
              </Button>
            </div>
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  <p className="mb-2">Courses management interface</p>
                  <p className="text-sm">Navigate to the Courses manager page for full course management capabilities.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Employees Tab */}
          <TabsContent value="employees" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Employee Management</h2>
              <Button 
                onClick={() => router.push('/manager/employees')}
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
                  onClick={() => router.push('/manager/employees')}
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
