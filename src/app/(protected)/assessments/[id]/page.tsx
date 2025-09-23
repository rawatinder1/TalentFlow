"use client"
import React, { use ,useEffect, useState } from 'react';
import { Plus, Trash2, Eye, Code, ChevronLeft, ChevronRight, Edit2, ChevronDown, Check, Loader2, Save } from 'lucide-react';
import FormPreview, { Question, Section, FormData } from './FormPreview';
import { Button }  from '@/components/ui/button';
import { CodeBlock } from '@/components/ui/code-block';
import  Kiko  from "./kiko"
import {AssessmentPicker} from './savedAssessments'
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const FormBuilder = ({ params }: { params: Promise<{ id: string }> }) => {
   const { id } = use(params); 
  const jobId = Number(id);

  const [jobTitle, setJobTitle] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
  jobId: id,
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
    /*async function fetchAssessments(){
      try{
        const res=await fetch(`/mock/assessments?jobId=${jobId}`);
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

      }catch(err:any){
          setError(err.message || "Failed to fetch job");


      }
    }*/
   // fetchAssessments();
  }, [jobId]);

  const [activeTab, setActiveTab] = useState<'preview' | 'json'>('preview');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [sectionInput, setSectionInput] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [saving, setSaving] = useState(false);
    
  const handleSave = async () => {
      try {
        setSaving(true);

        const res = await fetch("/mock/assessments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ jobId: formData.jobId, data: formData }),
        });

        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`);
        }

        const data = await res.json();

      } catch (err) {
        console.error("Failed to save assessment:", err);
      } finally {
        setSaving(false);
      }
    };

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
    setDropdownOpen(false);
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
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-neutral-200/50 px-6 py-1.5">
        <div className="flex justify-between items-center h-10">
          <div>
            <input
              value={formData.title}
              onChange={(e) => updateFormData(prev => ({ ...prev, title: e.target.value }))}
              className="text-base font-black bg-transparent border-none outline-none placeholder:text-neutral-400 text-neutral-800"
              style={{ fontWeight: '900' }}
              placeholder="Assessment Title"
            />
          </div>
          
          <div className="flex gap-2 items-center">
            {/* Preview/JSON Slider */}
            <div className="flex items-center bg-neutral-100 rounded-lg p-1">
              {['preview', 'json'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as 'preview' | 'json')}
                  className={`flex items-center px-3 py-1.5 rounded-md transition-all duration-200 text-sm ${
                    activeTab === tab 
                      ? 'bg-white text-neutral-900 shadow-sm' 
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {tab === 'preview' ? <Eye size={14} className="mr-1.5" /> : <Code size={14} className="mr-1.5" />}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            
            <AssessmentPicker
              jobId={jobId}
              onSelect={(data) => setFormData(data)}
            />
            
            <Kiko setFormData={setFormData} title={formData.title} jobId={formData.jobId}/>
            
            <Button
              onClick={handleSave}
              disabled={saving}
              className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-all duration-200 border-0"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            </Button>

          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Builder */}
        <div className="w-1/2 p-4 bg-white/50 backdrop-blur-sm border-r border-neutral-200/60 overflow-y-auto">
          <div className="mb-4">
            <h2 className="text-xl font-medium bg-gradient-to-r from-neutral-700 to-neutral-600 bg-clip-text text-transparent mb-3">Assessment Builder</h2>
            <div className="flex items-center justify-between">
              <div className="text-neutral-600 text-sm font-light">
                <span className="text-neutral-800 font-medium">Section {currentSectionIndex + 1}</span> 
                <span className="text-neutral-500 mx-1">of</span> 
                <span className="text-neutral-700">{formData.sections.length}</span>
                {allQuestions.length > 0 && (
                  <>
                    <span className="text-neutral-400 mx-2">•</span>
                    <span className="text-neutral-800 font-medium">Question {currentSlide + 1}</span>
                    <span className="text-neutral-500 mx-1">of</span>
                    <span className="text-neutral-700">{allQuestions.length}</span>
                  </>
                )}
              </div>
              
              {/* Section Navigation */}
              <div className="flex gap-1">
                <button
                  onClick={prevSection}
                  disabled={currentSectionIndex === 0}
                  className="flex items-center px-2 py-1 text-xs border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-40 transition-all duration-200"
                >
                  <ChevronLeft size={12} className="mr-1" />
                  Prev
                </button>
                <button
                  onClick={nextSection}
                  disabled={currentSectionIndex === formData.sections.length - 1}
                  className="flex items-center px-2 py-1 text-xs border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-40 transition-all duration-200"
                >
                  Next
                  <ChevronRight size={12} className="ml-1" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm border border-neutral-200/60 rounded-xl p-4 shadow-lg shadow-neutral-900/5 bg-gradient-to-br from-white to-neutral-50/50">
            {/* Section Header */}
            <div className="mb-4 p-3 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-lg border border-blue-100/60">
              <div className="flex items-center justify-between">
                {editingSectionId === currentSection?.id ? (
                  <div className="flex items-center flex-1 mr-2">
                    <input
                      value={sectionInput}
                      onChange={(e) => setSectionInput(e.target.value)}
                      className="flex-1 p-2 text-sm border border-neutral-300 rounded-lg mr-2 bg-white/80 backdrop-blur-sm"
                      placeholder="Section title"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') updateSection(currentSection.id, sectionInput);
                        if (e.key === 'Escape') setEditingSectionId(null);
                      }}
                      autoFocus
                    />
                    <button
                      onClick={() => updateSection(currentSection.id, sectionInput)}
                      className="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center flex-1">
                    <h3 className="text-base font-medium text-blue-800">
                      {currentSection?.title || 'No Section'}
                    </h3>
                    {currentSection && (
                      <button
                        onClick={() => {
                          setEditingSectionId(currentSection.id);
                          setSectionInput(currentSection.title);
                        }}
                        className="ml-2 p-1.5 text-blue-600 hover:bg-blue-100/60 rounded-lg transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                    )}
                  </div>
                )}
                
                {currentSection && (
                  <button
                    onClick={() => deleteSection(currentSection.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>

            {showSectionView ? (
              /* Section View - when no questions */
              <div className="text-center py-8">
                <p className="text-neutral-500 mb-4 font-light text-sm">
                  {currentSection?.questions.length === 0 
                    ? "This section has no questions yet" 
                    : "No sections or questions yet"}
                </p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={addSection}
                    className="flex items-center px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 shadow-sm text-sm"
                  >
                    <Plus size={14} className="mr-1.5" />
                    Add Section
                  </button>
                  {currentSection && (
                    <button
                      onClick={() => addQuestion(currentSection.id)}
                      className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm text-sm"
                    >
                      <Plus size={14} className="mr-1.5" />
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
                      className="flex-1 p-3 text-base border border-neutral-300 rounded-lg mr-3 bg-white/80 backdrop-blur-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all outline-none"
                      placeholder="Question text"
                    />
                    <button
                      onClick={() => deleteQuestion(currentQuestion.sectionId, currentQuestion.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-2 text-neutral-700">Question Type</label>
                      {/* Custom Dropdown */}
                      <div className="relative">
                        <button
                          onClick={() => setDropdownOpen(!dropdownOpen)}
                          className="w-full p-3 border border-neutral-300 rounded-lg bg-white/80 backdrop-blur-sm text-left flex items-center justify-between hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all text-sm"
                        >
                          <span className="text-neutral-900">
                            {questionTypes.find(t => t.value === currentQuestion.type)?.label}
                          </span>
                          <ChevronDown size={14} className={`text-neutral-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {dropdownOpen && (
                          <div className="absolute z-10 w-full mt-1 bg-white/95 backdrop-blur-sm border border-neutral-200 rounded-lg shadow-lg">
                            {questionTypes.map((type) => (
                              <button
                                key={type.value}
                                onClick={() => changeQuestionType(currentQuestion.sectionId, currentQuestion.id, type.value as Question['type'])}
                                className="w-full px-3 py-2 text-left hover:bg-neutral-50 flex items-center justify-between group first:rounded-t-lg last:rounded-b-lg transition-colors text-sm"
                              >
                                <span className="text-neutral-900">{type.label}</span>
                                {currentQuestion.type === type.value && (
                                  <Check size={14} className="text-blue-600" />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center pt-6">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={currentQuestion.required}
                          onChange={(e) => updateQuestion(currentQuestion.sectionId, currentQuestion.id, { required: e.target.checked })}
                          className="mr-2 w-3.5 h-3.5 rounded border-neutral-300 text-blue-600 focus:ring-blue-400"
                        />
                        <span className="text-neutral-700 text-sm">Required</span>
                      </label>
                    </div>
                  </div>

                  {/* Type-specific fields */}
                  {currentQuestion.type === 'long' && (
                    <div>
                      <label className="block text-xs font-medium mb-2 text-neutral-700">Maximum Characters</label>
                      <input
                        type="number"
                        value={(currentQuestion as any).maxLength || ''}
                        onChange={(e) => updateQuestion(currentQuestion.sectionId, currentQuestion.id, { 
                          maxLength: e.target.value ? parseInt(e.target.value) : undefined 
                        })}
                        className="w-full p-3 border border-neutral-300 rounded-lg bg-white/80 backdrop-blur-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all outline-none text-sm"
                        placeholder="Leave blank for no limit"
                      />
                    </div>
                  )}

                  {(currentQuestion.type === 'single' || currentQuestion.type === 'multi') && (
                    <div>
                      <label className="block text-xs font-medium mb-2 text-neutral-700">Options (one per line)</label>
                      <textarea
                        value={(currentQuestion as any).options?.join('\n') || ''}
                        onChange={(e) => {
                          // Split by newlines but preserve empty strings to allow typing
                          const lines = e.target.value.split('\n');
                          // Only filter out completely empty lines at the end, not in the middle
                          const options = lines.length === 1 && lines[0] === '' ? [] : lines;
                          updateQuestion(currentQuestion.sectionId, currentQuestion.id, { options });
                        }}
                        className="w-full p-3 border border-neutral-300 rounded-lg h-24 bg-white/80 backdrop-blur-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all outline-none resize-none text-sm"
                        placeholder="Option 1&#10;Option 2&#10;Option 3"
                      />
                      <p className="text-xs text-neutral-500 mt-1 font-light">
                        Press Enter for new lines. Empty lines at the end will be removed automatically.
                      </p>
                    </div>
                  )}

                  {currentQuestion.type === 'numeric' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-2 text-neutral-700">Min Value</label>
                        <input
                          type="number"
                          value={(currentQuestion as any).min ?? ''}
                          onChange={(e) => updateQuestion(currentQuestion.sectionId, currentQuestion.id, { 
                            min: e.target.value ? parseInt(e.target.value) : undefined 
                          })}
                          className="w-full p-3 border border-neutral-300 rounded-lg bg-white/80 backdrop-blur-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-2 text-neutral-700">Max Value</label>
                        <input
                          type="number"
                          value={(currentQuestion as any).max ?? ''}
                          onChange={(e) => updateQuestion(currentQuestion.sectionId, currentQuestion.id, { 
                            max: e.target.value ? parseInt(e.target.value) : undefined 
                          })}
                          className="w-full p-3 border border-neutral-300 rounded-lg bg-white/80 backdrop-blur-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all outline-none text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Question Navigation */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-neutral-200">
                  <button
                    onClick={prevQuestion}
                    disabled={currentSlide === 0}
                    className="flex items-center px-3 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-40 transition-all duration-200 text-sm"
                  >
                    <ChevronLeft size={14} className="mr-1" />
                    Previous
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={addSection}
                      className="flex items-center px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 shadow-sm text-sm"
                    >
                      <Plus size={14} className="mr-1.5" />
                      Add Section
                    </button>
                    
                    <button
                      onClick={() => addQuestion(currentQuestion.sectionId)}
                      className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm text-sm"
                    >
                      <Plus size={14} className="mr-1.5" />
                      Add Question
                    </button>
                  </div>

                  <button
                    onClick={nextQuestion}
                    disabled={currentSlide === allQuestions.length - 1}
                    className="flex items-center px-3 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-40 transition-all duration-200 text-sm"
                  >
                    Next
                    <ChevronRight size={14} className="ml-1" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Preview/JSON */}
        <div className="w-1/2 p-4 overflow-y-auto bg-gradient-to-br from-neutral-900 to-black">
          <div className="mb-4">
            <h2 className="text-lg font-light mb-2 text-white/90">
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
      
      {/* Click outside to close dropdown */}
      {dropdownOpen && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default FormBuilder;