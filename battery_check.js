const HID = require("node-hid");

// Find DualShock controller
const devices = HID.devices();
const ds4 = devices.find((d) =>
  d.product?.toLowerCase().includes("wireless controller")
);

if (!ds4) {
  console.log("DualShock 4 controller not found.");
  process.exit(1);
}

const device = new HID.HID(ds4.path);

console.log("🔋 Listening for battery status...");

// USB: battery level is usually byte 30 (index 29)
device.on("data", (data) => {
  const batteryByte = data[30]; // Index might vary slightly depending on OS/mode

  // Interpret battery level (USB: 0–5, Bluetooth: 0–10/11/15)
  let batteryPercent = 0;
  if (batteryByte <= 5) {
    batteryPercent = (batteryByte / 5) * 100; // USB scale
  } else if (batteryByte <= 15) {
    batteryPercent = (batteryByte / 15) * 100; // Bluetooth scale
  }

  const charging = data[29] & 0x10; // charging bit flag (on some firmwares)
  const status = charging ? "⚡ Charging" : "🔋";

  process.stdout.write(`\r${status} Battery: ${Math.round(batteryPercent)}% `);
});

// Graceful exit
process.on("SIGINT", () => {
  console.log("\nClosing connection.");
  device.close();
  process.exit(0);
});
