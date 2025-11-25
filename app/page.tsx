import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/hero-section";
import { SectionHeading } from "@/components/section-heading";
import { TestimonialCarousel } from "@/components/testimonial-carousel";
import {
  ArrowRight,
  Users,
  Building,
  Award,
  CheckCircle,
  Briefcase,
  User,
} from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "John Doe",
    company: "ABC Inc.",
    role: "CTO",
    quote:
      "BrainHR IT Solutions has been instrumental in helping us build our engineering team. Their understanding of our technical requirements and company culture allowed them to find perfect matches for our open positions.",
  },
];

const clients = [
  {
    name: "TechGiant",
    logo: "/clientsLogo/ALLY_Bank.jpg?height=60&width=120",
  },
  {
    name: "AMEX",
    logo: "/clientsLogo/AMEXLOGO.png?height=60&width=120",
  },
  {
    name: "BESTBUY",
    logo: "/clientsLogo/BESTBUY.png?height=60&width=120",
  },
  {
    name: "BioIntelliSense",
    logo: "/clientsLogo/BioIntellisense_Logo.jpg?height=60&width=120",
  },
  {
    name: "Citizens Bank",
    logo: "/clientsLogo/Citizens-Bank.jpg?height=60&width=120",
  },
  {
    name: "DTCC",
    logo: "/clientsLogo/DTCC-logo.jpeg?height=60&width=120",
  },
  {
    name: "Fannie Mae",
    logo: "/clientsLogo/Fannie-Mae.webp?height=60&width=120",
  },
  {
    name: "Federal Reserve Bank",
    logo: "/clientsLogo/FEDERALRESERVEBANK.png?height=60&width=120",
  },
  {
    name: "Freddie Mac",
    logo: "/clientsLogo/freddie-mac.jpg?height=60&width=120",
  },
  {
    name: "Goldman Sachs",
    logo: "/clientsLogo/Goldman_Sachs.png?height=60&width=120",
  },
  {
    name: "HealthFirst",
    logo: "/clientsLogo/healthfirst.png?height=60&width=120",
  },
  {
    name: "Hexaware",
    logo: "/clientsLogo/hexaware.png?height=60&width=120",
  },
  {
    name: "JP Morgan Chase",
    logo: "/clientsLogo/JP_Morgan_logo.png?height=60&width=120",
  },
  {
    name: "Kaiser Permanente",
    logo: "/clientsLogo/kaiser-permanente-logo.png?height=60&width=120",
  },
  {
    name: "KPMG",
    logo: "/clientsLogo/KPMG.png?height=60&width=120",
  },
  {
    name: "Lifescan",
    logo: "/clientsLogo/lifescan.webp?height=60&width=120",
  },
  {
    name: "MasterCard",
    logo: "/clientsLogo/MasterCard_Logo.png?height=60&width=120",
  },
  {
    name: "Medtronic",
    logo: "/clientsLogo/Medtronic-Logo.png?height=60&width=120",
  },
  {
    name: "Options Clearing Corporation",
    logo: "/clientsLogo/Options_Clearing_Corporation_logo.png?height=60&width=120",
  },
  {
    name: "OSCAR HEALTH",
    logo: "/clientsLogo/OSCAR_HEALTH.png?height=60&width=120",
  },
  {
    name: "ROCHE",
    logo: "/clientsLogo/ROCHE.jpg?height=60&width=120",
  },
  {
    name: "RR Donnelley",
    logo: "/clientsLogo/RR_Donnelley_logo.png?height=60&width=120",
  },
  {
    name: "Silicon Valley Bank",
    logo: "/clientsLogo/SiliconValleyBank.png?height=60&width=120",
  },
  {
    name: "SLING TV",
    logo: "/clientsLogo/SLINGTV.png?height=60&width=120",
  },
  {
    name: "Tech Mahindra",
    logo: "/clientsLogo/TechM.jpg?height=60&width=120",
  },
  {
    name: "WAHBE",
    logo: "/clientsLogo/WAHBE.png?height=60&width=120",
  },
  {
    name: "WALMART",
    logo: "/clientsLogo/WALMART.jpg?height=60&width=120",
  },
  {
    name: "Wells Fargo",
    logo: "/clientsLogo/Wells_Fargo_Logo.png?height=60&width=120",
  },
];

