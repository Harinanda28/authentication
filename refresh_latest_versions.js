const pool = require("./server/db");
const { getLatestVersion } = require("./server/services/registryService");

async function refreshAllDependencies() {
  console.log("Starting refresh of latest_version for all dependencies in the database...");
  try {
    // Get all distinct dependency names currently in the DB
    const res = await pool.query("SELECT DISTINCT dependency_name FROM dependencies");
    const depNames = res.rows.map(row => row.dependency_name);
    
    console.log(`Found ${depNames.length} distinct dependencies to check.`);

    let updatedCount = 0;

    for (const name of depNames) {
      console.log(`Fetching latest version for: ${name}...`);
      try {
        const latest = await getLatestVersion(name, "npm");
        
        if (latest) {
          // Update all rows for this dependency with the true latest version
          const updateRes = await pool.query(
            "UPDATE dependencies SET latest_version = $1 WHERE dependency_name = $2",
            [latest, name]
          );
          console.log(` -> Updated ${name} to latest version: ${latest} (${updateRes.rowCount} rows affected)`);
          updatedCount += updateRes.rowCount;
        } else {
          console.log(` -> Failed to find latest version for ${name} on npm.`);
        }
      } catch (err) {
        console.error(`Error processing ${name}:`, err.message);
      }
    }

    console.log(`\nSuccess! Updated a total of ${updatedCount} dependency rows with their true latest versions.`);
  } catch (err) {
    console.error("Database error:", err);
  } finally {
    pool.end();
  }
}

refreshAllDependencies();
