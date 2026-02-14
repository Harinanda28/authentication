import "../styles/settings.css";

function Settings() {
  return (
    <div className="page-wrapper">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your account and application preferences</p>
        </div>
      </div>

      {/* Profile Settings */}
      <div className="settings-card">
        <h2>Profile Settings</h2>

        <div className="form-grid">
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" defaultValue="John Doe" />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input type="email" defaultValue="john.doe@company.com" />
          </div>

          <div className="form-group">
            <label>Company</label>
            <input type="text" defaultValue="TechCorp Inc." />
          </div>

          <div className="form-group">
            <label>Role</label>
            <input type="text" defaultValue="Security Engineer" />
          </div>
        </div>

        <button className="primary-btn">Save Profile</button>
      </div>

      {/* Notification Preferences */}
      <div className="settings-card">
        <h2>Notification Preferences</h2>

        <div className="toggle-row">
          <div>
            <h4>Email Alerts</h4>
            <p>Receive email notifications for critical vulnerabilities</p>
          </div>
          <input type="checkbox" defaultChecked />
        </div>

        <div className="toggle-row">
          <div>
            <h4>Version Drift Notifications</h4>
            <p>Get notified when dependencies have newer versions</p>
          </div>
          <input type="checkbox" defaultChecked />
        </div>
      </div>

      {/* AI Risk Threshold */}
      <div className="settings-card">
        <h2>AI Risk Threshold Configuration</h2>

        <p>
          Configure the risk score threshold for AI-generated alerts.
          Dependencies exceeding this threshold will trigger alerts.
        </p>

        <div className="slider-container">
          <span>Low Risk</span>
          <input type="range" min="0" max="100" defaultValue="70" />
          <span>High Risk</span>
        </div>

        <button className="primary-btn">Save Configuration</button>
      </div>

    </div>
  );
}

export default Settings;
