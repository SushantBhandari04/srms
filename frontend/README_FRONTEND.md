# Student Record Management System - Frontend

A modern React + TypeScript frontend for the Student Academic Record Management System.

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **TailwindCSS** - Styling
- **Axios** - HTTP client
- **Lucide React** - Icons

## Features

### Authentication
- JWT-based authentication
- Role-based access control (Admin, Faculty, Student)
- Protected routes

### User Roles

#### Admin
- View dashboard with statistics
- Manage students (CRUD operations)
- Manage faculty members
- Manage courses and subjects
- View and manage attendance
- View and manage marks

#### Faculty
- View dashboard
- View student list
- Mark attendance
- Enter marks

#### Student
- View personal dashboard
- View attendance records
- View marks and grades

## Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Card.tsx
│   ├── Layout.tsx       # Main layout with sidebar
│   └── ProtectedRoute.tsx
├── contexts/
│   └── AuthContext.tsx  # Authentication context
├── lib/
│   ├── api.ts          # Axios instance with interceptors
│   └── utils.ts        # Utility functions
├── pages/
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Students.tsx
│   ├── Faculty.tsx
│   ├── Courses.tsx
│   ├── Subjects.tsx
│   ├── Attendance.tsx
│   └── Marks.tsx
├── types/
│   └── index.ts        # TypeScript type definitions
├── App.tsx             # Main app with routing
└── main.tsx           # Entry point
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the frontend directory:
```bash
VITE_API_URL=http://localhost:3000/api
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` folder.

## API Integration

The frontend connects to the backend API using Axios. The base URL is configured in `.env` file.

### API Endpoints Used

- `POST /api/auth/login` - User login
- `GET /api/student` - Get all students
- `GET /api/student/:id` - Get student by ID
- `POST /api/student` - Create new student
- `DELETE /api/student/:id` - Delete student
- `GET /api/faculty` - Get all faculty
- `GET /api/course` - Get all courses
- `GET /api/subject` - Get all subjects

## Authentication Flow

1. User enters credentials on login page
2. Frontend sends POST request to `/api/auth/login`
3. Backend returns JWT token
4. Token is stored in localStorage
5. Token is automatically added to all subsequent API requests via Axios interceptor
6. If token expires (401 response), user is redirected to login

## Styling

The app uses TailwindCSS for styling with a custom design system:

- **Primary Color**: Blue (#3B82F6)
- **Typography**: System fonts
- **Components**: Custom-built with Tailwind utilities
- **Responsive**: Mobile-first design

## Development Notes

- The app uses React Router for navigation
- All routes except `/login` are protected
- Role-based access control is implemented at the route level
- API errors are handled globally via Axios interceptors

## Future Enhancements

- Complete CRUD operations for all entities
- Advanced filtering and search
- Data export functionality
- Charts and analytics
- Real-time notifications
- File upload for student photos
- Bulk operations
- Print reports

## License

This project is part of an academic assignment.
