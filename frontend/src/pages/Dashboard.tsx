import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Users, UserCircle, BookOpen, TrendingUp, Calendar, FileText } from 'lucide-react';
import api from '../lib/api';
import type { Student } from '../types';

interface Stats {
  totalStudents?: number;
  totalFaculty?: number;
  totalCourses?: number;
  totalSubjects?: number;
}

interface SubjectAttendance {
  subject_name: string;
  subject_code: string;
  total_classes: number;
  present_count: number;
  attendance_percentage: number;
}

interface SubjectMarks {
  subject_name: string;
  subject_code: string;
  internal_marks: number;
  external_marks: number;
  total_marks: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({});
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [subjectAttendance, setSubjectAttendance] = useState<SubjectAttendance[]>([]);
  const [subjectMarks, setSubjectMarks] = useState<SubjectMarks[]>([]);
  const [studentLoading, setStudentLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (user?.role === 'admin') {
          const [students, faculty, courses, subjects] = await Promise.all([
            api.get('/student'),
            api.get('/faculty'),
            api.get('/course'),
            api.get('/subject'),
          ]);
          
          setStats({
            totalStudents: students.data.length,
            totalFaculty: faculty.data.length,
            totalCourses: courses.data.length,
            totalSubjects: subjects.data.length,
          });
        } else if (user?.role === 'faculty') {
          // Faculty can see total students
          const students = await api.get('/student');
          setStats({
            totalStudents: students.data.length,
          });
        } else if (user?.role === 'student') {
          // Fetch student data
          await fetchStudentData();
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const fetchStudentData = async () => {
    setStudentLoading(true);
    try {
      // Get student ID
      const studentsRes = await api.get('/student');
      const currentStudent = studentsRes.data.find((s: Student) => s.user_id === user?.id);
      
      if (currentStudent) {
        setStudentId(currentStudent.id);
        
        // Fetch attendance and marks
        const [attendanceRes, marksRes] = await Promise.all([
          api.get(`/attendance/student/${currentStudent.id}`),
          api.get(`/marks/student/${currentStudent.id}`)
        ]);
        
        // Process attendance by subject
        const attendanceBySubject = processAttendanceBySubject(attendanceRes.data);
        setSubjectAttendance(attendanceBySubject);
        
        // Process marks by subject
        const marksBySubject = processMarksBySubject(marksRes.data);
        setSubjectMarks(marksBySubject);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setStudentLoading(false);
    }
  };

  const processAttendanceBySubject = (attendance: any[]): SubjectAttendance[] => {
    const subjectMap = new Map<string, { subject_name: string; subject_code: string; total: number; present: number }>();
    
    attendance.forEach((record) => {
      const key = record.subject_name;
      if (!subjectMap.has(key)) {
        subjectMap.set(key, {
          subject_name: record.subject_name,
          subject_code: record.subject_code || '',
          total: 0,
          present: 0
        });
      }
      
      const subject = subjectMap.get(key)!;
      subject.total++;
      if (record.status === 'present') {
        subject.present++;
      }
    });
    
    return Array.from(subjectMap.values()).map(s => ({
      subject_name: s.subject_name,
      subject_code: s.subject_code,
      total_classes: s.total,
      present_count: s.present,
      attendance_percentage: s.total > 0 ? (s.present / s.total) * 100 : 0
    }));
  };

  const processMarksBySubject = (marks: any[]): SubjectMarks[] => {
    return marks.map(m => ({
      subject_name: m.subject_name,
      subject_code: m.subject_code || '',
      internal_marks: Number(m.internal_marks) || 0,
      external_marks: Number(m.external_marks) || 0,
      total_marks: (Number(m.internal_marks) || 0) + (Number(m.external_marks) || 0)
    }));
  };

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents || 0,
      icon: Users,
      color: 'bg-blue-500',
      show: user?.role === 'admin' || user?.role === 'faculty',
    },
    {
      title: 'Total Faculty',
      value: stats.totalFaculty || 0,
      icon: UserCircle,
      color: 'bg-green-500',
      show: user?.role === 'admin',
    },
    {
      title: 'Total Courses',
      value: stats.totalCourses || 0,
      icon: BookOpen,
      color: 'bg-purple-500',
      show: user?.role === 'admin',
    },
    {
      title: 'Total Subjects',
      value: stats.totalSubjects || 0,
      icon: TrendingUp,
      color: 'bg-orange-500',
      show: user?.role === 'admin',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h2>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your academic records today.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards
            .filter((card) => card.show)
            .map((card) => (
              <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {card.title}
                  </CardTitle>
                  <div className={`${card.color} p-2 rounded-lg`}>
                    <card.icon className="w-5 h-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{card.value}</div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* Role-specific content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {user?.role === 'admin' && (
                <>
                  <a
                    href="/students"
                    className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <p className="font-medium text-gray-900">Manage Students</p>
                    <p className="text-sm text-gray-600">Add, edit, or remove student records</p>
                  </a>
                  <a
                    href="/faculty"
                    className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <p className="font-medium text-gray-900">Manage Faculty</p>
                    <p className="text-sm text-gray-600">Add, edit, or remove faculty members</p>
                  </a>
                </>
              )}
              {(user?.role === 'admin' || user?.role === 'faculty') && (
                <>
                  <a
                    href="/attendance"
                    className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <p className="font-medium text-gray-900">Mark Attendance</p>
                    <p className="text-sm text-gray-600">Record student attendance</p>
                  </a>
                  <a
                    href="/marks"
                    className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <p className="font-medium text-gray-900">Enter Marks</p>
                    <p className="text-sm text-gray-600">Record student exam marks</p>
                  </a>
                </>
              )}
              {user?.role === 'student' && (
                <>
                  <a
                    href="/attendance"
                    className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <p className="font-medium text-gray-900">View Attendance</p>
                    <p className="text-sm text-gray-600">Check your attendance records</p>
                  </a>
                  <a
                    href="/marks"
                    className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <p className="font-medium text-gray-900">View Marks</p>
                    <p className="text-sm text-gray-600">Check your exam results</p>
                  </a>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {user?.role === 'student' ? (
          <>
            {/* Student Attendance by Subject */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Attendance by Subject
                </CardTitle>
              </CardHeader>
              <CardContent>
                {studentLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : subjectAttendance.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No attendance records found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {subjectAttendance.map((subject, index) => (
                      <div key={index} className="border-b border-gray-100 pb-3 last:border-0">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-medium text-gray-900">{subject.subject_name}</h4>
                          <span className={`text-sm font-semibold ${
                            subject.attendance_percentage >= 75 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {subject.attendance_percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>{subject.subject_code}</span>
                          <span>{subject.present_count}/{subject.total_classes} classes</span>
                        </div>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              subject.attendance_percentage >= 75 ? 'bg-green-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${subject.attendance_percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Student Marks by Subject */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Marks by Subject
                </CardTitle>
              </CardHeader>
              <CardContent>
                {studentLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : subjectMarks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No marks records found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {subjectMarks.map((subject, index) => (
                      <div key={index} className="border-b border-gray-100 pb-3 last:border-0">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-medium text-gray-900">{subject.subject_name}</h4>
                          <span className="text-lg font-bold text-blue-600">
                            {subject.total_marks}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <span>{subject.subject_code}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 mt-2">
                          <span>Internal: {subject.internal_marks}</span>
                          <span>External: {subject.external_marks}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p>No recent activity to display</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
