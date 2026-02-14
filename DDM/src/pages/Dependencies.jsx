import "../styles/layout.css";
import "../styles/dependencies.css";

function Dependencies() {
  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1>Dependencies</h1>
          <p>Monitoring all projects</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-row">
        <div className="stat-card">
          <div>
            <p>Total</p>
            <h2>8</h2>
          </div>
          <div className="icon-box gray">📦</div>
        </div>

        <div className="stat-card">
          <div>
            <p>Vulnerable</p>
            <h2 className="red">3</h2>
          </div>
          <div className="icon-box red">⚠️</div>
        </div>

        <div className="stat-card">
          <div>
            <p>Version Drift</p>
            <h2 className="orange">3</h2>
          </div>
          <div className="icon-box orange">⬆️</div>
        </div>

        <div className="stat-card">
          <div>
            <p>Up to Date</p>
            <h2 className="green">2</h2>
          </div>
          <div className="icon-box green">✔</div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="table-controls">
        <input placeholder="Search dependencies..." />
        <select>
          <option>All Status</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>DEPENDENCY</th>
              <th>CURRENT VERSION</th>
              <th>LATEST VERSION</th>
              <th>STATUS</th>
              <th>SEVERITY</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                react <span className="badge">production</span>
              </td>
              <td>18.2.0</td>
              <td>18.3.1</td>
              <td><span className="status orange">Version Drift</span></td>
              <td>-</td>
              <td><a href="#">Details</a></td>
            </tr>

            <tr>
              <td>
                lodash <span className="badge">production</span>
              </td>
              <td>4.17.20</td>
              <td>4.17.21</td>
              <td><span className="status red">Vulnerable</span></td>
              <td className="red">CRITICAL</td>
              <td><a href="#">Details</a></td>
            </tr>

            <tr>
              <td>
                express <span className="badge">production</span>
              </td>
              <td>4.18.2</td>
              <td>4.19.0</td>
              <td><span className="status red">Vulnerable</span></td>
              <td className="orange">HIGH</td>
              <td><a href="#">Details</a></td>
            </tr>

            <tr>
              <td>
                axios <span className="badge">production</span>
              </td>
              <td>1.6.0</td>
              <td>1.6.0</td>
              <td><span className="status green">Up to Date</span></td>
              <td>-</td>
              <td><a href="#">Details</a></td>
            </tr>

            <tr>
              <td>
                webpack <span className="badge">development</span>
              </td>
              <td>5.88.0</td>
              <td>5.90.0</td>
              <td><span className="status orange">Version Drift</span></td>
              <td>-</td>
              <td><a href="#">Details</a></td>
            </tr>

            <tr>
              <td>
                typescript <span className="badge">development</span>
              </td>
              <td>5.3.3</td>
              <td>5.3.3</td>
              <td><span className="status green">Up to Date</span></td>
              <td>-</td>
              <td><a href="#">Details</a></td>
            </tr>

            <tr>
              <td>
                eslint <span className="badge">development</span>
              </td>
              <td>8.55.0</td>
              <td>8.56.0</td>
              <td><span className="status orange">Version Drift</span></td>
              <td>-</td>
              <td><a href="#">Details</a></td>
            </tr>

            <tr>
              <td>
                moment <span className="badge">production</span>
              </td>
              <td>2.29.4</td>
              <td>2.30.1</td>
              <td><span className="status red">Vulnerable</span></td>
              <td className="yellow">MEDIUM</td>
              <td><a href="#">Details</a></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dependencies;
