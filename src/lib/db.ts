import Dexie, { Table } from 'dexie';
import { Job, Candidate, Assessment } from '@/types';

export class AtsDatabase extends Dexie {
  jobs!: Table<Job, string>;
  candidates!: Table<Candidate, string>;
  assessments!: Table<Assessment, string>;

  constructor() {
    super('AtsDatabase');
    this.version(1).stores({
      jobs: 'id, slug, status, department, createdAt, order',
      candidates: 'id, jobId, stage, email, appliedAt, name',
      assessments: 'id, jobId, createdAt',
    });
  }
}

export const db = new AtsDatabase();

// Initialize database with seed data
export async function initializeDatabase() {
  const jobCount = await db.jobs.count();
  
  if (jobCount === 0) {
    console.log('🌱 Seeding database...');
    
    // Generate 25 jobs
    const jobs = generateJobs(25);
    await db.jobs.bulkAdd(jobs);
    
    // Generate 1000 candidates
    const candidates = generateCandidates(jobs, 1000);
    await db.candidates.bulkAdd(candidates);
    
    // Generate 3 assessments
    const assessments = generateAssessments(jobs.slice(0, 3));
    await db.assessments.bulkAdd(assessments);
    
    console.log('✅ Database seeded successfully');
  }
}

// Seed data generators
const departments = ["Engineering", "Product", "Design", "Marketing", "Sales", "Operations"];
const locations = ["Remote", "New York, NY", "San Francisco, CA", "London, UK", "Berlin, Germany"];
const firstNames = ["Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan", "Sophia", "Mason", "Isabella", "William", "Mia", "James", "Charlotte", "Benjamin", "Amelia", "Lucas", "Harper", "Henry", "Evelyn", "Alexander"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];

const jobTitles = [
  "Senior Software Engineer",
  "Product Manager",
  "UX Designer",
  "Frontend Developer",
  "Backend Engineer",
  "DevOps Engineer",
  "Data Scientist",
  "Marketing Manager",
  "Sales Representative",
  "Account Executive",
  "Customer Success Manager",
  "Technical Writer",
  "QA Engineer",
  "Security Engineer",
  "Mobile Developer",
  "Full Stack Developer",
  "UI Designer",
  "Product Designer",
  "Engineering Manager",
  "VP of Engineering",
];

const tags = [
  "Full-time",
  "Part-time",
  "Contract",
  "Remote",
  "Hybrid",
  "On-site",
  "Senior",
  "Mid-level",
  "Junior",
  "Leadership",
  "Technical",
  "Creative",
  "Urgent",
];

function generateJobs(count: number): Job[] {
  const jobs: Job[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const title = jobTitles[Math.floor(Math.random() * jobTitles.length)];
    const slug = title.toLowerCase().replace(/\s+/g, "-") + `-${i}`;
    const status: "active" | "archived" = Math.random() > 0.3 ? "active" : "archived";
    const jobTags = [
      tags[Math.floor(Math.random() * tags.length)],
      tags[Math.floor(Math.random() * tags.length)],
    ].filter((v, i, a) => a.indexOf(v) === i);

    const createdAt = new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000);

    jobs.push({
      id: `job-${i + 1}`,
      title,
      slug,
      status,
      tags: jobTags,
      order: i,
      department: departments[Math.floor(Math.random() * departments.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      description: `We are looking for a talented ${title} to join our team. This role offers exciting opportunities to work on cutting-edge projects and make a real impact.`,
      createdAt: createdAt.toISOString(),
    });
  }

  return jobs;
}

function generateCandidates(jobs: Job[], count: number): Candidate[] {
  const candidates: Candidate[] = [];
  const stages: Candidate['stage'][] = ["applied", "screen", "tech", "offer", "hired", "rejected"];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;
    const stage = stages[Math.floor(Math.random() * stages.length)];
    const job = jobs[Math.floor(Math.random() * jobs.length)];
    const appliedAt = new Date(now.getTime() - Math.random() * 60 * 24 * 60 * 60 * 1000);

    candidates.push({
      id: `candidate-${i + 1}`,
      name,
      email,
      stage,
      jobId: job.id,
      appliedAt: appliedAt.toISOString(),
      phone: `+1 (555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      resume: `https://example.com/resumes/${i + 1}.pdf`,
    });
  }

  return candidates;
}

function generateAssessments(jobs: Job[]): Assessment[] {
  const assessments: Assessment[] = [];
  const questionTypes: Array<'single-choice' | 'multi-choice' | 'short-text' | 'long-text' | 'numeric' | 'file-upload'> = 
    ['single-choice', 'multi-choice', 'short-text', 'long-text', 'numeric', 'file-upload'];

  jobs.forEach((job, index) => {
    const sections = [
      {
        id: `section-${index}-1`,
        title: "Technical Skills",
        description: "Assess candidate's technical knowledge",
        order: 0,
        questions: Array.from({ length: 5 }, (_, qIndex) => ({
          id: `q-${index}-1-${qIndex}`,
          type: questionTypes[qIndex % questionTypes.length],
          text: `Question ${qIndex + 1} for ${job.title}`,
          required: true,
          order: qIndex,
          options: ['single-choice', 'multi-choice'].includes(questionTypes[qIndex % questionTypes.length]) 
            ? ['Option A', 'Option B', 'Option C', 'Option D'] 
            : undefined,
          validation: questionTypes[qIndex % questionTypes.length] === 'numeric' 
            ? { min: 0, max: 100 } 
            : undefined,
        })),
      },
      {
        id: `section-${index}-2`,
        title: "Experience & Background",
        description: "Learn about candidate's experience",
        order: 1,
        questions: Array.from({ length: 6 }, (_, qIndex) => ({
          id: `q-${index}-2-${qIndex}`,
          type: questionTypes[(qIndex + 2) % questionTypes.length],
          text: `Experience question ${qIndex + 1}`,
          required: qIndex < 3,
          order: qIndex,
          options: ['single-choice', 'multi-choice'].includes(questionTypes[(qIndex + 2) % questionTypes.length]) 
            ? ['Yes', 'No', 'Maybe', 'Not Applicable'] 
            : undefined,
        })),
      },
    ];

    assessments.push({
      id: `assessment-${index + 1}`,
      jobId: job.id,
      title: `Assessment for ${job.title}`,
      sections,
      createdAt: new Date().toISOString(),
    });
  });

  return assessments;
}
