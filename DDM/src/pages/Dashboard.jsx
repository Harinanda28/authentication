import "../styles/dashboard.css";
import { useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

//ICONS
import {
  FolderGit2,
  Package,
  AlertTriangle,
  TrendingUp
} from "lucide-react";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const [selectedProject, setSelectedProject] = useState("All Projects");

  const projects = [
    "All Projects",
    "react-app",
    "api-service",
    "frontend-dashboard",
    "mobile-app",
  ];

  // Vulnerability Trends (Stacked Bar)
  const vulnerabilityData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
      {
        label: "Critical",
        data: [8, 6, 5, 4, 3],
        backgroundColor: "#ef4444",
      },
      {
        label: "High",
        data: [10, 9, 7, 6, 5],
        backgroundColor: "#f97316",
      },
      {
        label: "Medium",
        data: [18, 15, 12, 10, 8],
        backgroundColor: "#facc15",
      },
      {
        label: "Low",
        data: [24, 20, 18, 15, 12],
        backgroundColor: "#22c55e",
      },
    ],
  };

  const vulnerabilityOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: { display: false },
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true, beginAtZero: true },
    },
  };

  // Drift Trends (Line)
  const driftData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
      {
        label: "Drift",
        data: [45, 40, 35, 30, 25],
        borderColor: "#f97316",
        backgroundColor: "#f97316",
        tension: 0.3,
      },
    ],
  };

  const driftOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: { display: false },
    },
    scales: {
      y: { min: 0, max: 60 },
    },
  };

  return (
    <div className="dashboard-content">
      {/* Top Bar */}
      <div className="dashboard-top">
        <div className="top-left">
          <div className="title-block">
            <h1>Dashboard</h1>
            <p>Overview of your dependency security status</p>
          </div>
        </div>

        <div className="top-right">
          <button className="scan-btn">⟳ Scan All Projects</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon blue-bg">
            <FolderGit2 size={20} />
          </div>
          <div className="stat-text">
            <h4>Total Projects</h4>
            <h2>24</h2>
            <span className="green-text">↑ 3 new this month</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green-bg">
            <Package size={20} />
          </div>
          <div className="stat-text">
            <h4>Total Dependencies</h4>
            <h2>1,248</h2>
            <span className="muted">Across all projects</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red-bg">
            <AlertTriangle size={20} />
          </div>
          <div className="stat-text">
            <h4>Vulnerable Dependencies</h4>
            <h2>32</h2>
            <span className="red-text">5 critical issues</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange-bg">
            <TrendingUp size={20} />
          </div>
          <div className="stat-text">
            <h4>Dependency Drift Detected</h4>
            <h2>28</h2>
            <span className="orange-text">Updates available</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-row">
        <div className="chart-card">
          <h3>Vulnerability Trends</h3>
          <div className="chart-container">
            <Bar data={vulnerabilityData} options={vulnerabilityOptions} />
          </div>
        </div>

        <div className="chart-card">
          <h3>Dependency Drift Trends</h3>
          <div className="chart-container">
            <Line data={driftData} options={driftOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
