# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

BridgeGADdrafter is a comprehensive bridge design and drafting application that combines multiple technologies:

- **Frontend**: React + TypeScript with Vite build system
- **Backend**: Express.js server with TypeScript  
- **Database**: PostgreSQL with Drizzle ORM
- **UI Framework**: shadcn/ui components with Tailwind CSS
- **Legacy Integration**: LISP programs and Python bridge design tools from attached_assets

The application specializes in civil engineering bridge design, converting input parameters into technical drawings and calculations.

## Development Commands

### Frontend Development
```bash
# Install dependencies
npm install

# Start development server (runs both client and server)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type check
npm run check
```

### Database Operations
```bash
# Push database schema changes
npm run db:push
```

### Project Structure Commands
```bash
# View main directories
ls -la client/ server/ shared/ attached_assets/

# Check TypeScript configuration
cat tsconfig.json

# Review database schema
cat shared/schema.ts
```

## Architecture Overview

### Core Application Flow
1. **Input Processing**: Users upload bridge parameter files (text format from LISP systems)
2. **Parameter Parsing**: Server validates and processes engineering parameters
3. **Calculation Engine**: Bridge calculations performed using validated engineering formulas
4. **Visualization**: Interactive bridge rendering in React frontend
5. **Export Generation**: DXF/CAD file generation for professional drafting

### Key Technologies Integration
- **React Router**: wouter for client-side routing
- **State Management**: TanStack Query for server state
- **Forms**: React Hook Form with Zod validation
- **Database**: Drizzle ORM with PostgreSQL
- **File Processing**: Excel/text input parsing
- **CAD Generation**: ezdxf library integration for technical drawings

### Database Schema
- `users`: User authentication and management
- `bridge_projects`: Project storage with parameters
- `bridge_parameters`: Detailed engineering parameters (scale, skew, datum, etc.)
- `bridge_cross_sections`: Cross-sectional data for bridge design

## Key Engineering Features

### Bridge Parameter System
The application processes these critical parameters:
- **scale1/scale2**: Drawing scales for plan/elevation and sections  
- **skew**: Skew angle in degrees for non-perpendicular bridges
- **datum**: Reference level for elevation calculations
- **toprl**: Top rail level on Y axis
- **left/right**: Start and end chainage of X axis  
- **xincr/yincr**: Interval spacing for grid systems
- **noch**: Total number of chainages for bridge sections

### LISP Integration Points
The attached_assets directory contains legacy LISP programs that have been analyzed and integrated:
- Bridge geometry calculations
- Structural element design
- AutoCAD drawing generation routines
- Engineering formula implementations

### Python Bridge Design Integration  
Contains comprehensive bridge design logic from bridge_code.py including:
- Multi-span bridge calculations
- Pier and abutment design
- Load analysis and structural verification
- Professional DXF output generation

## File Structure Patterns

### Client Architecture
```
client/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # shadcn/ui base components  
│   │   ├── bridge-canvas/ # Bridge visualization
│   │   ├── parameter-*   # Parameter input/display
│   │   └── export-options/ # Export functionality
│   ├── pages/            # Route components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions and API clients
│   └── App.tsx           # Main application component
```

### Server Architecture  
```
server/
├── index.ts              # Express server setup
├── routes.ts             # API route definitions
├── storage.ts            # Database connection and queries
└── vite.ts              # Vite development integration
```

### Shared Resources
```
shared/
└── schema.ts             # Zod schemas and database definitions
```

## Development Notes

### API Endpoints
- `POST /api/bridge/parse`: Parse and validate bridge input files
- `POST /api/bridge/project`: Create new bridge projects  
- `GET /api/bridge/projects`: Retrieve user projects
- `POST /api/bridge/generate`: Generate bridge drawings

### Input File Format
The application expects text-based input files with numeric parameters in specific order:
1. scale1 (plan/elevation scale)
2. scale2 (section scale)  
3. skew (degrees)
4. datum (reference level)
5. toprl (top rail level)
6. left (start chainage)
7. right (end chainage)
8. xincr (X interval)
9. yincr (Y interval) 
10. noch (number of chainages)

### Legacy Asset Integration
The attached_assets folder contains valuable engineering algorithms that should be preserved:
- LISP programs contain proven AutoCAD automation routines
- Python bridge design code includes comprehensive structural calculations
- Input Excel files provide parameter templates and examples

### Component Development Patterns
- Use shadcn/ui for consistent styling
- Implement proper TypeScript interfaces for all props
- Follow React Hook Form patterns for form management
- Use TanStack Query for all API interactions
- Implement proper error handling and user feedback

### Database Development
- Use Drizzle ORM for all database operations
- Follow the established schema patterns in shared/schema.ts
- Implement proper validation using Zod schemas
- Handle user authentication through session management

## Common Development Tasks

### Adding New Bridge Parameters
1. Update `bridgeInputSchema` in shared/schema.ts
2. Modify database schema in `bridgeParameters` table
3. Update parsing logic in server/routes.ts
4. Add UI components for parameter input/display
5. Update calculation engine to use new parameters

### Implementing New Export Formats
1. Add export type to shared schema
2. Create export handler in server routes
3. Implement client-side export request
4. Add UI controls in ExportOptions component

### Database Schema Changes
1. Modify schema definitions in shared/schema.ts
2. Run `npm run db:push` to apply changes
3. Update TypeScript types as needed
4. Test migration with existing data

### Adding New Calculation Modules
1. Study corresponding LISP/Python code in attached_assets
2. Extract core engineering formulas and logic
3. Implement as TypeScript module with proper types
4. Add validation and error handling
5. Integrate with existing calculation pipeline
6. Add appropriate UI components for input/output

This documentation provides the foundation for productive development in the BridgeGAD codebase while preserving the valuable engineering knowledge from legacy systems.
