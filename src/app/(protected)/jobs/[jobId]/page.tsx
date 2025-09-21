"use client"

import React, { useState, useRef, useEffect } from 'react';
import HelpModal from './modal';
import { useParams } from 'next/navigation';
interface Card {
  id: number;
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
  id: number
  name: string
  email: string
  jobId: number
  stage: "applied" | "screen" | "tech" | "offer" | "hired" | "rejected"
}

const stages = [
  { id: 1, title: "Applied", stage: "applied" },
  { id: 2, title: "Screen", stage: "screen" },
  { id: 3, title: "Tech", stage: "tech" },
  { id: 4, title: "Offer", stage: "offer" },
  { id: 5, title: "Hired", stage: "hired" },
  { id: 6, title: "Rejected", stage: "rejected" },
]

export default function KanbanBoard() {
  const [draggedCard, setDraggedCard] = useState<DraggedCard | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [board, setBoard] = useState<Board>({ columns: [] })
  const { jobId } = useParams()

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, card: Card, columnId: number): void => {
    setDraggedCard({ card, sourceColumnId: columnId });
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    
    if (!isDragging || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const rect = container.getBoundingClientRect();
    const scrollThreshold = 100; // pixels from edge to trigger scroll
    const scrollSpeed = 10; // pixels per scroll

    const mouseX = e.clientX - rect.left;
    const containerWidth = rect.width;

    // Check if mouse is near the right edge and we can scroll right
    if (mouseX > containerWidth - scrollThreshold && 
        container.scrollLeft < container.scrollWidth - container.clientWidth) {
      startAutoScroll('right', scrollSpeed);
    }
    // Check if mouse is near the left edge and we can scroll left
    else if (mouseX < scrollThreshold && container.scrollLeft > 0) {
      startAutoScroll('left', scrollSpeed);
    }
    // Stop scrolling if mouse is not near edges
    else {
      stopAutoScroll();
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetColumnId: number): void => {
    e.preventDefault();
    
    if (!draggedCard || draggedCard.sourceColumnId === targetColumnId) {
      setDraggedCard(null);
      setIsDragging(false);
      stopAutoScroll();
      return;
    }

    const newBoard: Board = { ...board };
    
    // Remove card from source column
    const sourceColumn = newBoard.columns.find(col => col.id === draggedCard.sourceColumnId);
    if (sourceColumn) {
      sourceColumn.cards = sourceColumn.cards.filter(card => card.id !== draggedCard.card.id);
    }
    
    // Add card to target column
    const targetColumn = newBoard.columns.find(col => col.id === targetColumnId);
    if (targetColumn) {
      targetColumn.cards.push(draggedCard.card);
    }

    setBoard(newBoard);
    setDraggedCard(null);
    setIsDragging(false);
    stopAutoScroll();
  };

  const handleDragEnd = (): void => {
    setIsDragging(false);
    stopAutoScroll();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>): void => {
    // This function is no longer needed as we handle scrolling in dragOver
  };

  const startAutoScroll = (direction: 'left' | 'right', speed: number): void => {
    if (scrollIntervalRef.current) return; // Already scrolling

    scrollIntervalRef.current = setInterval(() => {
      if (scrollContainerRef.current) {
        const scrollAmount = direction === 'right' ? speed : -speed;
        scrollContainerRef.current.scrollLeft += scrollAmount;
      }
    }, 16); // ~60fps
  };

  const stopAutoScroll = (): void => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  };

  const removeCard = (columnId: number, cardId: number): void => {
    const newBoard: Board = { ...board };
    const column = newBoard.columns.find(col => col.id === columnId);
    if (column) {
      column.cards = column.cards.filter(card => card.id !== cardId);
    }
    
    setBoard(newBoard);
  };
    useEffect(() => {
    async function loadCandidates() {
      const res = await fetch(`/jobs/${jobId}/candidates`)
      const { data }: { data: Candidate[] } = await res.json()

      // Build board dynamically
      const cols: Column[] = stages.map((s) => ({
        id: s.id,
        title: s.title,
        stage: s.stage,
        backgroundColor: "#ffffff",
        cards: data
          .filter((c) => c.stage === s.stage)
          .map((c) => ({
            id: c.id,
            title: c.name,
            description: c.email, 
          })),
      }))

      setBoard({ columns: cols })
    }

    if (jobId) {
      loadCandidates()
    }
  }, [jobId])
  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, []);

  return (
   
<div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Help Modal - Top Left Corner */}
      <div className="fixed top-4 light-5 z-40">
        <HelpModal />
      </div>

      {/* Modern Header Section */}
      <div className="mb-8">
        <div className="max-w-7xl mx-auto">
         

          {/* Pipeline Overview */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Recruitment Pipeline Overview
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {board.columns.map((column, index) => (
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
              ))}
            </div>
          </div>
        </div>
      </div>
       <div className="max-w-7xl mx-auto">
         <div 
           ref={scrollContainerRef}
           className="flex gap-6 overflow-x-auto pb-6"
           onDragOver={handleDragOver}
         >
        {board.columns.map((column) => (
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
                    {`(${column.cards.length})`}
                  </span>
                </h2>
              </div>
            </div>

            {/* Cards */}
            <div className="p-4 min-h-32" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {column.cards.map((card) => (
                <div
                  key={card.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, card, column.id)}
                  onDragEnd={handleDragEnd}
                  className="bg-white p-4 rounded-xl border border-gray-200 cursor-grab active:cursor-grabbing group"
                  style={{
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: 'translateY(0px) scale(1) rotate(0deg)',
                    marginBottom: '16px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isDragging) {
                      e.currentTarget.style.transform = 'translateY(-8px) scale(1.02) rotate(1deg)';
                      e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(245, 158, 11, 0.4), 0 10px 20px -5px rgba(245, 158, 11, 0.2)';
                      e.currentTarget.style.borderColor = '#f59e0b';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isDragging) {
                      e.currentTarget.style.transform = 'translateY(0px) scale(1) rotate(0deg)';
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-800 text-sm">
                      {card.title}
                    </h3>
                    <button
                      onClick={() => removeCard(column.id, card.id)}
                      className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 
                               w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-50"
                      style={{
                        transition: 'all 0.3s ease',
                        transform: 'scale(1) rotate(0deg)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                      }}
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
              ))}
              
              {column.cards.length === 0 && (
                <div className="text-center text-gray-400 py-12 border-2 border-dashed border-gray-300 rounded-xl
                              hover:border-amber-300 hover:bg-amber-50/30 transition-all duration-300">
                  <div className="space-y-2">
                    <div className="text-4xl">📋</div>
                    <p className="text-sm font-medium">No cards yet</p>
                    <p className="text-xs">Drop cards here or add new ones</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
       </div>
     
      
      
      </div>

    </div>
  );
}