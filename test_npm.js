const axios = require("axios");
async function test() {
  console.log("Testing npm registry...");
  try {
    const res = await axios.get("https://registry.npmjs.org/express/latest", { timeout: 5000 });
    console.log("Success! Latest express version:", res.data.version);
  } catch (e) {
    console.error("Failed:", e.message);
  }
}
test();
