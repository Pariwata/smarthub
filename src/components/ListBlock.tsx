import { ListData } from '../types/webpart';
import './ListBlock.css';

interface ListBlockProps {
  data: ListData;
  onDataChange?: (updates: Partial<ListData>) => void;
  isSelected?: boolean;
}

export function ListBlock({ data, onDataChange, isSelected }: ListBlockProps) {
  const toggleItem = (itemId: string) => {
    const updatedItems = data.items.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    onDataChange?.({ items: updatedItems });
  };

  return (
    <div className={`list-block ${isSelected ? 'selected' : ''}`}>
      <h4 className="list-title">{data.title}</h4>
      <ul className="list-items">
        {data.items.map((item) => (
          <li key={item.id} className={`list-item ${item.completed ? 'completed' : ''}`}>
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => toggleItem(item.id)}
            />
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
