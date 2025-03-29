const HID = require("node-hid");

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

// Build vibration command
const rumbleCommand = Buffer.alloc(32);
rumbleCommand[0] = 0x05; // Report ID
rumbleCommand[1] = 0xff; // Flags
rumbleCommand[4] = 0xff; // Right motor (weak rumble)
rumbleCommand[5] = 0xff; // Left motor (strong rumble)

// Optional LED color
rumbleCommand[6] = 0x00; // R
rumbleCommand[7] = 0x80; // G
rumbleCommand[8] = 0x40; // B

// Initial rumble
device.write(rumbleCommand);
console.log("Vibrating indefinitely. Press Ctrl+C to stop.");

// Optional: Re-send every 10 seconds to keep alive (depends on controller behavior)
const keepAliveInterval = setInterval(() => {
  device.write(rumbleCommand);
}, 10000);

// Graceful shutdown on Ctrl+C
process.on("SIGINT", () => {
  console.log("\nStopping vibration...");
  rumbleCommand[4] = 0x00;
  rumbleCommand[5] = 0x00;
  device.write(rumbleCommand);
  clearInterval(keepAliveInterval);
  device.close();
  process.exit(0);
});
