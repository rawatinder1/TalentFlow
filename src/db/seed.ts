import { faker, FakerError } from "@faker-js/faker";
import { Job } from "./schema";
import { db } from "./schema"; 
import {Candidate} from "./schema"
import { CollisionsOverlap } from "@tsparticles/engine";

export function toSlug(input: string): string {
  return input
    .toLowerCase()                
    .trim()                       
    .replace(/[^\w\s-]/g, "")     
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-");        
}

export function generateJobs(count = 25): Job[] {
  //@ts-ignore
  return Array.from({ length: count }, (_, i) => {
    const title = faker.person.jobTitle();
    const slug = toSlug(title);

    return {
      // id is handled by Dexie (auto-increment), so we don't set it here
      title,
      slug,
      status: faker.helpers.arrayElement(["active", "archived"]),
      tags: faker.helpers.arrayElements(
        ["react", "typescript", "design", "backend", "frontend", "fullstack"],
        faker.number.int({ min: 1, max: 3 }) // should pick between  1–3 tags
      ),
      order: i, // keep order as index
      createdAt: faker.date.past({ years: 1 }),  // random date in past year
      updatedAt: new Date(),                     // now
    };
  });
}

export function generateCandidates(cnt: number): Candidate[] {
  //@ts-ignore
  return Array.from({ length: cnt }, (_, i) => {
    const name = faker.person.fullName();
    const email = faker.internet.email({ firstName: name.split(" ")[0], lastName: name.split(" ")[1] });

    return {
      id: faker.string.uuid(),   // or i.toString()
      name,
      email,
      jobId: faker.number.int({ min: 1, max: 25 }),
      stage: faker.helpers.arrayElement([
        "applied",
        "screen",
        "tech",
        "offer",
        "hired",
        "rejected",
      ]),
    };
  }
  )}
export async function seedDatabase(count = 25,cnt=1000): Promise<void> {
  try {
    // Check if database already has jobs
    const existingJobsCount = await db.jobs.count();
    const existingCandidatesCount=await db.candidates.count();
    
    if (existingJobsCount > 0 && existingCandidatesCount>0) {
      console.log(`Database already has ${existingJobsCount} jobs and ${existingCandidatesCount}. Skipping seed.`);
      return;
    }

    // Generate and add jobs to database
    const jobs = generateJobs(count);
    const candidates=generateCandidates(cnt);
    console.log(jobs);
    await db.jobs.bulkAdd(jobs);
    
    console.log(`Successfully seeded database with ${count} jobs!`);
    await db.candidates.bulkAdd(candidates);
    console.log(`Successfully seeded database with ${cnt} candidates!`);

  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Alternative function to force reseed (clears existing data)
//wont be needing this fn  but leaving it here just in case 
/*
export async function reseedDatabase(count = 25): Promise<void> {
  try {
    // Clear existing jobs
    await db.jobs.clear();
    
    // Generate and add new jobs
    const jobs = generateJobs(count);
    await db.jobs.bulkAdd(jobs);
    
    console.log(`Successfully reseeded database with ${count} jobs!`);
  } catch (error) {
    console.error("Error reseeding database:", error);
    throw error;
  }
}
  */
/*console.log(generateCandidates(25));*/
/*console.log(generateJobs(25));*/
seedDatabase(25, 1000);

