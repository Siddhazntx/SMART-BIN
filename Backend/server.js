// Backend Code
const express = require('express');
const mqtt = require('mqtt');
const cors = require('cors');

const app = express();
app.use(cors());

let binData = { full: false, distance: 0, timestamp: new Date() };

// Connect to local MQTT broker
const client = mqtt.connect('mqtt://localhost');

client.on('connect', () => {
  console.log('✅ Connected to Mosquitto');
  client.subscribe('bin/status');
});

client.on('message', (topic, message) => {
  if (topic === 'bin/status') {
    try {
      const data = JSON.parse(message.toString());
      binData = { ...data, timestamp: new Date() };
      console.log('📡 New data:', binData);
    } catch (e) {
      console.error('❌ Bad JSON:', message.toString());
    }
  }
});

app.get('/bin', (req, res) => {
  res.json(binData);
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => { // ← '0.0.0.0' allows external devices
  console.log(`🌐 Server running at http://localhost:${PORT}/bin`);
});
// "@ | Out-File -FilePath "server.js" -Encoding utf8