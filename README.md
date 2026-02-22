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

### 1. Hardware Setup
- Flash the code in `camera/CameraWebServer` to your **ESP32-CAM**.
- Connect the ultrasonic sensors using the logic in `distance + comm`.
- Update your WiFi credentials in the `.ino` files.

### 2. Python API Setup
Navigate to the camera folder and install dependencies:
```bash
cd "camera + api"
pip install -r requirements.txt
python app.py
```

### 3. Frontend setup
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

