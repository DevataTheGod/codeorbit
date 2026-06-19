import { spawn } from "child_process";

console.log("Starting CodeOrbit Services...");

// Spawn Frontend
const frontend = spawn("npm", ["run", "frontend"], { 
  stdio: "inherit", 
  shell: true 
});

// Spawn OTP Server
const otpServer = spawn("npm", ["run", "otp-server"], { 
  stdio: "inherit", 
  shell: true 
});

let isCleaningUp = false;
function cleanup() {
  if (isCleaningUp) return;
  isCleaningUp = true;
  console.log("\nShutting down CodeOrbit services...");
  try {
    frontend.kill();
  } catch (e) {}
  try {
    otpServer.kill();
  } catch (e) {}
  process.exit();
}

// Handle termination signals
process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
process.on("exit", cleanup);

frontend.on("exit", (code) => {
  if (code !== 0 && code !== null) {
    console.error(`Frontend exited with code ${code}`);
  }
  cleanup();
});

otpServer.on("exit", (code) => {
  if (code !== 0 && code !== null) {
    console.error(`OTP Server exited with code ${code}`);
  }
  cleanup();
});
