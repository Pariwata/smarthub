import { WebPartType } from '../types/webpart';
import './Sidebar.css';

interface WebPartOption {
  type: WebPartType;
  icon: JSX.Element;
  label: string;
  description: string;
}

const webPartOptions: WebPartOption[] = [
  {
    type: 'task',
    label: 'งาน',
    description: 'การ์ดงานพร้อมรายละเอียด',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    type: 'text',
    label: 'ข้อความ',
    description: 'กล่องข้อความอิสระ',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 7V4h16v3" />
        <path d="M9 20h6" />
        <path d="M12 4v16" />
      </svg>
    ),
  },
  {
    type: 'list',
    label: 'รายการ',
    description: 'รายการเช็คลิสต์',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
  },
  {
    type: 'image',
    label: 'รูปภาพ',
    description: 'พื้นที่สำหรับรูปภาพ',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
  },
];

interface SidebarProps {
  onAddWebPart: (type: WebPartType) => void;
}

export function Sidebar({ onAddWebPart }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>เว็บพาร์ท</h2>
        <p>คลิกเพื่อเพิ่มลงบนแคนวาส</p>
      </div>

      <div className="webpart-list">
        {webPartOptions.map((option) => (
          <button
            key={option.type}
            className="webpart-option"
            onClick={() => onAddWebPart(option.type)}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('webpart-type', option.type);
              e.dataTransfer.effectAllowed = 'copy';
            }}
          >
            <div className="webpart-icon">{option.icon}</div>
            <div className="webpart-info">
              <span className="webpart-label">{option.label}</span>
              <span className="webpart-description">{option.description}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="sidebar-footer">
        <p>ลากแล้ววางเพื่อกำหนดตำแหน่ง</p>
      </div>
    </aside>
  );
}
