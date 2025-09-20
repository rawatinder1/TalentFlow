"use client"
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Stage, Layer, Circle } from 'react-konva';
import Konva from 'konva';
import KanbanBoard from '../../kanban/page';
const InteractiveCanvas = () => {
  const stageRef = useRef<Konva.Stage>(null);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [stageScale, setStageScale] = useState(1);
  const [windowSize, setWindowSize] = useState({ width: 800, height: 600 });
  
  // Canvas boundaries - increased by 1.65x
  const CANVAS_WIDTH = 3000; // 2000 * 1.65
  const CANVAS_HEIGHT = 3000; // 2000 * 1.65
  const MIN_SCALE = 0.3;
  const MAX_SCALE = 3;
  
  // Dot configuration
  const DOT_SPACING = 50;
  const DOT_SIZE = 1.5;
  
  // Update window size on mount and resize
  useEffect(() => {
    const updateSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  
  // Calculate visible dots based on current viewport
  const visibleDots = useMemo(() => {
    const dots = [];
    
    // Calculate viewport bounds with some padding for smooth scrolling
    const padding = DOT_SPACING * 2;
    const viewportLeft = (-stagePos.x / stageScale) - padding;
    const viewportRight = (-stagePos.x + windowSize.width) / stageScale + padding;
    const viewportTop = (-stagePos.y / stageScale) - padding;
    const viewportBottom = (-stagePos.y + windowSize.height) / stageScale + padding;
    
    // Find the range of dots to render
    const startX = Math.floor(viewportLeft / DOT_SPACING) * DOT_SPACING;
    const endX = Math.ceil(viewportRight / DOT_SPACING) * DOT_SPACING;
    const startY = Math.floor(viewportTop / DOT_SPACING) * DOT_SPACING;
    const endY = Math.ceil(viewportBottom / DOT_SPACING) * DOT_SPACING;
    
    // Only generate dots within the canvas bounds and viewport
    for (let x = Math.max(0, startX); x <= Math.min(CANVAS_WIDTH, endX); x += DOT_SPACING) {
      for (let y = Math.max(0, startY); y <= Math.min(CANVAS_HEIGHT, endY); y += DOT_SPACING) {
        dots.push({
          id: `dot-${x}-${y}`,
          x,
          y,
          radius: DOT_SIZE
        });
      }
    }
    
    return dots;
  }, [stagePos.x, stagePos.y, stageScale, windowSize.width, windowSize.height]);
  
  // Handle zoom
  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    
    const stage = stageRef.current;
    if (!stage) return;
    
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    
    if (!pointer) return;
    
    const scaleBy = 1.1;
    const newScale = e.evt.deltaY > 0 
      ? Math.max(oldScale / scaleBy, MIN_SCALE)
      : Math.min(oldScale * scaleBy, MAX_SCALE);
    
    // Calculate new position to zoom towards mouse pointer
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    
    setStageScale(newScale);
    setStagePos(newPos);
  };
  
  // Handle drag with boundaries
  const handleDragMove = (e: KonvaEventObject<DragEvent>) => {
    const stage = e.target as Konva.Stage;
    const scale = stage.scaleX();
    
    // Calculate boundaries based on current scale
    const maxX = 0;
    const maxY = 0;
    const minX = -(CANVAS_WIDTH * scale - windowSize.width);
    const minY = -(CANVAS_HEIGHT * scale - windowSize.height);
    
    // Constrain position within boundaries
    const newX = Math.min(maxX, Math.max(minX, stage.x()));
    const newY = Math.min(maxY, Math.max(minY, stage.y()));
    
    stage.x(newX);
    stage.y(newY);
    
    setStagePos({ x: newX, y: newY });
  };
  
  return (
    <div className="w-full h-screen bg-white overflow-hidden relative"> 
      {/* Controls */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="text-sm space-y-1">
          <div>Zoom: {(stageScale * 100).toFixed(0)}%</div>
          <div>X: {Math.round(stagePos.x)}, Y: {Math.round(stagePos.y)}</div>
          <div>Visible dots: {visibleDots.length}</div>
          <div className="text-xs text-gray-600 mt-2">
            • Mouse wheel to zoom<br/>
            • Drag to pan<br/>
            • Movement is constrained
          </div>
        </div>
      </div>
      
      {/* Reset button */}
      <button
        onClick={() => {
          setStagePos({ x: 0, y: 0 });
          setStageScale(1);
        }}
        className="absolute top-4 right-4 z-10 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg transition-colors"
      >
        Reset View
      </button>
      
      <Stage
        ref={stageRef}
        width={windowSize.width}
        height={windowSize.height}
        x={stagePos.x}
        y={stagePos.y}
        scaleX={stageScale}
        scaleY={stageScale}
        draggable
        onWheel={handleWheel}
        onDragMove={handleDragMove}
        className="cursor-grab active:cursor-grabbing"
      >
        <Layer>
          {/* Background dots - only render visible ones */}
          {visibleDots.map((dot) => (
            <Circle
              key={dot.id}
              x={dot.x}
              y={dot.y}
              radius={dot.radius}
              fill="#374151"
              opacity={0.6}
            />
          ))}
          
          {/* Example content */}
          
        </Layer>
      </Stage>
    </div>
  );
};

export default InteractiveCanvas;