"use client"
import React, { useState, useEffect } from 'react';
//@ts-ignore
import { DndProvider } from 'react-dnd';
//@ts-ignore 
import { HTML5Backend } from 'react-dnd-html5-backend';
import AddCandidateModal from './addCandidateModal';

const CustomSelect = ({ 
  value, 
  onChange, 
  options, 
  placeholder = "Select..." 
}: { 
  value: string | number; 
  onChange: (value: string | number) => void; 
  options: { value: string | number; label: string }[];
  placeholder?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedOption = options.find(option => option.value === value);
  
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 pr-10 text-left border border-gray-200 rounded-2xl bg-white text-gray-900 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 cursor-pointer min-w-[140px]"
      >
        {selectedOption ? selectedOption.label : placeholder}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg 
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-[90]" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-[100] w-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left text-sm hover:bg-red-50 hover:text-red-600 transition-colors duration-150 ${
                  value === option.value ? 'bg-red-50 text-red-600 font-medium' : 'text-gray-900'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

interface Candidate {
  id?: number;
  name: string;
  email: string;
  jobId: number;
  stage: "applied" | "screen" | "tech" | "offer" | "hired" | "rejected";
}

const CandidateRow = ({ candidate }: { candidate: Candidate }) => {
  const getStageColor = (stage: string) => {
    const colors = {
      applied: 'bg-blue-100 text-blue-800',
      screen: 'bg-yellow-100 text-yellow-800',
      tech: 'bg-purple-100 text-purple-800',
      offer: 'bg-orange-100 text-orange-800',
      hired: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[stage as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <tr className="hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-300 transform hover:scale-[1.01]">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {candidate.id}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {candidate.name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {candidate.email}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {candidate.jobId}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStageColor(candidate.stage)}`}>
          {candidate.stage}
        </span>
      </td>
    </tr>
  );
};

const CandidatesTable = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [pagination, setPagination] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const stageOptions = [
    { value: '', label: 'All Stages' },
    { value: 'applied', label: 'Applied' },
    { value: 'screen', label: 'Screen' },
    { value: 'tech', label: 'Tech' },
    { value: 'offer', label: 'Offer' },
    { value: 'hired', label: 'Hired' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const pageSizeOptions = [
    { value: 25, label: '25 per page' },
    { value: 50, label: '50 per page' },
    { value: 75, label: '75 per page' }
  ];

  const filteredCandidates = candidates.filter(candidate => 
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleModalSuccess = () => {
    // Refresh the candidates list after successful creation
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: pageSize.toString(),
          ...(selectedStage && { stage: selectedStage })
        });
        
        const response = await fetch(`/mock/candidates?${params}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch candidates');
        }
        
        const result = await response.json();
        setCandidates(result.data);
        setPagination(result.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  };

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: pageSize.toString(),
          ...(selectedStage && { stage: selectedStage })
        });
        
        const response = await fetch(`/mock/candidates?${params}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch candidates');
        }
        
        const result = await response.json();
        setCandidates(result.data);
        setPagination(result.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [currentPage, selectedStage, pageSize]);

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50/50 min-h-screen">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading candidates...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50/50 min-h-screen">
        <div className="text-center py-12 text-red-500">
          <div className="text-4xl mb-4">⚠️</div>
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6 bg-gray-50/50 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 tracking-tight"> Candidates</h1>
                  <p className="text-gray-600 text-sm">Manage talent and track applications</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setIsModalOpen(true)}
              className="group bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
            >
              <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Candidate
            </button>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Applications</p>
                  <p className="text-2xl font-bold text-blue-900">{pagination?.total || 0}</p>
                </div>
                
              </div>
            </div>
            
            
            
            
            
            
          </div>
        </div>

        {        /* Stage Filter, Search, and Page Size Selector */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-sm border border-gray-100 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Filter by Stage:</label>
              <CustomSelect
                value={selectedStage}
                onChange={(value) => {
                  setSelectedStage(value as string);
                  setCurrentPage(1);
                }}
                options={stageOptions}
                placeholder="All Stages"
              />

            </div>

            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Show:</label>
              <CustomSelect
                value={pageSize}
                onChange={(value) => handlePageSizeChange(value as number)}
                options={pageSizeOptions}
                placeholder="Select page size"
              />
            </div>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 text-sm shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          
          {(selectedStage || searchTerm) && (
            <div className="mt-3 text-sm text-gray-600">
              {selectedStage && `Filtered by "${selectedStage}" stage • `}
              {searchTerm && `Search: "${searchTerm}" • `}
              Showing {filteredCandidates.length} candidates • {pageSize} per page
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 overflow-hidden relative z-10">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gradient-to-r from-red-600 to-red-700 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Job ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Stage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/90 divide-y divide-gray-200 backdrop-blur-sm">
                {filteredCandidates.map((candidate) => (
                  <CandidateRow key={candidate.id} candidate={candidate} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredCandidates.length === 0 && !loading && (selectedStage || searchTerm) && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">🔍</div>
            <p>No candidates found matching your filters</p>
            <div className="flex gap-2 justify-center mt-2">
              {selectedStage && (
                <button 
                  onClick={() => setSelectedStage('')}
                  className="text-red-500 hover:text-red-700 underline text-sm"
                >
                  Clear stage filter
                </button>
              )}
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="text-red-500 hover:text-red-700 underline text-sm"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>
        )}

        {candidates.length === 0 && !loading && !selectedStage && !searchTerm && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">👥</div>
            <p>No candidates found.</p>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total candidates, showing {pageSize} per page)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(pagination.page - 1)}
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
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 border rounded-md ${
                      pageNum === pagination.page
                        ? 'bg-red-500 text-white border-red-500'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(pagination.page + 1)}
                disabled={!pagination.hasNext}
                className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Summary */}
        {filteredCandidates.length > 0 && pagination && (
          <div className="mt-6 text-sm text-gray-600">
            Showing {Math.min(pageSize, filteredCandidates.length)} of {pagination.total} candidates ({pageSize} per page)
          </div>
        )}

        {/* Add Candidate Modal */}
        <AddCandidateModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleModalSuccess}
        />
      </div>
    </DndProvider>
  );
};

export default CandidatesTable;