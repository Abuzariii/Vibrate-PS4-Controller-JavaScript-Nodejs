const HID = require("node-hid");
const readline = require("readline");

// Find DualShock 4 controller
const devices = HID.devices();
const ds4 = devices.find((d) =>
  d.product?.toLowerCase().includes("wireless controller")
);

if (!ds4) {
  console.log("DualShock 4 controller not found.");
  process.exit(1);
}

const device = new HID.HID(ds4.path);

// Create vibration command
const rumbleCommand = Buffer.alloc(32);
rumbleCommand[0] = 0x05; // Report ID
rumbleCommand[1] = 0xff; // Flags
rumbleCommand[4] = 0xff; // Right motor
rumbleCommand[5] = 0xff; // Left motor
rumbleCommand[6] = 0x00; // LED R
rumbleCommand[7] = 0x40; // LED G
rumbleCommand[8] = 0x80; // LED B

let vibrating = true;
device.write(rumbleCommand);
console.log("🔥 Controller vibrating. Press 'A' to stop, 'B' to start again.");

// Keep-alive interval
const keepAliveInterval = setInterval(() => {
  if (vibrating) {
    device.write(rumbleCommand);
  }
}, 10000);

// Function to stop vibration
const stopVibration = () => {
  rumbleCommand[4] = 0x00;
  rumbleCommand[5] = 0x00;
  device.write(rumbleCommand);
  vibrating = false;
  console.log("🛑 Vibration stopped.");
};

// Function to start vibration
const startVibration = () => {
  rumbleCommand[4] = 0xff;
  rumbleCommand[5] = 0xff;
  device.write(rumbleCommand);
  vibrating = true;
  console.log("🎮 Vibration started.");
};

// Setup terminal key listener
readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) {
  process.stdin.setRawMode(true);
}

process.stdin.on("keypress", (str, key) => {
  const char = str.toLowerCase();

  if (char === "a") {
    stopVibration();
  } else if (char === "b") {
    startVibration();
  } else if (key.name === "c" && key.ctrl) {
    // Ctrl+C to exit
    console.log("\nExiting...");
    stopVibration();
    clearInterval(keepAliveInterval);
    device.close();
    process.exit(0);
  }
});
