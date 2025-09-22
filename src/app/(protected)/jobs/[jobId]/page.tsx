"use client"
import React, { useState, useRef, useEffect } from 'react';
import HelpModal from './modal';
import { useParams } from 'next/navigation';

// Types
interface Card {
  id: string;
  title: string;
  description: string;
}

interface Column {
  id: number;
  title: string;
  backgroundColor: string;
  cards: Card[];
}

interface Board {
  columns: Column[];
}

interface DraggedCard {
  card: Card;
  sourceColumnId: number;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  jobId: number;
  stage: "applied" | "screen" | "tech" | "offer" | "hired" | "rejected";
}

// Constants
const STAGES = [
  { id: 1, title: "Applied", stage: "applied" },
  { id: 2, title: "Screen", stage: "screen" },
  { id: 3, title: "Tech", stage: "tech" },
  { id: 4, title: "Offer", stage: "offer" },
  { id: 5, title: "Hired", stage: "hired" },
  { id: 6, title: "Rejected", stage: "rejected" },
] as const;

const SCROLL_THRESHOLD = 100;
const SCROLL_SPEED = 10;
const SCROLL_INTERVAL = 16;

export default function KanbanBoard() {
  // State
  const [board, setBoard] = useState<Board>({ columns: [] });
  const [draggedCard, setDraggedCard] = useState<DraggedCard | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loadingCards, setLoadingCards] = useState<Set<string>>(new Set());

  // Refs
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Params
  const { jobId } = useParams();

  // Auto-scroll functionality
  const startAutoScroll = (direction: 'left' | 'right', speed: number): void => {
    if (scrollIntervalRef.current) return;

    scrollIntervalRef.current = setInterval(() => {
      if (scrollContainerRef.current) {
        const scrollAmount = direction === 'right' ? speed : -speed;
        scrollContainerRef.current.scrollLeft += scrollAmount;
      }
    }, SCROLL_INTERVAL);
  };

  const stopAutoScroll = (): void => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  };

  // API calls
  const updateCandidateStage = async (candidateId: string, stage: string): Promise<void> => {
    console.log('Updating candidate:', candidateId, 'to stage:', stage);
    console.log('Candidate ID type:', typeof candidateId);
    console.log('Is candidate ID a number?', !isNaN(Number(candidateId)));

    const response = await fetch(`/mock/candidates/${candidateId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage }),
    });

    console.log('API Response status:', response.status);
    console.log('API Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('API Error response:', errorText);
      throw new Error(`Failed to update candidate stage: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Candidate stage updated successfully:', result);
  };

  const deleteCandidateAPI = async (candidateId: string): Promise<void> => {
    const response = await fetch(`/mock/candidates/${candidateId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete candidate');
    }

    console.log('Candidate deleted successfully');
  };

  const loadCandidates = async (): Promise<void> => {
    try {
      const res = await fetch(`/mock/jobs/${jobId}/candidates`);
      const { data }: { data: Candidate[] } = await res.json();

      const cols: Column[] = STAGES.map((stage) => ({
        id: stage.id,
        title: stage.title,
        backgroundColor: "#ffffff",
        cards: data
          .filter((candidate) => candidate.stage === stage.stage)
          .map((candidate) => ({
            id: candidate.id,
            title: candidate.name,
            description: candidate.email,
          })),
      }));

      setBoard({ columns: cols });
    } catch (error) {
      console.error('Error loading candidates:', error);
      
      // Set empty board if API fails
      const emptyCols: Column[] = STAGES.map((stage) => ({
        id: stage.id,
        title: stage.title,
        backgroundColor: "#ffffff",
        cards: [],
      }));
      setBoard({ columns: emptyCols });
    }
  };

  // Board manipulation
  const moveCardToColumn = (card: Card, sourceColumnId: number, targetColumnId: number): Board => {
    const newBoard: Board = { ...board };
    
    // Remove card from source column
    const sourceColumn = newBoard.columns.find(col => col.id === sourceColumnId);
    if (sourceColumn) {
      sourceColumn.cards = sourceColumn.cards.filter(c => c.id !== card.id);
    }
    
    // Add card to target column
    const targetColumn = newBoard.columns.find(col => col.id === targetColumnId);
    if (targetColumn) {
      targetColumn.cards.push(card);
    }

    return newBoard;
  };

  const removeCardFromBoard = (columnId: number, cardId: string): Board => {
    const newBoard: Board = { ...board };
    const column = newBoard.columns.find(col => col.id === columnId);
    if (column) {
      column.cards = column.cards.filter(card => card.id !== cardId);
    }
    return newBoard;
  };

  // Event handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, card: Card, columnId: number): void => {
    setDraggedCard({ card, sourceColumnId: columnId });
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    
    if (!isDragging || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const containerWidth = rect.width;

    if (mouseX > containerWidth - SCROLL_THRESHOLD && 
        container.scrollLeft < container.scrollWidth - container.clientWidth) {
      startAutoScroll('right', SCROLL_SPEED);
    }
    else if (mouseX < SCROLL_THRESHOLD && container.scrollLeft > 0) {
      startAutoScroll('left', SCROLL_SPEED);
    }
    else {
      stopAutoScroll();
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, targetColumnId: number): Promise<void> => {
    e.preventDefault();
    
    if (!draggedCard || draggedCard.sourceColumnId === targetColumnId) {
      setDraggedCard(null);
      setIsDragging(false);
      stopAutoScroll();
      return;
    }

    // Update local state immediately for responsiveness
    const newBoard = moveCardToColumn(draggedCard.card, draggedCard.sourceColumnId, targetColumnId);
    setBoard(newBoard);

    // Get the new stage based on target column
    const targetStage = STAGES.find(s => s.id === targetColumnId)?.stage;
    
    if (targetStage) {
      try {
        await updateCandidateStage(draggedCard.card.id, targetStage);
      } catch (error) {
        console.error('Error updating candidate stage:', error);
        // Optionally revert the UI change here
      }
    }

    setDraggedCard(null);
    setIsDragging(false);
    stopAutoScroll();
  };

  const handleDragEnd = (): void => {
    setIsDragging(false);
    stopAutoScroll();
  };

  const removeCard = async (columnId: number, cardId: string): Promise<void> => {
    try {
      // Update local state immediately for responsiveness
      const newBoard = removeCardFromBoard(columnId, cardId);
      setBoard(newBoard);

      // Call the API to delete the candidate
      await deleteCandidateAPI(cardId);
    } catch (error) {
      console.error('Error deleting candidate:', error);
      // Optionally revert the UI change or show an error message
    }
  };

  // Card styling helpers
  const getCardStyles = (isLoading: boolean) => ({
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'translateY(0px) scale(1) rotate(0deg)',
    marginBottom: '16px'
  });

  const handleCardMouseEnter = (e: React.MouseEvent<HTMLDivElement>, cardId: string) => {
    if (!isDragging && !loadingCards.has(cardId)) {
      const target = e.currentTarget;
      target.style.transform = 'translateY(-8px) scale(1.02) rotate(1deg)';
      target.style.boxShadow = '0 25px 50px -12px rgba(245, 158, 11, 0.4), 0 10px 20px -5px rgba(245, 158, 11, 0.2)';
      target.style.borderColor = '#f59e0b';
    }
  };

  const handleCardMouseLeave = (e: React.MouseEvent<HTMLDivElement>, cardId: string) => {
    if (!isDragging && !loadingCards.has(cardId)) {
      const target = e.currentTarget;
      target.style.transform = 'translateY(0px) scale(1) rotate(0deg)';
      target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
      target.style.borderColor = '#e5e7eb';
    }
  };

  const handleDeleteButtonHover = (e: React.MouseEvent<HTMLButtonElement>, isEntering: boolean, cardId: string) => {
    if (!loadingCards.has(cardId)) {
      const target = e.currentTarget;
      target.style.transform = isEntering ? 'scale(1.1) rotate(90deg)' : 'scale(1) rotate(0deg)';
    }
  };

  // Effects
  useEffect(() => {
    if (jobId) {
      loadCandidates();
    }
  }, [jobId]);

  useEffect(() => {
    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, []);

  // Render helpers
  const renderOverviewCard = (column: Column, index: number) => (
    <div key={column.id} className="relative">
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200 hover:shadow-md transition-all duration-300">
        <div className="text-sm font-semibold text-gray-700 mb-1">{column.title}</div>
        <div className="text-2xl font-bold text-gray-800">{column.cards.length}</div>
        <div className="text-xs text-gray-500">candidates</div>
      </div>
      {index < board.columns.length - 1 && (
        <div className="hidden lg:block absolute top-1/2 -right-2 w-4 h-0.5 bg-gradient-to-r from-gray-300 to-gray-400 transform -translate-y-1/2"></div>
      )}
    </div>
  );

  const renderCard = (card: Card, columnId: number) => {
    const isLoading = loadingCards.has(card.id);
    
    return (
      <div
        key={card.id}
        draggable
        onDragStart={(e) => handleDragStart(e, card, columnId)}
        onDragEnd={handleDragEnd}
        className={`bg-white p-4 rounded-xl border border-gray-200 cursor-grab active:cursor-grabbing group ${
          isLoading ? 'opacity-50 animate-pulse' : ''
        }`}
        style={getCardStyles(isLoading)}
        onMouseEnter={(e) => handleCardMouseEnter(e, card.id)}
        onMouseLeave={(e) => handleCardMouseLeave(e, card.id)}
      >
        {isLoading && (
          <div className="absolute top-2 right-2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        )}
        
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-gray-800 text-sm">
            {card.title}
          </h3>
          <button
            onClick={() => removeCard(columnId, card.id)}
            disabled={isLoading}
            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 
                     w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-50 disabled:opacity-25"
            style={{
              transition: 'all 0.3s ease',
              transform: 'scale(1) rotate(0deg)'
            }}
            onMouseEnter={(e) => handleDeleteButtonHover(e, true, card.id)}
            onMouseLeave={(e) => handleDeleteButtonHover(e, false, card.id)}
          >
            ×
          </button>
        </div>
        
        <p className="text-gray-600 text-xs leading-relaxed mb-3">
          {card.description}
        </p>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded-md">
            ID: {card.id}
          </span>
          <div className="w-8 h-8 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-full 
                        flex items-center justify-center group-hover:from-amber-200 group-hover:to-yellow-200
                        transition-all duration-300 hover:rotate-180">
            <span className="text-xs text-amber-700 font-bold">⋮⋮</span>
          </div>
        </div>
      </div>
    );
  };

  const renderEmptyColumn = () => (
    <div className="text-center text-gray-400 py-12 border-2 border-dashed border-gray-300 rounded-xl
                  hover:border-amber-300 hover:bg-amber-50/30 transition-all duration-300">
      <div className="space-y-2">
        <div className="text-4xl">📋</div>
        <p className="text-sm font-medium">No cards yet</p>
        <p className="text-xs">Drop cards here or add new ones</p>
      </div>
    </div>
  );

  const renderColumn = (column: Column) => (
    <div
      key={column.id}
      className="min-w-80 bg-white rounded-xl shadow-lg border border-gray-200 backdrop-blur-sm"
      style={{ backgroundColor: column.backgroundColor }}
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, column.id)}
    >
      {/* Column Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-zinc-900 text-lg">
            {column.title}
            <span className="ml-2 text-sm text-zinc-900 font-normal bg-gray-200 px-2 py-1 rounded-full">
              ({column.cards.length})
            </span>
          </h2>
        </div>
      </div>

      {/* Cards */}
      <div className="p-4 min-h-32" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {column.cards.length > 0 
          ? column.cards.map((card) => renderCard(card, column.id))
          : renderEmptyColumn()
        }
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Help Modal */}
      <div className="top-4">
        <HelpModal />
      </div>

      {/* Header Section */}
      <div className="mb-8">
        <div className="max-w-7xl mx-auto">
          {/* Pipeline Overview */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Recruitment Pipeline Overview
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {board.columns.map((column, index) => renderOverviewCard(column, index))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Kanban Board */}
      <div className="max-w-7xl mx-auto">
        <div 
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-6"
          onDragOver={handleDragOver}
        >
          {board.columns.map(renderColumn)}
        </div>
      </div>
    </div>
  );
}   