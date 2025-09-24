"use client"
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'; // or 'react-router-dom' if not using Next.js
import { AlertCircle, CheckCircle } from 'lucide-react';

// Types
interface BaseQuestion {
  id: string;
  label: string;
  required: boolean;
}

interface ShortTextQuestion extends BaseQuestion {
  type: 'short';
}

interface LongTextQuestion extends BaseQuestion {
  type: 'long';
  maxLength?: number;
}

interface ChoiceQuestion extends BaseQuestion {
  type: 'single' | 'multi';
  options: string[];
}

interface NumericQuestion extends BaseQuestion {
  type: 'numeric';
  min?: number;
  max?: number;
}

export type Question = ShortTextQuestion | LongTextQuestion | ChoiceQuestion | NumericQuestion;

export interface Section {
  id: string;
  title: string;
  questions: Question[];
}

export interface Assessment {
  id: string;
  jobId: number;
  data: {
    jobId: string;
    title: string;
    sections: Section[];
  };
  published: boolean;
}

export interface FormData {
  jobId: string;
  title: string;
  sections: Section[];
}

const FillableAssessmentForm: React.FC = () => {
  const params = useParams();
  const assessmentId = params.id as string;

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Fetch assessment data
  useEffect(() => {
    const fetchAssessment = async () => {
      if (!assessmentId) {
        setError('No assessment ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching assessment with ID:', assessmentId);
        
        const response = await fetch(`/mock/assessments/${assessmentId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Assessment not found');
          }
          throw new Error(`Failed to load assessment: ${response.statusText}`);
        }
        
        const assessmentData = await response.json();
        console.log('Assessment data received:', assessmentData);
        
        // Check if assessment is published
        if (!assessmentData.published) {
          throw new Error('This assessment is not published');
        }
        
        setAssessment(assessmentData);
        
        // Extract form data from assessment.data
        if (assessmentData.data && typeof assessmentData.data === 'object') {
          setFormData(assessmentData.data);
        } else {
          throw new Error('Invalid assessment data structure');
        }
        
      } catch (err) {
        console.error('Error fetching assessment:', err);
        setError(err instanceof Error ? err.message : 'Failed to load assessment');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [assessmentId]);

  const updateResponse = (questionId: string, value: any) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const validateForm = () => {
    if (!formData || !formData.sections || !Array.isArray(formData.sections)) {
      return false;
    }
    
    const requiredQuestions = formData.sections
      .flatMap(section => section?.questions || [])
      .filter(q => q?.required);
    
    return requiredQuestions.every(q => {
      const value = responses[q.id];
      if (q.type === 'multi') {
        return value && Array.isArray(value) && value.length > 0;
      }
      return value !== undefined && value !== '' && value !== null;
    });
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    
    try {
      // Create the response JSON matching your database structure
      const responseData = {
        id: `response_${Date.now()}`, // Generate unique response ID
        assessmentId,
        jobId: formData?.jobId,
        candidateInfo: {
          // You can collect candidate info in a separate step or form
          name: '',
          email: '',
        },
        submittedAt: new Date().toISOString(),
        responses: responses,
        completionStatus: 'completed'
      };

      console.log('Form Response JSON:', JSON.stringify(responseData, null, 2));
      
      // Send to your API endpoint for form responses
      const submitResponse = await fetch('/mock/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(responseData)
      });
      
      if (!submitResponse.ok) {
        throw new Error('Failed to submit response');
      }
      
      setSubmitted(true);
      
    } catch (err) {
      console.error('Submission failed:', err);
      alert('Failed to submit form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question: Question) => {
    const value = responses[question.id] || '';
    const isRequired = question.required;
    const hasValue = question.type === 'multi' 
      ? value && Array.isArray(value) && value.length > 0
      : value !== undefined && value !== '' && value !== null;
    
    return (
      <div key={question.id} className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {question.label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {question.type === 'short' && (
          <input
            type="text"
            value={value}
            onChange={(e) => updateResponse(question.id, e.target.value)}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all
              ${isRequired && !hasValue ? 'border-red-300 bg-red-50' : 'border-gray-300'}
            `}
            placeholder="Enter your answer..."
          />
        )}
        
        {question.type === 'long' && (
          <>
            <textarea
              value={value}
              onChange={(e) => updateResponse(question.id, e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32 transition-all resize-none
                ${isRequired && !hasValue ? 'border-red-300 bg-red-50' : 'border-gray-300'}
              `}
              placeholder="Enter your detailed answer..."
              maxLength={question.maxLength}
            />
            {question.maxLength && (
              <div className="text-sm text-gray-500 mt-1 text-right">
                {value.length} / {question.maxLength} characters
              </div>
            )}
          </>
        )}
        
        {question.type === 'single' && (
          <div className={`space-y-2 p-3 rounded-lg border transition-all
            ${isRequired && !hasValue ? 'bg-red-50 border-red-200' : 'border-gray-200 bg-gray-50'}
          `}>
            {question.options.map((option, i) => (
              <label key={i} className="flex items-center cursor-pointer hover:bg-white p-2 rounded transition-colors">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => updateResponse(question.id, e.target.value)}
                  className="mr-3 w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )}
        
        {question.type === 'multi' && (
          <div className={`space-y-2 p-3 rounded-lg border transition-all
            ${isRequired && !hasValue ? 'bg-red-50 border-red-200' : 'border-gray-200 bg-gray-50'}
          `}>
            {question.options.map((option, i) => (
              <label key={i} className="flex items-center cursor-pointer hover:bg-white p-2 rounded transition-colors">
                <input
                  type="checkbox"
                  checked={(value || []).includes(option)}
                  onChange={(e) => {
                    const current = value || [];
                    const updated = e.target.checked
                      ? [...current, option]
                      : current.filter((v: string) => v !== option);
                    updateResponse(question.id, updated);
                  }}
                  className="mr-3 w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )}
        
        {question.type === 'numeric' && (
          <input
            type="number"
            value={value}
            onChange={(e) => updateResponse(question.id, Number(e.target.value) || '')}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all
              ${isRequired && !hasValue ? 'border-red-300 bg-red-50' : 'border-gray-300'}
            `}
            placeholder="Enter a number..."
            min={question.min}
            max={question.max}
          />
        )}
        
        {isRequired && !hasValue && (
          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            This field is required
          </p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment...</p>
          <p className="text-gray-400 text-sm mt-2">ID: {assessmentId}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Assessment</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="text-sm text-gray-500 bg-gray-100 rounded p-3">
            <p><strong>Assessment ID:</strong> {assessmentId}</p>
            <p><strong>URL:</strong> {window.location.href}</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-4">Your assessment has been submitted successfully.</p>
          <div className="text-sm text-gray-500 bg-gray-100 rounded p-3">
            <p><strong>Assessment:</strong> {formData?.title}</p>
            <p><strong>Job ID:</strong> {formData?.jobId}</p>
            <p><strong>Submitted:</strong> {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Assessment Data</h2>
          <p className="text-gray-600">Failed to load assessment information.</p>
        </div>
      </div>
    );
  }

  const isFormValid = validateForm();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {/* Header - Match FormPreview styling */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <h1 className="text-2xl font-bold mb-2">{formData.title}</h1>
            <p className="text-blue-100 text-sm">Job_id: {formData.jobId}</p>
          </div>
          
          {/* Form Content */}
          <div className="p-6">
            {formData.sections && Array.isArray(formData.sections) ? (
              formData.sections.map((section, sectionIndex) => (
                <div key={section.id} className="mb-8">
                  <div className="border-l-4 border-yellow-500 pl-4 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {section.title}
                    </h2>
                  </div>
                  <div className="space-y-6">
                    {section.questions && Array.isArray(section.questions) ? (
                      section.questions.map(renderQuestion)
                    ) : (
                      <p className="text-gray-500 italic">No questions in this section</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No sections found in this assessment</p>
              </div>
            )}
            
            {/* Submit Button - Match FormPreview styling */}
            <div className="border-t pt-6 mt-8">
              <button
                onClick={handleSubmit}
                disabled={submitting || !isFormValid}
                className={`w-full py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2
                  ${isFormValid && !submitting
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting Assessment...
                  </>
                ) : (
                  'Submit Assessment'
                )}
              </button>
              
              {!isFormValid && (
                <p className="text-center text-red-500 text-sm mt-3 flex items-center justify-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Please complete all required fields before submitting
                </p>
              )}
            </div>
            
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default FillableAssessmentForm;