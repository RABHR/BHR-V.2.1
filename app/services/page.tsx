import type { Metadata } from "next";
import { HeroSection } from "@/components/hero-section";
import { SectionHeading } from "@/components/section-heading";
import { ServiceTabs } from "@/components/service-tabs";
import {
  Users,
  UserPlus,
  Search,
  Briefcase,
  Code,
  Database,
  Server,
  Globe,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Explore our comprehensive staffing solutions for prestigious software companies in India and the US.",
};

const services = [
  {
    id: "contract-staffing",
    title: "Contract Staffing",
    description:
      "Flexible staffing solutions for project-based needs, providing skilled professionals for short to long-term assignments.",
    features: [
      "Quick turnaround times to meet urgent project needs",
      "Verified technical expertise across various technologies",
      "Scalable team augmentation for project ramp-ups",
      "Reduced administrative burden with our managed services",
      "Compliance with all legal and regulatory requirements",
    ],
    icon: <Users className="h-6 w-6" />,
    caseStudy: {
      title: "Scaling Development Team for Product Launch",
      description:
        "A leading fintech company needed to quickly scale their development team to meet an upcoming product launch deadline. We provided 12 skilled contractors within two weeks, allowing them to accelerate development and meet their timeline.",
      result:
        "The client successfully launched their product on schedule, and retained 5 of our contractors for extended engagements.",
    },
  },
  {
    id: "permanent-placement",
    title: "Permanent Placement",
    description:
      "Strategic recruitment services to identify and secure top-tier talent for full-time positions within your organization.",
    features: [
      "Thorough candidate screening and technical assessment",
      "Cultural fit assessment to ensure long-term success",
      "Comprehensive background and reference checks",
      "Competitive market insights for effective offers",
      "Extended replacement guarantees for peace of mind",
    ],
    icon: <UserPlus className="h-6 w-6" />,
    caseStudy: {
      title: "Building an Engineering Leadership Team",
      description:
        "A growing SaaS company needed to build out their engineering leadership team to support their expansion. We helped them hire a VP of Engineering, three Engineering Managers, and a Director of QA over a six-month period.",
      result:
        "The new leadership team successfully restructured the engineering department, improving productivity by 35% and reducing turnover.",
    },
  },
  {
    id: "executive-search",
    title: "Executive Search",
    description:
      "Specialized recruitment for C-level and senior leadership positions, focusing on strategic fit and long-term impact.",
    features: [
      "Discreet outreach to passive candidates",
      "In-depth leadership and strategic thinking assessment",
      "Comprehensive evaluation of track record and achievements",
      "Detailed market mapping and competitive intelligence",
      "Structured interview process with stakeholder alignment",
    ],
    icon: <Search className="h-6 w-6" />,
    caseStudy: {
      title: "CTO Placement for AI Startup",
      description:
        "An AI startup that had secured Series B funding needed a visionary CTO to lead their technical strategy and scale their engineering team. We conducted a targeted search and presented five exceptional candidates within three weeks.",
      result:
        "The selected CTO implemented a new technical architecture that reduced infrastructure costs by 40% and accelerated the product roadmap.",
    },
  },
  {
    id: "specialized-recruitment",
    title: "Specialized Recruitment",
    description:
      "Focused recruitment services for niche technical roles and emerging technologies where talent is scarce and competition is high.",
    features: [
      "Deep expertise in emerging technology domains",
      "Access to specialized talent networks and communities",
      "Technical screening by domain experts",
      "Competitive insights for hard-to-fill positions",
      "Ongoing talent pipeline development for future needs",
    ],
    icon: <Briefcase className="h-6 w-6" />,
    caseStudy: {
      title: "Building a Blockchain Development Team",
      description:
        "A financial services company was venturing into blockchain technology and needed to build a specialized team from scratch. We helped them hire eight blockchain developers, architects, and security specialists over three months.",
      result:
        "The team successfully developed and launched the company's first blockchain-based product, establishing them as innovators in their industry.",
    },
  },
];

