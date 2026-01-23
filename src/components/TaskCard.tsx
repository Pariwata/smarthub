import { TaskData } from '../types/webpart';
import './TaskCard.css';

interface TaskCardProps {
  data: TaskData;
  onDataChange?: (updates: Partial<TaskData>) => void;
  isSelected?: boolean;
}

export function TaskCard({ data, onDataChange, isSelected }: TaskCardProps) {
  const handleToggleComplete = () => {
    onDataChange?.({ completed: !data.completed });
  };

  return (
    <div className={`task-card ${isSelected ? 'selected' : ''}`}>
      <div className="task-header">
        <button
          className={`task-checkbox ${data.completed ? 'checked' : ''}`}
          onClick={handleToggleComplete}
          aria-label={data.completed ? 'ทำเครื่องหมายว่ายังไม่เสร็จ' : 'ทำเครื่องหมายว่าเสร็จแล้ว'}
        >
          {data.completed && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>
        <h3 className={`task-title ${data.completed ? 'completed' : ''}`}>
          {data.title}
        </h3>
      </div>

      <div className="task-content">
        <div className="task-field">
          <span className="field-label">{data.description || 'รายละเอียด'}</span>
        </div>

        <div className="task-field">
          <span className="field-label">{data.assignee || 'ผู้รับผิดชอบ'}</span>
        </div>

        <div className="task-field">
          <span className="field-label">
            {data.dueDate || 'กำหนดแล้วเสร็จ'}
          </span>
        </div>

        <div className="task-field">
          <span className="field-label">
            เอกสารแนบ
            {data.attachments.length > 0 && (
              <span className="attachment-count">({data.attachments.length})</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
