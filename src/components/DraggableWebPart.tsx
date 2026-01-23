import { useState, useRef, useCallback, ReactNode } from 'react';
import { WebPart, Position, Size } from '../types/webpart';
import './DraggableWebPart.css';

interface DraggableWebPartProps {
  webPart: WebPart;
  isSelected: boolean;
  onSelect: () => void;
  onPositionChange: (position: Position) => void;
  onSizeChange: (size: Size) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  children: ReactNode;
}

export function DraggableWebPart({
  webPart,
  isSelected,
  onSelect,
  onPositionChange,
  onSizeChange,
  onDelete,
  onDuplicate,
  children,
}: DraggableWebPartProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('.resize-handle')) {
        return;
      }

      e.stopPropagation();
      onSelect();
      setIsDragging(true);
      dragStart.current = {
        x: e.clientX - webPart.position.x,
        y: e.clientY - webPart.position.y,
      };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const newX = moveEvent.clientX - dragStart.current.x;
        const newY = moveEvent.clientY - dragStart.current.y;
        onPositionChange({ x: Math.max(0, newX), y: Math.max(0, newY) });
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [webPart.position, onSelect, onPositionChange]
  );

  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent, direction: string) => {
      e.stopPropagation();
      e.preventDefault();
      setIsResizing(true);

      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = webPart.size.width;
      const startHeight = webPart.size.height;
      const startLeft = webPart.position.x;
      const startTop = webPart.position.y;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;

        let newWidth = startWidth;
        let newHeight = startHeight;
        let newX = startLeft;
        let newY = startTop;

        if (direction.includes('e')) {
          newWidth = Math.max(150, startWidth + deltaX);
        }
        if (direction.includes('w')) {
          newWidth = Math.max(150, startWidth - deltaX);
          newX = startLeft + startWidth - newWidth;
        }
        if (direction.includes('s')) {
          newHeight = Math.max(100, startHeight + deltaY);
        }
        if (direction.includes('n')) {
          newHeight = Math.max(100, startHeight - deltaY);
          newY = startTop + startHeight - newHeight;
        }

        onSizeChange({ width: newWidth, height: newHeight });
        if (direction.includes('w') || direction.includes('n')) {
          onPositionChange({ x: newX, y: newY });
        }
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [webPart.size, webPart.position, onSizeChange, onPositionChange]
  );

  return (
    <div
      ref={elementRef}
      className={`draggable-webpart ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''} ${isResizing ? 'resizing' : ''}`}
      style={{
        left: webPart.position.x,
        top: webPart.position.y,
        width: webPart.size.width,
        height: webPart.size.height,
        zIndex: webPart.zIndex,
      }}
      onMouseDown={handleMouseDown}
    >
      {children}

      {isSelected && (
        <>
          <div className="webpart-toolbar">
            <button
              className="toolbar-btn duplicate"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
              title="คัดลอก"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
            <button
              className="toolbar-btn delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              title="ลบ"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>

          <div
            className="resize-handle nw"
            onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
          />
          <div
            className="resize-handle ne"
            onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
          />
          <div
            className="resize-handle sw"
            onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
          />
          <div
            className="resize-handle se"
            onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
          />
          <div
            className="resize-handle n"
            onMouseDown={(e) => handleResizeMouseDown(e, 'n')}
          />
          <div
            className="resize-handle s"
            onMouseDown={(e) => handleResizeMouseDown(e, 's')}
          />
          <div
            className="resize-handle e"
            onMouseDown={(e) => handleResizeMouseDown(e, 'e')}
          />
          <div
            className="resize-handle w"
            onMouseDown={(e) => handleResizeMouseDown(e, 'w')}
          />
        </>
      )}
    </div>
  );
}
