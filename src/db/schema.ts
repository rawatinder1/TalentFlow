import Dexie, { Table } from "dexie/dist/dexie"

// Define Job type
export interface Job {
  id?: number; // Auto-increment key
  title: string;
  slug: string;
  status: "active" | "archived";
  tags: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Define Candidate type
export interface Candidate {
  id?: number;
  name: string;
  email: string;
  jobId: number;
  stage: "applied" | "screen" | "tech" | "offer" | "hired" | "rejected";
}

// Define Assessment type
export interface Assessment {
  id?: number;
  jobId: number;
  questions: {
    type: "single" | "multi" | "short" | "long" | "numeric";
    question: string;
    options: string[];
  }[];
}

// Create Dexie DB
export class TalentFlowDB extends Dexie {
  jobs!: Table<Job, number>;
  candidates!: Table<Candidate, number>;
  assessments!: Table<Assessment, number>;

  constructor() {
    super("TalentFlowDB");

    this.version(1).stores({
      jobs: "++id, title, slug, status, order, *tags",
      candidates: "++id, name, email, jobId, stage",
      assessments: "++id, jobId"
    });
  }
}

// Export instance
export const db = new TalentFlowDB();
