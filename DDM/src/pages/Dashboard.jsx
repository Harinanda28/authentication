import "../styles/dashboard.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { FolderGit2, Package, AlertTriangle, TrendingUp } from "lucide-react";
import {
  fetchDashboardStats,
  fetchDashboardTrends,
} from "../services/dashboardService";

function Dashboard() {
  const navigate = useNavigate();

  // ── Stats state ──────────────────────────────────────
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalDependencies: 0,
    vulnerableDependencies: 0,
    dependencyDrift: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  // ── Trends state ─────────────────────────────────────
  const [vulnerabilityTrends, setVulnerabilityTrends] = useState([]);
  const [driftTrends, setDriftTrends] = useState([]);
  const [trendsLoading, setTrendsLoading] = useState(true);
  const [trendsError, setTrendsError] = useState(null);

  // ── Fetch data ───────────────────────────────────────
  useEffect(() => {
    const loadData = async () => {
      const [statsResult, trendsResult] = await Promise.allSettled([
        fetchDashboardStats(),
        fetchDashboardTrends(),
      ]);

      // Stats
      if (statsResult.status === "fulfilled") {
        setStats(statsResult.value.data);
      } else {
        console.error("Stats fetch failed:", statsResult.reason);
        setStatsError("Failed to load dashboard stats.");
      }
      setStatsLoading(false);

      // Trends
      if (trendsResult.status === "fulfilled") {
        const { vulnerabilityTrends, dependencyDriftTrends } =
          trendsResult.value.data;

        setVulnerabilityTrends(vulnerabilityTrends || []);
        setDriftTrends(dependencyDriftTrends || []);
      } else {
        console.error("Trends fetch failed:", trendsResult.reason);
        setTrendsError("Failed to load chart data.");
      }
      setTrendsLoading(false);
    };

    loadData();
  }, []);

  // ── Stat cards ───────────────────────────────────────
  const statCards = [
    {
      label: "Total Projects",
      value: stats.totalProjects,
      subtitle: "Active monitored projects",
      icon: <FolderGit2 size={20} />,
      iconClass: "blue-bg",
      subtitleClass: "green-text",
      path: "/projects",
    },
    {
      label: "Total Dependencies",
      value: stats.totalDependencies.toLocaleString(),
      subtitle: "Across all projects",
      icon: <Package size={20} />,
      iconClass: "green-bg",
      subtitleClass: "muted",
      path: "/dependencies",
    },
    {
      label: "Vulnerable Dependencies",
      value: stats.vulnerableDependencies,
      subtitle: "Require attention",
      icon: <AlertTriangle size={20} />,
      iconClass: "red-bg",
      subtitleClass: "red-text",
      path: "/vulnerabilities",
    },
    {
      label: "Dependency Drift Detected",
      value: stats.dependencyDrift,
      subtitle: "Updates available",
      icon: <TrendingUp size={20} />,
      iconClass: "orange-bg",
      subtitleClass: "orange-text",
      path: "/dependencies",
    },
  ];

  return (
    <div className="dashboard-content">
      {/* ── Top Bar ── */}
      <div className="dashboard-top">
        <div className="top-left">
          <div className="title-block">
            <h1>Dashboard</h1>
            <p>Overview of your dependency security status</p>
          </div>
        </div>
        
      </div>

      {/* ── Error Banner ── */}
      {statsError && <div className="error-banner">⚠️ {statsError}</div>}

      {/* ── Stat Cards ── */}
      <div className="stats-row">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="stat-card clickable"
            onClick={() => navigate(card.path)}
            title={`Go to ${card.label}`}
          >
            <div className={`stat-icon ${card.iconClass}`}>
              {card.icon}
            </div>
            <div className="stat-text">
              <h4>{card.label}</h4>
              {statsLoading ? (
                <h2 className="stat-loading">—</h2>
              ) : (
                <h2>{card.value}</h2>
              )}
              <span className={card.subtitleClass}>
                {card.subtitle}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts ── */}
      <div className="charts-row">

        {/* Vulnerability Chart */}
        <div className="chart-card">
          <h3>Vulnerability Trends</h3>

          {trendsError ? (
            <div className="chart-error">{trendsError}</div>
          ) : trendsLoading ? (
            <div className="chart-skeleton" />
          ) : vulnerabilityTrends.length === 0 ? (
            <div className="chart-empty">
              No vulnerability data found.
            </div>
          ) : (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vulnerabilityTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="critical" fill="#ef4444" />
                  <Bar dataKey="high" fill="#f97316" />
                  <Bar dataKey="medium" fill="#facc15" />
                  <Bar dataKey="low" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Drift Chart */}
        <div className="chart-card">
          <h3>Dependency Drift Trends</h3>

          {trendsError ? (
            <div className="chart-error">{trendsError}</div>
          ) : trendsLoading ? (
            <div className="chart-skeleton" />
          ) : driftTrends.length === 0 ? (
            <div className="chart-empty">
              No drift data found.
            </div>
          ) : (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={driftTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="drift"
                    stroke="#f97316"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;