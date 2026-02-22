#include "esp_camera.h"
#include <WiFi.h>
#include <esp_now.h>
#include <HTTPClient.h>
#include <esp_wifi.h> // Required for setting the channel

// --- ADDED: Define a shared Wi-Fi channel ---
#define WIFI_CHANNEL 1

#include "board_config.h"

// ================================================================
// IMPORTANT: Fill in your Wi-Fi network credentials here
// ================================================================
const char* ssid = "BVICAM";
const char* password = "bvp@2002";

// Your Python server's IP address
const char* server_ip = "172.16.2.34"; 
const int server_port = 5000;

// Flash GPIO
#define FLASH_GPIO 4

// Global flag to trigger picture taking, 'volatile' is important here
volatile bool takePicture = false;

// ================================================================
// CORRECTED: The OnDataRecv function signature has been updated
// to match what your newer ESP32 library version requires.
// ================================================================
void OnDataRecv(const esp_now_recv_info * info, const uint8_t *incomingData, int len) {
  char receivedMessage[len + 1];
  memcpy(receivedMessage, incomingData, len);
  receivedMessage[len] = '\0'; // Null-terminate the string
  
  Serial.print("Message received from sender: ");
  Serial.println(receivedMessage);
  
  // Check if the message is our trigger command
  if (strcmp(receivedMessage, "TAKE_PICTURE") == 0) {
    takePicture = true; // Set the flag to take a picture
  }
}

// Function prototype for sending the picture
void sendPicture(camera_fb_t * fb);

void setup() {
  Serial.begin(115200);
  pinMode(FLASH_GPIO, OUTPUT);

  // --- Initialize ESP-NOW as a receiver ---
  WiFi.mode(WIFI_STA);
  
  // Set the Wi-Fi channel to match the sender
  esp_wifi_set_channel(WIFI_CHANNEL, WIFI_SECOND_CHAN_NONE);

  if (esp_now_init() != ESP_OK) {
    Serial.println("Error initializing ESP-NOW");
    return;
  }
  // Register the receiving callback function
  esp_now_register_recv_cb(OnDataRecv);
  Serial.println("--- ESP-NOW Initialized. Waiting for trigger... ---");


  // --- Camera Initialization (using your proven settings) ---
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.frame_size = FRAMESIZE_UXGA;
  config.pixel_format = PIXFORMAT_JPEG;
  config.grab_mode = CAMERA_GRAB_WHEN_EMPTY;
  config.fb_location = CAMERA_FB_IN_PSRAM;
  config.jpeg_quality = 8;
  config.fb_count = 1;
  
  if (psramFound()) {
    config.fb_count = 2;
    config.grab_mode = CAMERA_GRAB_LATEST;
  } else {
    config.frame_size = FRAMESIZE_SVGA;
    config.fb_location = CAMERA_FB_IN_DRAM;
  }

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x", err);
    return;
  }
  sensor_t *s = esp_camera_sensor_get();
  s->set_framesize(s, FRAMESIZE_VGA);
  s->set_vflip(s, 1);
  s->set_hmirror(s, 1);
  s->set_awb_gain(s, 1);
  s->set_exposure_ctrl(s, 1);
  s->set_brightness(s, 2);
  s->set_contrast(s, 2);
  Serial.println("--- Camera Initialized ---");
}

void loop() {
  // The main loop only checks if it has been told to take a picture
  if (takePicture) {
    
    // --- Connect to Wi-Fi to send the image ---
    WiFi.begin(ssid, password);
    Serial.print("WiFi connecting");
    int retries = 0;
    while (WiFi.status() != WL_CONNECTED && retries < 20) { // Retry for 10 seconds
      delay(500);
      Serial.print(".");
      retries++;
    }

    if (WiFi.status() == WL_CONNECTED){
      Serial.println("\nWiFi connected");

      // --- Take and Send Picture ---
      Serial.println("Trigger received! Taking a picture...");
      digitalWrite(FLASH_GPIO, HIGH);
      delay(2000); // Wait 2s for camera to adjust
      camera_fb_t * fb = esp_camera_fb_get();
      digitalWrite(FLASH_GPIO, LOW);
      
      if (!fb) {
        Serial.println("Failed to capture image");
      } else {
        Serial.printf("Picture taken! Size: %zu bytes\n", fb->len);
        sendPicture(fb);
        esp_camera_fb_return(fb);
      }
    } else {
      Serial.println("\nFailed to connect to WiFi.");
    }

    // --- Disconnect from Wi-Fi to save power ---
    WiFi.disconnect(true);
    WiFi.mode(WIFI_OFF); // Turn off the radio
    Serial.println("WiFi disconnected. Returning to standby.");
    
    takePicture = false; // Reset the flag and wait for the next trigger
  }
  
  // Do nothing and wait for the next trigger
  delay(100);
}

void sendPicture(camera_fb_t * fb) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String serverUrl = "http://" + String(server_ip) + ":" + String(server_port) + "/classify";
    
    http.begin(serverUrl);
    http.addHeader("Content-Type", "image/jpeg");
    http.setTimeout(25000); // 25 second timeout
    
    Serial.println("Sending image to server...");
    int httpResponseCode = http.POST(fb->buf, fb->len);
    
    if (httpResponseCode > 0) {
      String payload = http.getString();
      Serial.println("--------------------");
      Serial.print("Classification Result: ");
      payload.toUpperCase();
      Serial.println(payload);
      Serial.println("--------------------");
    } else {
      Serial.printf("Error on sending POST: %s\n", http.errorToString(httpResponseCode).c_str());
    }
    http.end();
  } else {
    Serial.println("WiFi not connected for sending");
  }
}

