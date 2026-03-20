const { scanDependency } = require("./server/services/vulnerabilityService");

console.log("Script starting...");
async function testDrift() {
  console.log("--- Testing Version Drift (Security + Absolute) ---");
  
  // Test 1: Package with known vulnerabilities (should show safe + absolute)
  console.log("\n1. Testing 'express@4.17.1' (Old + Vulnerable):");
  const res1 = await scanDependency("express", "4.17.1");
  console.log(`Installed: ${res1.installedVersion}`);
  console.log(`Safe Version: ${res1.safeVersion}`);
  console.log(`Latest Version: ${res1.latestVersion}`);
  console.log(`Drift Status: ${res1.versionDrift}`);
  console.log(`Vulnerabilities: ${res1.vulnerabilities.length}`);

  // Test 2: Package that is old but maybe not vulnerable (absolute drift only)
  console.log("\n2. Testing 'lodash@4.0.0' (Very Old):");
  const res2 = await scanDependency("lodash", "4.0.0");
  console.log(`Installed: ${res2.installedVersion}`);
  console.log(`Latest Version: ${res2.latestVersion}`);
  console.log(`Drift Status: ${res2.versionDrift}`);

  // Test 3: Up to date package
  console.log("\n3. Testing 'express@latest' (Fetching actual latest first for test):");
  const { getLatestVersion } = require("./server/services/registryService");
  const latest = await getLatestVersion("express");
  const res3 = await scanDependency("express", latest);
  console.log(`Installed: ${res3.installedVersion}`);
  console.log(`Latest Version: ${res3.latestVersion}`);
  console.log(`Drift Status: ${res3.versionDrift}`);
}

testDrift().catch(console.error);
