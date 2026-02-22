# 🗑️ SMART-BIN 

An automated waste management system that uses computer vision and IoT to intelligently manage and monitor waste. This project integrates an ESP32 Cam, ultrasonic sensors, a Python-based processing API, and a modern web dashboard.

---

## 📂 Project Structure

- **`Frontend/`**: A React/Next.js web application (Bin Bloom Vision) for real-time monitoring.
- **`Backend/`**: Flask server handling data orchestration and Supabase integration.
- **`camera + api/`**: Python API for processing images from the ESP32 Cam (includes model checking).
- **`camera/`**: Arduino/C++ code for the ESP32 Camera Web Server.
- **`distance + comm/`**: Arduino code for the ultrasonic sensor and communication logic.

---

## 🚀 Getting Started

## 📡 Hardware & Communication

This project utilizes a decentralized communication architecture using the **ESP-NOW protocol**, allowing the devices to talk to each other directly without a Wi-Fi router.

### System Components:
1.  **ESP32-CAM (Master/Vision Node):** Captures images for waste classification and sends data via ESP-NOW.
2.  **ESP32 (Controller Node):** Connected to the **Ultrasonic Sensor** for fill-level detection and manages physical bin operations.
3.  **Ultrasonic Sensor:** Monitors bin capacity in real-time.

---

## 🚀 Hardware Setup

### 1. ESP-NOW Configuration
- Both ESP devices must be on the same Wi-Fi channel.
- Ensure you have the **MAC Address** of the receiver ESP programmed into the sender ESP's code.

### 2. Flashing the Devices
- **Vision Node:** Flash the code found in `/camera/CameraWebServer`.
- **Sensor Node:** Flash the code found in `/distance + comm/ultrasonic-sensor`.

### 3. Wiring
- **Ultrasonic Sensor:** Trigger -> GPIO XX, Echo -> GPIO XX (check `ultrasonic-sensor.ino` for specific pins).
- **Power:** Ensure both ESPs share a common ground if they are physically linked, though ESP-NOW works wirelessly.

### 4. Python API Setup
Navigate to the camera folder and install dependencies:
```bash
cd "camera + api"
pip install -r requirements.txt
python app.py
```

### 5. Frontend setup
```
cd Frontend/bin-bloom-vision-main
npm install
npm run dev
 ```

### 🔧 Environment Variables
Make sure to create a .env file in the Frontend and Backend folders with the following:

- SUPABASE_URL
- SUPABASE_KEY

## 📺 Demo & Tutorial

Watch the full project walkthrough and hardware setup tutorial here:

[![Smart Bin Tutorial](https://img.youtube.com/vi/kErxp6QBL0I/0.jpg)](https://www.youtube.com/watch?v=kErxp6QBL0I)

*Click the image above to watch the video on YouTube.*

