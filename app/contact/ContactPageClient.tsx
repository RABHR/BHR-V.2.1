"use client";

import React from "react";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { HeroSection } from "@/components/hero-section";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle,
  Shield
} from "lucide-react";

export default function ContactPageClient() {
  const [formState, setFormState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState("submitting");

    // Simulate form submission
    setTimeout(() => {
      setFormState("success");
    }, 1500);
  };

  return (
    <>
      <HeroSection
        title="Contact Us"
        subtitle="Get in touch with our team for any inquiries about our services or career opportunities."
      />

      {/* Admin Access Button - Positioned discretely */}
      <div className="fixed bottom-4 right-4 z-50">
        <Link href="/admin/login">
          <Button variant="outline" size="sm" className="bg-white/90 backdrop-blur-sm hover:bg-white">
            <Shield className="h-4 w-4 mr-2" />
            Admin
          </Button>
        </Link>
      </div>

      {/* Contact Form */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <SectionHeading
                title="Get in Touch"
                subtitle="Fill out the form below and we'll get back to you as soon as possible."
              />

              <Card className="mt-8">
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          placeholder="John"
                          required
                          disabled={formState !== "idle"}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          required
                          disabled={formState !== "idle"}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john.doe@example.com"
                        required
                        disabled={formState !== "idle"}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        disabled={formState !== "idle"}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="inquiry">Inquiry Type</Label>
                      <Select disabled={formState !== "idle"}>
                        <SelectTrigger id="inquiry">
                          <SelectValue placeholder="Select an inquiry type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="staffing">
                            Staffing Solutions
                          </SelectItem>
                          <SelectItem value="career">
                            Career Opportunities
                          </SelectItem>
                          <SelectItem value="partnership">
                            Partnership Inquiries
                          </SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Please provide details about your inquiry..."
                        rows={5}
                        required
                        disabled={formState !== "idle"}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={formState !== "idle"}
                    >
                      {formState === "idle" && (
                        <>
                          Submit
                          <Send className="ml-2 h-4 w-4" />
                        </>
                      )}
                      {formState === "submitting" && "Submitting..."}
                      {formState === "success" && (
                        <>
                          Submitted
                          <CheckCircle className="ml-2 h-4 w-4" />
                        </>
                      )}
                      {formState === "error" && "Try Again"}
                    </Button>
                  </form>

                  {formState === "success" && (
                    <div className="mt-6 p-4 bg-green-50 text-green-700 rounded-md flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <p>
                        Thank you for your message! We&apos;ll get back to you
                        shortly.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <SectionHeading
                title="Contact Information"
                subtitle="Reach out to us directly using the information below."
              />

              <div className="mt-8 space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">Our Offices</h3>
                    <p className="fw-700 mt-2">Corporate Office:</p>
                    <p className="text-muted-foreground">
                      33 Wood Avenue South, Suite 600, Iselin NJ, 08830, United
                      States
                    </p>
                    <p className="fw-700 mt-2">Development Center:</p>
                    <p className="text-muted-foreground">
                     800 Inman Ave Suite 202D, Colonia, NJ 07067, United States
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">Phone</h3>
                    <p className="text-muted-foreground mb-2">
                      USA: +1 (201) 203-5406
                    </p>
                    <p className="text-muted-foreground">
                      USA: +1 (201) 203-5402
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">Email</h3>
                    <p className="text-muted-foreground mb-2">
                      <a
                        href="mailto:hr@brainhritsolutions.com"
                        className="text-primary hover:underline"
                      >
                        hr@brainhritsolutions.com
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <Linkedin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">Connect With Us</h3>
                    <div className="flex space-x-4 mt-2">
                      <Link
                        href="https://www.linkedin.com/company/brainhr-it-solutions/"
                        className="text-muted-foreground hover:text-primary transition-colors"
                        aria-label="LinkedIn"
                      >
                        <Linkedin size={24} />
                      </Link>
                      <Link
                        href="https://twitter.com"
                        className="text-muted-foreground hover:text-primary transition-colors"
                        aria-label="Twitter"
                      >
                        <Twitter size={24} />
                      </Link>
                      <Link
                        href="https://facebook.com"
                        className="text-muted-foreground hover:text-primary transition-colors"
                        aria-label="Facebook"
                      >
                        <Facebook size={24} />
                      </Link>
                      <Link
                        href="https://instagram.com"
                        className="text-muted-foreground hover:text-primary transition-colors"
                        aria-label="Instagram"
                      >
                        <Instagram size={24} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 h-80 rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d6061.879023832607!2d-74.328803!3d40.565013!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c3b662198e7da7%3A0xd8e151beaac19386!2sBrainHR%20IT%20Solutions!5e0!3m2!1sen!2sus!4v1745733936225!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="BrainHR IT Solutions Office Location"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <SectionHeading
            title="Frequently Asked Questions"
            subtitle="Find answers to common questions about our services and processes."
            centered
          />

          <div className="grid md:grid-cols-2 gap-8 mt-12 max-w-4xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-bold mb-2">
                  What types of positions do you help fill?
                </h3>
                <p className="text-muted-foreground">
                  We specialize in technical roles within the software industry,
                  including software engineers, data scientists, product
                  managers, UX/UI designers, DevOps engineers, and technical
                  leadership positions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-bold mb-2">
                  How long does the recruitment process typically take?
                </h3>
                <p className="text-muted-foreground">
                  The timeline varies based on the complexity of the role and
                  your specific requirements. For contract staffing, we can
                  often provide qualified candidates within 1-2 weeks. For
                  permanent placements and executive searches, the process
                  typically takes 3-6 weeks.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-bold mb-2">
                  Do you work with companies of all sizes?
                </h3>
                <p className="text-muted-foreground">
                  Yes, we work with software companies of all sizes, from
                  startups to large enterprises. Our solutions are tailored to
                  meet the unique needs of each client, regardless of their size
                  or stage of growth.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-bold mb-2">
                  What geographic regions do you serve?
                </h3>
                <p className="text-muted-foreground">
                  We primarily serve clients and candidates in India and the
                  United States. With offices in both countries, we have a deep
                  understanding of these markets and access to talent pools in
                  major tech hubs.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}