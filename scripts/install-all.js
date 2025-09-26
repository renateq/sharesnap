const { execSync } = require("child_process");
const path = require("path");

function run(command, cwd) {
  console.log(`\n📦 Running "${command}" in ${cwd}`);
  execSync(command, { stdio: "inherit", cwd });
}

const root = process.cwd();

try {
  // Install root dependencies
  run("npm install", root);

  // Install Next.js app dependencies
  run("npm install", path.join(root, "packages/app"));

  // Install Go server dependencies
  run("go mod tidy", path.join(root, "packages/server"));
  run("go mod download", path.join(root, "packages/server"));

  console.log("\n✅ All dependencies installed successfully!");
} catch (err) {
  console.error("\n❌ Installation failed:", err.message);
  process.exit(1);
}
