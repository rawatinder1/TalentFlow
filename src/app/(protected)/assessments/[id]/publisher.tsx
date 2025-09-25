import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Globe, Copy, Check, X } from 'lucide-react';

interface publish {
    savedAssessmentId: string; 
}

const PublishToggle = ({ 
  savedAssessmentId, 
}:publish) => {
  const [isToggling, setIsToggling] = useState(false);
  const [published, setPublished] = useState(false);
  const [link, setLink] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handlePublish = async () => {
    // Guard rail
    if (!savedAssessmentId || savedAssessmentId.trim() === '') {
      alert('Please save your assessment before publishing.');
      return;
    }

    setIsToggling(true);
    
    try {
      const res = await fetch(`/mock/assessments/${savedAssessmentId}/publish`, {
        method: "PUT",
      });
      
      if (res.ok) {
        const updated = await res.json();
        setPublished(updated.published);
        setLink(updated.link);
        
        if (updated.published && updated.link) {
          setShowModal(true);
        }
      }
    } catch (error) {
      console.error('Failed to toggle publish status:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      const fullLink = `${window.location.origin}${link}`;
      await navigator.clipboard.writeText(fullLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setCopied(false);
  };

  // Modal component that will be rendered via portal beacause increasing hte z index wasnt working.
  const Modal = () => (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4" 
      style={{ 
        zIndex: 9999,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)'
      }}
    >
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full mx-4 border border-gray-200">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <h3 className="text-sm font-medium text-gray-900">Published</h3>
            </div>
            <button
              onClick={closeModal}
              className="text-gray-400 hover:text-gray-600 p-0.5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Contentfor the form here */}
        <div className="p-4">
          <p className="text-xs text-gray-500 mb-3">
            Share your form link:
          </p>
          
          <div className="bg-gray-50 rounded border border-gray-200 overflow-hidden mb-3">
            <div className="flex items-center">
              <div className="flex-1 px-3 py-2">
                <p className="text-xs text-gray-700 font-mono break-all">
                  {window.location.origin}{link}
                </p>
              </div>
              <button
                onClick={copyToClipboard}
                className={`
                  px-3 py-2 border-l border-gray-200 transition-colors duration-200
                  ${copied 
                    ? 'bg-green-50 text-green-600' 
                    : 'hover:bg-gray-100 text-gray-500'
                  }
                `}
                title="Copy link"
              >
                {copied ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>

          {/* Copy Status */}
          {copied && (
            <div className="flex items-center gap-1 text-green-600 text-xs mb-3">
              <Check className="w-3 h-3" />
              Copied!
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={copyToClipboard}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded text-xs font-medium transition-colors duration-200 flex items-center justify-center gap-1"
            >
              <Copy className="w-3 h-3" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={closeModal}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 text-xs font-medium transition-colors duration-200"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={handlePublish}
        disabled={isToggling || !savedAssessmentId || savedAssessmentId.trim() === ''}
        className={`
          relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ease-in-out
          ${!savedAssessmentId || savedAssessmentId.trim() === '' 
            ? 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-100' 
            : published 
              ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
          }
          ${isToggling ? 'opacity-75 cursor-not-allowed' : (!savedAssessmentId || savedAssessmentId.trim() === '') ? '' : 'cursor-pointer hover:shadow-sm'}
          focus:outline-none focus:ring-2 focus:ring-offset-1
          ${published ? 'focus:ring-green-500' : 'focus:ring-gray-400'}
        `}
        title={
          !savedAssessmentId || savedAssessmentId.trim() === '' 
            ? 'Save assessment first to publish' 
            : published 
              ? 'Unpublish form' 
              : 'Publish form'
        }
      >
        <Globe className={`w-3.5 h-3.5 ${isToggling ? 'animate-spin' : ''}`} />
        {isToggling 
          ? 'Updating...' 
          : !savedAssessmentId || savedAssessmentId.trim() === '' 
            ? 'Save to Publish' 
            : published 
              ? 'Published' 
              : 'Publish'
        }
      </button>

      {/* Portal Modal */}
      {showModal && createPortal(<Modal />, document.body)}
    </>
  );
};

export default PublishToggle;