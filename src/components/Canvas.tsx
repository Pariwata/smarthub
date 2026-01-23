import { useRef } from 'react';
import { WebPart, TaskData, TextData, ListData, Position, Size } from '../types/webpart';
import { DraggableWebPart } from './DraggableWebPart';
import { TaskCard } from './TaskCard';
import { TextBlock } from './TextBlock';
import { ListBlock } from './ListBlock';
import './Canvas.css';

interface CanvasProps {
  webParts: WebPart[];
  selectedId: string | null;
  zoom: number;
  onSelect: (id: string | null) => void;
  onPositionChange: (id: string, position: Position) => void;
  onSizeChange: (id: string, size: Size) => void;
  onDataChange: (id: string, data: Partial<WebPart['data']>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export function Canvas({
  webParts,
  selectedId,
  zoom,
  onSelect,
  onPositionChange,
  onSizeChange,
  onDataChange,
  onDelete,
  onDuplicate,
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      onSelect(null);
    }
  };

  const renderWebPartContent = (webPart: WebPart) => {
    const isSelected = webPart.id === selectedId;

    switch (webPart.type) {
      case 'task':
        return (
          <TaskCard
            data={webPart.data as TaskData}
            onDataChange={(updates) => onDataChange(webPart.id, updates)}
            isSelected={isSelected}
          />
        );
      case 'text':
        return (
          <TextBlock
            data={webPart.data as TextData}
            isSelected={isSelected}
          />
        );
      case 'list':
        return (
          <ListBlock
            data={webPart.data as ListData}
            onDataChange={(updates) => onDataChange(webPart.id, updates)}
            isSelected={isSelected}
          />
        );
      case 'image':
        return (
          <div className={`image-placeholder ${isSelected ? 'selected' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span>รูปภาพ</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={canvasRef}
      className="canvas"
      onClick={handleCanvasClick}
      style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
    >
      <div className="canvas-grid" />

      {webParts.map((webPart) => (
        <DraggableWebPart
          key={webPart.id}
          webPart={webPart}
          isSelected={webPart.id === selectedId}
          onSelect={() => onSelect(webPart.id)}
          onPositionChange={(pos) => onPositionChange(webPart.id, pos)}
          onSizeChange={(size) => onSizeChange(webPart.id, size)}
          onDelete={() => onDelete(webPart.id)}
          onDuplicate={() => onDuplicate(webPart.id)}
        >
          {renderWebPartContent(webPart)}
        </DraggableWebPart>
      ))}

      {webParts.length === 0 && (
        <div className="canvas-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M12 8v8" />
            <path d="M8 12h8" />
          </svg>
          <p>ลากเว็บพาร์ทจากแถบด้านซ้ายมาวางที่นี่</p>
          <p className="hint">หรือคลิกที่เว็บพาร์ทเพื่อเพิ่มลงบนแคนวาส</p>
        </div>
      )}
    </div>
  );
}
