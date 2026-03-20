const axios = require("axios");

/**
 * Fetches the absolute latest version of a package from its registry.
 * @param {string} packageName - The name of the package.
 * @param {string} ecosystem - The package manager (e.g., 'npm').
 * @returns {Promise<string|null>} - The latest version string or null if not found.
 */
async function getLatestVersion(packageName, ecosystem = "npm") {
  try {
    if (ecosystem.toLowerCase() === "npm") {
      const response = await axios.get(`https://registry.npmjs.org/${packageName}/latest`);
      return response.data.version || null;
    }
    
    // Add other ecosystems (PyPI, Maven, etc.) here as needed
    return null;
  } catch (error) {
    console.error(`Error fetching latest version for ${packageName}:`, error.message);
    return null;
  }
}

module.exports = { getLatestVersion };
