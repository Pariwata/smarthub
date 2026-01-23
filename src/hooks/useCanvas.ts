import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { WebPart, WebPartType, Position, TaskData, TextData, ListData } from '../types/webpart';

const createDefaultTaskData = (): TaskData => ({
  title: 'งาน',
  description: 'รายละเอียด',
  assignee: 'ผู้รับผิดชอบ',
  dueDate: '',
  attachments: [],
  completed: false,
});

const createDefaultTextData = (): TextData => ({
  content: 'ข้อความ',
  fontSize: 16,
  fontWeight: '400',
  textAlign: 'left',
});

const createDefaultListData = (): ListData => ({
  title: 'รายการ',
  items: [
    { id: uuidv4(), text: 'รายการที่ 1', completed: false },
    { id: uuidv4(), text: 'รายการที่ 2', completed: false },
  ],
});

const getDefaultSize = (type: WebPartType) => {
  switch (type) {
    case 'task':
      return { width: 320, height: 220 };
    case 'text':
      return { width: 200, height: 100 };
    case 'image':
      return { width: 300, height: 200 };
    case 'list':
      return { width: 280, height: 200 };
    default:
      return { width: 200, height: 150 };
  }
};

const getDefaultData = (type: WebPartType) => {
  switch (type) {
    case 'task':
      return createDefaultTaskData();
    case 'text':
      return createDefaultTextData();
    case 'list':
      return createDefaultListData();
    case 'image':
      return { src: '', alt: 'รูปภาพ' };
    default:
      return createDefaultTextData();
  }
};

export function useCanvas() {
  const [webParts, setWebParts] = useState<WebPart[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  const addWebPart = useCallback((type: WebPartType, position?: Position) => {
    const newWebPart: WebPart = {
      id: uuidv4(),
      type,
      position: position || { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
      size: getDefaultSize(type),
      data: getDefaultData(type),
      zIndex: webParts.length + 1,
    };
    setWebParts((prev) => [...prev, newWebPart]);
    setSelectedId(newWebPart.id);
    return newWebPart.id;
  }, [webParts.length]);

  const updateWebPart = useCallback((id: string, updates: Partial<WebPart>) => {
    setWebParts((prev) =>
      prev.map((wp) => (wp.id === id ? { ...wp, ...updates } : wp))
    );
  }, []);

  const updateWebPartData = useCallback((id: string, dataUpdates: Partial<WebPart['data']>) => {
    setWebParts((prev) =>
      prev.map((wp) =>
        wp.id === id ? { ...wp, data: { ...wp.data, ...dataUpdates } } : wp
      )
    );
  }, []);

  const deleteWebPart = useCallback((id: string) => {
    setWebParts((prev) => prev.filter((wp) => wp.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
    }
  }, [selectedId]);

  const bringToFront = useCallback((id: string) => {
    setWebParts((prev) => {
      const maxZ = Math.max(...prev.map((wp) => wp.zIndex));
      return prev.map((wp) =>
        wp.id === id ? { ...wp, zIndex: maxZ + 1 } : wp
      );
    });
  }, []);

  const selectWebPart = useCallback((id: string | null) => {
    setSelectedId(id);
    if (id) {
      bringToFront(id);
    }
  }, [bringToFront]);

  const duplicateWebPart = useCallback((id: string) => {
    const webPart = webParts.find((wp) => wp.id === id);
    if (webPart) {
      const newWebPart: WebPart = {
        ...webPart,
        id: uuidv4(),
        position: {
          x: webPart.position.x + 20,
          y: webPart.position.y + 20,
        },
        zIndex: webParts.length + 1,
      };
      setWebParts((prev) => [...prev, newWebPart]);
      setSelectedId(newWebPart.id);
    }
  }, [webParts]);

  const getSelectedWebPart = useCallback(() => {
    return webParts.find((wp) => wp.id === selectedId) || null;
  }, [webParts, selectedId]);

  return {
    webParts,
    selectedId,
    zoom,
    setZoom,
    addWebPart,
    updateWebPart,
    updateWebPartData,
    deleteWebPart,
    selectWebPart,
    duplicateWebPart,
    getSelectedWebPart,
    bringToFront,
  };
}
