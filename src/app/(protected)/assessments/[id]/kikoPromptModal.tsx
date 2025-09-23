"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface AIPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  setFormData: (data: any) => void;
  jobId: string;
  title: string;
}

const AIPromptModal: React.FC<AIPromptModalProps> = ({
  isOpen,
  onClose,
  setFormData,
  jobId,
  title,
}) => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function generateAssessment(prompt: string, jobId: string, title: string) {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, jobId, title }),
    });

    if (!res.ok) throw new Error("Failed to generate assessment");
    return res.json();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const data = await generateAssessment(prompt, jobId, title);
      setFormData(data);
      setPrompt("");
      onClose();
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <>
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          zIndex: 2147483647,
          backdropFilter: 'blur(3px)'
        }}
      />
      
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '30px',
        maxWidth: '500px',
        width: '90vw',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 25px 50px rgba(0,0,0,0.8)',
        zIndex: 2147483647,
        border: '3px solid #007bff'
      }}>
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#333' }}>AI Assessment Generator</h2>
          <button 
            onClick={onClose}
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '28px', 
              cursor: 'pointer',
              padding: '5px',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        <p style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>
          Generate assessment questions for <strong>{title || "this role"}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Describe Your Assessment Requirements
            </label>
            <textarea
              required
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Create a frontend engineer assessment with React, HR, and Aptitude sections (5 questions each)."
              rows={4}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                resize: 'vertical',
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px 20px',
                border: '2px solid #ccc',
                borderRadius: '8px',
                backgroundColor: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              style={{
                flex: 1,
                padding: '12px 20px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: loading || !prompt.trim() ? '#ccc' : '#007bff',
                color: 'white',
                cursor: loading || !prompt.trim() ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {loading ? 'Generating...' : 'Generate Assessment'}
            </button>
          </div>
        </form>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
};

export default AIPromptModal;