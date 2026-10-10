import axios from "axios";
import { useEffect, useState, type FormEvent } from "react";

const API_URL = "http://localhost:5000/api";

type StudentFormProps = {
  onStudentAdded: () => void;
};

type Course = {
  _id: string;
  name: string;
};

export default function StudentFom({
  onStudentAdded,
}: StudentFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [course, setCourse] = useState("");

  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error" | ""
  >("");
  const [loading, setLoading] = useState(false);

  const getAuthHeaders = () => {
    const token = sessionStorage.getItem("adminToken");

    return token
      ? { Authorization: `Bearer ${token}` }
      : {};
  };

  // Load courses.
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setCoursesLoading(true);
        setCoursesError("");

        const response = await axios.get<Course[]>(
          `${API_URL}/courses`,
          { headers: getAuthHeaders() }
        );

        setCourses(
          Array.isArray(response.data) ? response.data : []
        );
      } catch (error) {
        console.error("Error loading courses:", error);

        if (
          axios.isAxiosError(error) &&
          error.response?.status === 401
        ) {
          sessionStorage.removeItem("adminToken");
          window.location.reload();
          return;
        }

        setCoursesError(
          axios.isAxiosError(error)
            ? error.response?.data?.message ||
                "Unable to load courses. Please refresh the page."
            : "Unable to load courses. Please refresh the page."
        );
      } finally {
        setCoursesLoading(false);
      }
    };

    void fetchCourses();
  }, []);

  const handleClick = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    if (!name.trim() || !email.trim() || !course) {
      setMessage("Please fill in all fields and select a course.");
      setMessageType("error");
      return;
    }

    const selectedCourse = courses.find(
      (item) => item._id === course
    );

    if (!selectedCourse) {
      setMessage("Please select a valid course.");
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/students`,
        {
          name: name.trim(),
          email: email.trim(),
          course: selectedCourse.name,
        },
        {
          headers: getAuthHeaders(),
        }
      );

      setMessage(
        response.data.message ||
          "Student registered successfully!"
      );
      setMessageType("success");

      setName("");
      setEmail("");
      setCourse("");

      onStudentAdded();
    } catch (error) {
      console.error("Error creating student:", error);

      if (
        axios.isAxiosError(error) &&
        error.response?.status === 401
      ) {
        sessionStorage.removeItem("adminToken");
        window.location.reload();
        return;
      }

      setMessage(
        axios.isAxiosError(error)
          ? error.response?.data?.message ||
              "Registration failed. Please try again."
          : "Something went wrong. Please try again."
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
          Register Student
        </h2>

        <form onSubmit={handleClick} className="space-y-5">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Name
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
              minLength={2}
              maxLength={100}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              maxLength={254}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="course"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Course
            </label>

            <select
              id="course"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              required
              disabled={coursesLoading || courses.length === 0}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">
                {coursesLoading
                  ? "Loading courses..."
                  : courses.length === 0
                    ? "No courses available"
                    : "Select a course"}
              </option>

              {courses.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>

            {coursesError && (
              <p className="mt-2 text-sm text-red-600">
                {coursesError}
              </p>
            )}

            {!coursesLoading &&
              !coursesError &&
              courses.length === 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  Create a course in Course Management first.
                </p>
              )}
          </div>

          <button
            type="submit"
            disabled={
              loading ||
              coursesLoading ||
              courses.length === 0
            }
            className="w-full rounded-lg bg-blue-600 py-2.5 font-medium text-white transition duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {loading ? "Registering..." : "Add Student"}
          </button>
        </form>

        {message && (
          <p
            role="status"
            className={`mt-4 text-center font-medium ${
              messageType === "success"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}