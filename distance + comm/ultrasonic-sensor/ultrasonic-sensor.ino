#include <esp_now.h>
#include <WiFi.h>
#include <esp_wifi.h> // Required for setting the channel

// --- Define a shared Wi-Fi channel ---
#define WIFI_CHANNEL 1

// HC-SR04 Pin Definitions
const int TRIG_PIN = 5;  // Connect to Trig pin of the sensor (ESP32 DevKit GPIO 5)
const int ECHO_PIN = 18; // Connect to Echo pin of the sensor (ESP32 DevKit GPIO 18)

// Define the distance in cm that will trigger the camera
#define TRIGGER_DISTANCE 20 

// ================================================================
// This MUST be the real MAC address of your Camera ESP
// ================================================================
uint8_t broadcastAddress[] = {0x68, 0x25, 0xDD, 0x2F, 0x52, 0x1C};

// Structure to send the trigger message
typedef struct struct_message {
    char a[32];
} struct_message;

struct_message myData;

// Your new, working callback function for ESP-IDF v5+
void OnDataSent(const wifi_tx_info_t *info, esp_now_send_status_t status) {
  Serial.print("\r\nLast Packet Send Status:\t");
  Serial.println(status == ESP_NOW_SEND_SUCCESS ? "Delivery Success" : "Delivery Fail");
}

void setup() {
  Serial.begin(115200);

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  
  // Set device as a Wi-Fi Station
  WiFi.mode(WIFI_STA);

  // Set the Wi-Fi channel to match the receiver
  esp_wifi_set_channel(WIFI_CHANNEL, WIFI_SECOND_CHAN_NONE);

  // Init ESP-NOW
  if (esp_now_init() != ESP_OK) {
    Serial.println("Error initializing ESP-NOW");
    return;
  }

  // Register the sending callback
  esp_now_register_send_cb(OnDataSent);
  
  // Register peer
  esp_now_peer_info_t peerInfo = {};
  memcpy(peerInfo.peer_addr, broadcastAddress, 6);
  peerInfo.channel = WIFI_CHANNEL;  
  peerInfo.encrypt = false;
  
  if (esp_now_add_peer(&peerInfo) != ESP_OK){
    Serial.println("Failed to add peer");
    return;
  }
}
 
void loop() {
  long duration;
  int distance;
  
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  duration = pulseIn(ECHO_PIN, HIGH);
  distance = duration * 0.034 / 2;

  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.println(" cm");

  // Check if object is close enough
  if (distance > 0 && distance < TRIGGER_DISTANCE) {
    Serial.println("Object detected! Sending trigger...");
    
    // Set the correct trigger message
    strcpy(myData.a, "TAKE_PICTURE");
    esp_err_t result = esp_now_send(broadcastAddress, (uint8_t *) &myData, sizeof(myData));
     
    if (result != ESP_OK) {
      Serial.println("Error sending the data");
    }
    // Wait 5 seconds after sending to avoid spamming
    delay(5000); 
  }
  
  delay(500);
}