const technologies = [
  {
    id: "frontend",
    title: "Frontend",
    description:
      "Expert developers specializing in creating responsive, user-friendly interfaces with modern frameworks and libraries.",
    features: [
      "React, Angular, and Vue.js specialists",
      "TypeScript and JavaScript experts",
      "Responsive design and mobile-first approach",
      "State management with Redux, MobX, or Context API",
      "Performance optimization and accessibility compliance",
    ],
    icon: <Code className="h-6 w-6" />,
  },
  {
    id: "backend",
    title: "Backend",
    description:
      "Skilled engineers who build robust, scalable server-side applications and APIs to power your digital products.",
    features: [
      "Node.js, Python, Java, and .NET specialists",
      "RESTful and GraphQL API development",
      "Microservices architecture implementation",
      "Database design and optimization",
      "Authentication and authorization systems",
    ],
    icon: <Server className="h-6 w-6" />,
  },
  {
    id: "database",
    title: "Database",
    description:
      "Database administrators and engineers who ensure your data is structured, secure, and optimized for performance.",
    features: [
      "SQL and NoSQL database expertise",
      "Data modeling and schema design",
      "Performance tuning and query optimization",
      "Data migration and ETL processes",
      "High availability and disaster recovery planning",
    ],
    icon: <Database className="h-6 w-6" />,
  },
  {
    id: "fullstack",
    title: "Full Stack",
    description:
      "Versatile developers who can handle both frontend and backend development, providing end-to-end solutions.",
    features: [
      "End-to-end application development",
      "Cross-functional technical expertise",
      "DevOps and CI/CD pipeline integration",
      "System architecture and technical design",
      "Full product lifecycle experience",
    ],
    icon: <Globe className="h-6 w-6" />,
  },
];

const training = [
  {
    id: "training",
    title: "Training & Development",
    description:
      "Customized training programs to upskill your existing workforce in the latest technologies and methodologies.",
    features: [
      "Tailored training programs for specific technologies",
      "Hands-on workshops and real-world projects",
      "Mentorship from industry experts",
      "Ongoing support and resources post-training",
      "Assessment and certification options available",
    ],
    icon: <Users className="h-6 w-6" />,
  },
  {
    id: "mentorship",
    title: "Mentorship & Coaching",
    description:
      "One-on-one mentorship and coaching for your team members to enhance their skills and career growth.",
    features: [
      "Personalized mentorship plans",
      "Regular feedback and progress tracking",
      "Access to a network of industry professionals",
      "Career development resources and tools",
      "Support for both technical and soft skills enhancement",
    ],
    icon: <UserPlus className="h-6 w-6" />,
  },
];

