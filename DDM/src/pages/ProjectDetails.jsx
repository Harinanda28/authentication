import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import "../styles/projects.css";

function ProjectDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const response = await fetch(`http://localhost:5000/api/projects/${id}/details`, { headers });

        if (!response.ok) {
          if (response.status === 404) throw new Error("Project not found");
          throw new Error("Failed to load project details");
        }

        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id]);

  const getSeverityBadge = (severity) => {
    const sev = severity?.toUpperCase() || "UNKNOWN";
    let colorClass = "safe";

    if (sev === "HIGH") colorClass = "red";
    else if (sev === "CRITICAL") colorClass = "critical"; // Dark red ideally, reusing critical class
    else if (sev === "MEDIUM") colorClass = "warning";
    else if (sev === "LOW") colorClass = "safe"; // Green

    return <span className={`status-badge ${colorClass}`}>{sev}</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  if (loading) return <div className="projects-page"><p>Loading project details...</p></div>;
  if (error) return <div className="projects-page"><p className="error-message">{error}</p></div>;
  if (!data) return <div className="projects-page"><p>No data found.</p></div>;

  const { project, dependencies, vulnerabilities } = data;

  return (
    <div className="projects-page">
      {/* Breadcrumb / Back Navigation */}
      <div className="page-header">
        <div>
          <Link to="/projects" className="back-link">← Back to Projects</Link>
          <h1 style={{ marginTop: "10px" }}>{project.project_name}</h1>
          <p>{project.description || "No description provided."}</p>
        </div>
        <div className="project-meta">
          <p><strong>Last Scanned:</strong> {formatDate(project.last_scanned)}</p>
        </div>
      </div>

      <div className="details-container">

        {/* Vulnerabilities Section */}
        <div className="details-section">
          <h2>Vulnerabilities ({vulnerabilities.length})</h2>
          {vulnerabilities.length === 0 ? (
            <p className="success-message">No vulnerabilities found! ✅</p>
          ) : (
            <table className="details-table">
              <thead>
                <tr>
                  <th>Dependency</th>
                  <th>Severity</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {vulnerabilities.map((vul, index) => (
                  <tr key={index}>
                    <td>{vul.dependency_name}</td>
                    <td>{getSeverityBadge(vul.severity)}</td>
                    <td>{vul.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Dependencies Section */}
        <div className="details-section">
          <h2>Dependencies ({dependencies.length})</h2>
          <table className="details-table">
            <thead>
              <tr>
                <th>Dependency Name</th>
                <th>Version</th>
              </tr>
            </thead>
            <tbody>
              {dependencies.map((dep, index) => (
                <tr key={index}>
                  <td>{dep.dependency_name}</td>
                  <td>{dep.version}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default ProjectDetails;
