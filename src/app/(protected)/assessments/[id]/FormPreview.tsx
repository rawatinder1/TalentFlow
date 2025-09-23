"use client"
import React, { useState } from 'react';

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

export interface FormData {
  jobId: string;
  title: string;
  sections: Section[];
}

interface FormPreviewProps {
  formData: FormData;
}

const FormPreview: React.FC<FormPreviewProps> = ({ formData }) => {
  const [responses, setResponses] = useState<Record<string, any>>({});
  
  const updateResponse = (questionId: string, value: any) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const renderQuestion = (question: Question) => {
    const value = responses[question.id] || '';
    
    return (
      <div key={question.id} className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {question.label}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {question.type === 'short' && (
          <input
            type="text"
            value={value}
            onChange={(e) => updateResponse(question.id, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your answer..."
          />
        )}
        
        {question.type === 'long' && (
          <>
            <textarea
              value={value}
              onChange={(e) => updateResponse(question.id, e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-32"
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
          <div className="space-y-2">
            {question.options.map((option, i) => (
              <label key={i} className="flex items-center">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => updateResponse(question.id, e.target.value)}
                  className="mr-3 w-4 h-4"
                />
                {option}
              </label>
            ))}
          </div>
        )}
        
        {question.type === 'multi' && (
          <div className="space-y-2">
            {question.options.map((option, i) => (
              <label key={i} className="flex items-center">
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
                  className="mr-3 w-4 h-4"
                />
                {option}
              </label>
            ))}
          </div>
        )}
        
        {question.type === 'numeric' && (
          <input
            type="number"
            value={value}
            onChange={(e) => updateResponse(question.id, Number(e.target.value) || '')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Enter a number..."
            min={question.min}
            max={question.max}
          />
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <h1 className="text-2xl font-bold">{formData.title}</h1>
        <p className="text-blue-100 text-sm"> Job_id : {formData.jobId}</p>
      </div>
      
      <div className="p-6">
        {formData.sections.map((section) => (
          <div key={section.id} className="mb-8">
            <div className="border-l-4 border-yellow-500 pl-4 mb-6">
              <h2 className="text-xl font-semibold">{section.title}</h2>
            </div>
            {section.questions.map(renderQuestion)}
          </div>
        ))}
        
        <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">
          Submit Assessment
        </button>
      </div>
    </div>
  );
};

export default FormPreview;