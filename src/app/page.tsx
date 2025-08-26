"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  Brush,
} from "recharts";

import React from "react";

const COLORS = ["#4A90E2", "#F43F5E", "#22C55E", "#F59E0B", "#8B5CF6"];

type DashboardData = {
  counts: { students: number; teachers: number; courses: number; enrollmentsActive: number; attendanceRecords: number };
  attendanceLast7Days: { date: string; present: number; absent: number; late: number; excused: number; total: number; ratePresent: number }[];
  topCoursesByEnrollment: { courseId: string; name: string; count: number }[];
  teacherCourseCounts: { teacherId: string; name: string; email: string; courseCount: number }[];
  recent: { students: any[]; teachers: any[]; courses: any[]; attendance: any[] };
};

export default function DashboardPage() {
  const [data, setData] = React.useState<DashboardData | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let abort = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/dashboard", { cache: "no-store" });
        if (!res.ok) throw new Error(`Dashboard load failed (${res.status})`);
        const j = (await res.json()) as DashboardData;
        if (!abort) setData(j);
      } catch (e: any) {
        if (!abort) setError(e?.message || "Failed to load dashboard");
      } finally {
        if (!abort) setLoading(false);
      }
    }
    load();
    return () => {
      abort = true;
    };
  }, []);

  const stats = React.useMemo(() => {
    if (!data) return [] as { label: string; value: React.ReactNode }[];
    const presentTotal = data.attendanceLast7Days.reduce((a, d) => a + d.present, 0);
    const totalMarks = data.attendanceLast7Days.reduce((a, d) => a + d.total, 0);
    const rate = totalMarks > 0 ? Math.round((presentTotal / totalMarks) * 100) : 0;
    return [
      { label: "Total Students", value: data.counts.students },
      { label: "Total Teachers", value: data.counts.teachers },
      { label: "Total Courses", value: data.counts.courses },
      { label: "Attendance Rate (7d)", value: `${rate}%` },
    ];
  }, [data]);

  const lineData = React.useMemo(() => {
    return (data?.attendanceLast7Days || []).map((d) => ({ date: d.date.slice(5), rate: Math.round(d.ratePresent * 100) }));
  }, [data]);

  const pieData = React.useMemo(() => {
    // Use top courses by enrollment for the pie
    return (data?.topCoursesByEnrollment || []).map((c) => ({ name: c.name, value: c.count }));
  }, [data]);

  const barData = React.useMemo(() => {
    // Student/Teacher counts
    return data
      ? [
          { name: "Students", value: data.counts.students },
          { name: "Teachers", value: data.counts.teachers },
        ]
      : [];
  }, [data]);

  // Stacked daily status breakdown (last 7 days)
  const stackedDaily = React.useMemo(() => {
    return (data?.attendanceLast7Days || []).map((d) => ({
      date: d.date.slice(5),
      present: d.present,
      absent: d.absent,
      late: d.late,
      excused: d.excused,
    }));
  }, [data]);

  // Today's composition donut (use last day in series)
  const todayDonut = React.useMemo(() => {
    const last = data?.attendanceLast7Days?.[data.attendanceLast7Days.length - 1];
    if (!last) return [] as { name: string; value: number }[];
    return [
      { name: "Present", value: last.present },
      { name: "Absent", value: last.absent },
      { name: "Late", value: last.late },
      { name: "Excused", value: last.excused },
    ];
  }, [data]);

  // Top teachers by course load
  const teacherBar = React.useMemo(() => {
    return (data?.teacherCourseCounts || []).map((t) => ({ name: t.name, value: t.courseCount }));
  }, [data]);

  return (
    <div className="space-y-6">
      {error && <div className="rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(loading ? [{ label: "Loading...", value: "" }] : stats).map((s) => (
          <div key={s.label} className="card p-4 card-hover">
            <div className="text-sm text-neutral-500">{s.label}</div>
            <div className="text-2xl font-semibold mt-2">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="card p-4">
          <div className="font-semibold mb-2">Attendance Trend (Last 7 days)</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="rate" stroke="#4A90E2" strokeWidth={2} />
                <Brush dataKey="date" height={16} travellerWidth={8} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4">
          <div className="font-semibold mb-2">Top Courses by Enrollment</div>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} label>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4">
          <div className="font-semibold mb-2">Student/Teacher Ratio</div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#F43F5E" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* New visualizations row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="card p-4">
          <div className="font-semibold mb-2">Daily Attendance Breakdown (7d)</div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={stackedDaily}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" stackId="a" fill="#22C55E" />
                <Bar dataKey="late" stackId="a" fill="#F59E0B" />
                <Bar dataKey="excused" stackId="a" fill="#8B5CF6" />
                <Bar dataKey="absent" stackId="a" fill="#F43F5E" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4">
          <div className="font-semibold mb-2">Today's Attendance Composition</div>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={todayDonut} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>
                  {todayDonut.map((entry, index) => (
                    <Cell key={`td-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4">
          <div className="font-semibold mb-2">Top Teachers by Course Load</div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={teacherBar} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={140} />
                <Tooltip />
                <Bar dataKey="value" fill="#4A90E2" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <div className="font-semibold mb-2">Recent Activity</div>
        <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
          {loading && <li>Loading...</li>}
          {!loading && data && data.recent.attendance.slice(0, 5).map((r: any) => {
            const d = new Date(r.date);
            const course = r.course?.name || r.course || "Course";
            const student = r.student?.name || r.student?.email || r.student || "Student";
            return (
              <li key={r._id}>
                {d.toLocaleDateString()} • {course} • {student} • {String(r.status).toUpperCase()}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
