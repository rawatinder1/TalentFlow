"use client"
import React, { use ,useEffect, useState } from 'react';
import { Plus, Trash2, Eye, Code, ChevronLeft, ChevronRight, Edit2 } from 'lucide-react';
import FormPreview, { Question, Section, FormData } from './FormPreview';
import { CodeBlock } from '@/components/ui/code-block';

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const FormBuilder = ({ params }: { params: Promise<{ id: string }> }) => {
   const { id } = use(params); // ✅ unwrap the promise correctly
  const jobId = Number(id);

  const [jobTitle, setJobTitle] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
  jobId: `Job_Id : ${id}`,
  title: "",
  sections: [{
    id: generateUUID(),
    title: "General Questions",
    questions: [{
      id: "q1",
      type: 'short',
      label: 'What is your name?',
      required: true
      }]
    }]
  });

  useEffect(() => {
    async function fetchJob() {
      try {
        const res = await fetch(`/mock/jobs/${jobId}`);
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const data = await res.json();
        setJobTitle(data.title);
        setFormData(prev => ({
          ...prev,
          title: data.title
        }));
      } catch (err: any) {
        setError(err.message || "Failed to fetch job");
      }
    }

    if (!isNaN(jobId)) {
      fetchJob();
    } else {
      setError("Invalid job ID");
    }
  }, [jobId]);




  const [activeTab, setActiveTab] = useState<'preview' | 'json'>('preview');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [sectionInput, setSectionInput] = useState('');

  const questionTypes = [
    { value: 'short', label: 'Short Text' },
    { value: 'long', label: 'Long Text' },
    { value: 'single', label: 'Single Choice' },
    { value: 'multi', label: 'Multiple Choice' },
    { value: 'numeric', label: 'Numeric' }
  ];

  // Get flattened questions with section info
  const allQuestions = formData.sections.flatMap(section => 
    section.questions.map(q => ({ ...q, sectionId: section.id, sectionTitle: section.title }))
  );
  const currentQuestion = allQuestions[currentSlide];
  const currentSection = formData.sections[currentSectionIndex];

  const createQuestion = (type: Question['type']): Question => {
    const base = { id: `q${Date.now()}`, label: 'New Question', required: true };
    
    switch (type) {
      case 'short': return { ...base, type: 'short' };
      case 'long': return { ...base, type: 'long' };
      case 'single':
      case 'multi': return { ...base, type, options: ['Option 1', 'Option 2'] };
      case 'numeric': return { ...base, type: 'numeric' };
    }
  };

  const updateFormData = (updater: (prev: FormData) => FormData) => {
    setFormData(updater);
  };

  const addSection = () => {
    const newSection = {
      id: generateUUID(),
      title: "New Section",
      questions: []
    };
    
    updateFormData(prev => ({ ...prev, sections: [...prev.sections, newSection] }));
    setCurrentSectionIndex(formData.sections.length);
    // Don't auto-navigate to questions since section might be empty
  };

  const deleteSection = (sectionId: string) => {
    // Allow deletion even if it's the last section
    const sectionIndex = formData.sections.findIndex(s => s.id === sectionId);
    
    updateFormData(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== sectionId)
    }));
    
    // If we deleted the last section and no sections remain, add a new one
    if (formData.sections.length === 1) {
      const newSection = {
        id: generateUUID(),
        title: "New Section",
        questions: []
      };
      updateFormData(prev => ({ ...prev, sections: [newSection] }));
      setCurrentSectionIndex(0);
    } else {
      // Adjust current section index
      if (currentSectionIndex >= sectionIndex && currentSectionIndex > 0) {
        setCurrentSectionIndex(currentSectionIndex - 1);
      }
    }
    
    // Adjust question slide if needed
    if (currentSlide >= allQuestions.length) {
      setCurrentSlide(Math.max(0, allQuestions.length - 1));
    }
  };

  const updateSection = (sectionId: string, title: string) => {
    updateFormData(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === sectionId ? { ...s, title } : s)
    }));
    setEditingSectionId(null);
    setSectionInput('');
  };

  const addQuestion = (sectionId: string) => {
    const newQuestion = createQuestion('short');
    updateFormData(prev => ({
      ...prev,
      sections: prev.sections.map(s => 
        s.id === sectionId ? { ...s, questions: [...s.questions, newQuestion] } : s
      )
    }));
    
    // Navigate to the new question
    const updatedAllQuestions = formData.sections.flatMap(section => 
      section.questions.map(q => ({ ...q, sectionId: section.id, sectionTitle: section.title }))
    );
    setCurrentSlide(updatedAllQuestions.length);
  };

  const deleteQuestion = (sectionId: string, questionId: string) => {
    updateFormData(prev => ({
      ...prev,
      sections: prev.sections.map(s => 
        s.id === sectionId 
          ? { ...s, questions: s.questions.filter(q => q.id !== questionId) }
          : s
      )
    }));
    
    if (currentSlide >= allQuestions.length - 1) {
      setCurrentSlide(Math.max(0, allQuestions.length - 2));
    }
  };

  const updateQuestion = (sectionId: string, questionId: string, updates: Partial<Question>) => {
    updateFormData(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId
          ? {
              ...s,
              questions: s.questions.map(q =>
                q.id === questionId ? { ...q, ...updates } as Question : q
              )
            }
          : s
      )
    }));
  };

  const changeQuestionType = (sectionId: string, questionId: string, newType: Question['type']) => {
    const oldQuestion = allQuestions.find(q => q.id === questionId);
    if (!oldQuestion) return;
    
    const newQuestion = createQuestion(newType);
    updateQuestion(sectionId, questionId, {
      ...newQuestion,
      id: oldQuestion.id,
      label: oldQuestion.label,
      required: oldQuestion.required
    });
  };

  const nextSection = () => {
    if (currentSectionIndex < formData.sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    }
  };

  const prevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };

  const nextQuestion = () => {
    if (currentSlide < allQuestions.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevQuestion = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  // Show section view if no questions or if navigating by sections
  const showSectionView = !currentQuestion || (currentSection && currentSection.questions.length === 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex justify-between items-center">
          <div>
            <input
              value={formData.title}
              onChange={(e) => updateFormData(prev => ({ ...prev, title: e.target.value }))}
              className="text-2xl font-bold bg-transparent border-none outline-none"
              placeholder="Assessment Title"
            />
            <input
              value={formData.jobId}
              onChange={(e) => updateFormData(prev => ({ ...prev, jobId: e.target.value }))}
              className="text-sm text-gray-600 bg-transparent border-none outline-none mt-1"
              placeholder="Job ID"
            />
          </div>
          
          <div className="flex gap-2">
            {['preview', 'json'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as 'preview' | 'json')}
                className={`flex items-center px-4 py-2 rounded-lg ${
                  activeTab === tab ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {tab === 'preview' ? <Eye size={16} className="mr-2" /> : <Code size={16} className="mr-2" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Builder */}
        <div className="w-1/2 p-6 bg-white border-r overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Form Builder</h2>
            <div className="flex items-center justify-between">
              <p className="text-gray-600 text-sm">
                Section {currentSectionIndex + 1} of {formData.sections.length}
                {allQuestions.length > 0 && ` • Question ${currentSlide + 1} of ${allQuestions.length}`}
              </p>
              
              {/* Section Navigation */}
              <div className="flex gap-2">
                <button
                  onClick={prevSection}
                  disabled={currentSectionIndex === 0}
                  className="flex items-center px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronLeft size={14} className="mr-1" />
                  Prev Section
                </button>
                <button
                  onClick={nextSection}
                  disabled={currentSectionIndex === formData.sections.length - 1}
                  className="flex items-center px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Next Section
                  <ChevronRight size={14} className="ml-1" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-6">
            {/* Section Header */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                {editingSectionId === currentSection?.id ? (
                  <div className="flex items-center flex-1 mr-4">
                    <input
                      value={sectionInput}
                      onChange={(e) => setSectionInput(e.target.value)}
                      className="flex-1 p-2 border rounded mr-2"
                      placeholder="Section title"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') updateSection(currentSection.id, sectionInput);
                        if (e.key === 'Escape') setEditingSectionId(null);
                      }}
                      autoFocus
                    />
                    <button
                      onClick={() => updateSection(currentSection.id, sectionInput)}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded mr-2"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center flex-1">
                    <h3 className="text-lg font-semibold text-blue-700">
                      {currentSection?.title || 'No Section'}
                    </h3>
                    {currentSection && (
                      <button
                        onClick={() => {
                          setEditingSectionId(currentSection.id);
                          setSectionInput(currentSection.title);
                        }}
                        className="ml-2 p-1 text-blue-600 hover:bg-blue-100 rounded"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                  </div>
                )}
                
                {currentSection && (
                  <button
                    onClick={() => deleteSection(currentSection.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            {showSectionView ? (
              /* Section View - when no questions */
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  {currentSection?.questions.length === 0 
                    ? "This section has no questions yet" 
                    : "No sections or questions yet"}
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={addSection}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Plus size={16} className="mr-2" />
                    Add Section
                  </button>
                  {currentSection && (
                    <button
                      onClick={() => addQuestion(currentSection.id)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus size={16} className="mr-2" />
                      Add First Question
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Question Editor */
              <>
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <input
                      value={currentQuestion.label}
                      onChange={(e) => updateQuestion(currentQuestion.sectionId, currentQuestion.id, { label: e.target.value })}
                      className="flex-1 p-3 text-lg border rounded mr-4"
                      placeholder="Question text"
                    />
                    <button
                      onClick={() => deleteQuestion(currentQuestion.sectionId, currentQuestion.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Question Type</label>
                      <select
                        value={currentQuestion.type}
                        onChange={(e) => changeQuestionType(currentQuestion.sectionId, currentQuestion.id, e.target.value as Question['type'])}
                        className="w-full p-3 border rounded"
                      >
                        {questionTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex items-center pt-6">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={currentQuestion.required}
                          onChange={(e) => updateQuestion(currentQuestion.sectionId, currentQuestion.id, { required: e.target.checked })}
                          className="mr-3 w-4 h-4"
                        />
                        Required field
                      </label>
                    </div>
                  </div>

                  {/* Type-specific fields */}
                  {currentQuestion.type === 'long' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Maximum Characters</label>
                      <input
                        type="number"
                        value={(currentQuestion as any).maxLength || ''}
                        onChange={(e) => updateQuestion(currentQuestion.sectionId, currentQuestion.id, { 
                          maxLength: e.target.value ? parseInt(e.target.value) : undefined 
                        })}
                        className="w-full p-3 border rounded"
                        placeholder="Leave blank for no limit"
                      />
                    </div>
                  )}

                  {(currentQuestion.type === 'single' || currentQuestion.type === 'multi') && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Options (one per line)</label>
                      <textarea
                        value={(currentQuestion as any).options?.join('\n') || ''}
                        onChange={(e) => {
                          // Split by newlines but preserve empty strings to allow typing
                          const lines = e.target.value.split('\n');
                          // Only filter out completely empty lines at the end, not in the middle
                          const options = lines.length === 1 && lines[0] === '' ? [] : lines;
                          updateQuestion(currentQuestion.sectionId, currentQuestion.id, { options });
                        }}
                        className="w-full p-3 border rounded h-32"
                        placeholder="Option 1&#10;Option 2&#10;Option 3"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Press Enter for new lines. Empty lines at the end will be removed automatically.
                      </p>
                    </div>
                  )}

                  {currentQuestion.type === 'numeric' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Min Value</label>
                        <input
                          type="number"
                          value={(currentQuestion as any).min ?? ''}
                          onChange={(e) => updateQuestion(currentQuestion.sectionId, currentQuestion.id, { 
                            min: e.target.value ? parseInt(e.target.value) : undefined 
                          })}
                          className="w-full p-3 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Max Value</label>
                        <input
                          type="number"
                          value={(currentQuestion as any).max ?? ''}
                          onChange={(e) => updateQuestion(currentQuestion.sectionId, currentQuestion.id, { 
                            max: e.target.value ? parseInt(e.target.value) : undefined 
                          })}
                          className="w-full p-3 border rounded"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Question Navigation */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t">
                  <button
                    onClick={prevQuestion}
                    disabled={currentSlide === 0}
                    className="flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft size={16} className="mr-2" />
                    Previous Question
                  </button>

                  <div className="flex gap-3">
                    <button
                      onClick={addSection}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Plus size={16} className="mr-2" />
                      Add Section
                    </button>
                    
                    <button
                      onClick={() => addQuestion(currentQuestion.sectionId)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus size={16} className="mr-2" />
                      Add Question
                    </button>
                  </div>

                  <button
                    onClick={nextQuestion}
                    disabled={currentSlide === allQuestions.length - 1}
                    className="flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next Question
                    <ChevronRight size={16} className="ml-2" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Preview/JSON */}
        <div className="w-1/2 p-6 overflow-y-auto bg-black">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2 text-white">
              {activeTab === 'preview' ? 'Live Preview' : 'JSON Output'}
            </h2>
          </div>

          {activeTab === 'preview' ? (
            <FormPreview formData={formData} />
          ) : (
            <CodeBlock
              language="json"
              filename="assessment.json"
              code={JSON.stringify(formData, null, 2)}
            />
          )}

        </div>
      </div>
    </div>
  );
};

export default FormBuilder;