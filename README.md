# Canvas Web Part Builder (สร้างเว็บพาร์ท)

A drag-and-drop canvas application for creating and managing web parts with Thai language support.

## Features

- **Task Cards (การ์ดงาน)**: Create task cards with title, description, assignee, due date, and attachments
- **Text Blocks (ข้อความ)**: Add customizable text blocks with font options
- **List Items (รายการ)**: Create checklists with interactive checkboxes
- **Image Placeholders (รูปภาพ)**: Add image placeholder areas

## Functionality

- Drag and drop web parts from the sidebar onto the canvas
- Select, move, and resize web parts
- Edit properties in the right panel
- Duplicate and delete web parts
- Zoom in/out for better viewing
- Export canvas data as JSON

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Tech Stack

- React 18
- TypeScript
- Vite
- CSS (no external UI libraries)

## Project Structure

```
src/
├── components/
│   ├── Canvas.tsx       # Main canvas area
│   ├── DraggableWebPart.tsx # Wrapper for draggable/resizable web parts
│   ├── PropertyPanel.tsx # Right panel for editing properties
│   ├── Sidebar.tsx      # Left panel with web part options
│   ├── TaskCard.tsx     # Task card component
│   ├── TextBlock.tsx    # Text block component
│   ├── ListBlock.tsx    # List/checklist component
│   └── Toolbar.tsx      # Top toolbar with zoom and export
├── hooks/
│   └── useCanvas.ts     # Canvas state management hook
├── types/
│   └── webpart.ts       # TypeScript type definitions
├── App.tsx              # Main application component
├── main.tsx             # Application entry point
└── index.css            # Global styles
```

## License

MIT
