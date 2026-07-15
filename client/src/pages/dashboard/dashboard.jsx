import React from "react";
import { useGlobalAnalyticsQuery } from "../../hooks/analytics/useAnalytics.js";
import { Loader } from "../../components/skeleton/loader.jsx";
import { Folder, CheckSquare, Users, Percent, AlertCircle, BarChart2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid
} from "recharts";

const COLORS = ["#f59e0b", "#3b82f6", "#10b981"]; // TODO (amber), IN PROGRESS (blue), COMPLETED (emerald)
const PRIORITY_COLORS = {
    HIGH: "#ef4444",
    MEDIUM: "#f59e0b",
    LOW: "#10b981"
};

export function Dashboard() {
    const { data, isLoading, error } = useGlobalAnalyticsQuery();
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <div className="w-full h-[60vh] flex items-center justify-center">
                <Loader className="w-12 h-12" />
            </div>
        );
    }

    if (error || !data || !data.success) {
        return (
            <div className="w-full max-w-2xl mx-auto mt-12 p-8 text-center bg-red-500/10 border border-red-500/20 rounded-2xl">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-red-600 dark:text-red-400">Failed to load workspace analytics</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                    {error?.message || "An unexpected error occurred while fetching workspace analytics."}
                </p>
            </div>
        );
    }

    const { summary, projectsBreakdown, taskStatusDistribution, taskPriorityDistribution } = data.data;

    const priorityData = taskPriorityDistribution.map(item => ({
        name: item.name,
        count: item.count,
        fill: PRIORITY_COLORS[item.name] || "#6366f1"
    }));

    return (
        <div className="w-full max-w-7xl mx-auto px-6 py-8 md:px-8 md:py-10 space-y-8 flex flex-col text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-900/60">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white md:text-3xl">
                        Workspace Dashboard
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Visual summary and performance metrics across all your active project workspaces.
                    </p>
                </div>
            </div>

            {summary.totalProjects === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-900 bg-slate-50 dark:bg-slate-950/20 max-w-lg mx-auto mt-8">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-500 dark:text-slate-400 mb-4">
                        <Folder className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">No active projects</h3>
                    <p className="text-sm text-slate-500 mt-1 max-w-xs">
                        Go to the Projects tab to create or join a project workspace first.
                    </p>
                    <button
                        onClick={() => navigate("/allprojects")}
                        className="mt-5 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                    >
                        Go to Projects
                    </button>
                </div>
            ) : (
                <>
                    {/* Summary KPI Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Total Projects Card */}
                        <div className="p-6 rounded-2xl bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 flex items-center justify-between shadow-md">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Projects</p>
                                <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{summary.totalProjects}</h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400">Active workspaces</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                                <Folder className="w-6 h-6" />
                            </div>
                        </div>

                        {/* Total Tasks Card */}
                        <div className="p-6 rounded-2xl bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 flex items-center justify-between shadow-md">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tasks</p>
                                <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{summary.totalTasks}</h3>
                                <p className="text-xs text-slate-650 dark:text-slate-400">Assigned across projects</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                <CheckSquare className="w-6 h-6" />
                            </div>
                        </div>

                        {/* Completion Rate Card */}
                        <div className="p-6 rounded-2xl bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 flex items-center justify-between shadow-md">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completion Rate</p>
                                <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{summary.overallCompletionRate}%</h3>
                                <p className="text-xs text-slate-650 dark:text-slate-400">Average progress</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <Percent className="w-6 h-6" />
                            </div>
                        </div>

                        {/* Active Members Card */}
                        <div className="p-6 rounded-2xl bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 flex items-center justify-between shadow-md">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Workspace Members</p>
                                <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{summary.totalMembersCount}</h3>
                                <p className="text-xs text-slate-650 dark:text-slate-400">Unique collaborators</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                <Users className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Task Status Donut */}
                        <div className="p-6 rounded-2xl bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 shadow-md flex flex-col">
                            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-6">Task Status Breakdown</h3>
                            {summary.totalTasks === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-450 dark:text-slate-500">
                                    <BarChart2 className="w-12 h-12 stroke-[1.5] mb-2" />
                                    <p className="text-sm">No tasks assigned to analyze.</p>
                                </div>
                            ) : (
                                <div className="h-72 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={taskStatusDistribution}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={0}
                                                dataKey="value"
                                            >
                                                {taskStatusDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                                                    borderRadius: "12px",
                                                    border: "none",
                                                    color: "#fff"
                                                }}
                                            />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>

                        {/* Task Priority Bar */}
                        <div className="p-6 rounded-2xl bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 shadow-md flex flex-col">
                            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-6">Task Priority Distribution</h3>
                            {summary.totalTasks === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-450 dark:text-slate-500">
                                    <BarChart2 className="w-12 h-12 stroke-[1.5] mb-2" />
                                    <p className="text-sm">No tasks assigned to analyze.</p>
                                </div>
                            ) : (
                                <div className="h-72 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                                            <XAxis dataKey="name" tick={{ fill: "currentColor", fontSize: 12 }} />
                                            <YAxis tick={{ fill: "currentColor", fontSize: 12 }} allowDecimals={false} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                                                    borderRadius: "12px",
                                                    border: "none",
                                                    color: "#fff"
                                                }}
                                                cursor={{ fill: "rgba(148, 163, 184, 0.05)" }}
                                            />
                                            <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={40}>
                                                {priorityData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Projects Progress List */}
                    <div className="p-6 rounded-2xl bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 shadow-md">
                        <h3 className="text-base font-bold text-slate-800 dark:text-white mb-6">Workspace Project Progress</h3>
                        <div className="space-y-4">
                            {projectsBreakdown.map((p) => (
                                <div
                                    key={p.projectId}
                                    onClick={() => navigate(`/project/${p.projectId}`)}
                                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 hover:bg-slate-100/50 dark:hover:bg-slate-900/30 transition-colors cursor-pointer shadow-sm"
                                >
                                    <div className="min-w-0 md:w-1/3">
                                        <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                                            {p.projectName}
                                        </span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">
                                            {p.memberCount} team members
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-full bg-slate-100 dark:bg-slate-900/60 rounded-full h-2">
                                            <div
                                                className="bg-violet-600 dark:bg-violet-500 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${p.completionRate}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-10 text-right">
                                            {p.completionRate}%
                                        </span>
                                    </div>

                                    <span className="text-xs text-slate-650 dark:text-slate-400 w-28 md:text-right font-medium">
                                        {p.completedTasks} / {p.totalTasks} tasks done
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
export default Dashboard;