// lib/adminApi.ts - Admin API client for BrainHR backend
// If you want to override the backend base URL, set:
//   NEXT_PUBLIC_API_BASE (preferred) or NEXT_PUBLIC_API_URL
// Fallback: http://localhost:5000
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

export interface JobApplication {
  id: number;
  name: string;
  email: string;
  contact_no: string;
  linkedin: string;
  location: string;
  visa_status: string;
  relocation: string;
  experience_years: number;
  job_id: number;
  job_title: string;
  resume_filename: string;
  applied_at: string;
  viewed: number;
}

export interface Job {
  id: number;
  title: string;
  location: string;
  description: string;
  visa_constraints: string;
  assessment_url?: string;
  job_category?: string;
  active: number;
  created_at: string;
}

export interface Course {
  id: number;
  title: string;
  category: string;
  description?: string;
  thumbnail_url?: string;
  video_url?: string;
  key_skills?: string;
  programming_languages?: string;
  course_duration?: string;
  total_sessions?: string;
  session_duration?: string;
  level?: string;
  target_audience?: string;
  mode?: string;
  course_contents?: string;
  what_you_will_learn?: string;
  created_at: string;
}

export interface AdminStats {
  total_applications: number;
  unviewed_applications: number;
  job_stats: Array<{
    job_title: string;
    count: number;
    unviewed: number;
  }>;
}

