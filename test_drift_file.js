const { scanDependency } = require("./server/services/vulnerabilityService");
const fs = require("fs");

async function testDrift() {
  let output = "--- Testing Version Drift (Security + Absolute) ---\n";
  
  try {
    console.log("Starting test 1...");
    const res1 = await scanDependency("express", "4.17.1");
    output += `\n1. Testing 'express@4.17.1' (Old + Vulnerable):\n`;
    output += `Installed: ${res1.installedVersion}\n`;
    output += `Safe Version: ${res1.safeVersion}\n`;
    output += `Latest Version: ${res1.latestVersion}\n`;
    output += `Drift Status: ${res1.versionDrift}\n`;
    output += `Vulnerabilities: ${res1.vulnerabilities.length}\n`;

    console.log("Starting test 2...");
    const res2 = await scanDependency("lodash", "4.0.0");
    output += `\n2. Testing 'lodash@4.0.0' (Very Old):\n`;
    output += `Installed: ${res2.installedVersion}\n`;
    output += `Latest Version: ${res2.latestVersion}\n`;
    output += `Drift Status: ${res2.versionDrift}\n`;
    
    fs.writeFileSync("drift_results.txt", output);
    console.log("Results written to drift_results.txt");
  } catch (err) {
    fs.writeFileSync("drift_results.txt", "Error: " + err.message + "\n" + err.stack);
  }
}

testDrift().catch(err => fs.writeFileSync("drift_results.txt", "Fatal Error: " + err.message));
