export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'faculty' | 'student';
}

export interface Student {
  id: number;
  user_id: number;
  roll_no: string;
  date_of_birth: string;
  admission_year: number;
  phone: string;
  address: string;
  gender: 'Male' | 'Female' | 'Other';
  department_id: number;
  course_id: number;
  student_name?: string;
  email?: string;
  department_name?: string;
  course_name?: string;
}

export interface Faculty {
  id: number;
  user_id: number;
  employee_id: string;
  department_id: number;
  designation: string;
  phone: string;
  date_of_joining: string;
  faculty_name?: string;
  email?: string;
}

export interface Department {
  id: number;
  dept_code: string;
  dept_name: string;
  created_at?: string;
}

export interface Course {
  id: number;
  course_code: string;
  course_name: string;
  department_id: number;
  duration_years: number;
}

export interface Subject {
  id: number;
  subject_code: string;
  subject_name: string;
  credits: number;
  semester: number;
  course_id: number;
}

export interface Attendance {
  id: number;
  student_id: number;
  subject_id: number;
  date: string;
  status: 'Present' | 'Absent' | 'Late';
}

export interface Marks {
  id: number;
  student_id: number;
  subject_id: number;
  exam_type: 'Mid-term' | 'End-term' | 'Assignment' | 'Quiz';
  marks_obtained: number;
  max_marks: number;
  exam_date: string;
}

export interface AuthResponse {
  message: string;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
