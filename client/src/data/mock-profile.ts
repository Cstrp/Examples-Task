import type { Profile } from '@/types'

export const MOCK_PROFILES: Profile[] = [
  {
    id: 'mock-profile-001',
    firstName: 'Alex',
    lastName: 'Morgan',
    middleName: undefined,

    title: 'Fullstack Developer',

    summary:
      'Fullstack developer focused on designing scalable APIs, modern web applications and data-driven services. Experienced with TypeScript, Node.js, NestJS, React, Next.js and cloud infrastructure. Interested in AI integrations, RAG systems and developer tooling.',

    email: 'alex.morgan@example.com',
    phone: '+49 000 000000',

    location: 'Berlin, Germany',
    website: 'https://example.com',

    experiences: [
      {
        id: 'mock-exp-001',
        company: 'Northstar Labs',
        position: 'Fullstack Developer',

        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2026-01-01T00:00:00.000Z',

        location: 'Remote',

        description:
          'Designed and developed backend services, web applications and automation tools for a growing SaaS platform.',

        highlights: [
          'Designed REST APIs with NestJS',
          'Optimized PostgreSQL queries and database indexes',
          'Built internal automation and messaging services',
          'Integrated AI-powered search and retrieval features',
          'Improved deployment and development workflows',
        ],
      },

      {
        id: 'mock-exp-002',
        company: 'Bluepeak Software',
        position: 'Frontend Developer',

        startDate: '2022-01-01T00:00:00.000Z',
        endDate: '2023-12-01T00:00:00.000Z',

        location: 'Remote',

        description:
          'Developed modern web interfaces and integrated frontend applications with backend APIs.',

        highlights: [
          'Built interfaces with React and Next.js',
          'Implemented CRUD workflows',
          'Improved page performance and loading states',
          'Worked on SEO and accessibility',
          'Integrated external APIs and notifications',
        ],
      },

      {
        id: 'mock-exp-003',
        company: 'Orbit Systems',
        position: 'Software Engineer Intern',

        startDate: '2021-01-01T00:00:00.000Z',
        endDate: '2021-12-01T00:00:00.000Z',

        location: 'Hamburg, Germany',

        description:
          'Worked on backend services, internal tools and engineering workflows.',

        highlights: [
          'Implemented backend features',
          'Participated in code reviews',
          'Worked with relational databases',
        ],
      },

      {
        id: 'mock-exp-004',
        company: 'CodeCraft Community',
        position: 'Technical Mentor',

        startDate: '2022-06-01T00:00:00.000Z',
        endDate: undefined,

        location: 'Remote',

        description:
          'Mentored developers and provided guidance on JavaScript, TypeScript and software architecture.',

        highlights: [
          'Conducted technical code reviews',
          'Helped developers improve architecture',
          'Prepared technical interview sessions',
          'Provided guidance on production development',
        ],
      },
    ],

    education: [
      {
        id: 'mock-edu-001',
        institution: 'Berlin Institute of Technology',
        faculty: 'Computer Science',
        degree: 'B.Sc. Computer Science',
        startYear: 2017,
        endYear: 2021,
      },

      {
        id: 'mock-edu-002',
        institution: 'Open Software Academy',
        faculty: 'Web Development',
        degree: 'Advanced Web Development',
        startYear: 2020,
        endYear: 2021,
      },
    ],

    skills: [
      ['TypeScript', 'PROGRAMMING', 'ADVANCED'],
      ['JavaScript', 'PROGRAMMING', 'ADVANCED'],
      ['Node.js', 'BACKEND', 'ADVANCED'],
      ['NestJS', 'BACKEND', 'ADVANCED'],
      ['React', 'FRONTEND', 'ADVANCED'],
      ['Next.js', 'FRONTEND', 'ADVANCED'],
      ['PostgreSQL', 'DATABASE', 'ADVANCED'],
      ['Prisma', 'DATABASE', 'ADVANCED'],
      ['Docker', 'DEVOPS', 'ADVANCED'],
      ['AWS', 'CLOUD', 'INTERMEDIATE'],
      ['Linux', 'DEVOPS', 'ADVANCED'],
      ['GraphQL', 'BACKEND', 'INTERMEDIATE'],
      ['Redis', 'DATABASE', 'INTERMEDIATE'],
      ['AI Integration', 'BACKEND', 'ADVANCED'],
      ['RAG', 'BACKEND', 'ADVANCED'],
      ['CI/CD', 'DEVOPS', 'ADVANCED'],
      ['Testing', 'TESTING', 'ADVANCED'],
      ['System Design', 'SOFT_SKILL', 'ADVANCED'],
    ].map(([name, category, proficiency], index) => ({
      note: `Primary skill: ${name}`,
      skill: {
        id: `mock-skill-${index + 1}`,
        name,
        category,
        proficiency,
      },
    })),

    languages: [
      {
        id: 'mock-language-001',
        name: 'English',
        level: 'C1',
      },
      {
        id: 'mock-language-002',
        name: 'German',
        level: 'B2',
      },
    ],

    recommendations: [
      {
        id: 'mock-recommendation-001',
        authorName: 'Jordan Lee',
        authorOrg: 'Northstar Labs',
        authorRole: 'Engineering Manager',

        content:
          'A reliable engineer who combines strong technical knowledge with a practical approach to solving complex engineering problems.',
      },

      {
        id: 'mock-recommendation-002',
        authorName: 'Taylor Reed',
        authorOrg: 'Bluepeak Software',
        authorRole: 'Product Lead',

        content:
          'Consistently delivered high-quality work, communicated clearly and showed strong ownership of technical tasks.',
      },
    ],
  },
]