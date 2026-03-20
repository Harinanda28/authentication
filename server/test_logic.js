const { checkVersionDrift } = require("./utils/versionUtils");
const fs = require("fs");

function testLogic() {
  let output = "--- Testing Version Drift Logic (Mocked) ---\n";
  
  const tests = [
    { inst: "4.17.1", target: "4.18.2", expect: "Update Available" },
    { inst: "1.0.0", target: "1.0.0", expect: "No Drift" },
    { inst: "2.0.0", target: "1.0.0", expect: "No Drift" }, // Newer already
    { inst: "1.2.3", target: "1.2.4", expect: "Update Available" },
    { inst: "invalid", target: "1.0.0", expect: "No Drift" }
  ];

  tests.forEach(t => {
    const res = checkVersionDrift(t.inst, t.target);
    output += `Installed: ${t.inst} | Target: ${t.target} | Result: ${res} | ${res === t.expect ? "PASS" : "FAIL"}\n`;
  });

  fs.writeFileSync("../drift_logic_results.txt", output);
}

testLogic();
