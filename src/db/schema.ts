// @ts-ignore
import Dexie, { Table } from "dexie"
import { v4 as uuidv4 } from "uuid"

// ------------------ Types ------------------

// Job type: numeric auto-increment ID
export interface Job {
  id?: number
  title: string
  slug: string
  status: "active" | "archived"
  tags: string[]
  order: number
  createdAt: Date
  updatedAt: Date
}

// Candidate type: UUID string ID
export interface Candidate {
  id: string // ✅ UUID string
  name: string
  email: string
  jobId: number
  stage: "applied" | "screen" | "tech" | "offer" | "hired" | "rejected"
}

// Assessment type: numeric auto-increment ID
export interface Assessment {
  id?: number
  jobId: number
  questions: {
    type: "single" | "multi" | "short" | "long" | "numeric"
    question: string
    options: string[]
  }[]
}

// ------------------ Dexie DB ------------------

export class TalentFlowDB extends Dexie {
  jobs!: Table<Job, number>
  candidates!: Table<Candidate, string> // ✅ string ID for candidates
  assessments!: Table<Assessment, number>

  constructor() {
    super("TalentFlowDB")

    this.version(1).stores({
      jobs: "++id, title, slug, status, order, *tags", // jobs = numeric auto-increment
      candidates: "id, name, email, jobId, stage",     // ✅ UUID string ID
      assessments: "++id, jobId",                      // assessments = numeric auto-increment
    })
  }
}

export const db = new TalentFlowDB()

// Utility for creating a new candidate
export function createCandidate(data: Omit<Candidate, "id">): Candidate {
  return {
    id: uuidv4(),
    ...data,
  }
}
