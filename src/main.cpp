#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// ===== PIN DEFINITIONS =====
// Touch Sensor (GND, I/O, VCC)
#define TOUCH_PIN 4        // I/O pin connected to GPIO4

// Buzzer
int buzzer = 25;
int buzzerChannel = 0;

// RGB LED pins
int redPin = 26;
int greenPin = 27;
int bluePin = 14;

int redChannel = 1;
int greenChannel = 2;
int blueChannel = 3;

// LED built-in
#define LED_BUILTIN 2

// ===== KY-038 MICROPHONE PINS =====
#define MIC_ANALOG_PIN 34     // A0 - Analog output
#define MIC_DIGITAL_PIN 35     // D0 - Digital output

// ===== TOUCH SENSOR VARIABLES =====
int touchState = HIGH;
int lastTouchState = HIGH;
unsigned long lastTouchTime = 0;
const int touchDebounce = 200; // 200ms debounce
int touchCount = 0;

// Microphone variables
int soundThreshold = 500;
unsigned long lastSoundTime = 0;
int clapCount = 0;
unsigned long lastClapTime = 0;
const int clapWindow = 500;

// ===== BLE SETUP =====
#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

BLEServer* pServer = NULL;
BLECharacteristic* pCharacteristic = NULL;
bool deviceConnected = false;

// Session tracking
bool sessionActive = false;
unsigned long sessionStartTime = 0;
int sessionDuration = 1500; // 25 minutes

// ===== FUNCTION DECLARATIONS =====
void setColor(int r, int g, int b);
void playChime();
void playCelebration();
void startSession();
void endSession();
void completeSession();
void calibrateMicrophone();
void checkForClaps();
int readAnalogSound();
bool readDigitalSound();

// ===== BLE CALLBACKS =====
class MyServerCallbacks: public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    deviceConnected = true;
    Serial.println("📱 App Connected!");
    digitalWrite(LED_BUILTIN, HIGH);
  }

  void onDisconnect(BLEServer* pServer) {
    deviceConnected = false;
    Serial.println("📱 App Disconnected");
    digitalWrite(LED_BUILTIN, LOW);
    BLEDevice::startAdvertising();
  }
};

class MyCharacteristicCallbacks: public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic* pCharacteristic) {
    std::string value = pCharacteristic->getValue();
    
    if (value.length() > 0) {
      Serial.print("📩 Received: ");
      Serial.println(value.c_str());
      
      String cmd = String(value.c_str());
      
      if (cmd == "START_SESSION") startSession();
      else if (cmd == "END_SESSION") endSession();
      else if (cmd == "LED_RED") setColor(255, 0, 0);
      else if (cmd == "LED_GREEN") setColor(0, 255, 0);
      else if (cmd == "LED_BLUE") setColor(0, 0, 255);
      else if (cmd == "LED_YELLOW") setColor(255, 255, 0);
      else if (cmd == "LED_OFF") setColor(0, 0, 0);
      else if (cmd == "PLAY_CHIME") playChime();
      else if (cmd == "PLAY_CELEBRATION") playCelebration();
      else if (cmd == "CALIBRATE_MIC") calibrateMicrophone();
      else if (cmd.startsWith("SET_THRESHOLD:")) {
        soundThreshold = cmd.substring(14).toInt();
        Serial.printf("🎤 Threshold: %d\n", soundThreshold);
      }
    }
  }
};

// ===== RGB LED CONTROL =====
void setColor(int r, int g, int b) {
  ledcWrite(redChannel, r);
  ledcWrite(greenChannel, g);
  ledcWrite(blueChannel, b);
}

// ===== SOUND EFFECTS =====
void playChime() {
  ledcWrite(buzzerChannel, 200);
  delay(100);
  ledcWrite(buzzerChannel, 0);
  delay(50);
  ledcWrite(buzzerChannel, 200);
  delay(100);
  ledcWrite(buzzerChannel, 0);
}

