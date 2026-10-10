
type StudentStatsProps = {
    totalStudents: number;
    totalCourses: number;
};

export default function StudentStats({
    totalStudents,
    totalCourses,
}: StudentStatsProps) {
    const stats = [
        {
            title: "Total Students",
            value: totalStudents,
            icon: "👨‍🎓",
        },
        {
            title: "Total Courses",
            value: totalCourses,
            icon: "📚",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {stats.map((stat) => (
                <div
                    key={stat.title}
                    className="bg-white rounded-xl shadow p-6 flex items-center gap-4"
                >
                    <div className="text-3xl bg-blue-50 p-4 rounded-lg">
                        {stat.icon}
                    </div>

                    <div>
                        <p className="text-gray-500 text-sm">
                            {stat.title}
                        </p>
                        <p className="text-3xl font-bold text-gray-800">
                            {stat.value}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
