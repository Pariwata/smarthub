import { useCallback } from 'react';
import { useCanvas } from './hooks/useCanvas';
import { Toolbar } from './components/Toolbar';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { PropertyPanel } from './components/PropertyPanel';
import { WebPartType } from './types/webpart';
import './App.css';

function App() {
  const {
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
  } = useCanvas();

  const handleAddWebPart = useCallback(
    (type: WebPartType) => {
      addWebPart(type);
    },
    [addWebPart]
  );

  const handleExport = useCallback(() => {
    const data = JSON.stringify(webParts, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'canvas-webparts.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [webParts]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('webpart-type') as WebPartType;
      if (type) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / zoom;
        const y = (e.clientY - rect.top) / zoom;
        addWebPart(type, { x, y });
      }
    },
    [addWebPart, zoom]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const selectedWebPart = getSelectedWebPart();

  return (
    <div className="app">
      <Toolbar zoom={zoom} onZoomChange={setZoom} onExport={handleExport} />

      <div className="app-body">
        <Sidebar onAddWebPart={handleAddWebPart} />

        <main
          className="canvas-container"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <Canvas
            webParts={webParts}
            selectedId={selectedId}
            zoom={zoom}
            onSelect={selectWebPart}
            onPositionChange={(id, position) => updateWebPart(id, { position })}
            onSizeChange={(id, size) => updateWebPart(id, { size })}
            onDataChange={updateWebPartData}
            onDelete={deleteWebPart}
            onDuplicate={duplicateWebPart}
          />
        </main>

        <PropertyPanel
          webPart={selectedWebPart}
          onDataChange={updateWebPartData}
          onPositionChange={(id, position) => updateWebPart(id, { position })}
          onSizeChange={(id, size) => updateWebPart(id, { size })}
        />
      </div>
    </div>
  );
}

export default App;
