import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Plus, Search, Trash2, Calendar, FileText } from 'lucide-react';
import api from '../lib/api';
import type { Student } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface AttendanceRecord {
  attendance_id: number;
  roll_no: string;
  student_name: string;
  subject_name: string;
  subject_code?: string;
  date: string;
  status: 'present' | 'absent';
}

interface Subject {
  subject_id: number;
  subject_name: string;
  subject_code: string;
  faculty_id?: number;
  course_name?: string;
  faculty_name?: string;
  credits?: number;
}

interface StudentWithAttendance extends Student {
  totalClasses: number;
  presentClasses: number;
  attendancePercentage: number;
}

const Attendance: React.FC = () => {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [facultyId, setFacultyId] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentsInSubject, setStudentsInSubject] = useState<StudentWithAttendance[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const isStudent = user?.role === 'student';
  const isFaculty = user?.role === 'faculty';
  const [formData, setFormData] = useState({
    studentId: '',
    subjectId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
  });

  useEffect(() => {
    if (isStudent) {
      fetchStudentId();
    } else if (isFaculty) {
      fetchFacultyId();
    } else {
      fetchSubjects();
      fetchStudents();
    }
  }, []);

  useEffect(() => {
    if (facultyId) {
      fetchSubjects();
      fetchStudents();
    }
  }, [facultyId]);

  useEffect(() => {
    if (studentId) {
      fetchAttendance();
    }
  }, [studentId]);

  const fetchStudentId = async () => {
    try {
      // Fetch all students and find the one matching the current user
      const response = await api.get('/student');
      const currentStudent = response.data.find((s: Student) => s.user_id === user?.id);
      if (currentStudent) {
        setStudentId(currentStudent.id);
      }
    } catch (error) {
      console.error('Error fetching student ID:', error);
      setLoading(false);
    }
  };

  const fetchFacultyId = async () => {
    try {
      // Fetch all faculty and find the one matching the current user
      const response = await api.get('/faculty');
      console.log('All faculty:', response.data);
      console.log('Current user ID:', user?.id);
      const currentFaculty = response.data.find((f: any) => f.user_id === user?.id);
      console.log('Found faculty:', currentFaculty);
      if (currentFaculty) {
        // Use faculty_id field, not id
        setFacultyId(currentFaculty.faculty_id);
        console.log('Set faculty ID to:', currentFaculty.faculty_id);
      } else {
        console.log('No faculty found for user');
      }
    } catch (error) {
      console.error('Error fetching faculty ID:', error);
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      // If student, fetch only their attendance records
      const endpoint = isStudent && studentId 
        ? `/attendance/student/${studentId}` 
        : '/attendance';
      const response = await api.get(endpoint);
      setAttendanceRecords(response.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get('/student');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchSubjects = async () => {
    setSubjectsLoading(true);
    try {
      const response = await api.get('/subject');
      console.log('All subjects:', response.data);
      console.log('Faculty ID:', facultyId);
      console.log('Is Faculty:', isFaculty);
      
      // Filter subjects for faculty - show only their assigned subjects
      if (isFaculty && facultyId) {
        const filteredSubjects = response.data.filter((s: Subject) => {
          console.log('Comparing:', s.faculty_id, 'with', facultyId, 'equal?', Number(s.faculty_id) === Number(facultyId));
          return Number(s.faculty_id) === Number(facultyId);
        });
        console.log('Filtered subjects for faculty:', filteredSubjects);
        setSubjects(filteredSubjects);
      } else {
        setSubjects(response.data);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setSubjectsLoading(false);
      setLoading(false);
    }
  };

  const handleSubjectClick = async (subject: Subject) => {
    setSelectedSubject(subject);
    setSelectedStudent(null);
    setLoading(true);
    try {
      // Fetch all students
      const studentsResponse = await api.get('/student');
      // Fetch attendance for this subject to filter students who have attendance
      const attendanceResponse = await api.get(`/attendance/subject/${subject.subject_id}`);
      
      // Calculate attendance stats for each student
      const studentAttendanceMap = new Map<number, { total: number; present: number }>();
      
      attendanceResponse.data.forEach((a: AttendanceRecord) => {
        // Find student by roll_no
        const student = studentsResponse.data.find((s: Student) => s.roll_no === a.roll_no);
        if (student) {
          if (!studentAttendanceMap.has(student.id)) {
            studentAttendanceMap.set(student.id, { total: 0, present: 0 });
          }
          const stats = studentAttendanceMap.get(student.id)!;
          stats.total++;
          if (a.status === 'present') {
            stats.present++;
          }
        }
      });
      
      // Create students with attendance stats
      const studentsWithAttendance: StudentWithAttendance[] = studentsResponse.data
        .filter((s: Student) => studentAttendanceMap.has(s.id))
        .map((s: Student) => {
          const stats = studentAttendanceMap.get(s.id)!;
          const percentage = stats.total > 0 ? (stats.present / stats.total) * 100 : 0;
          return {
            ...s,
            totalClasses: stats.total,
            presentClasses: stats.present,
            attendancePercentage: percentage
          };
        });
      
      setStudentsInSubject(studentsWithAttendance);
      setAttendanceRecords([]);
    } catch (error) {
      console.error('Error fetching students for subject:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentClick = async (student: Student) => {
    setSelectedStudent(student);
    setLoading(true);
    try {
      const response = await api.get(`/attendance/student/${student.id}`);
      // Filter attendance for the selected subject
      const filteredAttendance = response.data.filter((a: AttendanceRecord) => 
        selectedSubject && a.subject_name === selectedSubject.subject_name
      );
      setAttendanceRecords(filteredAttendance);
    } catch (error) {
      console.error('Error fetching attendance for student:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToStudents = () => {
    setSelectedStudent(null);
    setAttendanceRecords([]);
    setSearchTerm('');
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    setSelectedStudent(null);
    setStudentsInSubject([]);
    setAttendanceRecords([]);
    setSearchTerm('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/attendance', formData);
      setShowMarkModal(false);
      if (selectedSubject) {
        handleSubjectClick(selectedSubject);
      } else {
        fetchAttendance();
      }
      setFormData({
        studentId: '',
        subjectId: '',
        date: new Date().toISOString().split('T')[0],
        status: 'present',
      });
      alert('Attendance marked successfully!');
    } catch (error: any) {
      console.error('Error marking attendance:', error);
      alert(error.response?.data?.error || 'Failed to mark attendance');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this attendance record?')) return;

    try {
      await api.delete(`/attendance/${id}`);
      setAttendanceRecords(attendanceRecords.filter((a) => a.attendance_id !== id));
    } catch (error) {
      console.error('Error deleting attendance:', error);
      alert('Failed to delete attendance record');
    }
  };

  const filteredRecords = attendanceRecords.filter(
    (record) =>
      record.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.roll_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.subject_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            {isStudent 
              ? 'My Attendance' 
              : selectedStudent 
              ? `${selectedStudent.student_name} - ${selectedSubject?.subject_name}`
              : selectedSubject 
              ? selectedSubject.subject_name 
              : 'Attendance Management'}
          </h2>
          <p className="text-gray-600 mt-1">
            {isStudent 
              ? 'View your attendance records' 
              : selectedStudent
              ? `Roll No: ${selectedStudent.roll_no} - View attendance details`
              : selectedSubject 
              ? `${selectedSubject.subject_code} - Select a student to view attendance`
              : 'Select a subject to view students'}
          </p>
        </div>
        <div className="flex space-x-2">
          {!isStudent && selectedStudent && (
            <Button variant="outline" onClick={handleBackToStudents}>
              ← Back to Students
            </Button>
          )}
          {!isStudent && selectedSubject && !selectedStudent && (
            <Button variant="outline" onClick={handleBackToSubjects}>
              ← Back to Subjects
            </Button>
          )}
          {isFaculty && (
            <Button onClick={() => {
              setFormData(prev => ({ 
                ...prev, 
                subjectId: selectedSubject?.subject_id.toString() || '',
                // studentId: selectedStudent.id.toString()
              }));
              setShowMarkModal(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Mark Attendance
            </Button>
          )}
        </div>
      </div>

      {/* Subject Cards for Admin/Faculty */}
      {!isStudent && !selectedSubject && (
        <div>
          {subjectsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading subjects...</p>
            </div>
          ) : subjects.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12 text-gray-500">
                <p>{isFaculty ? 'No subjects assigned to you yet' : 'No subjects found'}</p>
                {isFaculty && (
                  <p className="text-sm mt-2">Please contact admin to assign subjects to you.</p>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject) => (
                <Card 
                  key={subject.subject_id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                  onClick={() => handleSubjectClick(subject)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {subject.subject_name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          Code: {subject.subject_code}
                        </p>
                        {subject.course_name && (
                          <p className="text-xs text-gray-500 mb-1">
                            📚 {subject.course_name}
                          </p>
                        )}
                        {subject.faculty_name && (
                          <p className="text-xs text-gray-500">
                            👨‍🏫 {subject.faculty_name}
                          </p>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Student Cards for Admin/Faculty after selecting subject */}
      {!isStudent && selectedSubject && !selectedStudent && (
        <div>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading students...</p>
            </div>
          ) : studentsInSubject.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12 text-gray-500">
                <p>No students found with attendance in this subject</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {studentsInSubject.map((student) => (
                <Card 
                  key={student.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                  onClick={() => handleStudentClick(student)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {student.student_name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Roll No: {student.roll_no}
                        </p>
                        {student.course_name && (
                          <p className="text-xs text-gray-500 mb-1">
                            📚 {student.course_name}
                          </p>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-2xl">👤</span>
                        </div>
                      </div>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Attendance</span>
                        <span className={`text-lg font-bold ${
                          student.attendancePercentage >= 75 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {student.attendancePercentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className={`h-2 rounded-full ${
                            student.attendancePercentage >= 75 ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${student.attendancePercentage}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 text-center">
                        {student.presentClasses}/{student.totalClasses} classes attended
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Subject Cards for Students */}
      {isStudent && !selectedSubject && (
        <div>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading attendance...</p>
            </div>
          ) : attendanceRecords.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12 text-gray-500">
                <p>No attendance records found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(() => {
                // Group attendance by subject
                const subjectMap = new Map<string, { subject_name: string; subject_code: string; total: number; present: number; records: any[] }>();
                attendanceRecords.forEach((record) => {
                  const key = record.subject_name;
                  if (!subjectMap.has(key)) {
                    subjectMap.set(key, {
                      subject_name: record.subject_name,
                      subject_code: record.subject_code || '',
                      total: 0,
                      present: 0,
                      records: []
                    });
                  }
                  const subject = subjectMap.get(key)!;
                  subject.total++;
                  if (record.status === 'present') subject.present++;
                  subject.records.push(record);
                });
                
                return Array.from(subjectMap.values()).map((subject, index) => {
                  const percentage = subject.total > 0 ? (subject.present / subject.total) * 100 : 0;
                  return (
                    <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {subject.subject_name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              Code: {subject.subject_code}
                            </p>
                          </div>
                          <div className="ml-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <Calendar className="w-6 h-6 text-blue-600" />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Attendance</span>
                            <span className={`text-lg font-bold ${
                              percentage >= 75 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                percentage >= 75 ? 'bg-green-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-gray-600 text-center">
                            {subject.present}/{subject.total} classes attended
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                });
              })()}
            </div>
          )}
        </div>
      )}

      {/* Attendance Records Table - Show only when student is selected */}
      {selectedStudent && (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by student name or roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
          </CardHeader>
          <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading attendance records...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No attendance records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Roll No</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Student Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Subject</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr key={record.attendance_id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900 font-medium">{record.roll_no}</td>
                      <td className="py-3 px-4 text-gray-900">{record.student_name}</td>
                      <td className="py-3 px-4 text-gray-600">{record.subject_name}</td>
                      <td className="py-3 px-4 text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(record.date)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            record.status === 'present'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end space-x-2">
                          {isFaculty && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(record.attendance_id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          )}
                          {!isFaculty && <span className="text-gray-400 text-sm">-</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          </CardContent>
        </Card>
      )}

      {/* Mark Attendance Modal */}
      {showMarkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Mark Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Student</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.student_name} ({student.roll_no})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="subjectId"
                    value={formData.subjectId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.subject_id} value={subject.subject_id}>
                        {subject.subject_name} ({subject.subject_code})
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowMarkModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Mark Attendance</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Attendance;
