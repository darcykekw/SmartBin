#include <WiFi.h>
#include <HTTPClient.h>

// Network and Server Configuration
const char* ssid = "Tableya with Pearl - Venti";
const char* password = "aishaquinn";
const char* serverUrl = "http://192.168.254.104:3000/api/bin-data";

// Hardware Identification
const String BIN_ID = "f079ae16-8552-48dd-a505-85c0b7667a54";

// Pin Assignments
const int trigPin = 5;
const int echoPin = 18;
const int redPin = 25;
const int greenPin = 26;
const int bluePin = 27;
const int buzzerPin = 14;
const int buttonPin = 32;

// Physical Parameters
const float BIN_CAPACITY_CM = 50.0; // Total vertical depth of the bin enclosure (cm)

// Global State Variables
float currentDistance = BIN_CAPACITY_CM;
float previousDistance = BIN_CAPACITY_CM;
String currentStatus = "Empty";
String previousStatus = "Empty";
bool isButtonPressed = false;
bool isSystemActive = true; // Primary hardware toggle state

// System Timers and Thresholds
unsigned long lastButtonPressTime = 0;
unsigned long lastBeepTime = 0;
unsigned long lastSensorTime = 0;
unsigned long lastNetworkTime = 0;
const unsigned long BEEP_COOLDOWN_MS = 5000; // Minimum delay between audible alerts
const unsigned long SENSOR_INTERVAL = 250;   // Ultrasonic sensor polling interval
const unsigned long NETWORK_INTERVAL = 2000; // Database synchronization interval

// Alarm State Variables
bool isBuzzerOn = false;
unsigned long lastBuzzerToggleTime = 0;

// Network Synchronization Flag
bool pendingNetworkUpdate = false;

