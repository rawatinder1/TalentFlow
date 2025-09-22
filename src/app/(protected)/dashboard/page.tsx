"use client"
import React, { useState, useEffect } from 'react';

interface Candidate {
  id?: number;
  name: string;
  email: string;
  jobId: number;
  stage: "applied" | "screen" | "tech" | "offer" | "hired" | "rejected";
}

interface FunnelStage {
  name: string;
  count: number;
  percentage: number;
  conversionRate?: number;
}

const RecruitmentDashboard = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [animationComplete, setAnimationComplete] = useState(false);

  const stageOrder = ['applied', 'screen', 'tech', 'offer', 'hired'];

  useEffect(() => {
    const fetchAllCandidates = async () => {
      try {
        setLoading(true);
        const response = await fetch('/mock/candidates?limit=10000');
        
        if (!response.ok) {
          throw new Error('Failed to fetch candidates');
        }
        
        const result = await response.json();
        setCandidates(result.data);
        
        setTimeout(() => setAnimationComplete(true), 500);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchAllCandidates();
  }, []);

  // Calculate funnel data with correct logic
  const calculateFunnelData = (): FunnelStage[] => {
    if (candidates.length === 0) return [];

    const totalApplied = candidates.length;
    
    const stageCounts = stageOrder.reduce((acc, stage) => {
      acc[stage] = candidates.filter(c => c.stage === stage).length;
      return acc;
    }, {} as Record<string, number>);

    const funnelData: FunnelStage[] = [];

    stageOrder.forEach((stage, index) => {
      if (stage === 'applied') {
        funnelData.push({
          name: 'Applied',
          count: totalApplied,
          percentage: 100,
        });
      } else {
        const currentCount = stageCounts[stage];
        const prevStageCount = index === 1 ? totalApplied : stageCounts[stageOrder[index - 1]];
        const conversionRate = prevStageCount > 0 ? (currentCount / totalApplied) * 100 : 0;
        
        funnelData.push({
          name: stage.charAt(0).toUpperCase() + stage.slice(1),
          count: currentCount,
          percentage: (currentCount / totalApplied) * 100,
          conversionRate,
        });
      }
    });

    return funnelData;
  };

  const funnelData = calculateFunnelData();
  const currentStageCounts = stageOrder.reduce((acc, stage) => {
    acc[stage] = candidates.filter(c => c.stage === stage).length;
    return acc;
  }, {} as Record<string, number>);

  const rejectedCount = candidates.filter(c => c.stage === 'rejected').length;
  const totalHired = currentStageCounts.hired || 0;
  const activePipeline = candidates.length - totalHired - rejectedCount;
  const conversionRate = candidates.length > 0 ? (totalHired / candidates.length) * 100 : 0;

  if (loading) {
    return (
      <div className="p-6 bg-gray-50/30 min-h-screen">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-200 border-t-blue-500"></div>
          <span className="ml-3 text-gray-600 font-medium">Loading recruitment data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50/30 min-h-screen">
        <div className="text-center py-20">
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50/30 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Recruitment Pipeline</h1>
            <p className="text-gray-500 text-sm font-medium">Track candidate flow and conversion metrics</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100/60">
          <div className="text-xl font-semibold text-gray-900 mb-0.5">{candidates.length}</div>
          <div className="text-gray-500 text-xs font-medium tracking-wide">TOTAL CANDIDATES</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100/60">
          <div className="text-xl font-semibold text-gray-900 mb-0.5">{totalHired}</div>
          <div className="text-gray-500 text-xs font-medium tracking-wide">SUCCESSFULLY HIRED</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100/60">
          <div className="text-xl font-semibold text-gray-900 mb-0.5">{conversionRate.toFixed(1)}%</div>
          <div className="text-gray-500 text-xs font-medium tracking-wide">CONVERSION RATE</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100/60">
          <div className="text-xl font-semibold text-gray-900 mb-0.5">{activePipeline}</div>
          <div className="text-gray-500 text-xs font-medium tracking-wide">ACTIVE PIPELINE</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Funnel Visualization */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100/60">
          <h2 className="text-base font-semibold text-gray-900 mb-6">Recruitment Funnel</h2>
          
          <div className="space-y-3">
            {funnelData.map((stage, index) => (
              <div key={index} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700 text-sm">{stage.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-gray-900">{stage.count.toLocaleString()}</span>
                    {stage.conversionRate !== undefined && index > 0 && (
                      <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded font-medium">
                        {stage.conversionRate.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="relative h-6 bg-gray-50 rounded-md overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-700 ease-out ${
                      animationComplete ? 'translate-x-0' : '-translate-x-full'
                    }`}
                    style={{ 
                      width: `${Math.max(stage.percentage, 2)}%`,
                      transitionDelay: `${index * 150}ms`
                    }}
                  />
                  <div className="absolute inset-0 flex items-center px-2">
                    <span className="text-white text-xs font-medium">
                      {stage.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                {index < funnelData.length - 1 && (
                  <div className="flex justify-center my-1">
                    <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Current Stage Distribution */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100/60">
          <h2 className="text-base font-semibold text-gray-900 mb-6">Current Stage Distribution</h2>
          
          <div className="space-y-3">
            {stageOrder.map((stage, index) => {
              const count = currentStageCounts[stage] || 0;
              const percentage = activePipeline > 0 ? (count / activePipeline) * 100 : 0;
              const maxCount = Math.max(...Object.values(currentStageCounts).slice(0, 4)); // Exclude hired
              
              return (
                <div key={stage} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span className="font-medium text-gray-700 text-sm capitalize">{stage}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-semibold text-gray-900">{count}</div>
                      <div className="text-xs text-gray-400 font-medium">
                        {stage === 'hired' ? 
                          `${((count / candidates.length) * 100).toFixed(1)}%` : 
                          `${percentage.toFixed(1)}%`
                        }
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-50 rounded-full h-1">
                    <div 
                      className={`h-1 bg-green-500 rounded-full transition-all duration-700 ease-out ${
                        animationComplete ? 'w-full' : 'w-0'
                      }`}
                      style={{ 
                        width: maxCount > 0 ? `${Math.max((count / maxCount) * 100, count > 0 ? 5 : 0)}%` : '0%',
                        transitionDelay: `${index * 100}ms`
                      }}
                    />
                  </div>
                </div>
              );
            })}
            
            {/* Rejected candidates */}
            {rejectedCount > 0 && (
              <div className="relative pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                    <span className="font-medium text-gray-500 text-sm">Rejected</span>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-semibold text-gray-500">{rejectedCount}</div>
                    <div className="text-xs text-gray-400 font-medium">
                      {((rejectedCount / candidates.length) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pipeline Summary */}
      <div className="mt-6 bg-white rounded-lg p-6 shadow-sm border border-gray-100/60">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Pipeline Flow</h2>
        
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {funnelData.map((stage, index) => (
            <React.Fragment key={index}>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-blue-500 text-white rounded-md flex items-center justify-center text-xs font-semibold">
                  {stage.count > 999 ? `${(stage.count/1000).toFixed(1)}k` : stage.count}
                </div>
                <span className="font-medium text-gray-600 text-sm">{stage.name}</span>
              </div>
              {index < funnelData.length - 1 && (
                <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </React.Fragment>
          ))}
        </div>
        
        {candidates.length > 0 && (
          <div className="p-3 bg-gray-50 rounded-md">
            <p className="text-gray-600 text-sm font-medium">
              Pipeline Health: {totalHired} successful hires from {candidates.length.toLocaleString()} total candidates 
              ({conversionRate.toFixed(1)}% success rate).{' '}
              {activePipeline > 0 && `${activePipeline} candidates are currently progressing through the pipeline.`}
              {rejectedCount > 0 && ` ${rejectedCount} candidates were rejected during the process.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruitmentDashboard;