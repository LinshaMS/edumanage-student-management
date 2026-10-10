import { useEffect, useState } from "react";
import axios from "axios";

import CourseSummary from "./components/CourseSummary";
import StudentFom from "./components/StudentFom";
import StudentDetails from "./components/StudentDetails";
import StudentStats from "./components/StudentStats";
import CourseManagement from "./components/CourseManagement";
import Login from "./components/Login";
import ChangePassword from "./components/changePassword";

type Student = {
  _id: string;
  name?: string;
  email?: string;
  course?: string;
};

type Section =
  | "dashboard"
  | "students"
  | "courses"
  | "settings";

const API_URL = "http://localhost:5000/api";

function App() {
  const [token, setToken] = useState<string | null>(() =>
    sessionStorage.getItem("adminToken")
  );

  const [refreshKey, setRefreshKey] = useState(0);
  const [students, setStudents] = useState<Student[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  const [activeSection, setActiveSection] =
    useState<Section>("dashboard");

  const handleLoginSuccess = (newToken: string) => {
    sessionStorage.setItem("adminToken", newToken);
    setToken(newToken);
    setActiveSection("dashboard");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminToken");
    setToken(null);
    setStudents([]);
    setStatsError("");
    setStatsLoading(true);
    setActiveSection("dashboard");
  };

  const handleStudentAdded = () => {
    setRefreshKey((previous) => previous + 1);
  };

  // Fetch dashboard data only when logged in.
  useEffect(() => {
    if (!token) {
      return;
    }

    let cancelled = false;

    const fetchStudents = async () => {
      try {
        setStatsLoading(true);
        setStatsError("");

        const response = await axios.get<Student[]>(
          `${API_URL}/students`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!cancelled) {
          setStudents(
            Array.isArray(response.data) ? response.data : []
          );
        }
      } catch (error) {
        console.error(
          "Failed to fetch dashboard students:",
          error
        );

        if (!cancelled) {
          if (
            axios.isAxiosError(error) &&
            error.response?.status === 401
          ) {
            handleLogout();
          } else {
            setStatsError(
              "Unable to load student statistics. Please check your backend."
            );
          }
        }
      } finally {
        if (!cancelled) {
          setStatsLoading(false);
        }
      }
    };

    void fetchStudents();

    return () => {
      cancelled = true;
    };
  }, [refreshKey, token]);

  // Show login before rendering the dashboard.
  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const normalizedCourses = students
    .map((student) =>
      typeof student.course === "string"
        ? student.course.trim()
        : ""
    )
    .filter((course) => course.length > 0);

  const totalCourses = new Set(
    normalizedCourses.map((course) => course.toLowerCase())
  ).size;

  const recentStudents = students.slice(0, 5);

  const navigation: {
    id: Section;
    label: string;
    icon: string;
  }[] = [
    { id: "dashboard", label: "Dashboard", icon: "▦" },
    { id: "students", label: "Students", icon: "♙" },
    { id: "courses", label: "Courses", icon: "▤" },
    { id: "settings", label: "Settings", icon: "⚙" },
  ];

  const pageTitle: Record<Section, string> = {
    dashboard: "Dashboard Overview",
    students: "Manage Students",
    courses: "Course Management",
    settings: "Admin Settings",
  };

  return (
    <div className="min-h-screen bg-slate-100 md:flex">
      {/* Sidebar */}
      <aside className="bg-slate-900 p-6 text-white md:min-h-screen md:w-64 md:shrink-0">
        <div className="mb-10 flex items-center gap-3">
          <div className="rounded-xl bg-blue-600 p-3 text-xl">
            🎓
          </div>

          <div>
            <h1 className="text-xl font-bold">EduManage</h1>
            <p className="text-xs text-slate-400">
              Student Administration
            </p>
          </div>
        </div>

        <nav className="space-y-2">
          {navigation.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveSection(item.id)}
              aria-current={
                activeSection === item.id ? "page" : undefined
              }
              className={`w-full rounded-lg px-4 py-3 text-left transition ${
                activeSection === item.id
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-10 border-t border-slate-700 pt-5">
          <p className="text-xs text-slate-400">
            STUDENT MANAGEMENT SYSTEM
          </p>

          <p className="mt-2 text-sm text-slate-300">
            Full-stack project
          </p>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-5 w-full rounded-lg border border-slate-600 px-4 py-3 text-left text-slate-200 hover:bg-slate-800"
          >
            ↪ Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-w-0 flex-1 p-5 md:p-8">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">
              Administration /{" "}
              {activeSection.charAt(0).toUpperCase() +
                activeSection.slice(1)}
            </p>

            <h2 className="mt-1 text-3xl font-bold text-slate-800">
              {pageTitle[activeSection]}
            </h2>

            <p className="mt-2 text-slate-500">
              Manage students and course information in one place.
            </p>
          </div>

          {activeSection !== "students" &&
            activeSection !== "settings" && (
              <button
                type="button"
                onClick={() => setActiveSection("students")}
                className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
              >
                + Manage Students
              </button>
            )}
        </header>

        {/* Dashboard error and retry */}
        {statsError && activeSection === "dashboard" && (
          <div
            role="alert"
            className="mb-5 rounded-lg bg-red-50 p-4 text-red-700"
          >
            {statsError}

            <button
              type="button"
              onClick={handleStudentAdded}
              className="ml-3 font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Dashboard */}
        {activeSection === "dashboard" && (
          <>
            <section className="mb-8">
              {statsLoading ? (
                <p className="text-slate-500">
                  Loading statistics...
                </p>
              ) : (
                <StudentStats
                  totalStudents={students.length}
                  totalCourses={totalCourses}
                />
              )}
            </section>

            <section className="mb-8">
              {statsLoading ? (
                <p className="text-slate-500">
                  Loading course enrollment...
                </p>
              ) : (
                <CourseSummary students={students} />
              )}
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">
                    Recently Registered Students
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Recent records from your database
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveSection("students")}
                  className="text-left text-sm font-medium text-blue-600 hover:underline"
                >
                  View all students →
                </button>
              </div>

              {statsLoading ? (
                <p className="py-6 text-slate-500">
                  Loading students...
                </p>
              ) : recentStudents.length === 0 ? (
                <p className="py-8 text-center text-slate-500">
                  No students registered yet. Add your first student
                  from the Students page.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b bg-slate-50 text-sm text-slate-500">
                        <th className="p-3">Name</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Course</th>
                      </tr>
                    </thead>

                    <tbody>
                      {recentStudents.map((student) => (
                        <tr
                          key={student._id}
                          className="border-b last:border-0 hover:bg-slate-50"
                        >
                          <td className="p-3 font-medium text-slate-800">
                            {student.name || "—"}
                          </td>

                          <td className="p-3 text-slate-600">
                            {student.email || "—"}
                          </td>

                          <td className="p-3 text-slate-600">
                            {student.course?.trim() || "Not assigned"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}

        {/* Student Management */}
        {activeSection === "students" && (
          <section className="space-y-8">
            <StudentFom onStudentAdded={handleStudentAdded} />

            <StudentDetails
              refreshKey={refreshKey}
              onStudentsChanged={handleStudentAdded}
            />
          </section>
        )}

        {/* Course Management */}
        {activeSection === "courses" && <CourseManagement />}

        {/* Admin Settings */}
        {activeSection === "settings" && (
          <section>
            <ChangePassword />
          </section>
        )}
      </main>
    </div>
  );
}

export default App;