import "../styles/dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard-content">

      {/* Header */}
      <div className="dashboard-top">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of your dependency security status</p>
        </div>

        <button className="scan-btn">
          ⟳ Scan All Projects
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-row">

        <div className="stat-card">
          <div className="icon blue"></div>
          <h4>Total Projects</h4>
          <h2>24</h2>
          <span className="green-text">↑ 3 new this month</span>
        </div>

        <div className="stat-card">
          <div className="icon green"></div>
          <h4>Total Dependencies</h4>
          <h2>1,248</h2>
          <span className="muted">Across all projects</span>
        </div>

        <div className="stat-card">
          <div className="icon red"></div>
          <h4>Vulnerable Dependencies</h4>
          <h2>32</h2>
          <span className="red-text">5 critical issues</span>
        </div>

        <div className="stat-card">
          <div className="icon orange"></div>
          <h4>Dependency Drift Detected</h4>
          <h2>28</h2>
          <span className="orange-text">Updates available</span>
        </div>

      </div>

      {/* Charts Row */}
      <div className="charts-row">

        <div className="chart-card">
          <h3>Vulnerability Trends</h3>
          <div className="chart-placeholder"></div>
        </div>

        <div className="chart-card">
          <h3>Dependency Drift Trends</h3>
          <div className="chart-placeholder"></div>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;
