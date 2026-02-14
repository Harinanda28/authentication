import "../styles/alerts.css";

function Alerts() {
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
          <h2>6</h2>
        </div>

        <div className="stat-card">
          <p>Open</p>
          <h2 className="orange">4</h2>
        </div>

        <div className="stat-card">
          <p>Resolved</p>
          <h2 className="green">2</h2>
        </div>

      </div>

      {/* Filter */}
      <div className="alerts-filter">
        <select>
          <option>All Alerts</option>
          <option>Open</option>
          <option>Resolved</option>
        </select>
      </div>

      {/* Alert Cards */}

      <div className="alerts-list">

        {/* Alert 1 */}
        <div className="alert-card open">
          <div className="alert-header">
            <div>
              <h3>Critical vulnerability detected</h3>
              <p>lodash in react-app</p>
            </div>
            <span className="badge critical">OPEN</span>
          </div>

          <p className="alert-description">
            A critical security issue was found in lodash dependency.
          </p>

          <div className="alert-footer">
            <span>2 hours ago</span>
            <button className="resolve-btn">Resolve</button>
          </div>
        </div>

        {/* Alert 2 */}
        <div className="alert-card open">
          <div className="alert-header">
            <div>
              <h3>Version drift detected</h3>
              <p>react in frontend-dashboard</p>
            </div>
            <span className="badge warning">OPEN</span>
          </div>

          <p className="alert-description">
            New version available for React dependency.
          </p>

          <div className="alert-footer">
            <span>5 hours ago</span>
            <button className="resolve-btn">Resolve</button>
          </div>
        </div>

        {/* Alert 3 */}
        <div className="alert-card resolved">
          <div className="alert-header">
            <div>
              <h3>Medium severity vulnerability resolved</h3>
              <p>moment in mobile-app</p>
            </div>
            <span className="badge success">RESOLVED</span>
          </div>

          <p className="alert-description">
            The vulnerability has been patched successfully.
          </p>

          <div className="alert-footer">
            <span>2 days ago</span>
          </div>
        </div>

      </div>

    </div>
  );
}

export default Alerts;
