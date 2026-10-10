import axios from "axios";
import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";

const API_URL = "http://localhost:5000/api";

type Student = {
  _id: string;
  name: string;
  email: string;
  course: string;
};

type CourseOption = {
  _id: string;
  name: string;
};

type StudentDetailsProps = {
  refreshKey: number;
  onStudentsChanged: () => void;
};

function StudentDetails({
  refreshKey,
  onStudentsChanged,
}: StudentDetailsProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [availableCourses, setAvailableCourses] = useState<CourseOption[]>([]);

  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [course, setCourse] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("All");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  // Attach the JWT to protected API requests.
  const getAuthHeaders = useCallback(() => {
    const token = sessionStorage.getItem("adminToken");

    return token
      ? { Authorization: `Bearer ${token}` }
      : {};
  }, []);

  const handleApiError = useCallback((error: unknown, fallback: string) => {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        sessionStorage.removeItem("adminToken");
        window.location.reload();
        return "Your session has expired. Please log in again.";
      }

      return error.response?.data?.message || fallback;
    }

    return fallback;
  }, []);

  // Fetch students.
  const getStudents = useCallback(async () => {
    try {
      setLoading(true);

      const response = await axios.get<Student[]>(
        `${API_URL}/students`,
        {
          headers: getAuthHeaders(),
        }
      );

      setStudents(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to get students:", error);
      setMessage(handleApiError(error, "Failed to load students."));
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, handleApiError]);

  // Fetch courses.
  const getCourses = useCallback(async () => {
    try {
      setCoursesLoading(true);

      const response = await axios.get<CourseOption[]>(
        `${API_URL}/courses`,
        {
          headers: getAuthHeaders(),
        }
      );

      setAvailableCourses(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (error) {
      console.error("Failed to get courses:", error);
      setMessage(handleApiError(error, "Failed to load courses."));
      setMessageType("error");
    } finally {
      setCoursesLoading(false);
    }
  }, [getAuthHeaders, handleApiError]);

  useEffect(() => {
    const loadData = async () => {
      await Promise.resolve();
      await Promise.all([getStudents(), getCourses()]);
    };

    void loadData();
  }, [getCourses, getStudents, refreshKey]);

  // Build course filter options from student records.
  const courseNames = Array.from(
    new Set(
      students
        .map((student) => student.course?.trim())
        .filter((courseName): courseName is string =>
          Boolean(courseName)
        )
    )
  );

  // Search by name/email and filter by course.
  const filteredStudents = students.filter((student) => {
    const search = searchTerm.toLowerCase().trim();

    const matchesSearch =
      (student.name ?? "").toLowerCase().includes(search) ||
      (student.email ?? "").toLowerCase().includes(search);

    const matchesCourse =
      selectedCourse === "All" ||
      student.course === selectedCourse;

    return matchesSearch && matchesCourse;
  });

  // Populate the edit form.
  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setName(student.name ?? "");
    setEmail(student.email ?? "");
    setCourse(student.course ?? "");
    setMessage("");
  };

  // Update student.
  const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingStudent) return;

    const selectedCourseOption = availableCourses.find(
      (item) => item.name === course
    );

    const validCourse =
      selectedCourseOption?.name ??
      (course === editingStudent.course ? course : "");

    if (!name.trim() || !email.trim() || !validCourse.trim()) {
      setMessage("Please fill in all fields and select a course.");
      setMessageType("error");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const response = await axios.put(
        `${API_URL}/students/${editingStudent._id}`,
        {
          name: name.trim(),
          email: email.trim(),
          course: validCourse.trim(),
        },
        {
          headers: getAuthHeaders(),
        }
      );

      setMessage(
        response.data.message || "Student updated successfully!"
      );
      setMessageType("success");

      setEditingStudent(null);
      setName("");
      setEmail("");
      setCourse("");

      await getStudents();
      onStudentsChanged();
    } catch (error) {
      console.error("Failed to update student:", error);
      setMessage(handleApiError(error, "Failed to update student."));
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  // Cancel editing.
  const handleCancel = () => {
    setEditingStudent(null);
    setName("");
    setEmail("");
    setCourse("");
    setMessage("");
  };

  // Delete student.
  const handleDelete = async (student: Student) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${student.name}?`
    );

    if (!confirmed) return;

    try {
      setMessage("");

      await axios.delete(
        `${API_URL}/students/${student._id}`,
        {
          headers: getAuthHeaders(),
        }
      );

      setStudents((previous) =>
        previous.filter((item) => item._id !== student._id)
      );

      if (editingStudent?._id === student._id) {
        setEditingStudent(null);
        setName("");
        setEmail("");
        setCourse("");
      }

      setMessage("Student deleted successfully!");
      setMessageType("success");

      onStudentsChanged();
    } catch (error) {
      console.error("Failed to delete student:", error);
      setMessage(handleApiError(error, "Failed to delete student."));
      setMessageType("error");
    }
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-lg">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          Student Directory
        </h2>

        <span className="text-sm text-gray-500">
          Total students: {students.length}
        </span>
      </div>

      {message && (
        <div
          role="status"
          className={`mb-4 rounded-lg p-3 text-sm ${
            messageType === "success"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      {/* Edit Student Form */}
      {editingStudent && (
        <form
          onSubmit={handleUpdate}
          className="mb-8 space-y-4 rounded-xl border border-blue-200 bg-blue-50 p-5"
        >
          <h3 className="text-lg font-semibold text-gray-800">
            Edit Student
          </h3>

          <div>
            <label
              htmlFor="edit-name"
              className="mb-1 block text-sm font-medium"
            >
              Name
            </label>

            <input
              id="edit-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              minLength={2}
              maxLength={100}
              className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="edit-email"
              className="mb-1 block text-sm font-medium"
            >
              Email
            </label>

            <input
              id="edit-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              maxLength={254}
              className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="edit-course"
              className="mb-1 block text-sm font-medium"
            >
              Course
            </label>

            <select
              id="edit-course"
              value={course}
              onChange={(event) => setCourse(event.target.value)}
              required
              disabled={coursesLoading}
              className="w-full rounded-lg border bg-white p-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">
                {coursesLoading ? "Loading courses..." : "Select a course"}
              </option>

              {course &&
                !availableCourses.some((item) => item.name === course) && (
                  <option value={course}>{course} (existing course)</option>
                )}

              {availableCourses.map((item) => (
                <option key={item._id} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>

            {!coursesLoading && availableCourses.length === 0 && (
              <p className="mt-2 text-sm text-gray-500">
                No courses found. Create a course in Course Management first.
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving || coursesLoading}
              className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="rounded-lg bg-gray-200 px-5 py-2 text-gray-800 hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Search and Course Filter */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row">
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search by name or email..."
          aria-label="Search students by name or email"
          className="flex-1 rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={selectedCourse}
          onChange={(event) => setSelectedCourse(event.target.value)}
          aria-label="Filter students by course"
          className="rounded-lg border border-gray-300 bg-white px-4 py-3"
        >
          <option value="All">All Courses</option>

          {courseNames.map((courseName) => (
            <option key={courseName} value={courseName}>
              {courseName}
            </option>
          ))}
        </select>
      </div>

      {/* Student Table */}
      {loading ? (
        <p className="py-8 text-center text-gray-500">
          Loading students...
        </p>
      ) : students.length === 0 ? (
        <p className="py-8 text-center text-gray-500">
          No students registered yet.
        </p>
      ) : filteredStudents.length === 0 ? (
        <p className="py-8 text-center text-gray-500">
          No students match your search or selected course.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Course</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((student) => (
                <tr
                  key={student._id}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="p-3 font-medium">
                    {student.name || "—"}
                  </td>

                  <td className="p-3">{student.email || "—"}</td>

                  <td className="p-3">
                    {student.course || "Not assigned"}
                  </td>

                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(student)}
                        className="rounded-lg bg-amber-500 px-3 py-2 text-sm text-white hover:bg-amber-600"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => void handleDelete(student)}
                        className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-sm text-gray-500">
        Showing {filteredStudents.length} of {students.length} students
      </p>
    </div>
  );
}

export default StudentDetails;