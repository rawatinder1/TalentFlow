"use client"
import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Clock, DollarSign, Users, Briefcase, Calendar, Tag, ChevronLeft, ChevronRight, Loader2, Building2, Star, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import HelpModal from './HelpModal';
// Type definitions for Job
interface Job {
  id?: number;
  title: string;
  slug: string;
  status: string;
  order: number;
  tags: string[];
  description?: string;
  location?: string;
  salary?: string;
  type?: string;
  department?: string;
  experience?: string;
  postedDate?: Date;
  applicationCount?: number;
  companyName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface JobFilters {
  status?: string;
  search?: string;
  tags?: string[];
}

interface PaginatedResponse {
  data: Job[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// API Service for Jobs
class JobApiService {
  private static baseUrl = '/mock/jobs';

  static async getJobs(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    tags?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.status && params.status !== 'all') searchParams.set('status', params.status);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.tags?.length) searchParams.set('tags', params.tags.join(','));
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    const response = await fetch(`${this.baseUrl}?${searchParams}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch jobs');
    }

    return response.json();
  }
}

// Custom hook for jobs
const useJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  const fetchJobs = async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    tags?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await JobApiService.getJobs(params);
      setJobs(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    jobs,
    loading,
    error,
    pagination,
    fetchJobs,
    setError
  };
};

// Custom Dropdown Component
const CustomDropdown = ({ value, onChange, options, placeholder }: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedOption = options.find(option => option.value === value);

  return (
    <div className="relative">

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-left focus:ring-1 focus:ring-gray-400 focus:border-gray-400 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <span className="text-gray-700">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 text-gray-700 first:rounded-t-lg last:rounded-b-lg transition-colors"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Main Jobs Component
export default function JobCards() {
  const router = useRouter();
  const { jobs, loading, error, pagination, fetchJobs, setError } = useJobs();
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tagsFilter, setTagsFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('order');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Status options for dropdown
  const statusOptions = [
    { value: 'all', label: 'All Jobs' },
    { value: 'active', label: 'Active' },
  ];

  // Handle job card click - navigate to assessment page
  const handleJobClick = (jobId: number | undefined) => {
    if (jobId) {
      router.push(`/assessments/${jobId}`);
    }
  };

  // Load jobs on component mount and when filters change
  useEffect(() => {
    fetchJobs({
      page: pagination.page,
      limit: pagination.limit,
      status: statusFilter,
      search: searchTerm || undefined,
      tags: tagsFilter.length ? tagsFilter : undefined,
      sortBy,
      sortOrder
    });
  }, [searchTerm, statusFilter, tagsFilter, sortBy, sortOrder]);

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    fetchJobs({
      page: newPage,
      limit: pagination.limit,
      status: statusFilter,
      search: searchTerm || undefined,
      tags: tagsFilter.length ? tagsFilter : undefined,
      sortBy,
      sortOrder
    });
  };

  // Card styling helpers - neon red shadow on hover
  const getCardStyles = () => ({
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'translateY(0px) rotate(0deg) scale(1)',
  });

  const handleCardMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    target.style.transform = 'translateY(-12px) rotate(1deg) scale(1.02)';
    target.style.boxShadow =
      '0 15px 35px rgba(245, 158, 11, 0.4), 0 5px 15px rgba(245, 158, 11, 0.2), 0 0 20px rgba(245, 158, 11, 0.1)';
    target.style.borderColor = '#f59e0b'; // amber-500
  };

  const handleCardMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    target.style.transform = 'translateY(0px) rotate(0deg) scale(1)';
    target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
    target.style.borderColor = '#e5e7eb';
  };

  // Utility functions
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'open':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'closed':
      case 'filled':
      case 'archived':
        return 'bg-gray-50 text-gray-600 border-gray-200';
      case 'draft':
        return 'bg-gray-50 text-gray-600 border-gray-200';
      case 'pending':
        return 'bg-gray-50 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
        <div className="top-4 left-5"><HelpModal/></div>
      <div className="max-w-7xl mx-auto">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400 bg-white"
              />
            </div>

            {/* Custom Status Filter Dropdown */}
            <CustomDropdown
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
              placeholder="Select Status"
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
            <div className="flex-1">
              <p className="text-red-700 font-medium">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {/* Jobs Grid */}
        {jobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">💼</div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">No jobs found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'No jobs available at the moment'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {jobs.map((job) => (
              <button
                key={job.id}
                onClick={() => handleJobClick(job.id)}
                className="bg-white rounded-lg border border-gray-200 p-5 group text-left w-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                style={getCardStyles()}
                onMouseEnter={handleCardMouseEnter}
                onMouseLeave={handleCardMouseLeave}
              >
                {/* Job Header */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-800 text-base leading-tight">
                      {truncateText(job.title, 40)}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-normal border ${getStatusColor(job.status)} ml-2 flex-shrink-0`}>
                      {job.status}
                    </span>
                  </div>
                  
                  {job.companyName && (
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      {job.companyName}
                    </div>
                  )}

                  {job.description && (
                    <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                      {truncateText(job.description, 80)}
                    </p>
                  )}
                </div>

                {/* Job Details */}
                <div className="space-y-2 mb-4">
                  {job.location && (
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {job.location}
                    </div>
                  )}

                  {job.type && (
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      {job.type}
                    </div>
                  )}

                  {job.salary && (
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      {job.salary}
                    </div>
                  )}

                  {job.experience && (
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {job.experience}
                    </div>
                  )}

                  {job.applicationCount !== undefined && (
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Users className="w-4 h-4 text-gray-400" />
                      {job.applicationCount} applications
                    </div>
                  )}

                  {job.postedDate && (
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      Posted {formatDate(job.postedDate)}
                    </div>
                  )}
                </div>

                {/* Tags */}
                {job.tags && job.tags.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {job.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-1 bg-gray-50 text-gray-600 rounded-full text-xs border border-gray-200"
                        >
                          {tag}
                        </span>
                      ))}
                      {job.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs border border-gray-200">
                          +{job.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
                    ID: {job.id}
                  </span>
                  <div className="w-8 h-8 bg-gray-50 rounded-full 
                                flex items-center justify-center group-hover:bg-gray-100
                                transition-all duration-300">
                    <Star className="w-4 h-4 text-gray-400 group-hover:text-gray-500" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrev || loading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <span className="text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNext || loading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Loading indicator */}
        {loading && jobs.length > 0 && (
          <div className="text-center mt-4">
            <Loader2 className="w-5 h-5 animate-spin text-gray-500 mx-auto" />
          </div>
        )}
      </div>
    </div>
  );
}