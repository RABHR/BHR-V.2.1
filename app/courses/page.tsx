"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { publicApi, Course } from '@/lib/adminApi';
import { BookOpen, Code, Users, Star, Clock, Users2, Award } from 'lucide-react';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [enrollmentFormData, setEnrollmentFormData] = useState({ name: '', email: '', contact_no: '' });
  const [enrollmentError, setEnrollmentError] = useState('');
  const [enrollmentSuccess, setEnrollmentSuccess] = useState('');
  const [isEnrolling, setIsEnrolling] = useState(false);

  const categories = [
    { id: '', label: 'All Courses', icon: BookOpen },
    { id: 'Certifications', label: 'Certifications', icon: Award },
    { id: 'Live Projects', label: 'Live Projects', icon: Code },
    { id: 'School Bee', label: 'School Bee', icon: Users }
  ];

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, selectedCategory, searchQuery]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await publicApi.getCourses();
      setCourses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    if (selectedCategory) {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.key_skills?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredCourses(filtered);
  };

  const getRandomReviews = (courseId: number) => {
    const minReviews = 40;
    const maxReviews = 500;
    const seed = courseId * 12345;
    return minReviews + (seed % (maxReviews - minReviews + 1));
  };

  const getRandomStars = (courseId: number) => {
    const seed = (courseId * 54321) % 100;
    if (seed < 20) return 4;
    if (seed < 50) return 5;
    return seed % 5 > 0 ? seed % 5 : 5;
  };

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
    setIsDetailOpen(true);
  };

  const handleEnrollClick = () => {
    setIsDetailOpen(false);
    setIsEnrollOpen(true);
    setEnrollmentFormData({ name: '', email: '', contact_no: '' });
    setEnrollmentError('');
    setEnrollmentSuccess('');
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!enrollmentFormData.name || !enrollmentFormData.email || !enrollmentFormData.contact_no || !selectedCourse) {
      setEnrollmentError('All fields are required');
      return;
    }

    setIsEnrolling(true);
    setEnrollmentError('');
    setEnrollmentSuccess('');

    try {
      const formData = new FormData();
      formData.append('name', enrollmentFormData.name);
      formData.append('email', enrollmentFormData.email);
      formData.append('contact_no', enrollmentFormData.contact_no);
      formData.append('course_id', selectedCourse.id.toString());
      formData.append('course_title', selectedCourse.title);

      await publicApi.enrollCourse(formData);
      setEnrollmentSuccess('Successfully enrolled! We will contact you soon.');
      setEnrollmentFormData({ name: '', email: '', contact_no: '' });
      setTimeout(() => {
        setIsEnrollOpen(false);
      }, 2000);
    } catch (err) {
      setEnrollmentError(err instanceof Error ? err.message : 'Enrollment failed');
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <>
      {/* Shortened Hero Section - White Background */}
      <section className="bg-white text-gray-800 py-24 border-b">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Learning & Development Courses</h1>
          <p className="text-gray-600">Explore our comprehensive courses designed to enhance your skills and accelerate your career growth.</p>
        </div>
      </section>

      {/* Search Bar and Category Tabs */}
      <section className="py-4 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto mb-6">
            <Input
              type="text"
              placeholder="Search courses by name, skills, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Category Tabs - Immediately Below Search */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 ${
                    selectedCategory === category.id
                      ? 'bg-orange-600 hover:bg-orange-700 text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {category.label}
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Courses Grid - Udemy Style (4 per row) */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-pulse">Loading courses...</div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">
              {error}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No courses found. Try adjusting your search or category filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => handleCourseClick(course)}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden group"
                >
                  {/* Thumbnail */}
                  <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
                    {course.thumbnail_url ? (
                      <img
                        src={course.thumbnail_url.startsWith('http') ? course.thumbnail_url : `http://localhost:5000${course.thumbnail_url}`}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600">
                        <BookOpen className="h-12 w-12 text-white" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-orange-600 text-white px-2 py-1 rounded text-xs font-semibold">
                      {course.category}
                    </div>
                  </div>

                  {/* Course Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                      {course.title}
                    </h3>

                    {/* Rating and Reviews */}
                    <div className="flex items-center gap-1 mb-3">
                      <div className="flex text-yellow-400">
                        {[...Array(getRandomStars(course.id))].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-current" />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600">({getRandomReviews(course.id)} reviews)</span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {course.description}
                    </p>

                    {/* Course Details */}
                    <div className="space-y-2 mb-4 text-xs text-gray-600">
                      {course.course_duration && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <span>{course.course_duration}</span>
                        </div>
                      )}
                      {course.level && (
                        <div className="flex items-center gap-2">
                          <Award className="h-3 w-3" />
                          <span>{course.level}</span>
                        </div>
                      )}
                      {course.total_sessions && (
                        <div className="flex items-center gap-2">
                          <Users2 className="h-3 w-3" />
                          <span>{course.total_sessions} sessions</span>
                        </div>
                      )}
                    </div>

                    {/* Skills */}
                    {course.key_skills && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {course.key_skills.split(',').slice(0, 2).map((skill, idx) => (
                            <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                              {skill.trim()}
                            </span>
                          ))}
                          {course.key_skills.split(',').length > 2 && (
                            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                              +{course.key_skills.split(',').length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Enroll Button */}
                    <Button
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCourseClick(course);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Course Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedCourse && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedCourse.title}</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Thumbnail */}
                {selectedCourse.thumbnail_url && (
                  <div className="w-full h-64 rounded-lg overflow-hidden">
                    <img
                      src={selectedCourse.thumbnail_url}
                      alt={selectedCourse.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Basic Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {selectedCourse.level && (
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-xs text-gray-600 mb-1">Level</div>
                      <div className="font-semibold">{selectedCourse.level}</div>
                    </div>
                  )}
                  {selectedCourse.course_duration && (
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-xs text-gray-600 mb-1">Duration</div>
                      <div className="font-semibold">{selectedCourse.course_duration}</div>
                    </div>
                  )}
                  {selectedCourse.total_sessions && (
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-xs text-gray-600 mb-1">Sessions</div>
                      <div className="font-semibold">{selectedCourse.total_sessions}</div>
                    </div>
                  )}
                  {selectedCourse.session_duration && (
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-xs text-gray-600 mb-1">Per Session</div>
                      <div className="font-semibold">{selectedCourse.session_duration}</div>
                    </div>
                  )}
                </div>

                {/* Description */}
                {selectedCourse.description && (
                  <div>
                    <h3 className="font-semibold mb-2">About This Course</h3>
                    <p className="text-gray-600">{selectedCourse.description}</p>
                  </div>
                )}

                {/* Course Contents */}
                {selectedCourse.course_contents && (
                  <div>
                    <h3 className="font-semibold mb-2">Course Contents</h3>
                    <p className="text-gray-600 whitespace-pre-line">{selectedCourse.course_contents}</p>
                  </div>
                )}

                {/* What You'll Learn */}
                {selectedCourse.what_you_will_learn && (
                  <div>
                    <h3 className="font-semibold mb-2">What You Will Learn</h3>
                    <p className="text-gray-600 whitespace-pre-line">{selectedCourse.what_you_will_learn}</p>
                  </div>
                )}

                {/* Skills */}
                {selectedCourse.key_skills && (
                  <div>
                    <h3 className="font-semibold mb-2">Key Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCourse.key_skills.split(',').map((skill, idx) => (
                        <span key={idx} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Languages */}
                {selectedCourse.programming_languages && (
                  <div>
                    <h3 className="font-semibold mb-2">Programming Languages</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCourse.programming_languages.split(',').map((lang, idx) => (
                        <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {lang.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Info */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  {selectedCourse.mode && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Mode</div>
                      <div className="font-semibold">{selectedCourse.mode}</div>
                    </div>
                  )}
                  {selectedCourse.target_audience && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Target Audience</div>
                      <div className="font-semibold">{selectedCourse.target_audience}</div>
                    </div>
                  )}
                </div>

                {/* Video Link */}
                {selectedCourse.video_url && (
                  <Button
                    asChild
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <a href={selectedCourse.video_url} target="_blank" rel="noopener noreferrer">
                      Watch Course Preview
                    </a>
                  </Button>
                )}

                {/* Enroll Button */}
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white" 
                  size="lg"
                  onClick={handleEnrollClick}
                >
                  Enroll Now
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Enrollment Form Dialog */}
      <Dialog open={isEnrollOpen} onOpenChange={setIsEnrollOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enroll in Course</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEnrollSubmit} className="space-y-4">
            {enrollmentError && (
              <Alert variant="destructive">
                <AlertDescription>{enrollmentError}</AlertDescription>
              </Alert>
            )}
            
            {enrollmentSuccess && (
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">{enrollmentSuccess}</AlertDescription>
              </Alert>
            )}

            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={enrollmentFormData.name}
                onChange={(e) => setEnrollmentFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={enrollmentFormData.email}
                onChange={(e) => setEnrollmentFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="contact">Contact Number *</Label>
              <Input
                id="contact"
                placeholder="Enter your contact number"
                value={enrollmentFormData.contact_no}
                onChange={(e) => setEnrollmentFormData(prev => ({ ...prev, contact_no: e.target.value }))}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={isEnrolling}
            >
              {isEnrolling ? 'Enrolling...' : 'Submit Enrollment'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
