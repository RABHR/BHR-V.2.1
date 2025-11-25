"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, CheckCircle } from 'lucide-react';
import { publicApi } from '@/lib/adminApi';

interface JobApplicationFormProps {
  jobId: number;
  jobTitle: string;
  trigger: React.ReactNode;
}

export function JobApplicationForm({ jobId, jobTitle, trigger }: JobApplicationFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact_no: '',
    linkedin: '',
    location: '',
    visa_status: '',
    relocation: '',
    experience_years: ''
  });
  
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!resumeFile) {
        throw new Error('Please upload your resume');
      }

      if (!formData.location.trim()) {
        throw new Error('Current Location is required');
      }

      if (!formData.visa_status) {
        throw new Error('Visa Status is required');
      }

      if (!formData.relocation) {
        throw new Error('Willing to Relocate is required');
      }

      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value);
      });
      submitData.append('job_id', jobId.toString());
      submitData.append('job_title', jobTitle);
      submitData.append('resume', resumeFile);

      await publicApi.submitApplication(submitData);
      setSubmitted(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Application failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload only PDF, DOC, or DOCX files');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size must be less than 5MB');
        return;
      }
      setResumeFile(file);
      setError('');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      contact_no: '',
      linkedin: '',
      location: '',
      visa_status: '',
      relocation: '',
      experience_years: ''
    });
    setResumeFile(null);
    setSubmitted(false);
    setError('');
  };

  const handleClose = () => {
    setIsOpen(false);
    if (submitted) {
      resetForm();
    }
  };

  if (submitted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-2" />
              Application Submitted Successfully!
            </DialogTitle>
            <DialogDescription>
              Thank you for applying to {jobTitle}. We have received your application and will review it shortly.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={handleClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply for {jobTitle}</DialogTitle>
          <DialogDescription>
            Fill out the form below to submit your application.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                disabled={isSubmitting}
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
                disabled={isSubmitting}
                placeholder="your.email@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact_no">Contact Number *</Label>
              <Input
                id="contact_no"
                value={formData.contact_no}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_no: e.target.value }))}
                required
                disabled={isSubmitting}
                placeholder="Your phone number"
              />
            </div>

            <div>
              <Label htmlFor="linkedin">LinkedIn Profile *</Label>
              <Input
                id="linkedin"
                value={formData.linkedin}
                onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                required
                disabled={isSubmitting}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Current Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                required
                disabled={isSubmitting}
                placeholder="City, State"
              />
            </div>

            <div>
              <Label htmlFor="experience_years">Years of Experience *</Label>
              <Input
                id="experience_years"
                type="number"
                step="0.5"
                min="0"
                value={formData.experience_years}
                onChange={(e) => setFormData(prev => ({ ...prev, experience_years: e.target.value }))}
                required
                disabled={isSubmitting}
                placeholder="e.g., 3.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="visa_status">Visa Status *</Label>
              <Select 
                value={formData.visa_status} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, visa_status: value }))}
                disabled={isSubmitting}
              >
                <SelectTrigger className={!formData.visa_status ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select your visa status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPT-EAD">OPT-EAD</SelectItem>
                  <SelectItem value="CPT">CPT</SelectItem>
                  <SelectItem value="STEM-OPT">STEM-OPT</SelectItem>
                  <SelectItem value="H1B">H1B</SelectItem>
                  <SelectItem value="H4-EAD">H4-EAD</SelectItem>
                  <SelectItem value="GC">Green Card</SelectItem>
                  <SelectItem value="GC-EAD">GC-EAD</SelectItem>
                  <SelectItem value="USC">US Citizen</SelectItem>
                  <SelectItem value="L1">L1</SelectItem>
                  <SelectItem value="L2-EAD">L2-EAD</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="relocation">Willing to Relocate? *</Label>
              <Select 
                value={formData.relocation} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, relocation: value }))}
                disabled={isSubmitting}
              >
                <SelectTrigger className={!formData.relocation ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select yes or no" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="YES">Yes</SelectItem>
                  <SelectItem value="NO">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="resume">Upload Resume *</Label>
            <div className="mt-2">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="resume"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> your resume
                    </p>
                    <p className="text-xs text-gray-500">PDF, DOC, or DOCX (MAX. 5MB)</p>
                  </div>
                  <input
                    id="resume"
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    disabled={isSubmitting}
                  />
                </label>
              </div>
              {resumeFile && (
                <p className="mt-2 text-sm text-green-600">
                  Selected: {resumeFile.name}
                </p>
              )}
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}