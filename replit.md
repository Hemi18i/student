# نظام إدارة بيانات الطلاب - Student Management System

## Overview
A comprehensive student data management system for the Al-Saraniyah Secondary School (السعرانية الثانوية المشتركة). The system allows school administrators to:
- View and search all students by name or national ID
- Display detailed student information
- Edit student data
- Generate official transfer request forms (طلب تحويل) that match Egyptian government school transfer documents
- Print transfer requests directly

## Current State
The application is fully functional with 639 students imported from CSV data.

## Technical Architecture

### Frontend (React + TypeScript)
- **Framework**: React with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack Query for server state
- **UI Components**: Shadcn/UI components
- **Styling**: Tailwind CSS with Cairo font for Arabic RTL support
- **Language**: Arabic (RTL layout)

### Backend (Express + Node.js)
- **Framework**: Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **API**: RESTful endpoints

### Database Schema
- `students` - Main student data table with all CSV fields
- `transfer_requests` - Transfer request records (linked to students)
- `users` - User authentication (future use)

## API Endpoints

### Students
- `GET /api/students` - Get all students
- `GET /api/students/search?q={query}&type={nationalId|name}` - Search students
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create new student
- `PATCH /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `POST /api/students/import` - Bulk import students

### Transfer Requests
- `POST /api/transfer-requests` - Create transfer request
- `GET /api/students/:id/transfer-requests` - Get transfer requests for a student

## Key Features

### 1. Student Search
- Search by national ID (الرقم القومي) or name (الاسم)
- Debounced search (300ms) for better performance
- Real-time results filtering

### 2. Student Details View
- Complete student information display
- Organized into sections: Personal, Academic, Guardian, Additional
- Print functionality for student details

### 3. Edit Student
- Modal dialog for editing all student fields
- Form validation
- Automatic cache invalidation after updates

### 4. Add Student
- Form modal for adding new students
- Validation for required fields
- Automatic list refresh after adding

### 5. Delete Student
- Delete button appears when student is selected
- Confirmation dialog before deletion
- Automatic list refresh after deletion

### 6. Bulk Import Students
- Upload Excel/CSV/JSON files with student data
- File preview before import
- Support for batch student creation
- No code modifications needed for new data

### 7. Transfer Request Form
- Auto-fills from selected student data
- Matches official Egyptian school transfer document format
- Editable fields for from/to school, reason, etc.
- Save to database functionality
- Print functionality for A4 paper

## File Structure
```
client/
  src/
    pages/
      home.tsx - Main dashboard page with all modal handlers
    components/
      student-list.tsx - Student list sidebar
      student-details.tsx - Student details card
      edit-student-modal.tsx - Edit dialog
      add-student-modal.tsx - Add new student form
      import-students-modal.tsx - Bulk import from file
      transfer-request-form.tsx - Transfer form
server/
  db.ts - Database connection
  storage.ts - Data access layer
  routes.ts - API endpoints
shared/
  schema.ts - Database schema and types
```

## Recent Changes
- 2025-12-20: Added Data Management Features
  - Excel/CSV/JSON file upload for bulk import
  - Add student form modal
  - Delete student functionality
  - File preview before import
  - Automatic cache invalidation after changes

- 2025-12-05: Initial implementation
  - Imported 639 students from CSV
  - Full CRUD for students
  - Transfer request form matching official document
  - Arabic RTL support with Cairo font
  - Search with debounce
  - Print functionality

## User Preferences
- Arabic language interface
- RTL layout
- Cairo font for Arabic text
- Print-ready forms for official documents
