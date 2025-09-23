// @ts-ignore
import Dexie, { Table } from "dexie"
import { v4 as uuidv4 } from "uuid"

//  Types 

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


export interface Candidate {
  id: string 
  name: string
  email: string
  jobId: number
  stage: "applied" | "screen" | "tech" | "offer" | "hired" | "rejected"
}

// Assessment type: numeric auto-increment ID

export interface Assessment {
  id: string;            // Dexie auto-incremented id
  jobId: number;          // index field
  data: any;              // raw JSON blob
}

//  Dexie DB class setup here

export class TalentFlowDB extends Dexie {
  jobs!: Table<Job, number>
  candidates!: Table<Candidate, string> 
  assessments!: Table<Assessment, number>

  constructor() {
    super("TalentFlowDB")

    this.version(1).stores({
      jobs: "++id, title, slug, status, order, *tags", 
      candidates: "id, name, email, jobId, stage", 
      assessments: "++id, jobId",           
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