export default function Home() {
  return (
    <>
      <HeroSection
        title="Connecting Elite Tech Talent with Industry-Leading Innovators"
        subtitle="Your dedicated platform for exceptional software careers and building world-class engineering teams"
      >
        <div className="flex flex-col md:flex-row gap-6 justify-center mt-8 max-w-2xl mx-auto">
          <Button
            asChild
            size="lg"
            className="text-base py-6 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            <Link href="/jobs" className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Find Your Dream Role
            </Link>
          </Button>
          <Button
            asChild
            variant="secondary"
            size="lg"
            className="text-base py-6 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            <Link href="/services" className="flex items-center">
              <Briefcase className="mr-2 h-5 w-5" />
              Hire Top Tech Talent
            </Link>
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-md hover:shadow-lg transition-all">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Elite Talent Network</h3>
            <p className="text-muted-foreground">
              Access to pre-vetted software professionals with proven expertise
              across all technology stacks.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-md hover:shadow-lg transition-all">
            <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mb-4">
              <Building className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Premier Partnerships</h3>
            <p className="text-muted-foreground">
              Exclusive relationships with industry-leading software companies
              seeking exceptional talent.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-md hover:shadow-lg transition-all">
            <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-4">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Algorithmically Curated, Human Approved.</h3>
            <p className="text-muted-foreground">
              Our rigorous screening process ensures cultural fit and technical
              alignment for lasting success.
            </p>
          </div>
        </div>

        <div className="mt-16 flex justify-center">
          <div className="inline-flex items-center text-primary hover:text-primary/80 transition-colors">
            <ArrowRight className="mr-2 h-4 w-4 animate-pulse" />
            <a href="#testimonials" className="text-sm font-medium">
              See what our clients say
            </a>
          </div>
        </div>
      </HeroSection>

      {/* About Section */}
      <section className="py-20 bg-gray-50" id="about">
        <div className="container mx-auto px-4">
          <SectionHeading
            title="About BrainHR IT Solutions"
            subtitle="We take the pleasure to introduce ourselves to you as a leading Software consultancy firm catering to the Staffing needs of various prestigious software companies in INDIA, and a few reputed overseas clients within US."
            centered
            className="flex flex-col items-center"
          />

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="glass p-6 rounded-lg text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Expert Talent Pool</h3>
              <p className="text-muted-foreground">
                Access to a curated network of top-tier software professionals
                with verified skills and experience.
              </p>
            </div>

            <div className="glass p-6 rounded-lg text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                <Building className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Industry Connections</h3>
              <p className="text-muted-foreground">
                Strong relationships with prestigious software companies across
                India and the United States.
              </p>
            </div>

            <div className="glass p-6 rounded-lg text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Proven Track Record</h3>
              <p className="text-muted-foreground">
                Consistent success in matching the right talent with the right
                opportunities for optimal outcomes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <SectionHeading
            title="Our Services"
            subtitle="Comprehensive staffing solutions tailored to meet the unique needs of software companies."
            centered
            className="flex flex-col items-center"
          />

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold mb-4">
                Resource Strategy & Staffing
              </h3>
              <p className="text-muted-foreground mb-4">
                Flexible staffing solutions for project-based needs, providing
                skilled professionals for short to long-term assignments.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Quick turnaround times</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Verified technical expertise</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Scalable team augmentation</span>
                </li>
              </ul>
              <Link href="/services#contract-staffing">
                <Button variant="outline">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold mb-4">
                Software Projects - Mobile and Web Applications
              </h3>
              <p className="text-muted-foreground mb-4">
                End-to-end software development services for mobile and web
                applications, from concept to deployment.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Agile development methodologies</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Cross-platform solutions</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Post-launch support and maintenance</span>
                </li>
              </ul>
              <Link href="/services#software-development">
                <Button variant="outline">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold mb-4">Training</h3>
              <p className="text-muted-foreground mb-4">
                Comprehensive training programs for software professionals to
                enhance their skills and stay updated with the latest
                technologies.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Customized training modules</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Hands-on workshops</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>Certification programs</span>
                </li>
              </ul>
              <Link href="/services#training">
                <Button variant="outline">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/services">
              <Button>
                View All Services
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {/* <section className="py-20 bg-gray-50" id="testimonials">
        <div className="container mx-auto px-4">
          <SectionHeading
            title="Client Testimonials"
            subtitle="Hear what our clients have to say about our staffing solutions."
            centered
            className="flex flex-col items-center"
          />

          <div className="mt-12 max-w-4xl mx-auto">
            <TestimonialCarousel testimonials={testimonials} />
          </div>
        </div>
      </section> */}

      {/* Clients */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <SectionHeading title="Trusted by Industry Leaders" centered />

          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 mt-12">
            {clients.map((client, index) => (
              <div
                key={index}
                // className="grayscale hover:grayscale-0 transition-all"
              >
                <Image
                  src={client.logo || "/placeholder.svg"}
                  alt={client.name}
                  width={120}
                  height={60}
                  className="h-12 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-intermediate text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
            Ready to Find Your Perfect Match?
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
            Whether you are looking for top talent or your next career
            opportunity, we are here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/contact">
                Contact Us Today
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <Link href="/jobs">View Open Positions</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
