const HID = require("node-hid");

// Look for DualShock 4 (USB)
const devices = HID.devices();
const ds4 = devices.find((d) =>
  d.product?.toLowerCase().includes("wireless controller")
);

if (!ds4) {
  console.log("DualShock 4 controller not found.");
  process.exit(1);
}

const device = new HID.HID(ds4.path);

// USB mode needs a 32-byte report
const rumbleCommand = Buffer.alloc(32);
rumbleCommand[0] = 0x05; // Report ID (output report)
rumbleCommand[1] = 0xff; // Flags
rumbleCommand[4] = 0xff; // Right (weak rumble)
rumbleCommand[5] = 0xff; // Left (strong rumble)

// Optional LED (RGB) if you want color
rumbleCommand[6] = 0x00; // R
rumbleCommand[7] = 0x20; // G
rumbleCommand[8] = 0x80; // B

device.write(rumbleCommand);
console.log("Vibration ON");

setTimeout(() => {
  rumbleCommand[4] = 0x00; // Stop right motor
  rumbleCommand[5] = 0x00; // Stop left motor
  device.write(rumbleCommand);
  console.log("Vibration OFF");
  device.close();
}, 5000);
