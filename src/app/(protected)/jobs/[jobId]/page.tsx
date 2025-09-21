"use client"

import React, { useState } from 'react';

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

const initialBoard: Board = {
  columns: [
    {
      id: 1,
      title: "Applied",
      backgroundColor: "#ffffff",
      cards: [
        { id: 1, title: "Card title 1", description: "Card content" },
        { id: 2, title: "Card title 2", description: "Card content" },
        { id: 3, title: "Card title 3", description: "Card content" }
      ]
    },
    {
      id: 2,
      title: "Screen",
      backgroundColor: "#ffffff",
      cards: [
        { id: 9, title: "Card title 9", description: "Card content" }
      ]
    },
    {
      id: 3,
      title: "Tech",
      backgroundColor: "#ffffff",
      cards: [
        { id: 10, title: "Card title 10", description: "Card content" },
        { id: 11, title: "Card title 11", description: "Card content" }
      ]
    },
    {
      id: 4,
      title: "Offer",
      backgroundColor: "#ffffff",
      cards: [
        { id: 12, title: "Card title 12", description: "Card content" },
        { id: 13, title: "Card title 13", description: "Card content" }
      ]
    },
    {
      id: 5,
      title: "Hired",
      backgroundColor: "#ffffff",
      cards: [
        { id: 14, title: "Card title 14", description: "Card content" },
        { id: 15, title: "Card title 15", description: "Card content" }
      ]
    },
    {
      id: 6,
      title: "Rejected",
      backgroundColor: "#ffffff",
      cards: [
        { id: 16, title: "Card title 16", description: "Card content" },
        { id: 17, title: "Card title 17", description: "Card content" }
      ]
    }
  ]
};

export default function KanbanBoard() {
  const [board, setBoard] = useState<Board>(initialBoard);
  const [draggedCard, setDraggedCard] = useState<DraggedCard | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, card: Card, columnId: number): void => {
    setDraggedCard({ card, sourceColumnId: columnId });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetColumnId: number): void => {
    e.preventDefault();
    
    if (!draggedCard || draggedCard.sourceColumnId === targetColumnId) {
      setDraggedCard(null);
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
  };

  const removeCard = (columnId: number, cardId: number): void => {
    const newBoard: Board = { ...board };
    const column = newBoard.columns.find(col => col.id === columnId);
    if (column) {
      column.cards = column.cards.filter(card => card.id !== cardId);
    }
    
    setBoard(newBoard);
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
        Kanban Board
      </h1>
      
      <div className="flex gap-6 overflow-x-auto pb-6">
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
                  className="bg-white p-4 rounded-xl border border-gray-200 cursor-grab active:cursor-grabbing group"
                  style={{
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: 'translateY(0px) scale(1) rotate(0deg)',
                    marginBottom: '16px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.02) rotate(1deg)';
                    e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(245, 158, 11, 0.4), 0 10px 20px -5px rgba(245, 158, 11, 0.2)';
                    e.currentTarget.style.borderColor = '#f59e0b';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0px) scale(1) rotate(0deg)';
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                    e.currentTarget.style.borderColor = '#e5e7eb';
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
  );
}