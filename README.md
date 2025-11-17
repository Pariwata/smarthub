# SmartHub - Regulation Review Platform

A modern web application for reviewing and confirming Claude AI-generated regulation libraries. Built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- **AI-Powered Regulation Generation**: Leverage Claude AI to generate comprehensive regulation libraries
- **Interactive Review Interface**: User-friendly interface for reviewing generated regulations
- **Approve/Reject Workflow**: Simple workflow to approve or reject individual regulations
- **Export Functionality**: Export approved regulations in JSON format
- **Real-time Statistics**: Track pending, approved, and rejected regulations
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Mode Support**: Automatic dark mode based on system preferences

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: Anthropic Claude API
- **Icons**: Lucide React
- **Runtime**: Node.js

## Prerequisites

- Node.js 20.x or higher
- npm or yarn package manager
- Anthropic API key (for Claude integration)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd smarthub
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Anthropic API key:

```env
ANTHROPIC_API_KEY=your_actual_api_key_here
```

To get an API key:
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
smarthub/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   └── regulations/          # Regulation-related endpoints
│   │       ├── route.ts          # Get mock regulations
│   │       └── generate/         # Generate regulations via Claude
│   │           └── route.ts
│   ├── regulation-review/        # Regulation review page
│   │   └── page.tsx
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── types/                        # TypeScript type definitions
│   └── regulation.ts             # Regulation-related types
├── public/                       # Static assets
├── .env.example                  # Environment variables template
├── package.json                  # Project dependencies
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── next.config.js                # Next.js configuration
└── README.md                     # This file
```

## Usage

### Reviewing Regulations

1. Navigate to the home page at [http://localhost:3000](http://localhost:3000)
2. Click on "Review Regulations" to access the review interface
3. Select a regulation from the list to view its details
4. Review the regulation content carefully
5. Click "Approve" to accept or "Reject" to decline the regulation
6. Repeat for all regulations in the library

### Exporting Approved Regulations

1. After reviewing regulations, click the "Export Approved" button
2. A JSON file will be downloaded containing all approved regulations
3. This file can be used for:
   - Documentation purposes
   - Integration with other systems
   - Version control and audit trails

### Generating New Regulations (API)

To generate regulations via the Claude API:

```bash
curl -X POST http://localhost:3000/api/regulations/generate \
  -H "Content-Type: application/json" \
  -d '{
    "industry": "Healthcare",
    "region": "United States",
    "specificRequirements": ["HIPAA compliance", "Data encryption"]
  }'
```

## API Endpoints

### GET /api/regulations

Returns mock regulation data for testing.

**Response:**
```json
{
  "regulations": [...],
  "generatedAt": "2025-11-17T10:00:00Z"
}
```

### POST /api/regulations/generate

Generates new regulations using Claude AI.

**Request Body:**
```json
{
  "industry": "string",
  "region": "string",
  "specificRequirements": ["string"],
  "customPrompt": "string"
}
```

**Response:**
```json
{
  "regulations": [...],
  "generatedAt": "2025-11-17T10:00:00Z",
  "requestId": "string"
}
```

## Development

### Building for Production

```bash
npm run build
```

### Running Production Build

```bash
npm start
```

### Linting

```bash
npm run lint
```

## Features in Detail

### Regulation Review Interface

The regulation review page provides:

- **List View**: All regulations with status indicators
- **Detail View**: Full regulation content with formatting
- **Status Tracking**: Visual indicators for pending, approved, and rejected items
- **Statistics Dashboard**: Real-time counts of regulation statuses
- **Batch Operations**: Confirm all decisions at once

### Data Model

Each regulation includes:

```typescript
{
  id: string              // Unique identifier
  title: string           // Regulation title
  category: string        // Classification (e.g., Privacy, Security)
  description: string     // Brief description
  content: string         // Full regulation text
  generatedAt: string     // ISO timestamp
  status: 'pending' | 'approved' | 'rejected'
  metadata?: {
    generatedBy: string   // AI model identifier
    version: string       // Version number
    tags?: string[]       // Optional tags
  }
}
```

## Customization

### Styling

The application uses Tailwind CSS. Customize the theme in `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      // Add custom colors
    },
  },
}
```

### Mock Data

Modify the mock regulations in `app/regulation-review/page.tsx` or `app/api/regulations/route.ts` for testing.

## Troubleshooting

### API Key Issues

If you see "ANTHROPIC_API_KEY is not configured":
1. Ensure `.env.local` exists
2. Verify the API key is correct
3. Restart the development server

### Build Errors

If you encounter build errors:
```bash
rm -rf .next node_modules
npm install
npm run build
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

This project is part of the SmartHub platform.

## Support

For issues or questions:
- Check the [Next.js Documentation](https://nextjs.org/docs)
- Review [Anthropic API Documentation](https://docs.anthropic.com/)
- Open an issue in the repository

## Roadmap

Future enhancements:
- [ ] User authentication and authorization
- [ ] Regulation versioning and history
- [ ] Collaborative review workflow
- [ ] Integration with compliance management systems
- [ ] Advanced search and filtering
- [ ] Regulation comparison tools
- [ ] AI-powered compliance checking
- [ ] Multi-language support