void setup() {
  Serial.begin(115200);
  
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(redPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  pinMode(bluePin, OUTPUT);
  
  // Initialize Buzzer (Active-Low Configuration)
  pinMode(buzzerPin, OUTPUT);
  digitalWrite(buzzerPin, HIGH); // Set initial state to disabled
  
  // Initialize Input Button with internal pull-up resistor
  pinMode(buttonPin, INPUT_PULLUP);
  
  connectWiFi();
}

void loop() {
  unsigned long currentTime = millis();

  // Handle manual system toggle via tactile button interrupt
  if (digitalRead(buttonPin) == LOW) {
    if (!isButtonPressed && (currentTime - lastButtonPressTime > 500)) {
      isButtonPressed = true;
      lastButtonPressTime = currentTime;
      isSystemActive = !isSystemActive; // Invert system active state
      
      if (isSystemActive) {
        Serial.println("[System] Enabled");
        beep(100); delay(100); beep(100); // Audible confirmation: Enabled
        lastSensorTime = 0; // Reset sensor timer to trigger immediate polling
      } else {
        Serial.println("[System] Disabled");
        beep(400); // Audible confirmation: Disabled
        
        // Disable all physical outputs to conserve power
        digitalWrite(buzzerPin, HIGH);
        isBuzzerOn = false;
        setLED(0, 0, 0); 
        
        // Reset state machine variables
        currentStatus = "Empty";
        previousStatus = "Empty";
      }
    }
  } else {
    isButtonPressed = false;
  }

  // Halt execution if system is manually disabled
  if (!isSystemActive) {
    return;
  }

  // Periodic Sensor Polling and State Evaluation
  if (currentTime - lastSensorTime > SENSOR_INTERVAL) {
    lastSensorTime = currentTime;
    
    float rawDistance = measureDistance();
    
    // Validate sensor bounds (0-400cm is the operational range for HC-SR04)
    if (rawDistance > 0 && rawDistance <= 400.0) {
      currentDistance = rawDistance;

      // Calculate fill level percentage and clamp values
      float fillLevel = ((BIN_CAPACITY_CM - currentDistance) / BIN_CAPACITY_CM) * 100.0;
      if (fillLevel < 0) fillLevel = 0;
      if (fillLevel > 100) fillLevel = 100;
      
      // Determine discrete state thresholds
      String newStatus = "Empty";
      if (fillLevel > 85.0) newStatus = "Full";
      else if (fillLevel > 20.0) newStatus = "Half-Full";
      else newStatus = "Empty";

      // Implement state debounce (hysteresis) to mitigate threshold jitter. 
      // State must persist across multiple polling cycles.
      static String pendingStatus = newStatus;
      static int stableCount = 0;
      
      // Bypass debounce logic upon initial system startup to ensure immediate UI feedback
      if (lastSensorTime == 0) {
         stableCount = 2;
      }
      
      if (newStatus == pendingStatus) {
        stableCount++;
        if (stableCount >= 2) {
          currentStatus = newStatus;
          stableCount = 2; // Cap counter to prevent integer overflow
        }
      } else {
        pendingStatus = newStatus;
        stableCount = 1;
      }

      // Update physical indicators prior to network operations to minimize UI latency
      updateLEDs(currentStatus);

      // Evaluate conditions for state-change alerts
      bool canBeep = (currentTime - lastBeepTime) > BEEP_COOLDOWN_MS;

      // Execute logic upon detecting a confirmed state transition
      if (currentStatus != previousStatus) {
        Serial.print("[State Change] "); Serial.print(previousStatus); Serial.print(" -> "); Serial.println(currentStatus);
        
        // Flag network synchronization to execute asynchronously
        pendingNetworkUpdate = true;
        
        if (canBeep && currentStatus == "Half-Full") {
          beep(100); delay(100); beep(100); // Output half-full alert sequence
          lastBeepTime = currentTime;
        }
      }

      previousDistance = currentDistance;
      previousStatus = currentStatus;
    }
  }

  // Evaluate continuous alarm state machine for Full status (2000ms active, 5000ms inactive)
  if (currentStatus == "Full") {
    unsigned long timeSinceToggle = currentTime - lastBuzzerToggleTime;
    
    if (isBuzzerOn) {
      // Deactivate alarm after active duration
      if (timeSinceToggle >= 2000) {
        digitalWrite(buzzerPin, HIGH); // Disable (Active-Low)
        isBuzzerOn = false;
        lastBuzzerToggleTime = currentTime;
      }
    } else {
      // Activate alarm after inactive duration
      if (timeSinceToggle >= 5000) {
        digitalWrite(buzzerPin, LOW); // Enable (Active-Low)
        isBuzzerOn = true;
        lastBuzzerToggleTime = currentTime;
      }
    }
  } else {
    // Reset alarm state machine when bin is no longer full
    if (isBuzzerOn || lastBuzzerToggleTime != 0) {
      digitalWrite(buzzerPin, HIGH); 
      isBuzzerOn = false;
      // Adjust timer to ensure immediate activation upon re-entering Full state
      lastBuzzerToggleTime = currentTime - 5000; 
    }
  }

  // Execute asynchronous network synchronization
  if (pendingNetworkUpdate || (currentTime - lastNetworkTime > NETWORK_INTERVAL)) {
    pendingNetworkUpdate = false;
    lastNetworkTime = currentTime;
    sendDataToServer(currentDistance);
  }
}

void connectWiFi() {
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    setLED(0, 0, 255); // Indicate connection attempt via blue LED
    delay(500);
    setLED(0, 0, 0);
  }
  beep(200); delay(100); beep(200); // Audible confirmation: Connected
}

long duration;

float measureDistance() {
  digitalWrite(trigPin, LOW); delayMicroseconds(2);
  digitalWrite(trigPin, HIGH); delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  
  // Execute ultrasonic pulse measurement. pulseIn blocks execution until a valid echo is received or timeout occurs.
  duration = pulseIn(echoPin, HIGH); 
  
  // Return maximum threshold upon timeout to indicate empty bin
  if (duration == 0) return 400.0; 
  return duration * 0.034 / 2;
}

void updateLEDs(String status) {
  if (status == "Full") {
    setLED(255, 0, 0); // Map Full state to Red LED
  } else if (status == "Half-Full") {
    setLED(255, 255, 0); // Map Half-Full state to Yellow LED
  } else {
    setLED(0, 255, 0); // Map Empty state to Green LED
  }
}

void setLED(int r, int g, int b) {
  analogWrite(redPin, r); analogWrite(greenPin, g); analogWrite(bluePin, b);
}

// Low-Level Trigger Logic wrapper
void beep(int ms) {
  digitalWrite(buzzerPin, LOW); delay(ms); digitalWrite(buzzerPin, HIGH);
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
    connectWiFi();
  }
}
