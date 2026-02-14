import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/projects.css";

function NewProject() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        project_name: "",
        description: "",
    });
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!file) {
            setError("Please select a dependency file (package.json or requirements.txt)");
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const data = new FormData();
            data.append("project_name", formData.project_name);
            data.append("description", formData.description);
            data.append("dependencyFile", file);

            const response = await fetch("http://localhost:5000/api/projects", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    // Content-Type is set automatically with FormData
                },
                body: data,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to create project");
            }

            // Success - Redirect to projects page
            navigate("/projects");
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="projects-page">
            <div className="page-header">
                <div>
                    <Link to="/projects" className="back-link">← Back to Projects</Link>
                    <h1 style={{ marginTop: "10px" }}>Create New Project</h1>
                    <p>Upload your dependency file to start monitoring</p>
                </div>
            </div>

            <div className="details-container" style={{ maxWidth: "600px", margin: "0 auto" }}>
                <div className="details-section">
                    {error && <div className="error-message" style={{ marginBottom: "20px" }}>{error}</div>}

                    <form onSubmit={handleSubmit} className="new-project-form">
                        <div className="form-group">
                            <label htmlFor="project_name">Project Name</label>
                            <input
                                type="text"
                                id="project_name"
                                name="project_name"
                                value={formData.project_name}
                                onChange={handleChange}
                                required
                                placeholder="e.g. My Awesome App"
                                style={{ width: "100%", padding: "10px", marginBottom: "15px", border: "1px solid #ddd", borderRadius: "5px" }}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Description (Optional)</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Brief description of your project..."
                                rows="4"
                                style={{ width: "100%", padding: "10px", marginBottom: "15px", border: "1px solid #ddd", borderRadius: "5px" }}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="dependencyFile">Dependency File</label>
                            <div style={{ marginBottom: "5px", color: "#666", fontSize: "0.9em" }}>
                                Supported formats: <code>package.json</code> (Node.js), <code>requirements.txt</code> (Python)
                            </div>
                            <input
                                type="file"
                                id="dependencyFile"
                                name="dependencyFile"
                                accept=".json,.txt"
                                onChange={handleFileChange}
                                required
                                style={{ marginBottom: "20px" }}
                            />
                        </div>

                        <button
                            type="submit"
                            className="primary-btn"
                            disabled={loading}
                            style={{ width: "100%", opacity: loading ? 0.7 : 1 }}
                        >
                            {loading ? "Creating Project..." : "Create Project"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default NewProject;