class AdminApi {
  private async fetchWithCredentials(url: string, options: RequestInit = {}) {
    try {
      const response = await fetch(`${API_BASE}${url}`, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Request failed';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }
      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  async login(username: string, password: string) {
    return this.fetchWithCredentials('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async logout() {
    return this.fetchWithCredentials('/api/admin/logout', {
      method: 'POST',
    });
  }

  async checkAuth() {
    return this.fetchWithCredentials('/api/admin/check');
  }

  async getAdminInfo() {
    return this.fetchWithCredentials('/api/admin/me');
  }

  async getJobs(): Promise<Job[]> {
    return this.fetchWithCredentials('/api/admin/jobs');
  }

  async createJob(jobData: {
    title: string;
    location: string;
    description: string;
    visa_constraints?: string;
    assessment_url?: string;
    job_category?: string;
  }) {
    return this.fetchWithCredentials('/api/admin/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  async getCourses(category?: string): Promise<Course[]> {
    const url = category ? `/api/admin/courses?category=${category}` : '/api/admin/courses';
    return this.fetchWithCredentials(url);
  }

  async createCourse(courseData: {
    title: string;
    category: string;
    description?: string;
    thumbnail_url?: string;
    video_url?: string;
    key_skills?: string;
    programming_languages?: string;
  }) {
    return this.fetchWithCredentials('/api/admin/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  }

  async createCourseWithFile(formData: FormData) {
    const response = await fetch(`${API_BASE}/api/admin/courses`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Failed to create course';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return response.json();
    }
    return response.text();
  }

  async updateCourseWithFile(courseId: number, formData: FormData) {
    try {
      const response = await fetch(`${API_BASE}/api/admin/courses/${courseId}`, {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Failed to update course (${response.status})`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return response.json();
      }
      return response.text();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to update course');
    }
  }

  async archiveCourse(courseId: number) {
    return this.fetchWithCredentials(`/api/admin/courses/${courseId}/archive`, {
      method: 'POST',
    });
  }

  async deleteCourse(courseId: number) {
    return this.fetchWithCredentials(`/api/admin/courses/${courseId}`, {
      method: 'DELETE',
    });
  }

  async deleteJob(jobId: number) {
    return this.fetchWithCredentials(`/api/admin/jobs/${jobId}`, {
      method: 'DELETE',
    });
  }

  async deleteApplication(applicationId: number) {
    return this.fetchWithCredentials(`/api/admin/applications/${applicationId}`, {
      method: 'DELETE',
    });
  }

  async deleteApplicationsBulk(applicationIds: number[]) {
    return this.fetchWithCredentials('/api/admin/applications/delete', {
      method: 'POST',
      body: JSON.stringify({ application_ids: applicationIds }),
    });
  }

  async getApplications(jobId?: number): Promise<JobApplication[]> {
    const url = jobId ? `/api/admin/applications?job_id=${jobId}` : '/api/admin/applications';
    return this.fetchWithCredentials(url);
  }

  async markApplicationViewed(applicationId: number) {
    return this.fetchWithCredentials(`/api/admin/applications/${applicationId}/view`, {
      method: 'POST',
    });
  }

  async downloadResume(filename: string) {
    try {
      const response = await fetch(`${API_BASE}/api/admin/download/resume/${filename}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      throw new Error('Failed to download file');
    }
  }

  async downloadMultipleResumes(applicationIds: number[]) {
    try {
      const response = await fetch(`${API_BASE}/api/admin/download/resumes`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ application_ids: applicationIds }),
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'selected_resumes.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      throw new Error('Failed to download resumes');
    }
  }

  async exportToExcel(applicationIds?: number[]) {
    try {
      const response = await fetch(`${API_BASE}/api/admin/export/excel`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ application_ids: applicationIds || [] }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'applications.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      throw new Error('Failed to export Excel file');
    }
  }

  async getStats(): Promise<AdminStats> {
    return this.fetchWithCredentials('/api/admin/stats');
  }

  async getCourseEnrollments(courseId: number) {
    return this.fetchWithCredentials(`/api/admin/enrollments/${courseId}`);
  }

  async exportEnrollmentsToExcel(courseId: number, enrollmentIds?: number[]) {
    try {
      const response = await fetch(`${API_BASE}/api/admin/enrollments/export/excel`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ course_id: courseId, enrollment_ids: enrollmentIds || [] }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'enrollments.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      throw new Error('Failed to export Excel file');
    }
  }

  async employeeLogin(employee_id: string, username: string, password: string) {
    return this.fetchWithCredentials('/api/employee/login', {
      method: 'POST',
      body: JSON.stringify({ employee_id, username, password }),
    });
  }

  async employeeLogout() {
    return this.fetchWithCredentials('/api/employee/logout', {
      method: 'POST',
    });
  }

  async employeeCheckAuth() {
    return this.fetchWithCredentials('/api/employee/check');
  }

  async getEmployeeInfo() {
    return this.fetchWithCredentials('/api/employee/me');
  }

  async managerLogin(username: string, password: string) {
    return this.fetchWithCredentials('/api/manager/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async managerLogout() {
    return this.fetchWithCredentials('/api/manager/logout', {
      method: 'POST',
    });
  }

  async managerCheckAuth() {
    return this.fetchWithCredentials('/api/manager/check');
  }

  async getManagerInfo() {
    return this.fetchWithCredentials('/api/manager/me');
  }

  async getEmployees(): Promise<any[]> {
    return this.fetchWithCredentials('/api/admin/employees');
  }

  async createEmployee(data: { username: string; password: string; employee_name: string; employee_id_field: string; email?: string; role?: string }) {
    return this.fetchWithCredentials('/api/admin/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEmployee(employeeId: number, data: { password?: string; employee_name?: string; email?: string }) {
    return this.fetchWithCredentials(`/api/admin/employees/${employeeId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEmployee(employeeId: number) {
    return this.fetchWithCredentials(`/api/admin/employees/${employeeId}`, {
      method: 'DELETE',
    });
  }

  async resetEmployeePassword(employeeId: number): Promise<{ temporary_password: string }> {
    return this.fetchWithCredentials(`/api/admin/employees/${employeeId}/reset-password`, {
      method: 'POST',
    });
  }

  async getEmployeeTimesheets(): Promise<any[]> {
    return this.fetchWithCredentials('/api/employee/timesheets');
  }

  async getAllTimesheets(employeeId?: number): Promise<any[]> {
    const url = employeeId ? `/api/admin/timesheets?employee_id=${employeeId}` : '/api/admin/timesheets';
    return this.fetchWithCredentials(url);
  }

  async uploadTimesheet(formData: FormData) {
    try {
      const response = await fetch(`${API_BASE}/api/employee/timesheets`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Upload failed';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return response.json();
      }
      return response.text();
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('Failed to upload timesheet');
    }
  }

  async submitTimesheet(timesheetId: number) {
    return this.fetchWithCredentials(`/api/employee/timesheets/${timesheetId}/submit`, {
      method: 'POST',
    });
  }

  async getEmployeeVisaDocs(): Promise<any[]> {
    return this.fetchWithCredentials('/api/employee/visa-docs');
  }

  async getAllVisaDocs(employeeId?: number): Promise<any[]> {
    const url = employeeId ? `/api/admin/visa-docs?employee_id=${employeeId}` : '/api/admin/visa-docs';
    return this.fetchWithCredentials(url);
  }

  async uploadVisaDoc(formData: FormData) {
    try {
      const response = await fetch(`${API_BASE}/api/employee/visa-docs`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Upload failed';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return response.json();
      }
      return response.text();
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('Failed to upload visa document');
    }
  }

  async downloadVisaDoc(docId: number) {
    try {
      const response = await fetch(`${API_BASE}/api/admin/visa-docs/download/${docId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const contentDisposition = response.headers.get('content-disposition');
      a.download = contentDisposition ? contentDisposition.split('filename=')[1] : `document_${docId}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      throw new Error('Failed to download visa document');
    }
  }

  async downloadMultipleVisaDocs(docIds: number[]) {
    try {
      const response = await fetch(`${API_BASE}/api/admin/visa-docs/download-multiple`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doc_ids: docIds }),
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'visa_docs.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      throw new Error('Failed to download visa documents');
    }
  }

  async downloadTimesheet(timesheetId: number) {
    try {
      const response = await fetch(`${API_BASE}/api/admin/timesheets/download/${timesheetId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const contentDisposition = response.headers.get('content-disposition');
      a.download = contentDisposition ? contentDisposition.split('filename=')[1] : `timesheet_${timesheetId}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      throw new Error('Failed to download timesheet');
    }
  }

  async downloadMultipleTimesheets(timesheetIds: number[]) {
    try {
      const response = await fetch(`${API_BASE}/api/admin/timesheets/download-multiple`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timesheet_ids: timesheetIds }),
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'timesheets.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      throw new Error('Failed to download timesheets');
    }
  }

  async getEmployeeActivities(): Promise<any[]> {
    return this.fetchWithCredentials('/api/employee/activities');
  }

  async getEmployeeManagers(): Promise<any[]> {
    return this.fetchWithCredentials('/api/employee/managers');
  }

  async getAllActivities(employeeId?: number): Promise<any[]> {
    const url = employeeId ? `/api/admin/activities?employee_id=${employeeId}` : '/api/admin/activities';
    return this.fetchWithCredentials(url);
  }

  async createActivity(data: { activity_name: string; activity_description?: string }) {
    return this.fetchWithCredentials('/api/employee/activities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAllNotifications(employeeId?: number): Promise<any[]> {
    const url = employeeId ? `/api/admin/notifications?employee_id=${employeeId}` : '/api/admin/notifications';
    return this.fetchWithCredentials(url);
  }

  async markNotificationRead(notificationId: number) {
    return this.fetchWithCredentials(`/api/admin/notifications/${notificationId}/mark-read`, {
      method: 'POST',
    });
  }

  async createMessage(data: { 
    context: string; 
    context_id?: number; 
    message: string; 
    sender?: string; 
    sender_name?: string; 
    sender_id?: number;
    sender_type?: string;
    receiver_id?: number;
    receiver_type?: string;
    employee_id?: number 
  }) {
    return this.fetchWithCredentials('/api/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMessages(context: string, contextId?: number): Promise<any[]> {
    let url = `/api/messages?context=${context}`;
    if (contextId) url += `&context_id=${contextId}`;
    return this.fetchWithCredentials(url);
  }

  async getEmployeeMessages(context?: string): Promise<any[]> {
    let url = '/api/employee/my-messages';
    if (context) url += `?context=${context}`;
    return this.fetchWithCredentials(url);
  }

  async getManagerMessages(context?: string): Promise<any[]> {
    let url = '/api/manager/my-messages';
    if (context) url += `?context=${context}`;
    return this.fetchWithCredentials(url);
  }

  async getAdminMessages(context?: string): Promise<any[]> {
    let url = '/api/admin/my-messages';
    if (context) url += `?context=${context}`;
    return this.fetchWithCredentials(url);
  }

  async getUnreadCount(): Promise<{ unread_count: number }> {
    return this.fetchWithCredentials('/api/unread-count');
  }

  async markMessageRead(messageId: number) {
    return this.fetchWithCredentials(`/api/messages/mark-read/${messageId}`, {
      method: 'POST',
    });
  }

  async getAllEmployeeMessages(empId: number): Promise<any[]> {
    try {
      const messages = await this.fetchWithCredentials(`/api/manager/employee-messages/${empId}`);
      return messages.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('Failed to get employee messages');
    }
  }

  async getManagers(): Promise<any[]> {
    return this.fetchWithCredentials('/api/admin/managers');
  }

  async createManager(data: { username: string; password: string; employee_name: string; email?: string }) {
    return this.fetchWithCredentials('/api/admin/managers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateManager(managerId: number, data: { password?: string; employee_name?: string; email?: string }) {
    return this.fetchWithCredentials(`/api/admin/managers/${managerId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteManager(managerId: number) {
    return this.fetchWithCredentials(`/api/admin/managers/${managerId}`, {
      method: 'DELETE',
    });
  }

  async resetManagerPassword(managerId: number): Promise<{ temporary_password: string }> {
    return this.fetchWithCredentials(`/api/admin/managers/${managerId}/reset-password`, {
      method: 'POST',
    });
  }
}

export const adminApi = new AdminApi();

// Public API for job applications
export class PublicApi {
  async getJobs(): Promise<Job[]> {
    try {
      const response = await fetch(`${API_BASE}/api/jobs`);
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw new Error('Failed to load jobs');
    }
  }

  async getCourses(category?: string, search?: string): Promise<Course[]> {
    try {
      let url = `${API_BASE}/api/public/courses`;
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw new Error('Failed to load courses');
    }
  }

  async submitApplication(formData: FormData) {
    try {
      const response = await fetch(`${API_BASE}/api/apply`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Application failed';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to submit application');
    }
  }

  async enrollCourse(formData: FormData) {
    try {
      const response = await fetch(`${API_BASE}/api/enroll`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Enrollment failed';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to submit enrollment');
    }
  }
}

export const publicApi = new PublicApi();