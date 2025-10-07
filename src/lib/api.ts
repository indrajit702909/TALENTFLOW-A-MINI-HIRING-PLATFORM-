import { Job, Candidate, Assessment } from '@/types';

const BASE_URL = '/api';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const api = {
  // Jobs
  async getJobs(params: {
    search?: string;
    status?: string;
    page?: number;
    pageSize?: number;
    sort?: string;
  }): Promise<PaginatedResponse<Job>> {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.set('search', params.search);
    if (params.status) queryParams.set('status', params.status);
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.pageSize) queryParams.set('pageSize', params.pageSize.toString());
    if (params.sort) queryParams.set('sort', params.sort);

    const response = await fetch(`${BASE_URL}/jobs?${queryParams}`);
    if (!response.ok) throw new Error('Failed to fetch jobs');
    return response.json();
  },

  async createJob(data: Partial<Job>): Promise<Job> {
    const response = await fetch(`${BASE_URL}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create job');
    }
    return response.json();
  },

  async updateJob(id: string, data: Partial<Job>): Promise<Job> {
    const response = await fetch(`${BASE_URL}/jobs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update job');
    }
    return response.json();
  },

  async reorderJob(id: string, fromOrder: number, toOrder: number): Promise<void> {
    const response = await fetch(`${BASE_URL}/jobs/${id}/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromOrder, toOrder }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to reorder job');
    }
  },

  // Candidates
  async getCandidates(params: {
    search?: string;
    stage?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Candidate>> {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.set('search', params.search);
    if (params.stage) queryParams.set('stage', params.stage);
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.pageSize) queryParams.set('pageSize', params.pageSize.toString());

    const response = await fetch(`${BASE_URL}/candidates?${queryParams}`);
    if (!response.ok) throw new Error('Failed to fetch candidates');
    return response.json();
  },

  async createCandidate(data: Partial<Candidate>): Promise<Candidate> {
    const response = await fetch(`${BASE_URL}/candidates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create candidate');
    }
    return response.json();
  },

  async updateCandidate(id: string, data: Partial<Candidate>): Promise<Candidate> {
    const response = await fetch(`${BASE_URL}/candidates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update candidate');
    }
    return response.json();
  },

  async getCandidateTimeline(id: string): Promise<any[]> {
    const response = await fetch(`${BASE_URL}/candidates/${id}/timeline`);
    if (!response.ok) throw new Error('Failed to fetch candidate timeline');
    return response.json();
  },

  // Assessments
  async getAssessment(jobId: string): Promise<Assessment | null> {
    const response = await fetch(`${BASE_URL}/assessments/${jobId}`);
    if (!response.ok) throw new Error('Failed to fetch assessment');
    return response.json();
  },

  async saveAssessment(jobId: string, data: Partial<Assessment>): Promise<Assessment> {
    const response = await fetch(`${BASE_URL}/assessments/${jobId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save assessment');
    }
    return response.json();
  },

  async submitAssessment(jobId: string, responses: Record<string, any>): Promise<{ success: boolean; submissionId: string }> {
    const response = await fetch(`${BASE_URL}/assessments/${jobId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(responses),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit assessment');
    }
    return response.json();
  },
};
