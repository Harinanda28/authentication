import { useState, useEffect } from "react";
import "../styles/alerts.css";

const API_BASE = "http://localhost:5000";

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch alerts from the backend
  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE}/api/vulnerability/alert`);
      if (!response.ok) {
        throw new Error(`Failed to fetch alerts (status ${response.status})`);
      }
      const data = await response.json();
      setAlerts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Resolve an alert
  const handleResolve = async (alertId) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/vulnerability/alert/${alertId}/resolve`,
        { method: "PUT" }
      );
      if (!response.ok) {
        throw new Error(`Failed to resolve alert (status ${response.status})`);
      }
      // Update local state so the card reflects RESOLVED immediately
      setAlerts((prev) =>
        prev.map((a) =>
          a.alert_id === alertId ? { ...a, alert_status: "RESOLVED" } : a
        )
      );
    } catch (err) {
      alert("Error resolving alert: " + err.message);
    }
  };

  // Dynamic statistics
  const totalAlerts = alerts.length;
  const openAlerts = alerts.filter((a) => a.alert_status === "OPEN").length;
  const resolvedAlerts = alerts.filter(
    (a) => a.alert_status === "RESOLVED"
  ).length;

  // Filtered alerts
  const filteredAlerts =
    filter === "ALL"
      ? alerts
      : alerts.filter((a) => a.alert_status === filter);

  // Helper: badge class based on priority
  const getBadgeClass = (priority) => {
    switch (priority?.toUpperCase()) {
      case "CRITICAL":
        return "critical";
      case "HIGH":
        return "warning";
      default:
        return "success";
    }
  };

  // Helper: format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins} minutes ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  return (
    <div className="page-wrapper">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Alerts</h1>
          <p>Monitor and manage security alerts</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="alerts-stats">

        <div className="stat-card">
          <p>Total Alerts</p>
          <h2>{totalAlerts}</h2>
        </div>

        <div className="stat-card">
          <p>Open</p>
          <h2 className="orange">{openAlerts}</h2>
        </div>

        <div className="stat-card">
          <p>Resolved</p>
          <h2 className="green">{resolvedAlerts}</h2>
        </div>

      </div>

      {/* Filter */}
      <div className="alerts-filter">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="ALL">All Alerts</option>
          <option value="OPEN">Open</option>
          <option value="RESOLVED">Resolved</option>
        </select>
      </div>

      {/* Loading State */}
      {loading && <p>Loading alerts...</p>}

      {/* Error State */}
      {error && (
        <p style={{ color: "#dc2626" }}>
          Error: {error}{" "}
          <button onClick={fetchAlerts} className="resolve-btn">
            Retry
          </button>
        </p>
      )}

      {/* Alert Cards */}
      {!loading && !error && (
        <div className="alerts-list">
          {filteredAlerts.length === 0 && <p>No alerts found.</p>}

          {filteredAlerts.map((alert) => (
            <div
              key={alert.alert_id}
              className={`alert-card ${alert.alert_status === "RESOLVED" ? "resolved" : "open"
                }`}
            >
              <div className="alert-header">
                <div>
                  <h3>
                    {alert.dependency_name}{" "}
                    <span className="cve-tag">{alert.cve_id}</span>
                  </h3>
                  <p>
                    Project: <strong>{alert.project_name}</strong> &nbsp;|&nbsp;
                    Alert #{alert.alert_id}
                  </p>
                </div>
                <span
                  className={`badge ${alert.alert_status === "RESOLVED"
                      ? "success"
                      : getBadgeClass(alert.priority_level)
                    }`}
                >
                  {alert.alert_status}
                </span>
              </div>

              <p className="alert-description">
                {alert.summary || "No description available"}
              </p>

              <div className="alert-details">
                <span>Severity: <strong>{alert.severity || alert.priority_level}</strong></span>
                <span>Risk Score: <strong>{alert.risk_score}</strong></span>
                <span>Priority: <strong>{alert.priority_level}</strong></span>
              </div>

              <div className="alert-footer">
                <span>{formatDate(alert.created_at)}</span>
                {alert.alert_status !== "RESOLVED" && (
                  <button
                    className="resolve-btn"
                    onClick={() => handleResolve(alert.alert_id)}
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default Alerts;
