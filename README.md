# SmartHub - Regulation Library Frontend

A modern web application for managing regulation library requests with AI-assisted generation capabilities. This frontend allows users to submit requests for generating regulatory documentation, upload templates, and manage compliance requirements.

## Features

- **Regulation Request Form**: Comprehensive form for submitting regulation generation requests
- **Template Upload**: Support for uploading regulation templates (PDF, DOC, DOCX, TXT, MD)
- **Multiple Request Types**: Generate new regulations, update existing ones, or request compliance reviews
- **Compliance Frameworks**: Pre-configured support for major frameworks (SOX, GDPR, HIPAA, PCI-DSS, etc.)
- **Priority Management**: Set priority levels (Low, Medium, High, Urgent) for requests
- **Category Selection**: Choose from various regulation categories (Financial, Healthcare, Data Privacy, etc.)
- **Form Validation**: Client-side validation with helpful error messages
- **Responsive Design**: Mobile-friendly interface that works on all devices
- **Modern UI**: Clean, professional interface with smooth animations

## Tech Stack

- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Axios** - HTTP client for API requests
- **CSS3** - Custom styling with CSS variables

## Project Structure

```
smarthub/
├── src/
│   ├── components/           # React components
│   │   ├── RegulationRequestForm.tsx
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── services/            # API services
│   │   ├── api.ts           # Base API service
│   │   └── regulationService.ts
│   ├── types/               # TypeScript type definitions
│   │   ├── regulation.ts
│   │   └── api.ts
│   ├── utils/               # Utilities and constants
│   │   └── constants.ts
│   ├── App.tsx              # Main application component
│   ├── App.css              # Application styles
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── index.html               # HTML template
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
└── README.md                # This file

```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd smarthub
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure the API endpoint in `.env`:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build

Create a production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

### Linting

Run ESLint:
```bash
npm run lint
```

## Form Fields

### Required Fields

- **Request Type**: Generate New, Update Existing, or Review & Compliance Check
- **Title**: Brief title for the regulation request
- **Description**: Detailed description of requirements
- **Regulation Category**: Select from predefined categories
- **Target Audience**: Who will use this regulation
- **Priority**: Low, Medium, High, or Urgent

### Optional Fields

- **Compliance Framework**: Select applicable framework (SOX, GDPR, HIPAA, etc.)
- **Deadline**: Target completion date
- **Template Upload**: Upload existing template file (max 10MB)
- **Additional Notes**: Any extra information or requirements

## Supported File Formats

Template uploads support:
- PDF (.pdf)
- Word Documents (.doc, .docx)
- Text Files (.txt)
- Markdown (.md)

Maximum file size: 10MB

## API Integration

The application integrates with a backend API through the following endpoints:

- `POST /api/regulations/requests` - Submit new request
- `GET /api/regulations/requests` - Get all requests
- `GET /api/regulations/requests/:id` - Get specific request
- `PUT /api/regulations/requests/:id` - Update request
- `DELETE /api/regulations/requests/:id` - Delete request

See `src/services/regulationService.ts` for implementation details.

## Customization

### Adding New Regulation Categories

Edit `src/utils/constants.ts` and add to `REGULATION_CATEGORIES`:

```typescript
{
  id: 'custom-category',
  name: 'Custom Category',
  description: 'Description here'
}
```

### Adding New Compliance Frameworks

Edit `src/utils/constants.ts` and add to `COMPLIANCE_FRAMEWORKS`:

```typescript
{
  id: 'framework-id',
  name: 'Framework Full Name',
  abbreviation: 'ABBR'
}
```

### Styling

The application uses CSS variables for theming. Edit `src/index.css` to customize:

- Colors
- Typography
- Spacing
- Border radius
- Shadows

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Create an issue in the repository
- Contact the development team

## Future Enhancements

- [ ] User authentication and authorization
- [ ] Request history and status tracking
- [ ] Real-time collaboration features
- [ ] Advanced search and filtering
- [ ] Export capabilities
- [ ] Integration with more compliance frameworks
- [ ] Multi-language support
- [ ] Dark mode theme