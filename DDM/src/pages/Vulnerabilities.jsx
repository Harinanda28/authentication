import "../styles/vulnerabilities.css";

function Vulnerabilities() {
  return (
    <div className="page-wrapper">

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Vulnerabilities</h1>
          <p>Known security vulnerabilities across all projects</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="vuln-stats">

        <div className="stat-card">
          <p>Total</p>
          <h2>11</h2>
        </div>

        <div className="stat-card">
          <p>Critical</p>
          <h2 className="red">3</h2>
        </div>

        <div className="stat-card">
          <p>High</p>
          <h2 className="orange">4</h2>
        </div>

        <div className="stat-card">
          <p>Medium</p>
          <h2 className="yellow">2</h2>
        </div>

        <div className="stat-card">
          <p>Low</p>
          <h2 className="green">2</h2>
        </div>

      </div>

      {/* Search + Filter */}
      <div className="vuln-controls">
        <input placeholder="Search vulnerabilities..." />
        <select>
          <option>All Severity</option>
        </select>
      </div>

      {/* Vulnerability Cards */}
      <div className="vuln-list">

        {/* Card 1 */}
        <div className="vuln-card">
          <div className="vuln-header">
            <div>
              <h3>CVE-2024-1234</h3>
              <p>lodash • react-app</p>
            </div>
            <span className="badge critical">CRITICAL</span>
          </div>

          <p className="vuln-description">
            Prototype pollution vulnerability in lodash versions prior to 4.17.21.
          </p>

          <div className="vuln-footer">
            <span>Discovered 2 days ago</span>
            <button className="resolve-btn">View Details</button>
          </div>
        </div>

        {/* Card 2 */}
        <div className="vuln-card">
          <div className="vuln-header">
            <div>
              <h3>CVE-2024-5678</h3>
              <p>express • api-service</p>
            </div>
            <span className="badge high">HIGH</span>
          </div>

          <p className="vuln-description">
            Denial of service vulnerability in Express.js middleware chain.
          </p>

          <div className="vuln-footer">
            <span>Discovered 5 days ago</span>
            <button className="resolve-btn">View Details</button>
          </div>
        </div>

        {/* Card 3 */}
        <div className="vuln-card">
          <div className="vuln-header">
            <div>
              <h3>CVE-2024-7890</h3>
              <p>moment • mobile-app</p>
            </div>
            <span className="badge medium">MEDIUM</span>
          </div>

          <p className="vuln-description">
            Improper input validation leading to unexpected behavior.
          </p>

          <div className="vuln-footer">
            <span>Discovered 1 week ago</span>
            <button className="resolve-btn">View Details</button>
          </div>
        </div>

      </div>

    </div>
  );
}

export default Vulnerabilities;
