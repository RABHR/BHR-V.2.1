export interface JobOpening {
  id: number;
  title: string;
  active: boolean;
  locations: string[];
  introduction?: string | null;
  jobDescription: {
    keyResponsibilities: string[];
  };
  technicalSkills?: {
    backend?: string[];
    frontend?: string[];
    niceToHave?: string[];
  };
  preferredQualifications?: string[];
  goodToHave?: string[];
  keySkills?: string[];
  technicalHandsOnRealTimeExperience?: string[];
  requiredSkills?: string[];
  desiredQualificationsAndSkills?: string[];
}

export const jobOpenings: JobOpening[] = [
  {
    id: 1,
    title: "Java Full Stack Developer - I",
    active: true,
    locations: ["Phoenix, AZ"],
    introduction:
      "We are seeking a talented and passionate Java Full Stack Developer to join our growing team. The ideal candidate will have strong expertise in developing scalable backend services using Java, Spring Boot, Kafka, and Hibernate/JPA, and building dynamic front-end applications using React.js.",
    jobDescription: {
      keyResponsibilities: [
        "Develop backend REST APIs using Java 8/11+, Spring Boot, Hibernate, and JPA.",
        "Build responsive front-end applications using React.js, JavaScript (ES6+), HTML5, and CSS3.",
        "Integrate backend services with Kafka messaging for real-time event-driven systems.",
        "Collaborate with Product Managers, Architects, and other Developers to understand business requirements and translate them into technical solutions.",
        "Design and implement microservices with a focus on scalability, maintainability, and performance.",
        "Perform unit testing, integration testing, and code reviews to ensure high-quality code.",
        "Optimize application performance, database queries, and API responses.",
        "Work with relational and NoSQL databases like PostgreSQL, MySQL, and MongoDB.",
        "Participate in DevOps activities, CI/CD pipeline setup, and containerization (Docker/Kubernetes is a plus).",
        "Ensure security best practices (OAuth2, JWT authentication, HTTPS/SSL implementation).",
        "Troubleshoot production issues and contribute to post-release support and monitoring.",
        "Follow Agile development methodologies (Scrum, Kanban) and participate in daily standups, sprint planning, and retrospectives.",
      ],
    },
    technicalSkills: {
      backend: [
        "Spring Boot (Core, Web, Security, Data JPA)",
        "Hibernate / JPA",
        "Apache Kafka (Producer, Consumer, Streams)",
        "RESTful Web Services (API development)",
        "SQL and Database Optimization (PostgreSQL, MySQL)",
        "JSON, XML, YAML data formats",
      ],
      frontend: [
        "React.js (Hooks, Redux, Context API)",
        "JavaScript (ES6+)",
        "HTML5",
        "CSS3",
        "Bootstrap",
      ],
      niceToHave: [
        "Git/GitHub, Bitbucket",
        "Maven or Gradle (build tools)",
        "Jenkins (CI/CD pipelines)",
        "Docker/Kubernetes",
        "JWT, OAuth 2.0, SAML (Authentication/Authorization)",
      ],
    },
  },
  {
    id: 2,
    title: "Sr Java/J2EE Engineer - II",
    active: true,
    locations: ["New York, NY"],
    introduction:
      "You will be responsible for designing, developing, and maintaining highly responsive web applications and backend microservices, while collaborating closely with cross-functional teams in an Agile/Scrum environment.",
    jobDescription: {
      keyResponsibilities: [
        "Lead internet-scale solutions, with Design and development primarily using Java, Spring Boot and no-sql databases.",
        "Must have demonstrated proficiency and experience in the following tools and technologies.",
        "Java 11 (Lambdas, Streams, Completable Future, optional, generics)",
        "Java functional and reactive programming",
        "Asynchronous Reactive Micro services utilizing Vert.x",
        "REST APIs using Spring Boot 2.0 (reactive) and skilled in Open API (swagger) specification",
        "Designing database schemas, index design, optimizations for query tuning",
        "Modern software engineering tools: git workflows, gradle, load testing tools, mock frameworks",
        "Experience with workflow orchestrators, preferably Temporal",
        "Good knowledge of messaging systems like Kafka, mq",
        "Take pride in writing good clean code, perform peer code reviews and architecture reviews.",
      ],
    },
    preferredQualifications: [
      "Experience with container orchestration tools like Kubernetes and Docker.",
      "Previous experience with payment systems or real-time transaction platforms.",
      "Leadership experience in a fast-paced development environment.",
      "Experience in API development for fintech applications.",
    ],
  },
  {
    id: 3,
    title: "Java Full Stack Developer - III",
    active: true,
    locations: ["Mclean, VA"],
    introduction: null,
    jobDescription: {
      keyResponsibilities: [
        "8-10 years of experience in in solution, design and development of applications using Java 8+/J2EE, Spring, Spring-Boot, Micro Services, RESTful Services and with experience in Big Data and with experience working in heavy data background needed.",
        "Must have strong experience in Big Data and with experience working in heavy data background needed.",
        "Must be strong in Cloud AWS event-based architecture, Kubernetes, ELK (Elasticsearch, Logstash & Kibana).",
        "Must have excellent experience in designing and Implementing cloud-based solutions in various AWS Services (: s3, Lambda, Step Function, AMQ, SNS, SQS, CloudWatch Events, etc.).",
        "Must be well experienced in design and development of Microservice using Spring-Boot and REST API and with Graph QL.",
        "Must have solid knowledge and experience in NoSQL (MongoDB).",
        "Good knowledge and experience in any Queue based implementations.",
        "Strong knowledge/experience in ORM Framework - JPA / Hibernate.",
        "Good knowledge in technical concepts Security, Transaction, Monitoring, Performance.",
        "Should have experience on Java, Python and Spark.",
        "2+ years of experience in designing and Implementing cloud-based solutions in various AWS Services.",
        "Strong experience in DevOps tool chain (Jenkins, Artifactory, Ansible/Chef/Puppet/Spinnaker, Maven/Gradle, Atlassian Tool suite).",
        "Very Good knowledge and experience in Non-Functional (Technical) Requirements like Security, Transaction, Performance, etc.",
      ],
    },
    goodToHave: [
      "Experience in any one of the UI Framework - Angular / ReactJS.",
      "Good knowledge and experience in any RDBMS/PostgreSQL.",
      "Strong experience in DevOps tool chain (Jenkins, Artifactory, Maven/Gradle, GIT/BitBucket).",
      "Experience with OAuth implementation using Ping Identity.",
      "Familiarity with API Management (Apigee) and Service Mesh (Istio).",
      "Experience with scripting languages using Unix, Python.",
    ],
    keySkills: [
      "Java springboot with microservice architecture knowledge.",
      "REST/GraphQL.",
      "Mongo, k8s (preferably EKS), TDD, ATDD.",
      "Java/Python Spark.",
      "AWS: s3, Lambda, Step Function, AMQ, SNS, SQS, CloudWatch Events.",
    ],
  },
  {
    id: 4,
    title: "Java MicroServices Back End Developer - IV",
    active: true,
    locations: ["Phoenix, AZ"],
    introduction: null,
    jobDescription: {
      keyResponsibilities: [
        "8-10 years of experience with expertise in Java and J2EE, Understanding of service design for AWS Cloud environment, specifically microservices development",
        "Experience in Cloud, AWS Engineering & Development (+)",
        "Bachelor’s or Master’s Degrees in Engineering discipline preferably Computer Engineering, Computer Science, Information Systems, or other related field or equivalent work experience.",
        "Collaborates with project stakeholders to identify product and technical requirements. Conducts analysis to determine integration needs.",
        "Experience working with Agile methodologies (Scrum) and cross-functional teams (Product Owners, Scrum Masters, Developers, Designers, Business Analysts)",
        "Demonstrated experience and understanding of DevOps; as it pertains to application development (+)",
        "Analyze business requirements/processes and system integration considerations to determine their feasibility, time requirements, compatibility with current systems, architecture standards, and provide appropriate technology solutions",
        "Demonstrated knowledge of Distributed and Scalable systems",
        "Provide direct hands-on support in the design, deployment, administration, and monitoring of production systems at scale in a Hybrid Environment with AWS and VM.",
        "Experience on AWS Services is a big plus, such as EC2, ECS, ECR, Lambda, FSx, Elastic Cache, Route, CloudFront, API Gateway, S3, Glacier, RDS, NLB/ALB, Security Groups/NACLs/VPCs, Cloud Watch (+)",
      ],
    },
    requiredSkills: [
      "Knowledge about API design standards, patterns and best-practices especially Swagger and OpenAPI 3.0, REST, SOAP, MQ, JSON, Microservices etc.",
      "Java Microservices, RESTful Web Services, Microservices Design Patterns",
      "Spring Boot, Spring Cloud, Hibernate, JMS, queues, JBoss/Wildfly",
      "Unit testing with JUnit, Easymock, Mockito",
      "CI/CD tools Jenkins, Code Pipeline, Maven, Git, Jira, BitBucket, Sonar",
      "Docker, Kubernetes, AWS, Oracle, NO-SQL, Terraform",
    ],
  },
  {
    id: 5,
    title: "React/React Native Full Stack Developer",
    active: true,
    locations: ["Richfield, MN", "Boston", "Phoenix, AZ"],
    introduction:
      "You will Design and build new features into one of the most advanced interfaces on the web. Work with other engineers and designers to deliver strong customer-focused experiences. Keep our product up to date with the latest frontend technologies with React and React Native.",
    jobDescription: {
      keyResponsibilities: [
        "Have successfully built, deployed, and supported an enterprise-scale web application in the cloud.",
        "Hands-on software development expertise in Java/Python and Javascript with a modern framework (React/Angular)",
        "Work on mobile app growth, strategy, and platform-exclusive features",
        "Develop full-stack solutions across mobile and web platforms",
        "Strong React development skills and proficiency in Javascript, Angular, or other modern JS frameworks.",
        "Extensive experience developing large-scale application software.",
        "Have full knowledge of the DOM, new HTML5 constructs, and CSS3.",
        "Have experience with Single Page Application development",
        "Collaborate with cross-functional teams to design, build, test, and debug software",
        "Lead API integrations and cross-service coordination",
        "Own feature delivery with focus on customer experience",
        "Evaluate and adopt emerging libraries, frameworks, and tools",
        "Follow agile practices and deliver high-quality code",
        "Mentor team members and maintain clean, well-documented code",
        "Debug 3rd-party dependencies and contribute to internal tooling",
        "Stay current with industry trends and continuously improve skills",
      ],
    },
    technicalHandsOnRealTimeExperience: [
      "React, JavaScript, TypeScript, React Native",
      "REST APIs, GraphQL",
      "DevOps tools: GitHub Actions, Jenkins, Git",
    ],
  },
  {
    id: 6,
    title: "QA/SDET Engineer",
    active: true,
    locations: ["Phoenix, AZ", "Mclean, VA"],
    introduction:
      "As a QA/SDET Engineer, you will design, build and maintain automated test frameworks and tools to ensure the quality of web and API-based applications. You’ll work closely with developers and product owners to integrate testing early in the SDLC.",
    jobDescription: {
      keyResponsibilities: [
        "Develop and maintain Java- and JavaScript-based automation frameworks (e.g., Selenium, Cypress).",
        "Write and execute automated test scripts for UI, API and regression suites.",
        "Integrate automated tests into CI/CD pipelines (Jenkins, GitHub Actions).",
        "Hands on experience to deliver robust test suites. (web technologies, REST APIs and web services, Java, XML, JS, CSS, and HTML)",
        "Work closely with product, design, and development team members to understand business requirements and to communicate problem impacts/risks",
        "Create and execute test plans and scripts that accurately and reliably assess application quality.",
        "Analyze test results to discover and report defects, following best practices as defined by the team.",
        "Develop, maintain, and enhance automation tests and framework libraries to verify the functionality and reliability.",
        "Conduct regular code reviews to ensure that object-oriented design best practices are followed at all times. Automation code should be easy to extend and support",
        "Collaborate with developers to triage, reproduce, and document defects.",
        "Implement BDD scenarios using Cucumber and manage test data.",
        "Conduct manual exploratory testing when needed to validate critical workflows.",
      ],
    },
    keySkills: [
      "Strong programming in Java and JavaScript",
      "Hands-on experience with Selenium, Cypress and TESTNG",
      "BDD frameworks: Cucumber",
      "API testing tools (e.g., RestAssured, Postman)",
      "Solid manual testing expertise",
      "Familiarity with CI/CD and version control (Git)",
    ],
  },
  {
    id: 7,
    title: "Mobile QA Engineer",
    active: true,
    locations: ["New York, NY"],
    introduction:
      "The Mobile QA Engineer ensures the stability, usability and performance of our Android and iOS applications by designing and executing comprehensive automated and manual tests.",
    jobDescription: {
      keyResponsibilities: [
        "Design, write, and maintain Appium scripts for Android and iOS automated testing.",
        "Execute manual smoke, regression, and exploratory tests on real devices and emulators.",
        "Identify, document, and track defects in JIRA or equivalent.",
        "Collaborate with mobile developers to reproduce issues and verify fixes.",
        "Validate platform-specific functionality, including push notifications, in-app purchases, and offline modes.",
        "Monitor application performance and report on stability metrics.",
        "Stay up-to-date with the latest mobile OS releases and best practices.",
      ],
    },
    keySkills: [
      "Mobile automation with Appium",
      "Hands-on experience testing Android and iOS apps",
      "Strong understanding of mobile testing tools and device farms (e.g., Sauce Labs)",
      "Familiarity with mobile CI tools (Bitrise, Fastlane)",
      "Solid manual testing and defect-tracking skills",
    ],
  },
  {
    id: 8,
    title: "GCP Test Engineer",
    active: true,
    locations: ["Palo Alto, CA"],
    introduction:
      "As a GCP Test Engineer, you will ensure the reliability and scalability of our cloud-native services running on Google Cloud Platform through automated testing and infrastructure validation.",
    jobDescription: {
      keyResponsibilities: [
        "Develop automated tests for microservices deployed on GCP (Compute Engine, Cloud Run, GKE).",
        "Validate infrastructure as code (IaC) deployments using Terraform.",
        "Write and maintain test suites for Kubernetes environments (helm charts, manifests).",
        "Integrate tests into GitLab CI/CD or Cloud Build pipelines.",
        "Monitor test results and collaborate with DevOps to remediate failures.",
        "Perform load and performance testing of services on GCP.",
        "Document test plans, cases, and infrastructure configurations.",
      ],
    },
    keySkills: [
      "Google Cloud Platform (GCP) services expertise",
      "Kubernetes (GKE) and container orchestration",
      "Infrastructure as Code: Terraform",
      "Automated testing frameworks (Python/Go/Java)",
      "CI/CD integration on GCP (Cloud Build, Jenkins)",
    ],
  },
  {
    id: 9,
    title: "Manual Test Engineer (E-commerce)",
    active: true,
    locations: ["New York, NY"],
    introduction:
      "Join our retail e-commerce team to manually test shopping cart workflows, payment integrations, and front-end features to deliver a seamless online shopping experience.",
    jobDescription: {
      keyResponsibilities: [
        "Execute detailed manual test cases for cart, checkout, promotions, and user account flows.",
        "Validate integration with payment gateways and third-party APIs.",
        "Report, track, and verify defects in JIRA.",
        "Work closely with UX designers and developers to clarify requirements.",
        "Perform cross-browser and responsive testing across devices.",
        "Document test results and continuously improve test coverage.",
      ],
    },
    keySkills: [
      "Strong manual testing background in e-commerce",
      "Experience with shopping cart and payment workflows",
      "Familiarity with browser dev tools and cross-browser testing",
      "Defect tracking in JIRA or similar",
      "Basic SQL for database validation",
    ],
  },
  {
    id: 10,
    title: "AWS DevOps Lead Engineer",
    active: true,
    locations: ["New York, NY", "Phoenix, AZ"],
    introduction:
      "Lead our DevOps practice by architecting and implementing scalable, secure CI/CD pipelines and AWS infrastructure to support development and operations teams.",
    jobDescription: {
      keyResponsibilities: [
        "Design and manage AWS environments using CloudFormation or Terraform.",
        "Build and optimize CI/CD pipelines (GitHub Actions, Jenkins, CodePipeline).",
        "Implement monitoring, logging, and alerting (CloudWatch, ELK, Prometheus).",
        "Automate infrastructure provisioning and deployments.",
        "Enforce best practices for security, compliance, and cost optimization.",
        "Mentor and onboard DevOps engineers across teams.",
      ],
    },
    keySkills: [
      "Deep expertise in AWS services (EC2, S3, RDS, Lambda, VPC)",
      "Infrastructure as Code: CloudFormation, Terraform",
      "CI/CD tools and pipelines",
      "Containerization (Docker, ECS/EKS)",
      "Monitoring and logging solutions",
    ],
  },
  {
    id: 11,
    title: "Cloud Solutions Architect",
    active: true,
    locations: ["New York, NY"],
    introduction:
      "As a Cloud Solutions Architect, you will define architecture blueprints, guide cloud migrations, and ensure our platforms are designed for performance, security, and scalability.",
    jobDescription: {
      keyResponsibilities: [
        "Gather requirements and design end-to-end cloud architectures.",
        "Lead cloud migration assessments and proofs of concept.",
        "Define best practices, governance models, and security controls.",
        "Collaborate with engineering teams to validate designs.",
        "Provide technical leadership during implementation phases.",
        "Stay current on emerging cloud technologies and frameworks.",
      ],
    },
    keySkills: [
      "Broad multi-cloud experience (AWS, Azure, GCP)",
      "Solution design and reference architecture creation",
      "Security frameworks (IAM, encryption, network security)",
      "Infrastructure as Code (Terraform, ARM, CloudFormation)",
      "Strong communication and stakeholder management",
    ],
  },
  {
    id: 12,
    title: "Azure Cloud / AKS Engineering Manager",
    active: true,
    locations: ["Montvale, NJ"],
    introduction:
      "We seek an experienced hands-on engineering manager with deep Azure experience, to join a large custom-application team. Lead migration efforts from IAAS/VM to PAAS via containerization with AKS",
    jobDescription: {
      keyResponsibilities: [
        "Lead a team of cloud engineers to build and operate containerized applications on Azure Kubernetes Service, ensuring high availability and efficient deployments.",
        "Manage and mentor a team of Azure/AKS engineers. Oversee AKS cluster provisioning, configuration, and upgrades.",
        "Lead a dynamic team of cloud engineers to provision and configure resources in Microsoft Azure environments, supporting the development and production use of the company's global applications.",
        "Ensure all resources adhere to pre-existing templates and change management policies.",
        "Design robust, cloud-based infrastructure for secure deployment of global applications, leveraging advanced Azure capabilities such as Azure Kubernetes Service (AKS), and OpenAI/ChatGPT, and Azure Databricks,",
        "Develop strategic Azure roadmaps for the adoption of new services, aligning with the company's application needs and future goals.",
        "Collaborate on the design, implementation, and testing of security, high-availability, and disaster recovery solutions, utilizing Azure capabilities like Azure Site Recovery.",
        "Provide critical support in troubleshooting during deployment activities and resolving major incidents.",
        "Create automations and comprehensive documentation to ensure repeatable and supportable environment and infrastructure configurations.",
        "Serve as a technical delivery lead on key initiatives, ensuring project milestones and deliverables are met.",
        "Develop and manage detailed project schedules outlining all necessary activities and milestones for successful technical delivery.",
        "Act as an essential member of the Engineering organization, participating in key meetings with business stakeholders, suppliers, and team members.",
        "Ensure team compliance with the company's administrative, compliance, and training requirements.",
      ],
    },
    desiredQualificationsAndSkills: [
      "Bachelor's Degree in Computer Science, Management Information Systems, or a related field, or equivalent experience.",
      "Must have in-depth knowledge of Azure AKS and significant experience working in the Azure portal, evaluating SKUs, helping make decisions on AKS versions and migrations, following Microsoft's AKS development/deployment roadmap.",
      "Must have Azure certifications.",
      "Agile or other management certifications are a plus.",
      "At least fifteen years of recent experience in delivering enterprise systems, with a focus on globally available solutions.",
      "In-depth technical knowledge of Microsoft Azure Cloud infrastructure/services, storage concepts, networking basics, and delivery models.",
      "Proven experience leading large, complex technology programs, with the ability to manage resources and multiple projects simultaneously.",
      "Strong interpersonal skills with the ability to engage confidently with staff, managers, and partners across the firm. Adept at working with diverse cultural backgrounds.",
      "Experience managing small teams (five to ten people), including both internal staff and vendor personnel.",
    ],
  },
  {
    id: 13,
    title: "AWS Data Engineer",
    active: true,
    locations: ["Phoenix, AZ", "McLean, VA"],
    introduction:
      "Build and maintain scalable data pipelines on AWS to ingest, process, and store large volumes of structured and unstructured data for analytics and machine learning.",
    jobDescription: {
      keyResponsibilities: [
        "Design ETL/ELT workflows using AWS Glue, Lambda, and Step Functions.",
        "Manage data storage solutions: S3, Redshift, RDS.",
        "Optimize Spark jobs on EMR or Glue for performance.",
        "Implement data quality, validation, and monitoring.",
        "Collaborate with data scientists and analysts to deliver datasets.",
        "Document pipeline architectures and data dictionaries.",
      ],
    },
    keySkills: [
      "AWS data services: Glue, EMR, Redshift, S3",
      "Python or Scala for data processing",
      "SQL proficiency",
      "Workflow orchestration (Airflow, Step Functions)",
      "Data modeling and performance tuning",
    ],
  },
  {
    id: 14,
    title: "Azure Data Engineer",
    active: true,
    locations: ["Phoenix, AZ", "McLean, VA"],
    introduction:
      "Develop robust data solutions on Azure, leveraging Azure Data Factory, Databricks, and Synapse Analytics to support enterprise reporting and analytics.",
    jobDescription: {
      keyResponsibilities: [
        "Create and manage ETL pipelines in Azure Data Factory.",
        "Build Spark-based transformations in Azure Databricks.",
        "Optimize data warehouse schemas in Synapse Analytics.",
        "Ensure data quality, governance, and lineage tracking.",
        "Collaborate with BI teams to deliver semantic models.",
        "Monitor performance and cost of data platforms.",
      ],
    },
    keySkills: [
      "Azure Data Factory, Databricks, Synapse Analytics",
      "Python/Scala and SQL",
      "Data modeling for analytics",
      "CI/CD for data pipelines (DevOps)",
    ],
  },
  {
    id: 15,
    title: "GCP Data Engineer",
    active: true,
    locations: ["Phoenix, AZ", "McLean, VA"],
    introduction:
      "Implement data ingestion, transformation, and analytics workloads on GCP, using tools like Dataflow, BigQuery, and Pub/Sub to power real-time and batch pipelines.",
    jobDescription: {
      keyResponsibilities: [
        "Develop pipelines in Dataflow (Apache Beam) and Cloud Data Fusion.",
        "Load and query large datasets in BigQuery.",
        "Manage streaming ingestion with Pub/Sub and Dataflow.",
        "Optimize query performance and manage partitioning/clustering.",
        "Set up monitoring and alerts via Stackdriver.",
        "Document architecture and data schemas.",
      ],
    },
    keySkills: [
      "GCP services: Dataflow, BigQuery, Pub/Sub",
      "Python/Java for Beam pipelines",
      "SQL for large-scale analytics",
      "Monitoring with Cloud Monitoring (Stackdriver)",
      "Data governance and security on GCP",
    ],
  },
  {
    id: 16,
    title: "Data and Analytics Lead Consultant",
    active: true,
    locations: ["Montvale, NJ"],
    introduction:
      "Serve as a strategic advisor for data and analytics initiatives, guiding clients on architecture, best practices, and technology selection to drive data-driven decisions.",
    jobDescription: {
      keyResponsibilities: [
        "Lead discovery workshops to understand business requirements.",
        "Develop end-to-end data and analytics roadmaps.",
        "Recommend appropriate cloud/data technologies and frameworks.",
        "Oversee proof-of-concepts and pilot implementations.",
        "Mentor client teams on data governance and modeling.",
        "Present findings and KPIs to executive stakeholders.",
      ],
    },
    keySkills: [
      "Strong consulting background in data/analytics",
      "Familiarity across cloud platforms (AWS, Azure, GCP)",
      "Expertise in BI tools (Tableau, Power BI)",
      "Data governance and compliance knowledge",
      "Excellent communication and presentation skills",
    ],
  },
  {
    id: 17,
    title: "Cybersecurity Analyst",
    active: true,
    locations: ["Piscataway, NJ"],
    introduction:
      "Protect our information assets by implementing and monitoring security controls, firewalls, and compliance processes in accordance with GLBA and other regulations.",
    jobDescription: {
      keyResponsibilities: [
        "Configure and maintain SonicWall firewalls and VPNs.",
        "Manage Windows Active Directory setup, group policies, and support.",
        "Perform vulnerability assessments and penetration testing.",
        "Monitor security alerts and investigate incidents.",
        "Develop and enforce security policies under GLBA.",
        "Conduct regular security audits and reporting.",
      ],
    },
    keySkills: [
      "SonicWall firewall expertise",
      "Windows Active Directory configuration & support",
      "Knowledge of GLBA and security frameworks (ISO 27001, NIST)",
      "Vulnerability assessment tools (Nessus, Qualys)",
      "Incident response and forensics",
    ],
  },
  {
    id: 18,
    title: "Scrum Master / Technical Progra/Project Manager",
    active: true,
    locations: ["Phoenix, AZ"],
    introduction:
      "Guide Agile teams as Scrum Master or TPM, facilitating ceremonies, removing impediments, and coordinating cross-functional delivery of software products.",
    jobDescription: {
      keyResponsibilities: [
        "Coach teams on Scrum/Agile best practices and principles.",
        "Facilitate sprint planning, daily stand-ups, retrospectives, and reviews.",
        "Track and report on team velocity and delivery metrics.",
        "Identify and escalate risks; work with stakeholders to resolve blockers.",
        "Coordinate across multiple teams and manage program timelines.",
        "Maintain product backlog in Jira and ensure clear user stories.",
      ],
    },
    keySkills: [
      "Certified Scrum Master (CSM, PSM) or TPM experience",
      "Strong facilitation and communication skills",
      "Agile tools: Jira, Confluence",
      "Risk and dependency management",
      "Basic technical understanding of software development",
    ],
  },
  {
    id: 19,
    title: "Android Engineer",
    active: true,
    locations: ["CA"],
    introduction:
      "Design and build high-performance Android applications, collaborating on architecture, UI/UX, and integration with backend services.",
    jobDescription: {
      keyResponsibilities: [
        "Develop native Android apps using Kotlin/Java and Android Jetpack.",
        "Architect modular, testable code following MVVM/MVP patterns.",
        "Integrate with RESTful APIs and WebSocket services.",
        "Write unit and instrumentation tests.",
        "Optimize app performance, memory, and battery usage.",
        "Participate in code reviews and mentoring.",
      ],
    },
    keySkills: [
      "Proficiency in Kotlin and Android SDK",
      "Experience with Jetpack components (LiveData, ViewModel, Navigation)",
      "REST API integration and JSON parsing",
      "Unit testing (JUnit, Espresso)",
      "Familiarity with CI (CircleCI, GitHub Actions)",
    ],
  },
  {
    id: 20,
    title: "iOS Developer",
    active: true,
    locations: ["CA"],
    introduction:
      "Create and maintain robust, user-friendly iOS applications using Swift and Apple’s frameworks, with a strong focus on code quality and performance.",
    jobDescription: {
      keyResponsibilities: [
        "Build iOS apps in Swift, using UIKit and SwiftUI constructs.",
        "Architect applications with MVVM or VIPER patterns.",
        "Consume RESTful APIs, handle offline caching.",
        "Implement unit/UI tests (XCTest, XCUITest).",
        "Profile and optimize app performance using Instruments.",
        "Participate in design discussions and peer reviews.",
      ],
    },
    keySkills: [
      "Strong Swift skills and familiarity with Objective-C interoperability",
      "UIKit and SwiftUI experience",
      "Networking (URLSession, Alamofire) and JSON parsing",
      "Test automation (XCTest, XCUITest)",
      "App Store submission process",
    ],
  },
  {
    id: 21,
    title: "Senior Data Governance Specialist",
    active: true,
    locations: ["New York, NY", "Phoenix, AZ"],
    introduction:
      "Lead data governance initiatives by defining policies, standards, and processes to ensure data quality, lineage, and compliance across the organization.",
    jobDescription: {
      keyResponsibilities: [
        "Develop and implement data governance frameworks and policies.",
        "Define data ownership, stewardship roles, and accountability.",
        "Establish metadata management, data catalogs, and lineage tracking.",
        "Monitor data quality metrics and drive remediation efforts.",
        "Collaborate with legal and compliance teams on regulatory requirements.",
        "Provide training and best-practice guidelines to data users.",
      ],
    },
    keySkills: [
      "Deep expertise in data governance and metadata tools like Collibra",
      "Knowledge of regulatory standards (GDPR, CCPA, HIPAA)",
      "Strong communication and stakeholder management",
      "Data quality, lineage, and cataloging",
      "Experience with enterprise data platforms",
    ],
  },
];
