"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus, Upload, Edit, ChevronDown, Download, ArrowLeft } from 'lucide-react';
import { adminApi, Course } from '@/lib/adminApi';

export default function CoursesAdminPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [editThumbnailPreview, setEditThumbnailPreview] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [enrollmentsOpen, setEnrollmentsOpen] = useState<{ [key: number]: boolean }>({});
  const [enrollments, setEnrollments] = useState<{ [key: number]: any[] }>({});
  const [loadingEnrollments, setLoadingEnrollments] = useState<{ [key: number]: boolean }>({});
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    thumbnail_url: '',
    thumbnail_file: null as File | null,
    video_url: '',
    key_skills: '',
    programming_languages: '',
    course_duration: '',
    total_sessions: '',
    session_duration: '',
    level: 'Beginner',
    target_audience: '',
    mode: 'Virtual',
    course_contents: '',
    what_you_will_learn: ''
  });

  const [editFormData, setEditFormData] = useState({
    title: '',
    category: '',
    description: '',
    thumbnail_url: '',
    thumbnail_file: null as File | null,
    video_url: '',
    key_skills: '',
    programming_languages: '',
    course_duration: '',
    total_sessions: '',
    session_duration: '',
    level: 'Beginner',
    target_audience: '',
    mode: 'Virtual',
    course_contents: '',
    what_you_will_learn: ''
  });

  useEffect(() => {
    setIsMounted(true);
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await adminApi.checkAuth();
      if (response.logged_in) {
        setIsAuthenticated(true);
        loadCourses();
      } else {
        router.push('/admin/login');
      }
    } catch (error) {
      router.push('/admin/login');
    } finally {
      setIsCheckingAuth(false);
    }
  };

  useEffect(() => {
    if (selectedCategory) {
      setFilteredCourses(courses.filter(c => c.category === selectedCategory));
    } else {
      setFilteredCourses(courses);
    }
  }, [selectedCategory, courses]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getCourses();
      setCourses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, thumbnail_file: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category) {
      setError('Title and Category are required');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('video_url', formData.video_url);
      formDataToSend.append('key_skills', formData.key_skills);
      formDataToSend.append('programming_languages', formData.programming_languages);
      formDataToSend.append('course_duration', formData.course_duration);
      formDataToSend.append('total_sessions', formData.total_sessions);
      formDataToSend.append('session_duration', formData.session_duration);
      formDataToSend.append('level', formData.level);
      formDataToSend.append('target_audience', formData.target_audience);
      formDataToSend.append('mode', formData.mode);
      formDataToSend.append('course_contents', formData.course_contents);
      formDataToSend.append('what_you_will_learn', formData.what_you_will_learn);
      
      if (formData.thumbnail_file) {
        formDataToSend.append('thumbnail', formData.thumbnail_file);
      } else if (formData.thumbnail_url) {
        formDataToSend.append('thumbnail_url', formData.thumbnail_url);
      }

      const response = await adminApi.createCourseWithFile(formDataToSend);
      
      setFormData({
        title: '',
        category: '',
        description: '',
        thumbnail_url: '',
        thumbnail_file: null,
        video_url: '',
        key_skills: '',
        programming_languages: '',
        course_duration: '',
        total_sessions: '',
        session_duration: '',
        level: 'Beginner',
        target_audience: '',
        mode: 'Virtual',
        course_contents: '',
        what_you_will_learn: ''
      });
      setThumbnailPreview('');
      setIsCreateOpen(false);
      setSuccess('Course created successfully!');
      await loadCourses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create course';
      setError(errorMessage);
      console.error('Course creation error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourseId(course.id);
    setEditFormData({
      title: course.title || '',
      category: course.category || '',
      description: course.description || '',
      thumbnail_url: course.thumbnail_url || '',
      thumbnail_file: null,
      video_url: course.video_url || '',
      key_skills: course.key_skills || '',
      programming_languages: course.programming_languages || '',
      course_duration: course.course_duration || '',
      total_sessions: course.total_sessions || '',
      session_duration: course.session_duration || '',
      level: course.level || 'Beginner',
      target_audience: course.target_audience || '',
      mode: course.mode || 'Virtual',
      course_contents: course.course_contents || '',
      what_you_will_learn: course.what_you_will_learn || ''
    });
    setEditThumbnailPreview(course.thumbnail_url || '');
    setIsEditOpen(true);
  };

  const handleEditThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditFormData(prev => ({ ...prev, thumbnail_file: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editFormData.title || !editFormData.category) {
      setError('Title and Category are required');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!editingCourseId) return;

    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', editFormData.title);
      formDataToSend.append('category', editFormData.category);
      formDataToSend.append('description', editFormData.description);
      formDataToSend.append('video_url', editFormData.video_url);
      formDataToSend.append('key_skills', editFormData.key_skills);
      formDataToSend.append('programming_languages', editFormData.programming_languages);
      formDataToSend.append('course_duration', editFormData.course_duration);
      formDataToSend.append('total_sessions', editFormData.total_sessions);
      formDataToSend.append('session_duration', editFormData.session_duration);
      formDataToSend.append('level', editFormData.level);
      formDataToSend.append('target_audience', editFormData.target_audience);
      formDataToSend.append('mode', editFormData.mode);
      formDataToSend.append('course_contents', editFormData.course_contents);
      formDataToSend.append('what_you_will_learn', editFormData.what_you_will_learn);
      
      if (editFormData.thumbnail_file) {
        formDataToSend.append('thumbnail', editFormData.thumbnail_file);
      } else if (editFormData.thumbnail_url) {
        formDataToSend.append('thumbnail_url', editFormData.thumbnail_url);
      }

      await adminApi.updateCourseWithFile(editingCourseId, formDataToSend);
      
      setEditFormData({
        title: '',
        category: '',
        description: '',
        thumbnail_url: '',
        thumbnail_file: null,
        video_url: '',
        key_skills: '',
        programming_languages: '',
        course_duration: '',
        total_sessions: '',
        session_duration: '',
        level: 'Beginner',
        target_audience: '',
        mode: 'Virtual',
        course_contents: '',
        what_you_will_learn: ''
      });
      setEditThumbnailPreview('');
      setIsEditOpen(false);
      setEditingCourseId(null);
      setSuccess('Course updated successfully!');
      await loadCourses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update course';
      setError(errorMessage);
      console.error('Course update error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchiveCourse = async (courseId: number) => {
    if (confirm('Are you sure you want to archive this course? It will no longer be visible in the courses list.')) {
      try {
        await adminApi.archiveCourse(courseId);
        setSuccess('Course archived successfully!');
        await loadCourses();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to archive course');
      }
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (confirm('Are you sure you want to permanently delete this course?')) {
      try {
        await adminApi.deleteCourse(courseId);
        setSuccess('Course deleted successfully!');
        await loadCourses();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete course');
      }
    }
  };

  const toggleEnrollments = async (courseId: number) => {
    if (enrollmentsOpen[courseId]) {
      setEnrollmentsOpen(prev => ({ ...prev, [courseId]: false }));
    } else {
      setEnrollmentsOpen(prev => ({ ...prev, [courseId]: true }));
      if (!enrollments[courseId]) {
        setLoadingEnrollments(prev => ({ ...prev, [courseId]: true }));
        try {
          const data = await adminApi.getCourseEnrollments(courseId);
          setEnrollments(prev => ({ ...prev, [courseId]: data }));
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load enrollments');
        } finally {
          setLoadingEnrollments(prev => ({ ...prev, [courseId]: false }));
        }
      }
    }
  };

  const handleExportEnrollments = async (courseId: number) => {
    try {
      await adminApi.exportEnrollmentsToExcel(courseId);
      setSuccess('Enrollments exported successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export enrollments');
    }
  };

  if (!isMounted || isCheckingAuth) {
    return (
      <div className="space-y-6">
        <div className="p-8 text-center">Loading courses management...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div className="p-8 text-center text-red-600">Redirecting to login...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        onClick={() => router.push('/admin')}
        variant="outline"
        size="sm"
        className="mb-4 border-gray-300"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Admin Dashboard
      </Button>

      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Courses Management</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <Button 
            onClick={() => setIsCreateOpen(true)}
            type="button" 
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Course
          </Button>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => {
            if (isSubmitting) {
              e.preventDefault();
            }
          }}>
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
              <DialogDescription>
                Add a new course to your learning platform with complete details
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateCourse} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Course Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                      disabled={isSubmitting}
                      placeholder="e.g., React Fundamentals"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select 
                      value={formData.category}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Certifications">Certifications</SelectItem>
                        <SelectItem value="Live Projects">Live Projects</SelectItem>
                        <SelectItem value="School Bee">School Bee</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-4">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    disabled={isSubmitting}
                    placeholder="Course description"
                    rows={3}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-4">Course Contents & Learning</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="course_contents">Course Contents</Label>
                    <Textarea
                      id="course_contents"
                      value={formData.course_contents}
                      onChange={(e) => setFormData(prev => ({ ...prev, course_contents: e.target.value }))}
                      disabled={isSubmitting}
                      placeholder="Detailed course contents and modules"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="what_you_will_learn">What You Will Learn</Label>
                    <Textarea
                      id="what_you_will_learn"
                      value={formData.what_you_will_learn}
                      onChange={(e) => setFormData(prev => ({ ...prev, what_you_will_learn: e.target.value }))}
                      disabled={isSubmitting}
                      placeholder="Learning outcomes and skills gained"
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-4">Course Structure</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="course_duration">Course Duration</Label>
                    <Input
                      id="course_duration"
                      value={formData.course_duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, course_duration: e.target.value }))}
                      disabled={isSubmitting}
                      placeholder="e.g., 8 Weeks"
                    />
                  </div>

                  <div>
                    <Label htmlFor="total_sessions">Total Sessions</Label>
                    <Input
                      id="total_sessions"
                      type="number"
                      value={formData.total_sessions}
                      onChange={(e) => setFormData(prev => ({ ...prev, total_sessions: e.target.value }))}
                      disabled={isSubmitting}
                      placeholder="e.g., 16"
                    />
                  </div>

                  <div>
                    <Label htmlFor="session_duration">Session Duration</Label>
                    <Input
                      id="session_duration"
                      value={formData.session_duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, session_duration: e.target.value }))}
                      disabled={isSubmitting}
                      placeholder="e.g., 1.5 hours"
                    />
                  </div>

                  <div>
                    <Label htmlFor="level">Level</Label>
                    <Select 
                      value={formData.level}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, level: value }))}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="mode">Mode</Label>
                    <Select 
                      value={formData.mode}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, mode: value }))}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Virtual">Virtual</SelectItem>
                        <SelectItem value="In-person">In-person</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="target_audience">Target Audience</Label>
                    <Input
                      id="target_audience"
                      value={formData.target_audience}
                      onChange={(e) => setFormData(prev => ({ ...prev, target_audience: e.target.value }))}
                      disabled={isSubmitting}
                      placeholder="e.g., High school seniors, College students"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-4">Skills & Technologies</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="key_skills">Key Skills</Label>
                    <Input
                      id="key_skills"
                      value={formData.key_skills}
                      onChange={(e) => setFormData(prev => ({ ...prev, key_skills: e.target.value }))}
                      disabled={isSubmitting}
                      placeholder="e.g., React, JavaScript, CSS"
                    />
                  </div>

                  <div>
                    <Label htmlFor="programming_languages">Programming Languages</Label>
                    <Input
                      id="programming_languages"
                      value={formData.programming_languages}
                      onChange={(e) => setFormData(prev => ({ ...prev, programming_languages: e.target.value }))}
                      disabled={isSubmitting}
                      placeholder="e.g., JavaScript, Python, Java"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-4">Media & Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="thumbnail">Thumbnail Image</Label>
                    <div className="flex flex-col gap-2">
                      <Input
                        id="thumbnail"
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        disabled={isSubmitting}
                      />
                      {thumbnailPreview && (
                        <div className="relative w-full h-40 rounded-lg overflow-hidden border">
                          <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="video_url">Video URL</Label>
                    <Input
                      id="video_url"
                      type="url"
                      value={formData.video_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
                      disabled={isSubmitting}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setThumbnailPreview('');
                    setError('');
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="bg-orange-600 hover:bg-orange-700"
                  onClick={(e) => {
                    if (!formData.title || !formData.category) {
                      e.preventDefault();
                      setError('Title and Category are required');
                    }
                  }}
                >
                  {isSubmitting ? 'Creating...' : 'Create Course'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => {
            if (isSubmitting) {
              e.preventDefault();
            }
          }}>
            <DialogHeader>
              <DialogTitle>Edit Course</DialogTitle>
              <DialogDescription>
                Update the course details and save your changes
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleUpdateCourse} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-title">Course Title *</Label>
                    <Input
                      id="edit-title"
                      value={editFormData.title}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                      disabled={isSubmitting}
                      placeholder="e.g., React Fundamentals"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-category">Category *</Label>
                    <Select 
                      value={editFormData.category}
                      onValueChange={(value) => setEditFormData(prev => ({ ...prev, category: value }))}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Certifications">Certifications</SelectItem>
                        <SelectItem value="Live Projects">Live Projects</SelectItem>
                        <SelectItem value="School Bee">School Bee</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-4">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editFormData.description}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                    disabled={isSubmitting}
                    placeholder="Course description"
                    rows={3}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-4">Course Contents & Learning</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="edit-course_contents">Course Contents</Label>
                    <Textarea
                      id="edit-course_contents"
                      value={editFormData.course_contents}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, course_contents: e.target.value }))}
                      disabled={isSubmitting}
                      placeholder="Detailed course contents and modules"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-what_you_will_learn">What You Will Learn</Label>
                    <Textarea
                      id="edit-what_you_will_learn"
                      value={editFormData.what_you_will_learn}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, what_you_will_learn: e.target.value }))}
                      disabled={isSubmitting}
                      placeholder="Learning outcomes and skills gained"
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-4">Course Structure</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-course_duration">Course Duration</Label>
                    <Input
                      id="edit-course_duration"
                      value={editFormData.course_duration}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, course_duration: e.target.value }))}
                      disabled={isSubmitting}
                      placeholder="e.g., 8 Weeks"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-total_sessions">Total Sessions</Label>
                    <Input
                      id="edit-total_sessions"
                      type="number"
                      value={editFormData.total_sessions}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, total_sessions: e.target.value }))}
                      disabled={isSubmitting}
                      placeholder="e.g., 16"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-session_duration">Session Duration</Label>
                    <Input
                      id="edit-session_duration"
                      value={editFormData.session_duration}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, session_duration: e.target.value }))}
                      disabled={isSubmitting}
                      placeholder="e.g., 1.5 hours"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-level">Level</Label>
                    <Select 
                      value={editFormData.level}
                      onValueChange={(value) => setEditFormData(prev => ({ ...prev, level: value }))}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="edit-mode">Mode</Label>
                    <Select 
                      value={editFormData.mode}
                      onValueChange={(value) => setEditFormData(prev => ({ ...prev, mode: value }))}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Virtual">Virtual</SelectItem>
                        <SelectItem value="In-person">In-person</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="edit-target_audience">Target Audience</Label>
                    <Input
                      id="edit-target_audience"
                      value={editFormData.target_audience}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, target_audience: e.target.value }))}
                      disabled={isSubmitting}
                      placeholder="e.g., High school seniors, College students"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-4">Skills & Technologies</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-key_skills">Key Skills</Label>
                    <Input
                      id="edit-key_skills"
                      value={editFormData.key_skills}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, key_skills: e.target.value }))}
                      disabled={isSubmitting}
                      placeholder="e.g., React, JavaScript, CSS"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-programming_languages">Programming Languages</Label>
                    <Input
                      id="edit-programming_languages"
                      value={editFormData.programming_languages}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, programming_languages: e.target.value }))}
                      disabled={isSubmitting}
                      placeholder="e.g., JavaScript, Python, Java"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-4">Media & Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-thumbnail">Thumbnail Image</Label>
                    <div className="flex flex-col gap-2">
                      <Input
                        id="edit-thumbnail"
                        type="file"
                        accept="image/*"
                        onChange={handleEditThumbnailChange}
                        disabled={isSubmitting}
                      />
                      {editThumbnailPreview && (
                        <div className="relative w-full h-40 rounded-lg overflow-hidden border">
                          <img src={editThumbnailPreview} alt="Thumbnail preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="edit-video_url">Video URL</Label>
                    <Input
                      id="edit-video_url"
                      type="url"
                      value={editFormData.video_url}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, video_url: e.target.value }))}
                      disabled={isSubmitting}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditOpen(false);
                    setEditingCourseId(null);
                    setEditThumbnailPreview('');
                    setError('');
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          variant={selectedCategory === '' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('')}
          className={selectedCategory === '' ? 'bg-orange-600 hover:bg-orange-700' : ''}
        >
          All Courses
        </Button>
        <Button
          variant={selectedCategory === 'Certifications' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('Certifications')}
          className={selectedCategory === 'Certifications' ? 'bg-orange-600 hover:bg-orange-700' : ''}
        >
          Certifications
        </Button>
        <Button
          variant={selectedCategory === 'Live Projects' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('Live Projects')}
          className={selectedCategory === 'Live Projects' ? 'bg-orange-600 hover:bg-orange-700' : ''}
        >
          Live Projects
        </Button>
        <Button
          variant={selectedCategory === 'School Bee' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('School Bee')}
          className={selectedCategory === 'School Bee' ? 'bg-orange-600 hover:bg-orange-700' : ''}
        >
          School Bee
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading courses...</div>
        ) : error ? (
          <Alert variant="destructive" className="m-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : filteredCourses.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No courses found. Create your first course!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Thumbnail</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Title</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Category</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Level</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Duration</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => (
                  <React.Fragment key={course.id}>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">
                        {course.thumbnail_url ? (
                          <img src={course.thumbnail_url.startsWith('http') ? course.thumbnail_url : `${process.env.NEXT_PUBLIC_API_URL}${course.thumbnail_url}`} alt={course.title} className="h-12 w-16 object-cover rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        ) : (
                          <div className="h-12 w-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">No image</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">{course.title}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          {course.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{course.level || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{course.course_duration || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleEnrollments(course.id)}
                            className="text-purple-600 hover:text-purple-800 inline-flex items-center gap-1"
                            title="View enrollments"
                          >
                            <ChevronDown className={`h-4 w-4 transition-transform ${enrollmentsOpen[course.id] ? 'rotate-180' : ''}`} />
                            Enrollees
                          </button>
                          <button
                            onClick={() => handleEditCourse(course)}
                            className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleArchiveCourse(course.id)}
                            className="text-yellow-600 hover:text-yellow-800 inline-flex items-center gap-1"
                          >
                            Archive
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(course.id)}
                            className="text-red-600 hover:text-red-800 inline-flex items-center gap-1"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>

                    {enrollmentsOpen[course.id] && (
                      <tr className="bg-gray-50 border-b">
                        <td colSpan={6} className="px-6 py-4">
                          {loadingEnrollments[course.id] ? (
                            <div className="text-center py-4 text-gray-600">Loading enrollments...</div>
                          ) : enrollments[course.id]?.length === 0 ? (
                            <div className="text-center py-4 text-gray-600">No enrollments yet</div>
                          ) : (
                            <div className="space-y-3">
                              <div className="flex justify-between items-center mb-4">
                                <h4 className="font-semibold text-sm">Course Enrollees ({enrollments[course.id]?.length || 0})</h4>
                                <button
                                  onClick={() => handleExportEnrollments(course.id)}
                                  className="text-green-600 hover:text-green-800 inline-flex items-center gap-1 text-sm"
                                >
                                  <Download className="h-4 w-4" />
                                  Export Excel
                                </button>
                              </div>
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm border-collapse">
                                  <thead className="bg-white border-b">
                                    <tr>
                                      <th className="px-3 py-2 text-left font-medium">Name</th>
                                      <th className="px-3 py-2 text-left font-medium">Email</th>
                                      <th className="px-3 py-2 text-left font-medium">Contact No</th>
                                      <th className="px-3 py-2 text-left font-medium">Enrolled Date</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {enrollments[course.id]?.map((enrollee: any) => (
                                      <tr key={enrollee.id} className="border-b hover:bg-gray-100">
                                        <td className="px-3 py-2">{enrollee.name}</td>
                                        <td className="px-3 py-2">{enrollee.email}</td>
                                        <td className="px-3 py-2">{enrollee.contact_no}</td>
                                        <td className="px-3 py-2 text-xs text-gray-600">
                                          {new Date(enrollee.enrolled_at).toLocaleDateString()}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>
        </div>
      </div>
    </div>
  );
}
