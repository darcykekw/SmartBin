#include <WiFi.h>
#include <HTTPClient.h>

// --- Configuration ---
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "http://YOUR_SERVER_IP:3000/api/bin-data";

// Bin Configuration
const String BIN_ID = "YOUR_BIN_UUID"; // Replace with actual bin UUID from Next.js dashboard

// --- Pins ---
const int trigPin = 5;
const int echoPin = 18;
const int redPin = 25;
const int greenPin = 26;
const int bluePin = 27;
const int buzzerPin = 14;
const int buttonPin = 32;

const float BIN_CAPACITY_CM = 100.0; // Total depth of the bin in cm

// --- State Variables ---
long duration;
float currentDistance;
float previousDistance = BIN_CAPACITY_CM;
String currentStatus = "Empty";
String previousStatus = "Empty";
bool isButtonPressed = false;

// Cooldown mechanism
unsigned long lastBeepTime = 0;
const unsigned long BEEP_COOLDOWN_MS = 5000; // 5 seconds cooldown

void setup() {
  Serial.begin(115200);
  
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(redPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  pinMode(bluePin, OUTPUT);
  pinMode(buzzerPin, OUTPUT);
  pinMode(buttonPin, INPUT_PULLUP);
  
  connectWiFi();
}

void loop() {
  // 1. Check User Interaction (Button Reset)
  if (digitalRead(buttonPin) == LOW) {
    if (!isButtonPressed) {
      Serial.println("[Input] Reset Button Pressed!");
      // Beep-Beep (2 short beeps)
      beep(100); delay(100); beep(100);
      isButtonPressed = true;
      
      // Reset tracking state manually
      previousDistance = BIN_CAPACITY_CM;
      previousStatus = "Empty";
      delay(500); // Debounce
    }
  } else {
    isButtonPressed = false;
  }

  // 2. Process: Measure Trash Level
  currentDistance = measureDistance();
  Serial.print("Distance: "); Serial.print(currentDistance); Serial.println(" cm");

  float fillLevel = ((BIN_CAPACITY_CM - currentDistance) / BIN_CAPACITY_CM) * 100.0;
  if (fillLevel < 0) fillLevel = 0;
  if (fillLevel > 100) fillLevel = 100;
  
  // Determine new state
  if (fillLevel > 85.0) currentStatus = "Full";
  else if (fillLevel > 20.0) currentStatus = "Half-Full";
  else currentStatus = "Empty";

  // 3. Process: Evaluate Changes and Smart Alerts
  unsigned long currentTime = millis();
  bool canBeep = (currentTime - lastBeepTime) > BEEP_COOLDOWN_MS;

  // Detect new trash (significant change in distance, e.g. > 5cm closer)
  if (previousDistance - currentDistance > 5.0) {
    Serial.println("[Event] New trash detected!");
    if (canBeep) {
      beep(150); // Beep once when new trash is detected
      lastBeepTime = currentTime;
    }
  }

  // Detect status change
  if (currentStatus != previousStatus) {
    Serial.print("[State Change] "); Serial.print(previousStatus); Serial.print(" -> "); Serial.println(currentStatus);
    
    if (canBeep) {
      if (currentStatus == "Half-Full") {
        // 2 short beeps
        beep(100); delay(100); beep(100);
      } else if (currentStatus == "Full") {
        // 1 long beep
        beep(800);
      }
      lastBeepTime = currentTime;
    }
  }

  // 4. Output: UI/UX Feedback (LEDs)
  updateLEDs(currentStatus);
  
  // Update previous states
  previousDistance = currentDistance;
  previousStatus = currentStatus;

  // 5. Output: Dashboard Update (Send Data to Next.js API)
  sendDataToServer(currentDistance);
  
  delay(10000); // 10-second polling interval
}

void connectWiFi() {
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    setLED(0, 0, 255); // Blue blinking while connecting
    delay(500);
    setLED(0, 0, 0);
  }
  beep(200); delay(100); beep(200); // Success beep
}

float measureDistance() {
  digitalWrite(trigPin, LOW); delayMicroseconds(2);
  digitalWrite(trigPin, HIGH); delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  duration = pulseIn(echoPin, HIGH);
  return duration * 0.034 / 2;
}

void updateLEDs(String status) {
  if (status == "Full") {
    setLED(255, 0, 0); // Red
  } else if (status == "Half-Full") {
    setLED(255, 255, 0); // Yellow
  } else {
    setLED(0, 255, 0); // Green
  }
}

void setLED(int r, int g, int b) {
  analogWrite(redPin, r); analogWrite(greenPin, g); analogWrite(bluePin, b);
}

void beep(int ms) {
  digitalWrite(buzzerPin, HIGH); delay(ms); digitalWrite(buzzerPin, LOW);
}

void sendDataToServer(float dist) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    String payload = "{\"bin_id\":\"" + BIN_ID + "\", \"distance_cm\":" + String(dist) + "}";
    int httpResponseCode = http.POST(payload);
    
    
    http.end();
  } else {
    Serial.println("WiFi Disconnected");
    // Reconnect
    connectWiFi();
  }
}
