import { NavLink, Outlet } from "react-router-dom";
import "../styles/layout.css";


function AppLayout() {
  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo">DepMonitor</div>

        <NavLink to="/" end className="nav-item">
          Dashboard
        </NavLink>

        <NavLink to="/projects" className="nav-item">
          Projects
        </NavLink>

        <NavLink to="/dependencies" className="nav-item">
          Dependencies
        </NavLink>

        <NavLink to="/vulnerabilities" className="nav-item">
          Vulnerabilities
        </NavLink>

        <NavLink to="/alerts" className="nav-item">
          Alerts
        </NavLink>

        <NavLink to="/settings" className="nav-item">
          Settings
        </NavLink>
      </div>

      {/* Main */}
      <div className="main">
        <div className="topbar">
          <div className="project-dropdown">All Projects ▾</div>

          <div className="top-icons">
            🔔 ⚙️ 👤
          </div>
        </div>

        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AppLayout;
