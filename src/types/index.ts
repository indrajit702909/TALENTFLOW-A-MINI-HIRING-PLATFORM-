export type JobStatus = "active" | "archived";

export interface Job {
  id: string;
  title: string;
  slug: string;
  status: JobStatus;
  tags: string[];
  order: number;
  department?: string;
  location?: string;
  description?: string;
  createdAt: string;
}

export type CandidateStage =
  | "applied"
  | "screen"
  | "tech"
  | "offer"
  | "hired"
  | "rejected";

export interface Candidate {
  id: string;
  name: string;
  email: string;
  stage: CandidateStage;
  jobId: string;
  appliedAt: string;
  phone?: string;
  resume?: string;
}

export interface TimelineEvent {
  id: string;
  candidateId: string;
  type: "stage_change" | "note" | "assessment";
  timestamp: string;
  fromStage?: CandidateStage;
  toStage?: CandidateStage;
  note?: string;
  userId?: string;
}

export type QuestionType =
  | "single-choice"
  | "multi-choice"
  | "short-text"
  | "long-text"
  | "numeric"
  | "file-upload";

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  required: boolean;
  order: number;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
  };
  minValue?: number;
  maxValue?: number;
  maxLength?: number;
  conditionalOn?: {
    questionId: string;
    value: string | string[];
  };
}

export interface AssessmentSection {
  id: string;
  title: string;
  description?: string;
  order: number;
  questions: Question[];
}

export interface Assessment {
  id: string;
  jobId: string;
  title?: string;
  sections: AssessmentSection[];
  createdAt: string;
}

export interface AssessmentResponse {
  id: string;
  assessmentId: string;
  candidateId: string;
  responses: Record<string, any>;
  submittedAt?: string;
}
