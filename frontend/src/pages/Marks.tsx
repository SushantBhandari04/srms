import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Plus, Search, Trash2, Edit, FileText } from 'lucide-react';
import api from '../lib/api';
import type { Student } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface MarksRecord {
  marks_id: number;
  roll_no: string;
  student_name: string;
  subject_name: string;
  subject_code?: string;
  internal_marks: number;
  external_marks: number;
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

const Marks: React.FC = () => {
  const { user } = useAuth();
  const [marksRecords, setMarksRecords] = useState<MarksRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [facultyId, setFacultyId] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const isStudent = user?.role === 'student';
  const isFaculty = user?.role === 'faculty';
  const [formData, setFormData] = useState({
    studentId: '',
    subjectId: '',
    internalMarks: 0,
    externalMarks: 0,
  });
  const [editData, setEditData] = useState({
    id: 0,
    internalMarks: 0,
    externalMarks: 0,
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
      fetchMarks();
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

  const fetchMarks = async () => {
    try {
      // If student, fetch only their marks
      const endpoint = isStudent && studentId 
        ? `/marks/student/${studentId}` 
        : '/marks';
      const response = await api.get(endpoint);
      setMarksRecords(response.data);
    } catch (error) {
      console.error('Error fetching marks:', error);
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
    setLoading(true);
    try {
      const response = await api.get(`/marks/subject/${subject.subject_id}`);
      setMarksRecords(response.data);
    } catch (error) {
      console.error('Error fetching marks for subject:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    setMarksRecords([]);
    setSearchTerm('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/marks', formData);
      setShowAddModal(false);
      if (selectedSubject) {
        handleSubjectClick(selectedSubject);
      } else {
        fetchMarks();
      }
      setFormData({
        studentId: '',
        subjectId: '',
        internalMarks: 0,
        externalMarks: 0,
      });
      alert('Marks added successfully!');
    } catch (error: any) {
      console.error('Error adding marks:', error);
      alert(error.response?.data?.error || 'Failed to add marks');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/marks/${editData.id}`, {
        internalMarks: editData.internalMarks,
        externalMarks: editData.externalMarks,
      });
      setShowEditModal(false);
      if (selectedSubject) {
        handleSubjectClick(selectedSubject);
      } else {
        fetchMarks();
      }
      alert('Marks updated successfully!');
    } catch (error: any) {
      console.error('Error updating marks:', error);
      alert(error.response?.data?.error || 'Failed to update marks');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ['internalMarks', 'externalMarks'].includes(name) ? parseFloat(value) : value,
    }));
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: parseFloat(value) }));
  };

  const openEditModal = (record: MarksRecord) => {
    setEditData({
      id: record.marks_id,
      internalMarks: record.internal_marks,
      externalMarks: record.external_marks,
    });
    setShowEditModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this marks record?')) return;

    try {
      await api.delete(`/marks/${id}`);
      setMarksRecords(marksRecords.filter((m) => m.marks_id !== id));
    } catch (error) {
      console.error('Error deleting marks:', error);
      alert('Failed to delete marks record');
    }
  };

  const filteredRecords = marksRecords.filter(
    (record) =>
      record.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.roll_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.subject_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateTotal = (internal: number, external: number) => {
    const internalNum = Number(internal) || 0;
    const externalNum = Number(external) || 0;
    return (internalNum + externalNum).toFixed(2);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            {isStudent ? 'My Marks' : selectedSubject ? selectedSubject.subject_name : 'Marks Management'}
          </h2>
          <p className="text-gray-600 mt-1">
            {isStudent 
              ? 'View your exam marks and grades' 
              : selectedSubject 
              ? `${selectedSubject.subject_code} - View and manage marks`
              : 'Select a subject to view marks'}
          </p>
        </div>
        <div className="flex space-x-2">
          {!isStudent && selectedSubject && (
            <Button variant="outline" onClick={handleBackToSubjects}>
              ← Back to Subjects
            </Button>
          )}
          {isFaculty && selectedSubject && (
            <Button onClick={() => {
              setFormData(prev => ({ ...prev, subjectId: selectedSubject.subject_id.toString() }));
              setShowAddModal(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Marks
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
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <FileText className="w-6 h-6 text-green-600" />
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

      {/* Subject Cards for Students */}
      {isStudent && !selectedSubject && (
        <div>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading marks...</p>
            </div>
          ) : marksRecords.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12 text-gray-500">
                <p>No marks records found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {marksRecords.map((record, index) => {
                const total = (Number(record.internal_marks) || 0) + (Number(record.external_marks) || 0);
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {record.subject_name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            Code: {record.subject_code || 'N/A'}
                          </p>
                        </div>
                        <div className="ml-4">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <FileText className="w-6 h-6 text-green-600" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total Marks</span>
                          <span className="text-2xl font-bold text-blue-600">
                            {total}
                          </span>
                        </div>
                        <div className="border-t pt-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Internal</span>
                            <span className="font-semibold text-gray-900">{record.internal_marks}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">External</span>
                            <span className="font-semibold text-gray-900">{record.external_marks}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Marks Records Table */}
      {((isStudent && selectedSubject) || (!isStudent && selectedSubject)) && (
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
              <p className="mt-4 text-gray-600">Loading marks records...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No marks records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Roll No</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Student Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Subject</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Internal</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">External</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr key={record.marks_id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900 font-medium">{record.roll_no}</td>
                      <td className="py-3 px-4 text-gray-900">{record.student_name}</td>
                      <td className="py-3 px-4 text-gray-600">{record.subject_name}</td>
                      <td className="py-3 px-4 text-gray-600">{record.internal_marks}</td>
                      <td className="py-3 px-4 text-gray-600">{record.external_marks}</td>
                      <td className="py-3 px-4 text-gray-900 font-semibold">
                        {calculateTotal(record.internal_marks, record.external_marks)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end space-x-2">
                          {isFaculty && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditModal(record)}
                              >
                                <Edit className="w-4 h-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(record.marks_id)}
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </>
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

      {/* Add Marks Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Add Marks</CardTitle>
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
                  label="Internal Marks"
                  name="internalMarks"
                  type="number"
                  step="0.01"
                  value={formData.internalMarks}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  required
                />
                <Input
                  label="External Marks"
                  name="externalMarks"
                  type="number"
                  step="0.01"
                  value={formData.externalMarks}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  required
                />

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Add Marks</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Marks Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Edit Marks</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleUpdate}>
                <Input
                  label="Internal Marks"
                  name="internalMarks"
                  type="number"
                  step="0.01"
                  value={editData.internalMarks}
                  onChange={handleEditInputChange}
                  min="0"
                  max="100"
                  required
                />
                <Input
                  label="External Marks"
                  name="externalMarks"
                  type="number"
                  step="0.01"
                  value={editData.externalMarks}
                  onChange={handleEditInputChange}
                  min="0"
                  max="100"
                  required
                />

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Update Marks</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Marks;
