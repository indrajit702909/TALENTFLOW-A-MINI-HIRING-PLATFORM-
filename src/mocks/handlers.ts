import { http, HttpResponse, delay } from 'msw';
import { db } from '@/lib/db';
import { Job, Candidate } from '@/types';

// Utility functions
const getRandomDelay = () => Math.floor(Math.random() * 1000) + 200; // 200-1200ms
const shouldSimulateError = () => Math.random() < 0.08; // 8% error rate on writes
const shouldSimulateReorderError = () => Math.random() < 0.2; // 20% error rate on reorder

export const handlers = [
  // GET /jobs?search=&status=&page=&pageSize=&sort=
  http.get('/api/jobs', async ({ request }) => {
    await delay(getRandomDelay());
    
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const sort = url.searchParams.get('sort') || 'order';

    let jobs = await db.jobs.toArray();

    // Filter by search
    if (search) {
      jobs = jobs.filter(job => 
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.department.toLowerCase().includes(search.toLowerCase()) ||
        job.location.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by status
    if (status && status !== 'all') {
      jobs = jobs.filter(job => job.status === status);
    }

    // Sort
    jobs.sort((a, b) => {
      if (sort === 'order') return a.order - b.order;
      if (sort === 'createdAt') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });

    // Paginate
    const total = jobs.length;
    const start = (page - 1) * pageSize;
    const paginatedJobs = jobs.slice(start, start + pageSize);

    return HttpResponse.json({
      data: paginatedJobs,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  }),

  // POST /jobs
  http.post('/api/jobs', async ({ request }) => {
    await delay(getRandomDelay());
    
    if (shouldSimulateError()) {
      return HttpResponse.json(
        { error: 'Failed to create job. Please try again.' },
        { status: 500 }
      );
    }

    const data = await request.json() as Partial<Job>;
    const maxOrder = await db.jobs.orderBy('order').last();
    
    const newJob: Job = {
      id: `job-${Date.now()}`,
      title: data.title || '',
      slug: (data.title || '').toLowerCase().replace(/\s+/g, '-') + `-${Date.now()}`,
      status: data.status || 'active',
      tags: data.tags || [],
      order: (maxOrder?.order || 0) + 1,
      department: data.department || '',
      location: data.location || '',
      description: data.description || '',
      createdAt: new Date().toISOString(),
    };

    await db.jobs.add(newJob);
    return HttpResponse.json(newJob, { status: 201 });
  }),

  // PATCH /jobs/:id
  http.patch('/api/jobs/:id', async ({ params, request }) => {
    await delay(getRandomDelay());
    
    if (shouldSimulateError()) {
      return HttpResponse.json(
        { error: 'Failed to update job. Please try again.' },
        { status: 500 }
      );
    }

    const { id } = params;
    const updates = await request.json() as Partial<Job>;
    
    await db.jobs.update(id as string, updates);
    const updatedJob = await db.jobs.get(id as string);
    
    return HttpResponse.json(updatedJob);
  }),

  // PATCH /jobs/:id/reorder - with occasional 500 for rollback testing
  http.patch('/api/jobs/:id/reorder', async ({ params, request }) => {
    await delay(getRandomDelay());
    
    if (shouldSimulateReorderError()) {
      return HttpResponse.json(
        { error: 'Reorder failed. Rolling back changes.' },
        { status: 500 }
      );
    }

    const { id } = params;
    const { fromOrder, toOrder } = await request.json() as { fromOrder: number; toOrder: number };
    
    const jobs = await db.jobs.orderBy('order').toArray();
    const movingJob = jobs.find(j => j.id === id);
    
    if (!movingJob) {
      return HttpResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Reorder logic
    if (fromOrder < toOrder) {
      // Moving down
      for (const job of jobs) {
        if (job.order > fromOrder && job.order <= toOrder) {
          await db.jobs.update(job.id, { order: job.order - 1 });
        }
      }
    } else {
      // Moving up
      for (const job of jobs) {
        if (job.order >= toOrder && job.order < fromOrder) {
          await db.jobs.update(job.id, { order: job.order + 1 });
        }
      }
    }
    
    await db.jobs.update(id as string, { order: toOrder });
    
    return HttpResponse.json({ success: true });
  }),

  // GET /candidates?search=&stage=&page=
  http.get('/api/candidates', async ({ request }) => {
    await delay(getRandomDelay());
    
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const stage = url.searchParams.get('stage') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '50');

    let candidates = await db.candidates.toArray();

    // Filter by search
    if (search) {
      candidates = candidates.filter(candidate => 
        candidate.name.toLowerCase().includes(search.toLowerCase()) ||
        candidate.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by stage
    if (stage && stage !== 'all') {
      candidates = candidates.filter(candidate => candidate.stage === stage);
    }

    // Sort by applied date (most recent first)
    candidates.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());

    // Paginate
    const total = candidates.length;
    const start = (page - 1) * pageSize;
    const paginatedCandidates = candidates.slice(start, start + pageSize);

    return HttpResponse.json({
      data: paginatedCandidates,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  }),

  // POST /candidates
  http.post('/api/candidates', async ({ request }) => {
    await delay(getRandomDelay());
    
    if (shouldSimulateError()) {
      return HttpResponse.json(
        { error: 'Failed to create candidate. Please try again.' },
        { status: 500 }
      );
    }

    const data = await request.json() as Partial<Candidate>;
    
    const newCandidate: Candidate = {
      id: `candidate-${Date.now()}`,
      name: data.name || '',
      email: data.email || '',
      stage: data.stage || 'applied',
      jobId: data.jobId || '',
      appliedAt: new Date().toISOString(),
      phone: data.phone || '',
      resume: data.resume || '',
    };

    await db.candidates.add(newCandidate);
    return HttpResponse.json(newCandidate, { status: 201 });
  }),

  // PATCH /candidates/:id (stage transitions)
  http.patch('/api/candidates/:id', async ({ params, request }) => {
    await delay(getRandomDelay());
    
    if (shouldSimulateError()) {
      return HttpResponse.json(
        { error: 'Failed to update candidate. Please try again.' },
        { status: 500 }
      );
    }

    const { id } = params;
    const updates = await request.json() as Partial<Candidate>;
    
    await db.candidates.update(id as string, updates);
    const updatedCandidate = await db.candidates.get(id as string);
    
    return HttpResponse.json(updatedCandidate);
  }),

  // GET /candidates/:id/timeline
  http.get('/api/candidates/:id/timeline', async ({ params }) => {
    await delay(getRandomDelay());
    
    const { id } = params;
    const candidate = await db.candidates.get(id as string);
    
    if (!candidate) {
      return HttpResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    // Generate mock timeline based on stage
    const timeline = [
      {
        id: '1',
        stage: 'applied',
        date: candidate.appliedAt,
        note: 'Application received',
      },
    ];

    const stages: Candidate['stage'][] = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];
    const currentStageIndex = stages.indexOf(candidate.stage);
    
    for (let i = 1; i <= currentStageIndex; i++) {
      timeline.push({
        id: String(i + 1),
        stage: stages[i],
        date: new Date(new Date(candidate.appliedAt).getTime() + i * 7 * 24 * 60 * 60 * 1000).toISOString(),
        note: `Moved to ${stages[i]} stage`,
      });
    }

    return HttpResponse.json(timeline);
  }),

  // GET /assessments/:jobId
  http.get('/api/assessments/:jobId', async ({ params }) => {
    await delay(getRandomDelay());
    
    const { jobId } = params;
    const assessment = await db.assessments.where('jobId').equals(jobId as string).first();
    
    if (!assessment) {
      return HttpResponse.json(null);
    }

    return HttpResponse.json(assessment);
  }),

  // PUT /assessments/:jobId
  http.put('/api/assessments/:jobId', async ({ params, request }) => {
    await delay(getRandomDelay());
    
    if (shouldSimulateError()) {
      return HttpResponse.json(
        { error: 'Failed to save assessment. Please try again.' },
        { status: 500 }
      );
    }

    const { jobId } = params;
    const data = await request.json() as any;
    
    const existing = await db.assessments.where('jobId').equals(jobId as string).first();
    
    if (existing) {
      await db.assessments.update(existing.id, {
        ...data,
        jobId: jobId as string,
      });
      return HttpResponse.json(await db.assessments.get(existing.id));
    } else {
      const newAssessment = {
        id: `assessment-${Date.now()}`,
        jobId: jobId as string,
        ...data,
        createdAt: new Date().toISOString(),
      };
      await db.assessments.add(newAssessment);
      return HttpResponse.json(newAssessment, { status: 201 });
    }
  }),

  // POST /assessments/:jobId/submit (store response locally)
  http.post('/api/assessments/:jobId/submit', async ({ params, request }) => {
    await delay(getRandomDelay());
    
    if (shouldSimulateError()) {
      return HttpResponse.json(
        { error: 'Failed to submit assessment. Please try again.' },
        { status: 500 }
      );
    }

    const { jobId } = params;
    const responses = await request.json();
    
    // Store in localStorage (as per requirements)
    const submissionKey = `assessment-submission-${jobId}-${Date.now()}`;
    localStorage.setItem(submissionKey, JSON.stringify({
      jobId,
      responses,
      submittedAt: new Date().toISOString(),
    }));

    return HttpResponse.json({ 
      success: true,
      submissionId: submissionKey,
    });
  }),
];
