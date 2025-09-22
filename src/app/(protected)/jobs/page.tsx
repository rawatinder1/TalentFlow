"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  //@ts-ignore
} from "@hello-pangea/dnd";
import { LoaderOne } from "@/components/ui/loader";

type Job = {
  id: number;
  title: string;
  status: string;
  order: number;
  tags: string[];
  slug: string;
  createdAt: Date;
  updatedAt: Date;
};

type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

type JobsResponse = {
  data: Job[];
  pagination: PaginationInfo;
};

type Filters = {
  status: string;
  search: string;
  tags: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
};

// Custom hook for throttled search
function useThrottledSearch(initialValue: string, delay: number = 500) {
  const [displayValue, setDisplayValue] = useState(initialValue);
  const [searchValue, setSearchValue] = useState(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchValue(displayValue);
    }, delay);

    return () => clearTimeout(timer);
  }, [displayValue, delay]);

  return [displayValue, searchValue, setDisplayValue] as const;
}

// Separate component for search input to prevent filter section re-renders
const SearchInput = React.memo(({ 
  value, 
  onChange, 
  isSearching 
}: { 
  value: string; 
  onChange: (value: string) => void;
  isSearching: boolean;
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-900 mb-2">
        Search
      </label>
      <div className="relative">
        <input
          type="text"
          placeholder="Search jobs..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-11 px-4 bg-white/90 backdrop-blur-sm border border-gray-200/80 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all duration-300 shadow-sm hover:shadow-lg hover:bg-white font-medium"
        />
        {isSearching && (
          <div className="absolute inset-y-0 right-3 flex items-center">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      {isSearching && (
        <div className="text-xs text-gray-500 mt-2 ml-1">
          Searching...
        </div>
      )}
    </div>
  );
});

SearchInput.displayName = "SearchInput";

// Custom Apple-style dropdown component
const AppleDropdown = React.memo(({ 
  value, 
  options, 
  onChange, 
  placeholder = "Select..." 
}: {
  value: string | number;
  options: { value: string | number; label: string; }[];
  onChange: (value: string | number) => void;
  placeholder?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(option => option.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-11 px-4 bg-white/90 backdrop-blur-sm border border-gray-200/80 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all duration-300 shadow-sm hover:shadow-lg hover:bg-white font-medium text-left flex items-center justify-between"
      >
        <span>{selectedOption?.label || placeholder}</span>
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-2xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left hover:bg-blue-50/80 transition-colors duration-150 font-medium text-sm ${
                value === option.value 
                  ? 'bg-blue-100/80 text-blue-700' 
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

AppleDropdown.displayName = "AppleDropdown";

// Separate component for non-search filters
const FilterControls = React.memo(({ 
  filters, 
  statusOptions, 
  availableTags,
  pageSize,
  onFilterChange,
  onTagToggle,
  onPageSizeChange 
}: {
  filters: Omit<Filters, 'search'>;
  statusOptions: { value: string; label: string; }[];
  availableTags: string[];
  pageSize: number;
  onFilterChange: (newFilters: Partial<Omit<Filters, 'search'>>) => void;
  onTagToggle: (tag: string) => void;
  onPageSizeChange: (size: number) => void;
}) => {
  return (
    <>
      {/* Status Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Status
        </label>
        <AppleDropdown
          value={filters.status}
          options={statusOptions}
          onChange={(value) => onFilterChange({ status: value as string })}
          placeholder="Select status..."
        />
      </div>

      {/* Sort */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Sort By
        </label>
        <div className="flex gap-2">
          <AppleDropdown
            value={filters.sortBy}
            options={[
              { value: 'order', label: 'Order' },
              { value: 'title', label: 'Title' },
              { value: 'status', label: 'Status' },
              { value: 'createdAt', label: 'Created' }
            ]}
            onChange={(value) => onFilterChange({ sortBy: value as string })}
          />
          <button
            onClick={() => onFilterChange({ 
              sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' 
            })}
            className="w-11 h-11 bg-white/90 backdrop-blur-sm border border-gray-200/80 rounded-2xl hover:bg-white hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all duration-300 shadow-sm flex items-center justify-center"
            title={`Sort ${filters.sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
          >
            <span className="text-gray-600 font-medium">
              {filters.sortOrder === 'asc' ? '↑' : '↓'}
            </span>
          </button>
        </div>
      </div>

      {/* Page Size */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Per Page
        </label>
        <AppleDropdown
          value={pageSize}
          options={[
            { value: 10, label: '10' },
            { value: 25, label: '25' },
            { value: 50, label: '50' },
            { value: 100, label: '100' }
          ]}
          onChange={(value) => onPageSizeChange(Number(value))}
        />
      </div>

      {/* Tags Filter */}
      <div className="md:col-span-3">
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Filter by Tags
        </label>
        <div className="flex flex-wrap gap-2">
          {availableTags.map(tag => (
            <button
              key={tag}
              onClick={() => onTagToggle(tag)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                filters.tags.includes(tag)
                  ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600 hover:shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </>
  );
});

FilterControls.displayName = "FilterControls";

// Separate component for the table section to isolate re-renders
const JobsTable = React.memo(({ 
  jobs, 
  loading, 
  currentPage, 
  pageSize, 
  onDragEnd,
  onNavigateToKanban
}: {
  jobs: Job[];
  loading: boolean;
  currentPage: number;
  pageSize: number;
  onDragEnd: (result: DropResult) => void;
  onNavigateToKanban: (jobId: number) => void;
}) => {
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl shadow-lg border border-green-200 overflow-hidden relative">
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <LoaderOne />
        </div>
      )}
      
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="jobs">
          {(provided:any) => (
            <table
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="w-full"
            >
              <thead className="bg-gradient-to-r from-green-500 to-emerald-600">
                <tr>
                  <th className="p-3 text-left text-white font-medium">S.No.</th>
                  <th className="p-3 text-left text-white font-medium">Title</th>
                  <th className="p-3 text-left text-white font-medium">Status</th>
                  <th className="p-3 text-left text-white font-medium">Tags</th>
                  <th className="p-3 text-left text-white font-medium">Kanban</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job, index) => (
                  <Draggable
                    key={job.id}
                    draggableId={job.id.toString()}
                    index={index}
                  >
                    {(provided:any, snapshot:any) => (
                      <tr
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`border-t border-green-200 ${
                          snapshot.isDragging 
                            ? "bg-green-100 shadow-md" 
                            : "bg-white hover:bg-green-50"
                        }`}
                      >
                        <td className="p-3">
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-green-500 text-white text-xs font-bold rounded-full">
                            {((currentPage - 1) * pageSize) + index + 1}
                          </span>
                        </td>
                        <td className="p-3">{job.title}</td>
                        <td className="p-3">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            job.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {job.tags?.slice(0, 3).map(tag => (
                              <span key={tag} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                            {job.tags?.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{job.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigateToKanban(job.id);
                            }}
                            className="inline-flex items-center justify-center w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                            title={`View Kanban for ${job.title}`}
                          >
                            <svg 
                              className="w-4 h-4" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M9 5l7 7-7 7" 
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </tbody>
            </table>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
});

JobsTable.displayName = "JobsTable";

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  
  // Filter states
  const [filters, setFilters] = useState<Filters>({
    status: 'all',
    search: '',
    tags: [],
    sortBy: 'order',
    sortOrder: 'asc'
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Throttled search hook
  const [searchInput, debouncedSearch, setSearchInput] = useThrottledSearch(filters.search, 500);

  // Available filter options - memoized to prevent re-creation
  const statusOptions = useMemo(() => [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'archived', label: 'Archived' }
  ], []);

  const availableTags = useMemo(() => 
    ['react', 'typescript', 'design', 'backend', 'frontend', 'fullstack'], []
  );

  // Update filters when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setFilters(prev => ({ ...prev, search: debouncedSearch }));
    }
  }, [debouncedSearch]);

  // Separate effect for non-search filters to prevent search input re-renders
  const nonSearchFilters = useMemo(() => ({
    status: filters.status,
    tags: filters.tags,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder
  }), [filters.status, filters.tags, filters.sortBy, filters.sortOrder]);

  // Build query string from filters
  const buildQueryString = useCallback((page: number, filters: Filters) => {
    const params = new URLSearchParams();
    
    params.set('page', page.toString());
    params.set('limit', pageSize.toString());
    params.set('sortBy', filters.sortBy);
    params.set('sortOrder', filters.sortOrder);
    
    if (filters.status !== 'all') {
      params.set('status', filters.status);
    }
    
    if (filters.search) {
      params.set('search', filters.search);
    }
    
    if (filters.tags.length > 0) {
      params.set('tags', filters.tags.join(','));
    }
    
    return params.toString();
  }, [pageSize]);

  // Fetch jobs with filters and pagination
  const fetchJobs = useCallback(async (page: number, currentFilters: Filters) => {
    setLoading(true);
    try {
      const queryString = buildQueryString(page, currentFilters);
      const response = await fetch(`/mock/jobs?${queryString}`);
      const data: JobsResponse = await response.json();
      
      setJobs(data.data);
      setPagination(data.pagination);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  }, [buildQueryString]);

  // Initial load and filter changes (excluding search which is handled separately)
  useEffect(() => {
    fetchJobs(1, filters);
  }, [fetchJobs, filters.status, filters.tags, filters.sortBy, filters.sortOrder, filters.search]);

  // Handle filter changes (non-search filters)
  const handleFilterChange = useCallback((newFilters: Partial<Omit<Filters, 'search'>>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  }, []);

  // Handle search input change
  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
  }, [setSearchInput]);

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    fetchJobs(newPage, filters);
  }, [fetchJobs, filters]);

  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
    fetchJobs(1, filters);
  }, [fetchJobs, filters]);

  // Handle navigation to kanban view
  const handleNavigateToKanban = useCallback((jobId: number) => {
    router.push(`/jobs/${jobId}`);
  }, [router]);

  // Handle drag end - only works on current page
  const handleDragEnd = useCallback(async (result: DropResult) => {
    if (!result.destination) return;
      // Check if the item was actually moved to a different position
      if (result.source.index === result.destination.index) return;

    const reordered = Array.from(jobs);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    // Update local state
    setJobs(reordered);

    // Persist order - calculate global order based on page
    const startIndex = (currentPage - 1) * pageSize;
    await Promise.all(
      reordered.map((job, index) =>
        fetch(`/mock/jobs/${job.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: startIndex + index }),
        })
      )
    );
  }, [jobs, currentPage, pageSize]);

  // Handle tag selection
  const handleTagToggle = useCallback((tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    
    handleFilterChange({ tags: newTags });
  }, [filters.tags, handleFilterChange]);

  // Memoized results info to prevent unnecessary re-renders
  const resultsInfo = useMemo(() => {
    if (!pagination) return null;
    
    const start = ((pagination.page - 1) * pagination.limit) + 1;
    const end = Math.min(pagination.page * pagination.limit, pagination.total);
    
    return `Showing ${start}-${end} of ${pagination.total} jobs`;
  }, [pagination]);

  // Loading state for initial load
  if (loading && jobs.length === 0) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[200px]">
        <LoaderOne />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50/50 min-h-screen">
      {/* Modern Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Jobs</h1>
        <p className="text-gray-600 mt-1">Manage and organize your job listings</p>
      </div>

      {/* Filters Section - Modern Card Design */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Search - Isolated component */}
          <SearchInput 
            value={searchInput}
            onChange={handleSearchChange}
            isSearching={searchInput !== debouncedSearch}
          />

          {/* Other Filters - Isolated component */}
          <FilterControls 
            filters={nonSearchFilters}
            statusOptions={statusOptions}
            availableTags={availableTags}
            pageSize={pageSize}
            onFilterChange={handleFilterChange}
            onTagToggle={handleTagToggle}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      </div>

      {/* Results Info */}
      {resultsInfo && (
        <div className="mb-4 text-sm text-gray-600 font-medium">
          {resultsInfo}
        </div>
      )}

      {/* Jobs Table - Isolated component that only re-renders when jobs/loading changes */}
      <JobsTable 
        jobs={jobs}
        loading={loading}
        currentPage={currentPage}
        pageSize={pageSize}
        onDragEnd={handleDragEnd}
        onNavigateToKanban={handleNavigateToKanban}
      />

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrev}
              className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(
                pagination.totalPages - 4,
                pagination.page - 2
              )) + i;
              
              if (pageNum > pagination.totalPages) return null;
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-2 border rounded-md ${
                    pageNum === pagination.page
                      ? 'bg-green-500 text-white border-green-500'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNext}
              className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {jobs.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">📝</div>
          <p>No jobs found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}