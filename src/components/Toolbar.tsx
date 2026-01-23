import './Toolbar.css';

interface ToolbarProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onExport: () => void;
}

export function Toolbar({ zoom, onZoomChange, onExport }: ToolbarProps) {
  const zoomLevels = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const zoomIn = () => {
    const currentIndex = zoomLevels.indexOf(zoom);
    if (currentIndex < zoomLevels.length - 1) {
      onZoomChange(zoomLevels[currentIndex + 1] ?? zoom);
    }
  };

  const zoomOut = () => {
    const currentIndex = zoomLevels.indexOf(zoom);
    if (currentIndex > 0) {
      onZoomChange(zoomLevels[currentIndex - 1] ?? zoom);
    }
  };

  return (
    <header className="toolbar">
      <div className="toolbar-left">
        <div className="app-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18" />
            <path d="M9 21V9" />
          </svg>
          <span>Canvas Web Part Builder</span>
        </div>
      </div>

      <div className="toolbar-center">
        <div className="zoom-controls">
          <button
            className="zoom-btn"
            onClick={zoomOut}
            disabled={zoom <= 0.5}
            title="ซูมออก"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>
          <span className="zoom-value">{Math.round(zoom * 100)}%</span>
          <button
            className="zoom-btn"
            onClick={zoomIn}
            disabled={zoom >= 2}
            title="ซูมเข้า"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>
        </div>
      </div>

      <div className="toolbar-right">
        <button className="export-btn" onClick={onExport}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          บันทึก
        </button>
      </div>
    </header>
  );
}
