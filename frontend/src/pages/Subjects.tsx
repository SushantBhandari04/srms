import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Plus, Search, Trash2, Eye, UserPlus } from 'lucide-react';
import api from '../lib/api';

interface Subject {
  subject_id: number;
  subject_name: string;
  subject_code: string;
  credits: number;
  course_id: number;
  faculty_id: number;
  course_name?: string;
  course_code?: string;
  faculty_name?: string;
  faculty_email?: string;
}

interface Course {
  id: number;
  course_code: string;
  course_name: string;
}

interface Faculty {
  faculty_id: number;
  faculty_name: string;
  email: string;
}

const Subjects: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [formData, setFormData] = useState({
    subjectName: '',
    subjectCode: '',
    courseId: '',
    credits: 3,
  });
  const [assignData, setAssignData] = useState({
    subjectId: 0,
    facultyId: '',
  });

  useEffect(() => {
    fetchSubjects();
    fetchCourses();
    fetchFaculties();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/subject');
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await api.get('/course');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchFaculties = async () => {
    try {
      const response = await api.get('/faculty');
      setFaculties(response.data);
    } catch (error) {
      console.error('Error fetching faculties:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/subject', formData);
      setShowAddModal(false);
      fetchSubjects();
      // Reset form
      setFormData({
        subjectName: '',
        subjectCode: '',
        courseId: '',
        credits: 3,
      });
      alert('Subject added successfully!');
    } catch (error: any) {
      console.error('Error creating subject:', error);
      alert(error.response?.data?.error || 'Failed to create subject');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'credits' ? parseInt(value) : value }));
  };

  const handleAssignFaculty = (subject: Subject) => {
    setSelectedSubject(subject);
    setAssignData({ subjectId: subject.subject_id, facultyId: '' });
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/subject/assign-faculty', assignData);
      setShowAssignModal(false);
      fetchSubjects();
      alert('Faculty assigned successfully!');
    } catch (error: any) {
      console.error('Error assigning faculty:', error);
      alert(error.response?.data?.error || 'Failed to assign faculty');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;

    try {
      await api.delete(`/subject/${id}`);
      setSubjects(subjects.filter((s) => s.subject_id !== id));
    } catch (error) {
      console.error('Error deleting subject:', error);
      alert('Failed to delete subject');
    }
  };

  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.subject_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.subject_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.course_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.faculty_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Subject Management</h2>
          <p className="text-gray-600 mt-1">Manage academic subjects</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Subject
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by subject, course, or faculty..."
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
              <p className="mt-4 text-gray-600">Loading subjects...</p>
            </div>
          ) : filteredSubjects.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No subjects found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Subject Code</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Subject Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Course</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Faculty</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Credits</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubjects.map((subject) => (
                    <tr key={subject.subject_id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900 font-medium">{subject.subject_code}</td>
                      <td className="py-3 px-4 text-gray-900">{subject.subject_name}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {subject.course_name || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {subject.faculty_name || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{subject.credits}</td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAssignFaculty(subject)}
                            title="Assign Faculty"
                          >
                            <UserPlus className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(subject.subject_id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
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

      {/* Add Subject Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Add New Subject</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <Input
                  label="Subject Code"
                  name="subjectCode"
                  value={formData.subjectCode}
                  onChange={handleInputChange}
                  placeholder="e.g., CS201"
                  required
                />
                <Input
                  label="Subject Name"
                  name="subjectName"
                  value={formData.subjectName}
                  onChange={handleInputChange}
                  placeholder="e.g., Data Structures"
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="courseId"
                    value={formData.courseId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.course_name} ({course.course_code})
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Credits"
                  name="credits"
                  type="number"
                  value={formData.credits}
                  onChange={handleInputChange}
                  min="1"
                  max="10"
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
                  <Button type="submit">Add Subject</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Assign Faculty Modal */}
      {showAssignModal && selectedSubject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Assign Faculty to {selectedSubject.subject_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleAssignSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Faculty <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="facultyId"
                    value={assignData.facultyId}
                    onChange={(e) => setAssignData({ ...assignData, facultyId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Faculty</option>
                    {faculties.map((faculty) => (
                      <option key={faculty.faculty_id} value={faculty.faculty_id}>
                        {faculty.faculty_name} ({faculty.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-600">
                    <strong>Current Faculty:</strong> {selectedSubject.faculty_name || 'Not assigned'}
                  </p>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAssignModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Assign Faculty</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Subjects;
