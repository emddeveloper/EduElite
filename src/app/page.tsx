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
} from "recharts";

const stats = [
  { label: "Total Students", value: 16 },
  { label: "Total Teachers", value: 3 },
  { label: "Total Courses", value: 4 },
  { label: "Attendance Rate", value: "92%" },
];

const attendanceTrend = [
  { month: "Jan", rate: 90 },
  { month: "Feb", rate: 92 },
  { month: "Mar", rate: 88 },
  { month: "Apr", rate: 94 },
  { month: "May", rate: 91 },
  { month: "Jun", rate: 95 },
];

const gradeDist = [
  { name: "A", value: 35 },
  { name: "B", value: 28 },
  { name: "C", value: 22 },
  { name: "D", value: 10 },
  { name: "F", value: 5 },
];

const ratio = [
  { name: "Students", value: 16 },
  { name: "Teachers", value: 3 },
];

const COLORS = ["#4A90E2", "#F43F5E", "#22C55E", "#F59E0B", "#8B5CF6"];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-4 card-hover">
            <div className="text-sm text-neutral-500">{s.label}</div>
            <div className="text-2xl font-semibold mt-2">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="card p-4">
          <div className="font-semibold mb-2">Monthly Attendance Trend</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="rate" stroke="#4A90E2" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4">
          <div className="font-semibold mb-2">Grade Distribution</div>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={gradeDist} dataKey="value" nameKey="name" outerRadius={90} label>
                  {gradeDist.map((entry, index) => (
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
              <BarChart data={ratio}>
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

      <div className="card p-4">
        <div className="font-semibold mb-2">Recent Activity</div>
        <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
          <li>New student &quot;Alice Johnson&quot; enrolled to Grade 8</li>
          <li>Math assignment grades updated in Algebra I</li>
          <li>Attendance marked for Science - 2025-08-26</li>
        </ul>
      </div>
    </div>
  );
}
