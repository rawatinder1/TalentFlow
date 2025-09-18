import { faker } from "@faker-js/faker";
import { Job } from "./schema";
import { db } from "./schema"; // Import the db instance

export function toSlug(input: string): string {
  return input
    .toLowerCase()                // make lowercase
    .trim()                       // remove leading/trailing spaces
    .replace(/[^\w\s-]/g, "")     // remove non-word characters
    .replace(/\s+/g, "-")         // replace spaces with -
    .replace(/--+/g, "-");        // collapse multiple dashes
}

export function generateJobs(count = 25): Job[] {
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
        faker.number.int({ min: 1, max: 3 }) // pick 1–3 tags
      ),
      order: i, // keep order as index
      createdAt: faker.date.past({ years: 1 }),  // random date in past year
      updatedAt: new Date(),                     // now
    };
  });
}

export async function seedDatabase(count = 25): Promise<void> {
  try {
    // Check if database already has jobs
    const existingJobsCount = await db.jobs.count();
    
    if (existingJobsCount > 0) {
      console.log(`Database already has ${existingJobsCount} jobs. Skipping seed.`);
      return;
    }

    // Generate and add jobs to database
    const jobs = generateJobs(count);
    console.log(jobs);
    await db.jobs.bulkAdd(jobs);
    
    console.log(`Successfully seeded database with ${count} jobs!`);
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Alternative function to force reseed (clears existing data)
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