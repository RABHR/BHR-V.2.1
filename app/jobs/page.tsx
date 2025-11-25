"use client";

import { useState, useEffect } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { HeroSection } from "@/components/hero-section";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowRight,
  Briefcase,
  MapPin,
  Heart,
  Users,
  Coffee,
} from "lucide-react";
import { JobApplicationForm } from "@/components/job-application-form";
import { publicApi, Job } from "@/lib/adminApi";

export default function JobPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = Array.from(new Set(jobs.map(job => job.job_category).filter(Boolean))) as string[];

  const filteredJobs = jobs.filter(job => {
    const matchesCategory = selectedCategory === "" || job.job_category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const jobsData = await publicApi.getJobs();
      setJobs(jobsData.filter(job => job.active));
    } catch (error) {
      console.error('Failed to load jobs:', error);
      setError('Failed to load jobs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Shortened Hero Section - White Background */}
      <section className="bg-white text-gray-800 py-24 border-b">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Join Our Team</h1>
          <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Explore career opportunities at BrainHR IT Solutions and be part of our mission to connect exceptional talent with prestigious software companies.
          </p>
        </div>
      </section>

      {/* Search Bar and Category Filter */}
      <section className="py-4 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto mb-6">
            <Input
              type="text"
              placeholder="Search jobs by title, location, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Category Filter - Immediately Below Search */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant={selectedCategory === "" ? "default" : "outline"}
                onClick={() => setSelectedCategory("")}
                className={selectedCategory === "" ? "bg-orange-600 hover:bg-orange-700" : ""}
              >
                All Positions
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? "bg-orange-600 hover:bg-orange-700" : ""}
                >
                  {category}
                </Button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Current Openings */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mt-0">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-pulse">Loading jobs...</div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                {error}
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {jobs.length === 0 ? "No job openings available at the moment. Please check back later." : "No jobs match your search. Try adjusting your search terms or category filter."}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Company Culture */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <SectionHeading
            title="Our Culture"
            subtitle="At BrainHR IT Solutions, we foster a collaborative, innovative, and inclusive work environment."
            centered
          />

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="glass p-6 rounded-lg text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Passion for Excellence</h3>
              <p className="text-muted-foreground">
                We are committed to delivering exceptional service and results
                that exceed expectations at every touchpoint.
              </p>
            </div>

            <div className="glass p-6 rounded-lg text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Collaborative Spirit</h3>
              <p className="text-muted-foreground">
                We believe in the power of teamwork and foster a collaborative
                environment where everyone&apos;s ideas and contributions are
                valued.
              </p>
            </div>

            <div className="glass p-6 rounded-lg text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                <Coffee className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Work-Life Balance</h3>
              <p className="text-muted-foreground">
                We understand the importance of balance and support our team
                members in maintaining a healthy work-life integration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <SectionHeading
            title="Employee Benefits"
            subtitle="We offer a comprehensive benefits package to support our team members' well-being and professional growth."
            centered
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  Competitive Compensation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Salary packages that recognize your skills, experience, and
                  contributions to our success.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Health Insurance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Comprehensive health insurance coverage for you and your
                  family to ensure your well-being.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  Professional Development
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Opportunities for continuous learning, including workshops,
                  certifications, and conference attendance.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Flexible Work Options</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Flexible working hours and remote work options to accommodate
                  your personal needs and preferences.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Paid Time Off</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Generous vacation days, sick leave, and holidays to ensure you
                  have time to rest and recharge.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Retirement Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Retirement savings plans with company matching to help you
                  secure your financial future.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Team Events</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Regular team outings, celebrations, and social events to
                  foster camaraderie and connection.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Wellness Programs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Initiatives to support your physical and mental well-being,
                  including gym memberships and wellness workshops.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <SectionHeading
            title="Application Process"
            subtitle="Our streamlined hiring process is designed to identify the best talent efficiently."
            centered
          />

          <div className="grid md:grid-cols-4 gap-8 mt-12">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Application</h3>
              <p className="text-muted-foreground">
                Submit your application through our careers page, including your
                resume and cover letter.
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Initial Screening</h3>
              <p className="text-muted-foreground">
                Our HR team will review your application and conduct an initial
                phone screening.
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Interviews</h3>
              <p className="text-muted-foreground">
                Qualified candidates will be invited for interviews with the
                hiring manager and team members.
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                <span className="text-2xl font-bold">4</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Offer & Onboarding</h3>
              <p className="text-muted-foreground">
                Successful candidates will receive an offer and begin our
                comprehensive onboarding process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
            Ready to Join Our Team?
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
            Explore our current openings and take the next step in your career
            with BrainHR IT Solutions.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="#current-openings">
              View Open Positions
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}

interface JobCardProps {
  job: Job;
}

function JobCard({ job }: JobCardProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value={`job-${job.id}`}>
        <AccordionTrigger>
          <div className="flex items-center justify-between w-full p-4">
            <div className="flex items-center space-x-4">
              <span className="font-semibold text-left">{job.title}</span>
              <Badge variant="secondary" className="flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {job.location}
              </Badge>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="p-4 space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Job Description:</h4>
              <div className="text-sm text-muted-foreground whitespace-pre-line">
                {job.description}
              </div>
            </div>

            {job.visa_constraints && (
              <div>
                <h4 className="font-semibold mb-2">Visa Requirements:</h4>
                <div className="text-sm text-muted-foreground whitespace-pre-line">
                  {job.visa_constraints}
                </div>
              </div>
            )}

            {job.job_category && (
              <div>
                <h4 className="font-semibold mb-2">Job Category:</h4>
                <Badge className="bg-blue-100 text-blue-800">{job.job_category}</Badge>
              </div>
            )}

            {job.assessment_url && (
              <div>
                <h4 className="font-semibold mb-2">Assessment:</h4>
                <p className="text-sm text-muted-foreground mb-2">Candidates are required to complete an assessment as part of the application process.</p>
                <a
                  href={job.assessment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium"
                >
                  Take Assessment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </div>
            )}

            <div className="flex justify-start">
              <JobApplicationForm
                jobId={job.id}
                jobTitle={job.title}
                trigger={
                  <Button>
                    Apply Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                }
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
