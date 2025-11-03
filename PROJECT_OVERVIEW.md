# Student Record Management System (SRMS)

A full-stack web application for managing student academic records with role-based access control.

## 🎯 Project Overview

This system automates the process of managing student academic information including personal details, course enrollment, attendance, marks, and grades. It provides different interfaces for Admins, Faculty, and Students.

## 🛠️ Technology Stack

### Backend
- **Node.js** with **Express.js** - REST API server
- **TypeScript** - Type safety and better developer experience
- **MySQL** - Relational database
- **JWT** - Authentication and authorization
- **bcrypt** - Password hashing

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **TailwindCSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **Lucide React** - Icon library

## 📁 Project Structure

```
srms/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth middleware
│   │   ├── routes/          # API routes
│   │   ├── scripts/         # Database initialization
│   │   ├── seed/            # Seed data
│   │   └── server.ts        # Entry point
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── components/      # Reusable components
    │   ├── contexts/        # React contexts
    │   ├── lib/             # Utilities and API client
    │   ├── pages/           # Page components
    │   ├── types/           # TypeScript types
    │   ├── App.tsx          # Main app component
    │   └── main.tsx         # Entry point
    ├── package.json
    └── tailwind.config.js
```

## 🔑 Key Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, Faculty, Student)
- Secure password hashing with bcrypt
- Protected API endpoints and routes

### Admin Features
- Dashboard with system statistics
- Manage students (Create, Read, Update, Delete)
- Manage faculty members
- Manage courses and subjects
- View and manage attendance records
- View and manage marks

### Faculty Features
- View student list
- Mark attendance
- Enter and update marks
- View subject assignments

### Student Features
- View personal dashboard
- Check attendance records
- View marks and grades
- Access academic reports

## 🗄️ Database Schema

### Main Tables
- **users** - User authentication (admin, faculty, student)
- **students** - Student personal information
- **faculty** - Faculty member details
- **courses** - Academic courses
- **subjects** - Course subjects
- **departments** - Academic departments
- **attendance** - Student attendance records
- **marks** - Student exam marks

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MySQL (v8+)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=srms
JWT_SECRET=your_secret_key
```

4. Initialize database schema:
```bash
npm run schema:init
```

5. Seed admin user (optional):
```bash
npm run seed:admin
```

6. Start the server:
```bash
npm run dev
```

Backend will run at `http://localhost:3000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
VITE_API_URL=http://localhost:3000/api
```

4. Start the development server:
```bash
npm run dev
```

Frontend will run at `http://localhost:5173`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Students
- `GET /api/student` - Get all students (Admin, Faculty)
- `GET /api/student/:id` - Get student by ID
- `POST /api/student` - Create student (Admin)
- `DELETE /api/student/:id` - Delete student (Admin)

### Faculty
- `GET /api/faculty` - Get all faculty (Admin)
- `GET /api/faculty/:id` - Get faculty by ID
- `POST /api/faculty` - Create faculty (Admin)
- `DELETE /api/faculty/:id` - Delete faculty (Admin)

### Courses
- `GET /api/course` - Get all courses
- `POST /api/course` - Create course (Admin)

### Subjects
- `GET /api/subject` - Get all subjects
- `POST /api/subject` - Create subject (Admin)

## 🎨 UI Features

### Design System
- **Colors**: Blue primary, clean grays
- **Typography**: System fonts for optimal readability
- **Components**: Custom-built with TailwindCSS
- **Icons**: Lucide React icon library
- **Responsive**: Mobile-first design approach

### User Interface
- Modern, clean dashboard
- Responsive sidebar navigation
- Role-based menu items
- Data tables with search and filter
- Modal forms for CRUD operations
- Loading states and error handling

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- HTTP-only token storage
- Protected API routes with middleware
- Role-based access control
- SQL injection prevention with parameterized queries
- CORS configuration

## 📝 Development Scripts

### Backend
```bash
npm run dev          # Start development server
npm run build        # Build TypeScript
npm run start        # Start production server
npm run schema:init  # Initialize database
npm run seed:admin   # Seed admin user
```

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🎓 Learning Outcomes

This project demonstrates:
- Full-stack TypeScript development
- RESTful API design
- Database design and relationships
- Authentication and authorization
- React state management
- Modern UI/UX practices
- Git version control

## 🔮 Future Enhancements

- [ ] Complete CRUD for all entities
- [ ] Advanced search and filtering
- [ ] Data export (PDF, Excel)
- [ ] Charts and analytics dashboard
- [ ] Email notifications
- [ ] File upload for student photos
- [ ] Bulk operations
- [ ] Report generation
- [ ] Attendance percentage calculation
- [ ] Grade calculation and GPA
- [ ] Academic calendar integration
- [ ] Parent portal

## 👥 User Roles & Permissions

| Feature | Admin | Faculty | Student |
|---------|-------|---------|---------|
| Dashboard | ✅ | ✅ | ✅ |
| Manage Students | ✅ | View Only | ❌ |
| Manage Faculty | ✅ | ❌ | ❌ |
| Manage Courses | ✅ | ❌ | ❌ |
| Manage Subjects | ✅ | View Only | ❌ |
| Mark Attendance | ✅ | ✅ | View Only |
| Enter Marks | ✅ | ✅ | View Only |

## 📄 License

This project is created for educational purposes as part of a B.Tech academic assignment.

## 🤝 Contributing

This is an academic project. For suggestions or improvements, please contact the development team.

---

**Developed by**: Department of Computer Science  
**Technology**: React, TypeScript, Express, MySQL  
**Year**: 2024
