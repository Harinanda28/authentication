/**import { useEffect, useState } from "react";
import "../styles/dependencies.css";

function Dependencies() {
  const [dependencies, setDependencies] = useState([]);

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:5000/api/vulnerability/dependencies", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setDependencies(data);
      } catch (err) {
        console.error("Error fetching dependencies:", err);
      }
    };

    fetchDependencies();
  }, []);

  // ✅ Dynamic counts
  const total = dependencies.length;
  const vulnerable = dependencies.filter(d => d.status === "Vulnerable").length;
  const drift = dependencies.filter(d => d.status === "Version Drift").length;
  const upToDate = dependencies.filter(d => d.status === "Up to Date").length;

  return (
    <div className="page-wrapper">
      <h1>Dependencies</h1>

      <div className="stats-row">
        <div className="stat-card"><p>Total</p><h2>{total}</h2></div>
        <div className="stat-card"><p>Vulnerable</p><h2 className="red">{vulnerable}</h2></div>
        <div className="stat-card"><p>Version Drift</p><h2 className="orange">{drift}</h2></div>
        <div className="stat-card"><p>Up to Date</p><h2 className="green">{upToDate}</h2></div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Dependency</th>
            <th>Current</th>
            <th>Latest</th>
            <th>Status</th>
            <th>Severity</th>
          </tr>
        </thead>
        <tbody>
          {dependencies.map(dep => (
            <tr key={dep._id}>
              <td>{dep.name}</td>
              <td>{dep.currentVersion}</td>
              <td>{dep.latestVersion}</td>
              <td>{dep.status}</td>
              <td>{dep.severity || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dependencies;*/

import { useEffect, useState } from "react";
import "../styles/dependencies.css";

function Dependencies() {
  const [dependencies, setDependencies] = useState([]);

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          "http://localhost:5000/api/vulnerability/dependencies",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        setDependencies(data);
      } catch (err) {
        console.error("Error fetching dependencies:", err);
      }
    };

    fetchDependencies();
  }, []);

  // ✅ Dynamic counts based on vuln_count
  const total = dependencies.length;
  const vulnerable = dependencies.filter(d => Number(d.vuln_count) > 0).length;
  const drift = 0; // not provided by API
  const upToDate = dependencies.filter(d => Number(d.vuln_count) === 0).length;

  return (
    <div className="page-wrapper">
      <h1>Dependencies</h1>

      <div className="stats-row">
        <div className="stat-card"><p>Total</p><h2>{total}</h2></div>
        <div className="stat-card"><p>Vulnerable</p><h2 className="red">{vulnerable}</h2></div>
        <div className="stat-card"><p>Version Drift</p><h2 className="orange">{drift}</h2></div>
        <div className="stat-card"><p>Up to Date</p><h2 className="green">{upToDate}</h2></div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Dependency</th>
            <th>Current</th>
            <th>Latest</th>
            <th>Status</th>
            <th>Severity</th>
          </tr>
        </thead>
        <tbody>
          {dependencies.map(dep => (
            <tr key={dep.dependency_id}>
              <td>{dep.dependency_name}</td>
              <td>{dep.current_version}</td>
              <td>-</td>
              <td>
                {Number(dep.vuln_count) > 0 ? "Vulnerable" : "Up to Date"}
              </td>
              <td>{dep.vuln_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dependencies;
