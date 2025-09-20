import { http, HttpResponse, PathParams } from "msw";
import { db, Job } from "@/db/schema";
interface Candidate {
  id?: number;
  name: string;
  email: string;
  jobId: number;
  stage: "applied" | "screen" | "tech" | "offer" | "hired" | "rejected";
}
// Types for pagination and filtering
interface PaginationResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface JobFilters {
  status?: string;
  search?: string;
  tags?: string[];
}

interface JobParams extends PathParams {
  id: string;
}

// Helper function to apply filters
const applyFilters = (jobs: Job[], filters: JobFilters): Job[] => {
  let filtered = [...jobs];

  // Filter by status
  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter(job => job.status === filters.status);
  }

  // Filter by search term (title or slug)
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filtered = filtered.filter(job => 
      job.title.toLowerCase().includes(searchTerm) ||
      job.slug.toLowerCase().includes(searchTerm)
    );
  }

  // Filter by tags
  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter(job =>
      filters.tags!.some(tag => job.tags.includes(tag))
    );
  }

  return filtered;
};

// Helper function to paginate results
const paginate = <T>(items: T[], page: number, limit: number): PaginationResponse<T> => {
  const total = items.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const data = items.slice(startIndex, endIndex);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};

// Error and success response helpers
const errorResponse = (message: string, status: number) =>
  HttpResponse.json({ error: message }, { status });

const successResponse = <T>(data: T, status: number = 200) =>
  //@ts-ignore
  HttpResponse.json(data, { status });


export const handlers = [
  // GET /jobs with filtering and pagination
  //@ts-ignore
  http.get("/jobs", async ({ request }): Promise<HttpResponse> => {
    try {
      const url = new URL(request.url);
      
      // this will Parse query parameters
      const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
      const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '10')));
      const status = url.searchParams.get('status') || undefined;
      const search = url.searchParams.get('search') || undefined;
      const tagsParam = url.searchParams.get('tags');
      const tags = tagsParam ? tagsParam.split(',').map(t => t.trim()) : undefined;
      const sortBy = url.searchParams.get('sortBy') || 'order';
      const sortOrder = url.searchParams.get('sortOrder') || 'asc';

      // this will fetch all jobs from database
      const allJobs = await db.jobs.toArray();

      // server side filtering
      const filters: JobFilters = { status, search, tags };
      const filteredJobs = applyFilters(allJobs, filters);

      
      const sortedJobs = [...filteredJobs].sort((a, b) => {
        let aValue: any = a[sortBy as keyof Job];
        let bValue: any = b[sortBy as keyof Job];

        
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (sortOrder === 'desc') {
          return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        } else {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        }
      });

      // Apply pagination
      const paginatedResult = paginate(sortedJobs, page, limit);

      // Add small delay to simulate network latency
      await new Promise(resolve => setTimeout(resolve, 300));

      return successResponse(paginatedResult);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      return errorResponse("Failed to fetch jobs", 500);
    }
  }),
  //@ts-ignore
  http.get("/api/jobs/count", async (): Promise<HttpResponse> => {
  try {
    // Get total count from database
    const totalJobs = await db.jobs.count();
    
    // Add small delay to simulate network latency
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return successResponse({ count: totalJobs });
  } catch (error) {
    console.error("Failed to get job count:", error);
    return errorResponse("Failed to get job count", 500);
  }
}),
  // GET /jobs/:id → return one job (unchanged)
  //@ts-ignore
  http.get<JobParams>("/jobs/:id", async ({ params }): Promise<HttpResponse> => {
    try {
      const id = Number(params.id);
      
      if (isNaN(id)) {
        return errorResponse("Invalid job ID", 400);
      }

      const job = await db.jobs.get(id);

      if (!job) {
        return errorResponse("Job not found", 404);
      }

      return successResponse<Job>(job);
    } catch (error) {
      console.error("Failed to fetch job:", error);
      return errorResponse("Failed to fetch job", 500);
    }
  }),

  // POST /jobs → create a new job (unchanged)
  //@ts-ignore
  http.post("/jobs", async ({ request }): Promise<HttpResponse> => {
    try {
      let jobData: Partial<Job>;
      
      try {
        jobData = await request.json() as Partial<Job>;
      } catch {
        return errorResponse("Invalid JSON payload", 400);
      }

      if (!jobData.title || !jobData.slug) {
        return errorResponse("Missing required fields: title and slug", 400);
      }

      const newJobData: Omit<Job, 'id'> = {
        ...jobData as Omit<Job, 'id'>,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const id = await db.jobs.add(newJobData);
      const newJob = await db.jobs.get(id);

      if (!newJob) {
        return errorResponse("Failed to retrieve created job", 500);
      }

      return successResponse<Job>(newJob, 201);
    } catch (error) {
      console.error("Failed to create job:", error);
      return errorResponse("Failed to create job", 500);
    }
  }),

  // PUT /jobs/:id → update job (unchanged)
  //@ts-ignore
  http.put<JobParams>("/jobs/:id", async ({ params, request }): Promise<HttpResponse> => {
    try {
      const id = Number(params.id);
      
      if (isNaN(id)) {
        return errorResponse("Invalid job ID", 400);
      }

      let updates: Partial<Job>;
      
      try {
        updates = await request.json() as Partial<Job>;
      } catch {
        return errorResponse("Invalid JSON payload", 400);
      }

      const existingJob = await db.jobs.get(id);
      if (!existingJob) {
        return errorResponse("Job not found", 404);
      }

      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };

      await db.jobs.update(id, updateData);
      const updatedJob = await db.jobs.get(id);

      if (!updatedJob) {
        return errorResponse("Failed to retrieve updated job", 500);
      }

      return successResponse<Job>(updatedJob);
    } catch (error) {
      console.error("Failed to update job:", error);
      return errorResponse("Failed to update job", 500);
    }
  }),

  // DELETE /jobs/:id → remove job (unchanged)
  //@ts-ignore
  http.delete<JobParams>("/jobs/:id", async ({ params }): Promise<HttpResponse> => {
    try {
      const id = Number(params.id);
      
      if (isNaN(id)) {
        return errorResponse("Invalid job ID", 400);
      }

      const existingJob = await db.jobs.get(id);
      if (!existingJob) {
        return errorResponse("Job not found", 404);
      }

      await db.jobs.delete(id);
      return successResponse<{ message: string }>({ message: "Job deleted successfully" });
    } catch (error) {
      console.error("Failed to delete job:", error);
      return errorResponse("Failed to delete job", 500);
    }
  }),
    //candidates Handler begin from here
    // routes from here are related to fetching candidates info and patching data for candidates like when moving them to different stages of a job.

    http.get('/candidates', async ({ request }) => {
      try {
        // Get URL search params for pagination
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page') || '1') || 1;
        const limit = parseInt(url.searchParams.get('limit') !) || 25;
        const stage = url.searchParams.get('stage') || '';

        // Fetch all candidates from the Dexie database
        let candidates = await db.candidates.toArray();

        // Apply search filter if provided
        if (stage) {
          candidates = candidates.filter((candidate: Candidate) =>
            candidate.stage.toLowerCase().includes(stage.toLowerCase())
          );
        }

        // Calculate pagination
        const total = candidates.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        
        // Get paginated results
        const paginatedCandidates = candidates.slice(startIndex, endIndex);
        
        // Simulate network delay (corrected syntax)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return HttpResponse.json({
          data: paginatedCandidates,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        });
      } catch (error) {
        console.error('Error fetching candidates from IndexedDB:', error);
        
        return HttpResponse.json(
          { error: 'Failed to fetch candidates' },
          { status: 500 }
        );
      }
    })




];