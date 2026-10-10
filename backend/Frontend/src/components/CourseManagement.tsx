import axios from "axios";
import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";

const API_URL = "http://localhost:5000/api";

type Course = {
  _id: string;
  name: string;
  description: string;
  studentCount: number;
};

type ApiMessage = {
  message?: string;
};

const getAuthHeaders = () => {
  const token = sessionStorage.getItem("adminToken");

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
};

export default function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error"
  >("success");

  const handleUnauthorized = useCallback(() => {
    sessionStorage.removeItem("adminToken");
    window.location.reload();
  }, []);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);

      const response = await axios.get<Course[]>(
        `${API_URL}/courses`,
        {
          headers: getAuthHeaders(),
        }
      );

      setCourses(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (error) {
      console.error("Failed to load courses:", error);

      if (
        axios.isAxiosError(error) &&
        error.response?.status === 401
      ) {
        handleUnauthorized();
        return;
      }

      setMessage("Unable to load courses. Check your backend.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }, [handleUnauthorized]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchCourses();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchCourses]);

  const handleCreateCourse = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!name.trim()) {
      setMessage("Please enter a course name.");
      setMessageType("error");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const response = await axios.post<ApiMessage>(
        `${API_URL}/courses`,
        {
          name: name.trim(),
          description: description.trim(),
        },
        {
          headers: getAuthHeaders(),
        }
      );

      setMessage(
        response.data.message || "Course created successfully!"
      );
      setMessageType("success");

      setName("");
      setDescription("");

      await fetchCourses();
    } catch (error) {
      console.error("Failed to create course:", error);

      if (
        axios.isAxiosError(error) &&
        error.response?.status === 401
      ) {
        handleUnauthorized();
        return;
      }

      if (axios.isAxiosError(error)) {
        setMessage(
          error.response?.data?.message ||
            "Failed to create course."
        );
      } else {
        setMessage("Something went wrong.");
      }

      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCourse = async (course: Course) => {
    const confirmed = window.confirm(
      `Delete the course "${course.name}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(course._id);
      setMessage("");

      const response = await axios.delete<ApiMessage>(
        `${API_URL}/courses/${course._id}`,
        {
          headers: getAuthHeaders(),
        }
      );

      setMessage(
        response.data.message || "Course deleted successfully!"
      );
      setMessageType("success");

      await fetchCourses();
    } catch (error) {
      console.error("Failed to delete course:", error);

      if (
        axios.isAxiosError(error) &&
        error.response?.status === 401
      ) {
        handleUnauthorized();
        return;
      }

      if (axios.isAxiosError(error)) {
        setMessage(
          error.response?.data?.message ||
            "Failed to delete course."
        );
      } else {
        setMessage("Something went wrong.");
      }

      setMessageType("error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Create course form */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-2 text-xl font-bold text-slate-800">
          Add a Course
        </h3>

        <p className="mb-6 text-sm text-slate-500">
          Create a course for your student directory.
        </p>

        <form
          onSubmit={handleCreateCourse}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="course-name"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Course Name
            </label>

            <input
              id="course-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Computer Science"
              maxLength={100}
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="course-description"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Description
            </label>

            <textarea
              id="course-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the course (optional)"
              maxLength={500}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Creating..." : "+ Create Course"}
          </button>
        </form>

        {message && (
          <p
            role="status"
            className={`mt-4 rounded-lg p-3 text-sm ${
              messageType === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message}
          </p>
        )}
      </section>

      {/* Course directory */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              Course Directory
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {courses.length} course
              {courses.length === 1 ? "" : "s"} available
            </p>
          </div>

          <button
            type="button"
            onClick={() => void fetchCourses()}
            disabled={loading}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="py-8 text-center text-slate-500">
            Loading courses...
          </p>
        ) : courses.length === 0 ? (
          <p className="py-8 text-center text-slate-500">
            No courses created yet. Add your first course above.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <article
                key={course._id}
                className="rounded-xl border border-slate-200 p-5 transition hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="rounded-lg bg-blue-50 p-3 text-2xl">
                    📚
                  </div>

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                    {course.studentCount ?? 0} students
                  </span>
                </div>

                <h4 className="text-lg font-bold text-slate-800">
                  {course.name}
                </h4>

                <p className="mt-2 min-h-10 text-sm text-slate-500">
                  {course.description ||
                    "No description provided."}
                </p>

                <button
                  type="button"
                  onClick={() => void handleDeleteCourse(course)}
                  disabled={deletingId === course._id}
                  className="mt-5 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {deletingId === course._id
                    ? "Deleting..."
                    : "Delete Course"}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}