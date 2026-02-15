import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/NewProject.css";

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
        <div className="new-project-page">
            <div className="form-card">
                <div className="form-header">
                    <h1>Create New Project</h1>
                    <p>Upload your dependency file to start monitoring</p>
                </div>

                {error && <div className="form-error">{error}</div>}

                <form onSubmit={handleSubmit} className="new-project-form">
                    <div className="input-group">
                        <label htmlFor="project_name">Project Name</label>
                        <input
                            type="text"
                            id="project_name"
                            name="project_name"
                            value={formData.project_name}
                            onChange={handleChange}
                            required
                            placeholder="e.g. My Awesome App"
                            className="modern-input"
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="description">Description (Optional)</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Brief description of your project..."
                            className="modern-textarea"
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="dependencyFile">Dependency File</label>
                        <div className="file-upload-area">
                            <input
                                type="file"
                                id="dependencyFile"
                                name="dependencyFile"
                                accept=".json,.txt"
                                onChange={handleFileChange}
                                required
                                className="file-input-hidden"
                            />
                            <span className="upload-icon">📁</span>
                            {file ? (
                                <span className="upload-text" style={{ color: "#2563eb" }}>{file.name}</span>
                            ) : (
                                <>
                                    <span className="upload-text">Click to upload or drag and drop</span>
                                    <span className="upload-hint">Supported: package.json, requirements.txt</span>
                                </>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={loading}
                    >
                        {loading ? "Creating Project..." : "Create Project"}
                    </button>

                    <div style={{ textAlign: "center", marginTop: "15px" }}>
                        <Link to="/projects" style={{ color: "#6b7280", textDecoration: "none", fontSize: "14px" }}>Cancel</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default NewProject;
