import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProjectAnalyticsQuery } from "../../hooks/analytics/useAnalytics.js";
import useProjectSocket from "../../hooks/sockets/useProjectSocket.js";
import { Loader } from "../../components/skeleton/loader.jsx";
import { ArrowLeft, CheckSquare, Layers, Users, AlertCircle, BarChart2 } from "lucide-react";
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

const ProjectAnalytics = () => {
  const { projectId } = useParams();
  useProjectSocket(projectId);
  const navigate = useNavigate();
  const { data, isLoading, error } = useProjectAnalyticsQuery(projectId);
  const [viewMode, setViewMode] = useState("personal"); // 'team' or 'personal'

  useEffect(() => {
    if (data && data.success) {
      if (data.data.role === "ADMIN" || data.data.role === "PROJECT_MANAGER") {
        setViewMode("team");
      } else {
        setViewMode("personal");
      }
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <Loader className="w-12 h-12" />
      </div>
    );
  }

  if (error || !data || !data.success) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-12 p-8 text-center bg-red-500/10 border border-red-500/20 rounded-2xl animate-fade-in">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-red-600 dark:text-red-400">Failed to load analytics</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
          {error?.message || "An unexpected error occurred while fetching project analytics."}
        </p>
        <button
          onClick={() => navigate(`/project/${projectId}`)}
          className="mt-6 px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
        >
          Back to Project Dashboard
        </button>
      </div>
    );
  }

  const { projectName, role, personal, team, projectOverallProgress } = data.data;
  const isManager = role === "ADMIN" || role === "PROJECT_MANAGER";

  // Helper for Circular progress SVG
  const renderCircularProgress = (percentage, colorClass, size = 64) => {
    const radius = 26;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-slate-100 dark:stroke-slate-900"
            strokeWidth="5"
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={`stroke-current ${colorClass}`}
            strokeWidth="5"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-xs font-bold text-slate-800 dark:text-slate-200">{percentage}%</span>
      </div>
    );
  };

  // Prepare current viewing stats
  const activeStats = viewMode === "team" && team ? team : personal;

  const priorityData = activeStats.taskPriorityDistribution.map(item => ({
    name: item.name,
    count: item.count,
    fill: PRIORITY_COLORS[item.name] || "#6366f1"
  }));

  const workloadData = viewMode === "team" && team?.memberWorkload
    ? team.memberWorkload.map(item => ({
      email: item.email.split("@")[0],
      fullEmail: item.email,
      tasks: item.taskCount
    })).sort((a, b) => b.tasks - a.tasks)
    : [];

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8 md:px-8 md:py-10 space-y-8 flex flex-col text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-900/60">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/project/${projectId}`)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-all duration-200 cursor-pointer shadow-sm"
            title="Back to Project"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white md:text-3xl">
              {projectName} Insights
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Role: <span className="font-semibold text-violet-600 dark:text-violet-400 uppercase text-xs px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20">{role.replace("_", " ")}</span>
            </p>
          </div>
        </div>

        {/* View mode toggle (Managers only) */}
        {isManager && (
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/60 self-start sm:self-auto shadow-sm">
            <button
              onClick={() => setViewMode("team")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${viewMode === "team"
                  ? "bg-white dark:bg-slate-950 text-violet-600 dark:text-violet-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-450 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
            >
              Team Analytics
            </button>
            <button
              onClick={() => setViewMode("personal")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${viewMode === "personal"
                  ? "bg-white dark:bg-slate-950 text-violet-600 dark:text-violet-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-450 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
            >
              My Contributions
            </button>
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Task Completion Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 flex items-center justify-between shadow-md">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {viewMode === "team" ? "Project Tasks" : "My Tasks"}
            </p>
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white">
              {activeStats.summary.completedTasks} / {activeStats.summary.totalTasks}
            </h3>
            <p className="text-xs text-slate-550 dark:text-slate-400">Completed tasks</p>
          </div>
          {renderCircularProgress(activeStats.summary.completionRate, "text-violet-600 dark:text-violet-400")}
        </div>

        {/* Dynamic Card 2 */}
        {viewMode === "team" && team ? (
          /* Subtask Progress Card for Team */
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 flex items-center justify-between shadow-md">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subtask Progress</p>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white">
                {team.summary.completedSubtasks} / {team.summary.totalSubtasks}
              </h3>
              <p className="text-xs text-slate-550 dark:text-slate-400">Completed subtasks</p>
            </div>
            {renderCircularProgress(team.summary.subtaskCompletionRate, "text-emerald-600 dark:text-emerald-400")}
          </div>
        ) : (
          /* Overall Project Progress (context card) for Personal View */
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 flex items-center justify-between shadow-md">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overall Project Progress</p>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white">
                {isManager && team ? team.summary.completionRate : projectOverallProgress}%
              </h3>
              <p className="text-xs text-slate-550 dark:text-slate-400">Team progress benchmark</p>
            </div>
            {renderCircularProgress(
              isManager && team ? team.summary.completionRate : (projectOverallProgress || 0),
              "text-blue-600 dark:text-blue-400"
            )}
          </div>
        )}

        {/* Dynamic Card 3 (Team Size / Active Roles) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 flex items-center justify-between shadow-md">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {viewMode === "team" ? "Team Size" : "My Active Tasks"}
            </p>
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white">
              {viewMode === "team" && team ? team.summary.totalMembers : activeStats.summary.totalTasks - activeStats.summary.completedTasks}
            </h3>
            <p className="text-xs text-slate-550 dark:text-slate-400">
              {viewMode === "team" ? "Active team members" : "Tasks in progress/todo"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            {viewMode === "team" ? <Users className="w-6 h-6" /> : <Layers className="w-6 h-6" />}
          </div>
        </div>

        {/* Overdue Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 flex items-center justify-between shadow-md">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overdue Tasks</p>
            <h3 className={`text-3xl font-bold ${activeStats.summary.overdueTasks > 0 ? "text-red-500 animate-pulse" : "text-slate-800 dark:text-white"}`}>
              {activeStats.summary.overdueTasks}
            </h3>
            <p className="text-xs text-slate-550 dark:text-slate-400">
              {viewMode === "team" ? "Total overdue tasks" : "Assigned to me & overdue"}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${activeStats.summary.overdueTasks > 0 ? "bg-red-500/10 text-red-600" : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400"}`}>
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Task Status Donut */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 shadow-md flex flex-col">
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-6">
            {viewMode === "team" ? "Project Task Status Breakdown" : "My Task Status Breakdown"}
          </h3>
          {activeStats.summary.totalTasks === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
              <CheckSquare className="w-12 h-12 stroke-[1.5] mb-2" />
              <p className="text-sm">No tasks assigned to display.</p>
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activeStats.taskStatusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {activeStats.taskStatusDistribution.map((entry, index) => (
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
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-6">
            {viewMode === "team" ? "Project Task Priority Overview" : "My Task Priority Overview"}
          </h3>
          {activeStats.summary.totalTasks === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
              <BarChart2 className="w-12 h-12 stroke-[1.5] mb-2" />
              <p className="text-sm">No tasks assigned to display.</p>
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

      {/* Team Workload Section (Only rendered in Team view) */}
      {viewMode === "team" && team && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 shadow-md">
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-6">Team Workload Distribution</h3>
          {workloadData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
              <Users className="w-12 h-12 stroke-[1.5] mb-2" />
              <p className="text-sm">No members added or tasks assigned yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={workloadData}
                    layout="vertical"
                    margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(148, 163, 184, 0.1)" />
                    <XAxis type="number" allowDecimals={false} tick={{ fill: "currentColor", fontSize: 11 }} />
                    <YAxis
                      dataKey="email"
                      type="category"
                      tick={{ fill: "currentColor", fontSize: 11 }}
                      width={80}
                    />
                    <Tooltip
                      formatter={(value) => [`${value} Tasks`, "Workload"]}
                      labelFormatter={(label, items) => items[0]?.payload?.fullEmail || label}
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.95)",
                        borderRadius: "12px",
                        border: "none",
                        color: "#fff"
                      }}
                      cursor={{ fill: "rgba(148, 163, 184, 0.05)" }}
                    />
                    <Bar dataKey="tasks" fill="#8b5cf6" radius={[0, 8, 8, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* List breakdown */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Workload breakdown</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 animate-fade-in">
                  {team.memberWorkload.map((m) => (
                    <div key={m.email} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-900/50">
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate" title={m.email}>
                          {m.email}
                        </p>
                      </div>
                      <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 animate-fade-in">
                        {m.taskCount} {m.taskCount === 1 ? "task" : "tasks"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectAnalytics;
