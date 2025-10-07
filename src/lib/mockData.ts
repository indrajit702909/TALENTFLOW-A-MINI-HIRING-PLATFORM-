import { Job, Candidate, CandidateStage, JobStatus } from "@/types";

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
  "Chief Technology Officer",
  "Head of Product",
  "Lead Designer",
  "Staff Engineer",
  "Principal Engineer",
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

export const generateJobs = (count: number = 25): Job[] => {
  const jobs: Job[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const title = jobTitles[Math.floor(Math.random() * jobTitles.length)];
    const slug = title.toLowerCase().replace(/\s+/g, "-") + `-${i}`;
    const status: JobStatus = Math.random() > 0.3 ? "active" : "archived";
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
};

export const generateCandidates = (jobs: Job[], count: number = 1000): Candidate[] => {
  const candidates: Candidate[] = [];
  const stages: CandidateStage[] = ["applied", "screen", "tech", "offer", "hired", "rejected"];
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
};
