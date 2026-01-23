import { WebPart, TaskData, TextData, ListData } from '../types/webpart';
import { v4 as uuidv4 } from 'uuid';
import './PropertyPanel.css';

interface PropertyPanelProps {
  webPart: WebPart | null;
  onDataChange: (id: string, data: Partial<WebPart['data']>) => void;
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
  onSizeChange: (id: string, size: { width: number; height: number }) => void;
}

export function PropertyPanel({
  webPart,
  onDataChange,
  onPositionChange,
  onSizeChange,
}: PropertyPanelProps) {
  if (!webPart) {
    return (
      <aside className="property-panel empty">
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 3v18" />
            <path d="M18 9l-6-6-6 6" />
          </svg>
          <p>เลือกเว็บพาร์ทเพื่อแก้ไขคุณสมบัติ</p>
        </div>
      </aside>
    );
  }

  const renderTaskProperties = (data: TaskData) => (
    <>
      <div className="property-group">
        <label className="property-label">ชื่องาน</label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => onDataChange(webPart.id, { title: e.target.value })}
          placeholder="ชื่องาน"
        />
      </div>

      <div className="property-group">
        <label className="property-label">รายละเอียด</label>
        <textarea
          value={data.description}
          onChange={(e) => onDataChange(webPart.id, { description: e.target.value })}
          placeholder="รายละเอียด"
          rows={3}
        />
      </div>

      <div className="property-group">
        <label className="property-label">ผู้รับผิดชอบ</label>
        <input
          type="text"
          value={data.assignee}
          onChange={(e) => onDataChange(webPart.id, { assignee: e.target.value })}
          placeholder="ผู้รับผิดชอบ"
        />
      </div>

      <div className="property-group">
        <label className="property-label">กำหนดแล้วเสร็จ</label>
        <input
          type="date"
          value={data.dueDate}
          onChange={(e) => onDataChange(webPart.id, { dueDate: e.target.value })}
        />
      </div>

      <div className="property-group checkbox-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={data.completed}
            onChange={(e) => onDataChange(webPart.id, { completed: e.target.checked })}
          />
          <span>เสร็จแล้ว</span>
        </label>
      </div>
    </>
  );

  const renderTextProperties = (data: TextData) => (
    <>
      <div className="property-group">
        <label className="property-label">ข้อความ</label>
        <textarea
          value={data.content}
          onChange={(e) => onDataChange(webPart.id, { content: e.target.value })}
          placeholder="ข้อความ"
          rows={4}
        />
      </div>

      <div className="property-group">
        <label className="property-label">ขนาดตัวอักษร</label>
        <input
          type="number"
          value={data.fontSize}
          onChange={(e) => onDataChange(webPart.id, { fontSize: parseInt(e.target.value) || 16 })}
          min={10}
          max={72}
        />
      </div>

      <div className="property-group">
        <label className="property-label">น้ำหนักตัวอักษร</label>
        <select
          value={data.fontWeight}
          onChange={(e) => onDataChange(webPart.id, { fontWeight: e.target.value })}
        >
          <option value="300">บาง</option>
          <option value="400">ปกติ</option>
          <option value="500">กลาง</option>
          <option value="600">หนา</option>
          <option value="700">หนามาก</option>
        </select>
      </div>

      <div className="property-group">
        <label className="property-label">การจัดวาง</label>
        <select
          value={data.textAlign}
          onChange={(e) =>
            onDataChange(webPart.id, { textAlign: e.target.value as 'left' | 'center' | 'right' })
          }
        >
          <option value="left">ซ้าย</option>
          <option value="center">กลาง</option>
          <option value="right">ขวา</option>
        </select>
      </div>
    </>
  );

  const renderListProperties = (data: ListData) => (
    <>
      <div className="property-group">
        <label className="property-label">หัวข้อ</label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => onDataChange(webPart.id, { title: e.target.value })}
          placeholder="หัวข้อรายการ"
        />
      </div>

      <div className="property-group">
        <label className="property-label">รายการ</label>
        <div className="list-items-editor">
          {data.items.map((item, index) => (
            <div key={item.id} className="list-item-row">
              <input
                type="text"
                value={item.text}
                onChange={(e) => {
                  const newItems = [...data.items];
                  newItems[index] = { ...item, text: e.target.value };
                  onDataChange(webPart.id, { items: newItems });
                }}
                placeholder={`รายการที่ ${index + 1}`}
              />
              <button
                className="remove-item-btn"
                onClick={() => {
                  const newItems = data.items.filter((_, i) => i !== index);
                  onDataChange(webPart.id, { items: newItems });
                }}
                title="ลบรายการ"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
          <button
            className="add-item-btn"
            onClick={() => {
              const newItems = [...data.items, { id: uuidv4(), text: '', completed: false }];
              onDataChange(webPart.id, { items: newItems });
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            เพิ่มรายการ
          </button>
        </div>
      </div>
    </>
  );

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'task':
        return 'งาน';
      case 'text':
        return 'ข้อความ';
      case 'list':
        return 'รายการ';
      case 'image':
        return 'รูปภาพ';
      default:
        return type;
    }
  };

  return (
    <aside className="property-panel">
      <div className="panel-header">
        <h3>คุณสมบัติ</h3>
        <span className="webpart-type-badge">{getTypeLabel(webPart.type)}</span>
      </div>

      <div className="panel-content">
        <div className="property-section">
          <h4 className="section-title">เนื้อหา</h4>
          {webPart.type === 'task' && renderTaskProperties(webPart.data as TaskData)}
          {webPart.type === 'text' && renderTextProperties(webPart.data as TextData)}
          {webPart.type === 'list' && renderListProperties(webPart.data as ListData)}
          {webPart.type === 'image' && (
            <div className="property-group">
              <p className="placeholder-text">การตั้งค่ารูปภาพจะเพิ่มในเวอร์ชันถัดไป</p>
            </div>
          )}
        </div>

        <div className="property-section">
          <h4 className="section-title">ตำแหน่งและขนาด</h4>
          <div className="position-size-grid">
            <div className="property-group">
              <label className="property-label">X</label>
              <input
                type="number"
                value={Math.round(webPart.position.x)}
                onChange={(e) =>
                  onPositionChange(webPart.id, { ...webPart.position, x: parseInt(e.target.value) || 0 })
                }
              />
            </div>
            <div className="property-group">
              <label className="property-label">Y</label>
              <input
                type="number"
                value={Math.round(webPart.position.y)}
                onChange={(e) =>
                  onPositionChange(webPart.id, { ...webPart.position, y: parseInt(e.target.value) || 0 })
                }
              />
            </div>
            <div className="property-group">
              <label className="property-label">ความกว้าง</label>
              <input
                type="number"
                value={Math.round(webPart.size.width)}
                onChange={(e) =>
                  onSizeChange(webPart.id, { ...webPart.size, width: parseInt(e.target.value) || 150 })
                }
                min={150}
              />
            </div>
            <div className="property-group">
              <label className="property-label">ความสูง</label>
              <input
                type="number"
                value={Math.round(webPart.size.height)}
                onChange={(e) =>
                  onSizeChange(webPart.id, { ...webPart.size, height: parseInt(e.target.value) || 100 })
                }
                min={100}
              />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
