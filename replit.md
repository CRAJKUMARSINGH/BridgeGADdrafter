# Bridge CAD Drawing Generator

## Overview

This is a full-stack web application that generates technical bridge drawings from LISP-formatted input data. The system parses engineering parameters, performs bridge calculations, and produces CAD-style drawings suitable for construction documentation. Built as a modern React frontend with an Express.js backend, it digitizes the traditional bridge design workflow while maintaining engineering accuracy and professional drawing standards.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React with TypeScript**: Modern component-based UI using functional components and hooks
- **Vite Build System**: Fast development server with hot module replacement and optimized production builds
- **TanStack Query**: Server state management for API calls, caching, and background updates
- **Wouter**: Lightweight client-side routing without the overhead of React Router
- **shadcn/ui Components**: Consistent design system built on Radix UI primitives with Tailwind CSS styling

### Backend Architecture
- **Express.js REST API**: Node.js server handling file parsing, calculations, and drawing generation
- **TypeScript**: Type safety across the entire backend codebase
- **Modular Route Structure**: Clean separation of concerns with dedicated route handlers
- **In-Memory Storage**: Simple storage implementation with interface for future database migration
- **Error Handling**: Centralized error middleware with proper HTTP status codes

### Data Processing Pipeline
- **LISP Parser**: Converts traditional LISP-formatted engineering input files into structured data
- **Bridge Calculator**: Implements mathematical formulas for coordinate transformations, skew adjustments, and layout calculations
- **Drawing Generator**: Creates SVG-based technical drawings with proper scaling, dimensions, and annotations
- **Parameter Validation**: Zod schema validation ensures engineering parameters meet required constraints

### Database Design
- **Drizzle ORM**: Type-safe database operations with PostgreSQL
- **User Management**: Basic authentication and project ownership
- **Project Storage**: Bridge parameters, cross-sections, and generated drawings
- **Schema Versioning**: Migration system for database structure changes

### File Processing Workflow
1. Input file upload and validation
2. LISP format parsing into structured parameters
3. Engineering calculations (coordinate systems, transformations)
4. Drawing generation with proper scaling and annotations
5. Export capabilities (DWG, PDF, SVG formats)

### UI Component Structure
- **File Upload**: Drag-and-drop interface with validation
- **Parameter Display**: Real-time visualization of parsed engineering data
- **Bridge Canvas**: Interactive drawing viewer with zoom and pan capabilities
- **Export Options**: Multiple format support with customizable settings

## External Dependencies

### Core Framework Dependencies
- **React 18**: Frontend framework with modern hooks and concurrent features
- **Express.js**: Backend web server framework
- **TypeScript**: Type safety and developer experience
- **Vite**: Build tool and development server

### Database and ORM
- **Drizzle ORM**: Type-safe database toolkit
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments
- **Drizzle Kit**: Database migration and schema management tools

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives (@radix-ui/react-*)
- **shadcn/ui**: Pre-built component library
- **Lucide Icons**: Modern icon library
- **class-variance-authority**: Component variant management

### Data Management
- **TanStack React Query**: Server state management and caching
- **Zod**: Runtime type validation and schema definition
- **React Hook Form**: Form state management with validation

### Development Tools
- **ESBuild**: Fast JavaScript bundler for production builds
- **TSX**: TypeScript execution for development
- **PostCSS**: CSS processing and optimization

### Engineering Libraries
- **date-fns**: Date manipulation utilities
- **CMDK**: Command palette component for advanced UI interactions