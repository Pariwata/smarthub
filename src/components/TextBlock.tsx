import { TextData } from '../types/webpart';
import './TextBlock.css';

interface TextBlockProps {
  data: TextData;
  isSelected?: boolean;
}

export function TextBlock({ data, isSelected }: TextBlockProps) {
  return (
    <div
      className={`text-block ${isSelected ? 'selected' : ''}`}
      style={{
        fontSize: data.fontSize,
        fontWeight: data.fontWeight,
        textAlign: data.textAlign,
      }}
    >
      {data.content}
    </div>
  );
}