void playCelebration() {
  for (int i = 0; i < 3; i++) {
    ledcWrite(buzzerChannel, 255);
    delay(150);
    ledcWrite(buzzerChannel, 0);
    delay(100);
  }
  delay(200);
  ledcWrite(buzzerChannel, 200);
  delay(400);
  ledcWrite(buzzerChannel, 0);
}

// ===== SESSION CONTROL =====
void startSession() {
  sessionActive = true;
  sessionStartTime = millis();
  
  Serial.println("▶️ Session started!");
  setColor(0, 255, 0); // Green
  playChime();
  
  if (deviceConnected) {
    pCharacteristic->setValue("SESSION_STARTED");
    pCharacteristic->notify();
    delay(50);
    pCharacteristic->setValue("STATE:ACTIVE");
    pCharacteristic->notify();
  }
}

void endSession() {
  sessionActive = false;
  
  Serial.println("⏹️ Session ended");
  setColor(255, 0, 0); // Red
  playChime();
  
  if (deviceConnected) {
    pCharacteristic->setValue("SESSION_ENDED");
    pCharacteristic->notify();
    delay(50);
    pCharacteristic->setValue("STATE:INACTIVE");
    pCharacteristic->notify();
  }
}

void completeSession() {
  sessionActive = false;
  
  Serial.println("✅ Session complete! +50 XP");
  setColor(0, 0, 255); // Blue
  playCelebration();
  
  if (deviceConnected) {
    pCharacteristic->setValue("XP_EARNED:50");
    pCharacteristic->notify();
    delay(50);
    pCharacteristic->setValue("SESSION_COMPLETE");
    pCharacteristic->notify();
  }
}

// ===== MICROPHONE FUNCTIONS =====
int readAnalogSound() {
  return analogRead(MIC_ANALOG_PIN);
}

bool readDigitalSound() {
  return digitalRead(MIC_DIGITAL_PIN) == HIGH;
}

void calibrateMicrophone() {
  Serial.println("🎤 Calibrating...");
  setColor(0, 0, 255); // Blue during calibration
  
  long total = 0;
  int samples = 50;
  
  for (int i = 0; i < samples; i++) {
    total += readAnalogSound();
    delay(10);
  }
  
  int avg = total / samples;
  soundThreshold = avg + 50; // Set threshold above ambient
  
  Serial.printf("✅ Threshold set to: %d\n", soundThreshold);
  setColor(0, 255, 0); // Back to green
  
  if (deviceConnected) {
    char msg[50];
    sprintf(msg, "MIC_CALIBRATED:%d", soundThreshold);
    pCharacteristic->setValue(msg);
    pCharacteristic->notify();
  }
}

void checkForClaps() {
  int sound = readAnalogSound();
  
  if (sound > soundThreshold) {
    unsigned long now = millis();
    
    if (now - lastClapTime < clapWindow) {
      // Double clap!
      Serial.println("👏 DOUBLE CLAP DETECTED!");
      
      if (deviceConnected) {
        pCharacteristic->setValue("DOUBLE_CLAP");
        pCharacteristic->notify();
      }
      
      // Toggle session
      if (!sessionActive) {
        startSession();
      } else {
        endSession();
      }
      
      clapCount = 0;
    } else {
      // First clap
      clapCount = 1;
      lastClapTime = now;
      // Visual feedback
      setColor(255, 255, 0); // Yellow flash
      delay(50);
      setColor(sessionActive ? 0 : 255, sessionActive ? 255 : 0, 0);
    }
    
    delay(200); // Debounce
  }
}