export default function ServicesPage() {
  return (
    <>
      <HeroSection
        title="Our Services"
        subtitle="Comprehensive staffing solutions tailored to meet the unique needs of software companies."
      />

      <section className="py-20">
        <div className="container mx-auto px-4">
          <SectionHeading
            title="Staffing Solutions"
            subtitle="We offer a range of staffing services to help you find the right talent for your organization."
          />

          <div className="mt-12">
            <ServiceTabs services={services} />
          </div>
        </div>
      </section>

      
      <section className="py-20">
        <div className="container mx-auto px-4">
          <SectionHeading
            title="Training & Development"
            subtitle="Empowering your team with the skills they need to succeed."
          />

          <div className="mt-12">
            <ServiceTabs services={training} />
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <SectionHeading
            title="Technology Expertise"
            subtitle="Our talent network spans across various technology domains to meet your specific requirements."
          />

          <div className="mt-12">
            <ServiceTabs services={technologies} />
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <SectionHeading
            title="Our Process"
            subtitle="A streamlined approach to connecting you with the right talent."
            centered
          />

          <div className="grid md:grid-cols-4 gap-8 mt-12">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Requirements Analysis</h3>
              <p className="text-muted-foreground">
                We work closely with you to understand your technical
                requirements, company culture, and specific needs.
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Talent Sourcing</h3>
              <p className="text-muted-foreground">
                Our specialized recruiters identify and engage with qualified
                candidates from our extensive network.
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Rigorous Screening</h3>
              <p className="text-muted-foreground">
                Candidates undergo thorough technical assessments, interviews,
                and background checks to ensure quality.
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                <span className="text-2xl font-bold">4</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Placement & Support</h3>
              <p className="text-muted-foreground">
                We facilitate the hiring process and provide ongoing support to
                ensure a successful engagement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Development Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <SectionHeading
            title="Leadership Development"
            subtitle="Prepare your future leaders with the skills and mindset needed to drive organizational success."
            centered
          />

          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold mb-4">Leadership Workshops & Executive Coaching</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-orange-600 font-bold mr-3">•</span>
                  <span>Customized leadership workshops tailored to your organization's needs</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 font-bold mr-3">•</span>
                  <span>One-on-one executive coaching for senior leaders</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 font-bold mr-3">•</span>
                  <span>Strategic planning and execution frameworks</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 font-bold mr-3">•</span>
                  <span>Change management and organizational transformation support</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold mb-4">Emotional Intelligence & Decision-Making</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-orange-600 font-bold mr-3">•</span>
                  <span>Emotional intelligence training and assessment</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 font-bold mr-3">•</span>
                  <span>Decision-making frameworks and critical thinking skills</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 font-bold mr-3">•</span>
                  <span>Strategic thinking and innovation sessions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 font-bold mr-3">•</span>
                  <span>Team management and conflict resolution skills</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold mb-4">Continuous Leadership Assessment & Feedback</h3>
            <p className="text-muted-foreground mb-4">
              We provide ongoing assessment and feedback mechanisms to ensure continuous leadership development and improvement.
            </p>
            <ul className="grid md:grid-cols-2 gap-4 text-muted-foreground">
              <li className="flex items-start">
                <span className="text-orange-600 font-bold mr-3">•</span>
                <span>360-degree feedback assessments</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 font-bold mr-3">•</span>
                <span>Leadership effectiveness metrics</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 font-bold mr-3">•</span>
                <span>Personalized development plans</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 font-bold mr-3">•</span>
                <span>Regular coaching and mentoring sessions</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Performance & Skill Evaluation Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <SectionHeading
            title="Performance & Skill Evaluation"
            subtitle="Measure growth and identify new opportunities for improvement through structured assessments."
            centered
          />

          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold mb-4">Comprehensive Skill Gap Analysis</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-orange-600 font-bold mr-3">•</span>
                  <span>In-depth assessment of current skill levels</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 font-bold mr-3">•</span>
                  <span>Identification of skill gaps and development areas</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 font-bold mr-3">•</span>
                  <span>Benchmarking against industry standards</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 font-bold mr-3">•</span>
                  <span>Prioritized recommendations for improvement</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold mb-4">Regular Performance Reviews & Feedback</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-orange-600 font-bold mr-3">•</span>
                  <span>Structured performance review processes</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 font-bold mr-3">•</span>
                  <span>Personalized feedback and coaching</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 font-bold mr-3">•</span>
                  <span>Goal setting and progress tracking</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 font-bold mr-3">•</span>
                  <span>Career development planning</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-2xl font-bold mb-4">Data-Driven Insights & Customized Learning Paths</h3>
            <p className="text-muted-foreground mb-4">
              We leverage data analytics to provide actionable insights and create customized learning paths for each employee.
            </p>
            <ul className="grid md:grid-cols-2 gap-4 text-muted-foreground">
              <li className="flex items-start">
                <span className="text-orange-600 font-bold mr-3">•</span>
                <span>Data-driven insights into employee development</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 font-bold mr-3">•</span>
                <span>Customized learning paths based on evaluation results</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 font-bold mr-3">•</span>
                <span>Recognition and reward programs for top performers</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 font-bold mr-3">•</span>
                <span>Continuous monitoring and adjustment of development plans</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
