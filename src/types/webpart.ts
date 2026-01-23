export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface TaskData {
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  attachments: string[];
  completed: boolean;
}

export interface TextData {
  content: string;
  fontSize: number;
  fontWeight: string;
  textAlign: 'left' | 'center' | 'right';
}

export interface ImageData {
  src: string;
  alt: string;
}

export interface ListData {
  title: string;
  items: { id: string; text: string; completed: boolean }[];
}

export type WebPartType = 'task' | 'text' | 'image' | 'list';

export type WebPartData = TaskData | TextData | ImageData | ListData;

export interface WebPart {
  id: string;
  type: WebPartType;
  position: Position;
  size: Size;
  data: WebPartData;
  zIndex: number;
}

export interface CanvasState {
  webParts: WebPart[];
  selectedId: string | null;
  zoom: number;
}