// ===== TOUCH SENSOR HANDLER =====
void checkTouchSensor() {
  touchState = digitalRead(TOUCH_PIN);
  
  // Touch detected (HIGH when touched - common for most modules)
  // If your module triggers on LOW, change to: touchState == LOW && lastTouchState == HIGH
  if (touchState == HIGH && lastTouchState == LOW) {
    
    // Debounce
    if (millis() - lastTouchTime > touchDebounce) {
      
      touchCount++;
      Serial.printf("👆 Touch #%d detected! (Pin: %d, State: %d)\n", touchCount, TOUCH_PIN, touchState);
      
      // Visual feedback
      digitalWrite(LED_BUILTIN, HIGH);
      setColor(255, 255, 255); // White flash
      
      // Send to app
      if (deviceConnected) {
        pCharacteristic->setValue("TOUCH_DETECTED");
        pCharacteristic->notify();
        delay(20);
        
        char countMsg[30];
        sprintf(countMsg, "TOUCH_COUNT:%d", touchCount);
        pCharacteristic->setValue(countMsg);
        pCharacteristic->notify();
      }
      
      // Toggle session
      if (!sessionActive) {
        startSession();
      } else {
        endSession();
      }
      
      lastTouchTime = millis();
      delay(100);
      digitalWrite(LED_BUILTIN, LOW);
    }
  }
  
  lastTouchState = touchState;
}

// ===== SETUP =====
void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n🎓 SMARTECO STUDY BUDDY - TOUCH SENSOR");
  Serial.println("======================================");
  
  // Initialize pins
  pinMode(TOUCH_PIN, INPUT);  // Touch sensor I/O pin
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(MIC_ANALOG_PIN, INPUT);
  pinMode(MIC_DIGITAL_PIN, INPUT);
  
  // Test touch sensor at startup
  Serial.println("👆 Testing touch sensor...");
  Serial.print("   Current state: ");
  Serial.println(digitalRead(TOUCH_PIN) == HIGH ? "HIGH (no touch)" : "LOW (touched)");
  Serial.println("   Touch the sensor now to verify!");
  
  // Buzzer setup
  ledcSetup(buzzerChannel, 5000, 8);
  ledcAttachPin(buzzer, buzzerChannel);
  
  // RGB PWM setup
  ledcSetup(redChannel, 10000, 8);
  ledcSetup(greenChannel, 10000, 8);
  ledcSetup(blueChannel, 10000, 8);
  
  ledcAttachPin(redPin, redChannel);
  ledcAttachPin(greenPin, greenChannel);
  ledcAttachPin(bluePin, blueChannel);
  
  // BLE Setup
  Serial.println("📱 Starting BLE...");
  BLEDevice::init("SmartEco Buddy");
  
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());
  
  BLEService *pService = pServer->createService(SERVICE_UUID);
  
  pCharacteristic = pService->createCharacteristic(
    CHARACTERISTIC_UUID,
    BLECharacteristic::PROPERTY_READ |
    BLECharacteristic::PROPERTY_WRITE |
    BLECharacteristic::PROPERTY_NOTIFY
  );
  
  pCharacteristic->addDescriptor(new BLE2902());
  pCharacteristic->setCallbacks(new MyCharacteristicCallbacks());
  
  pService->start();
  
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->start();
  
  Serial.println("✅ BLE Ready! Device: SmartEco Buddy");
  
  // Calibrate microphone
  calibrateMicrophone();
  
  // Startup sequence
  setColor(255, 255, 255);
  playChime();
  delay(200);
  setColor(0, 255, 0);
  
  Serial.println("\n🎓 Ready!");
  Serial.println("  • Touch sensor to start/stop sessions");
  Serial.println("  • Double clap to toggle session");
  Serial.println("  • Connect via Bluetooth to control");
  Serial.println("========================================\n");
}

// ===== LOOP =====
void loop() {
  // Check touch sensor (runs every 10ms)
  checkTouchSensor();
  
  // Check for claps
  checkForClaps();
  
  // Send sound level if connected
  if (deviceConnected && millis() % 100 < 10) {
    char msg[20];
    sprintf(msg, "SOUND:%d", readAnalogSound());
    pCharacteristic->setValue(msg);
    pCharacteristic->notify();
  }
  
  // Check session timer
  if (sessionActive) {
    unsigned long elapsed = (millis() - sessionStartTime) / 1000;
    
    if (elapsed >= sessionDuration) {
      completeSession();
    }
    
    // Send time updates every second
    if (deviceConnected && millis() % 1000 < 10) {
      char timeMsg[20];
      sprintf(timeMsg, "TIME:%lu", elapsed);
      pCharacteristic->setValue(timeMsg);
      pCharacteristic->notify();
    }
  }
  
  delay(10);
}