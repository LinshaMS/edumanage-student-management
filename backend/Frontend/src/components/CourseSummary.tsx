
type Student = {
    _id: string;
    course?: string;
};

type CourseSummaryProps = {
    students: Student[];
};

export default function CourseSummary({
    students,
}: CourseSummaryProps) {
    const courseCounts = students.reduce<Record<string, number>>(
        (counts, student) => {
            const courseName = student.course?.trim();

            if (courseName) {
                counts[courseName] = (counts[courseName] ?? 0) + 1;
            }

            return counts;
        },
        {}
    );

    const courses = Object.entries(courseCounts).sort(
        (a, b) => b[1] - a[1]
    );

    const maxCount = Math.max(...courses.map(([, count]) => count), 1);

    return (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-800">
                    Course-wise Enrollment
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                    Number of students enrolled in each course
                </p>
            </div>

            {courses.length === 0 ? (
                <p className="py-8 text-center text-slate-500">
                    No course enrollment data available yet.
                </p>
            ) : (
                <div className="space-y-5">
                    {courses.map(([courseName, count]) => (
                        <div key={courseName}>
                            <div className="mb-2 flex items-center justify-between gap-3">
                                <span className="font-medium text-slate-700">
                                    {courseName}
                                </span>

                                <span className="text-sm text-slate-500">
                                    {count} {count === 1 ? "student" : "students"}
                                </span>
                            </div>

                            <div
                                className="h-3 overflow-hidden rounded-full bg-slate-100"
                                role="progressbar"
                                aria-label={`${courseName} enrollment`}
                                aria-valuemin={0}
                                aria-valuemax={maxCount}
                                aria-valuenow={count}
                            >
                                <div
                                    className="h-full rounded-full bg-blue-600 transition-all duration-500"
                                    style={{
                                        width: `${(count / maxCount) * 100}%`,
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <p className="mt-5 border-t border-slate-100 pt-4 text-sm text-slate-500">
                Total enrolled students:{" "}
                <span className="font-semibold text-slate-800">
                    {courses.reduce((total, [, count]) => total + count, 0)}
                </span>
            </p>
        </section>
    );
}
