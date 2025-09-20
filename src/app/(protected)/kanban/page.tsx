"use client"
import React, { useState, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Types
const ItemTypes = {
  CARD: 'card',
};

// Sample data
const initialData = {
  columns: {
    'backlog': {
      id: 'backlog',
      title: 'Backlog',
      taskIds: ['task-1', 'task-2', 'task-3'],
    },
    'todo': {
      id: 'todo',
      title: 'To Do',
      taskIds: ['task-4', 'task-5'],
    },
    'in-progress': {
      id: 'in-progress',
      title: 'In Progress',
      taskIds: ['task-6'],
    },
    'review': {
      id: 'review',
      title: 'Review',
      taskIds: ['task-7'],
    },
    'done': {
      id: 'done',
      title: 'Done',
      taskIds: ['task-8', 'task-9'],
    },
  },
  tasks: {
    'task-1': { id: 'task-1', content: 'Setup project repository', priority: 'high' },
    'task-2': { id: 'task-2', content: 'Define user requirements', priority: 'medium' },
    'task-3': { id: 'task-3', content: 'Create wireframes', priority: 'low' },
    'task-4': { id: 'task-4', content: 'Design database schema', priority: 'high' },
    'task-5': { id: 'task-5', content: 'Setup authentication', priority: 'medium' },
    'task-6': { id: 'task-6', content: 'Implement user dashboard', priority: 'high' },
    'task-7': { id: 'task-7', content: 'Write unit tests', priority: 'medium' },
    'task-8': { id: 'task-8', content: 'Setup CI/CD pipeline', priority: 'low' },
    'task-9': { id: 'task-9', content: 'Deploy to staging', priority: 'medium' },
  },
  columnOrder: ['backlog', 'todo', 'in-progress', 'review', 'done'],
};

// Task Card Component
const TaskCard = ({ task, index, columnId, moveCard }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: { id: task.id, index, columnId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <div
      ref={drag}
      className={`p-3 mb-2 bg-white rounded-lg shadow-sm border-l-4 cursor-move transition-all hover:shadow-md ${
        getPriorityColor(task.priority)
      } ${isDragging ? 'opacity-50 rotate-1' : 'opacity-100'}`}
    >
      <div className="text-sm font-medium text-gray-800 mb-1">
        {task.content}
      </div>
      <div className="flex justify-between items-center">
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          task.priority === 'high' ? 'bg-red-100 text-red-700' :
          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
          'bg-green-100 text-green-700'
        }`}>
          {task.priority}
        </span>
        <span className="text-xs text-gray-500">#{task.id.split('-')[1]}</span>
      </div>
    </div>
  );
};

// Column Component
const Column = ({ column, tasks, moveCard }) => {
  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.CARD,
    drop: (item) => {
      if (item.columnId !== column.id) {
        moveCard(item.id, item.columnId, column.id, item.index, tasks.length);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const getColumnColor = (columnId) => {
    switch (columnId) {
      case 'backlog': return 'bg-slate-100 border-slate-300';
      case 'todo': return 'bg-blue-100 border-blue-300';
      case 'in-progress': return 'bg-purple-100 border-purple-300';
      case 'review': return 'bg-orange-100 border-orange-300';
      case 'done': return 'bg-green-100 border-green-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  return (
    <div
      ref={drop}
      className={`flex-1 min-w-72 max-w-80 border-2 border-dashed rounded-lg p-4 transition-colors ${
        getColumnColor(column.id)
      } ${isOver ? 'border-solid shadow-lg' : ''}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 text-lg">{column.title}</h3>
        <span className="bg-white text-gray-600 px-2 py-1 rounded-full text-sm font-medium">
          {tasks.length}
        </span>
      </div>
      
      <div className="space-y-2 min-h-32">
        {tasks.map((task, index) => (
          <TaskCard
            key={task.id}
            task={task}
            index={index}
            columnId={column.id}
            moveCard={moveCard}
          />
        ))}
        
        {tasks.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">📋</div>
            <p className="text-sm">Drop cards here</p>
          </div>
        )}
      </div>
      
      <button className="w-full mt-3 py-2 px-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors text-sm">
        + Add a card
      </button>
    </div>
  );
};

// Main Kanban Board Component
const KanbanBoard = () => {
  const [data, setData] = useState(initialData);

  const moveCard = useCallback((taskId, sourceColumnId, destColumnId, sourceIndex, destIndex) => {
    setData(prevData => {
      const newData = { ...prevData };
      
      // Remove from source column
      const sourceColumn = { ...newData.columns[sourceColumnId] };
      const newSourceTaskIds = [...sourceColumn.taskIds];
      newSourceTaskIds.splice(sourceIndex, 1);
      sourceColumn.taskIds = newSourceTaskIds;
      
      // Add to destination column
      const destColumn = { ...newData.columns[destColumnId] };
      const newDestTaskIds = [...destColumn.taskIds];
      newDestTaskIds.splice(destIndex, 0, taskId);
      destColumn.taskIds = newDestTaskIds;
      
      newData.columns[sourceColumnId] = sourceColumn;
      newData.columns[destColumnId] = destColumn;
      
      return newData;
    });
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Project Kanban Board</h1>
            <p className="text-gray-600">Drag and drop cards between columns to update their status</p>
          </header>
          
          <div className="flex gap-6 overflow-x-auto pb-6">
            {data.columnOrder.map(columnId => {
              const column = data.columns[columnId];
              const tasks = column.taskIds.map(taskId => data.tasks[taskId]);
              
              return (
                <Column
                  key={column.id}
                  column={column}
                  tasks={tasks}
                  moveCard={moveCard}
                />
              );
            })}
          </div>
          
          <div className="mt-8 text-center">
            <div className="inline-flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>High Priority</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Medium Priority</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Low Priority</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default KanbanBoard;