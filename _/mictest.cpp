#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// ===== PIN DEFINITIONS =====
// Button
int buttonPin = 4;
int buttonState = HIGH;
int lastButtonState = HIGH;

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

// LED built-in (usually GPIO2 on ESP32)
#define LED_BUILTIN 2

// ===== KY-038 MICROPHONE PINS =====
#define MIC_ANALOG_PIN 34     // A0 - Analog output (ADC)
#define MIC_DIGITAL_PIN 35     // D0 - Digital output (HIGH when sound detected)

// Microphone variables
int soundLevel = 0;
int soundThreshold = 500;      // Default threshold
bool soundDetected = false;
unsigned long lastSoundTime = 0;
int clapCount = 0;
unsigned long lastClapTime = 0;
const int clapWindow = 500;    // ms between claps to count as double-clap

// ===== BLE SETUP =====
#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

BLEServer* pServer = NULL;
BLECharacteristic* pCharacteristic = NULL;
bool deviceConnected = false;

// Session tracking
bool sessionActive = false;
unsigned long sessionStartTime = 0;
int sessionDuration = 1500; // 25 minutes (use 10 for demo)

// ===== FUNCTION DECLARATIONS (MUST COME BEFORE USE) =====
void setColor(int r, int g, int b);
void playChime();
void playCelebration();
void startSession();
void endSession();
void completeSession();
void testMicrophone();
void calibrateMicrophone();
void checkForClaps();
void checkDigitalSound();
int readAnalogSound();
bool readDigitalSound();

// ===== BLE CALLBACKS =====
class MyServerCallbacks: public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    deviceConnected = true;
    Serial.println("📱 App Connected!");
  }

  void onDisconnect(BLEServer* pServer) {
    deviceConnected = false;
    Serial.println("📱 App Disconnected");
    BLEDevice::startAdvertising();
  }
};

class MyCharacteristicCallbacks: public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic* pCharacteristic) {
    std::string value = pCharacteristic->getValue();
    
    if (value.length() > 0) {
      Serial.print("📩 Received: ");
      Serial.println(value.c_str());
      
      // Parse commands - FIXED: using compare instead of == for std::string
      if (value.compare("START_SESSION") == 0) {
        startSession();
      }
      else if (value.compare("END_SESSION") == 0) {
        endSession();
      }
      else if (value.compare("LED_RED") == 0) {
        setColor(255, 0, 0);
      }
      else if (value.compare("LED_GREEN") == 0) {
        setColor(0, 255, 0);
      }
      else if (value.compare("LED_BLUE") == 0) {
        setColor(0, 0, 255);
      }
      else if (value.compare("LED_YELLOW") == 0) {
        setColor(255, 255, 0);
      }
      else if (value.compare("LED_CYAN") == 0) {
        setColor(0, 255, 255);
      }
      else if (value.compare("LED_MAGENTA") == 0) {
        setColor(255, 0, 255);
      }
      else if (value.compare("LED_WHITE") == 0) {
        setColor(255, 255, 255);
      }
      else if (value.compare("LED_OFF") == 0) {
        setColor(0, 0, 0);
      }
      else if (value.compare("PLAY_CHIME") == 0) {
        playChime();
      }
      else if (value.compare("PLAY_CELEBRATION") == 0) {
        playCelebration();
      }
      else if (value.compare("TEST_MIC") == 0) {
        testMicrophone();
      }
      else if (value.compare("CALIBRATE_MIC") == 0) {
        calibrateMicrophone();
      }
      else if (value.find("SET_THRESHOLD:") == 0) {
        // FIXED: using find instead of startsWith
        String val = String(value.c_str());
        int threshold = val.substring(14).toInt();
        soundThreshold = threshold;
        Serial.printf("🎤 Threshold set to: %d\n", soundThreshold);
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
    delay(100);
    pCharacteristic->setValue("SESSION_COMPLETE");
    pCharacteristic->notify();
  }
}

// ===== MICROPHONE FUNCTIONS =====

// Read analog sound level (0-4095)
int readAnalogSound() {
  return analogRead(MIC_ANALOG_PIN);
}

// Read digital sound detection (HIGH/LOW)
bool readDigitalSound() {
  return digitalRead(MIC_DIGITAL_PIN) == HIGH;
}

// Calibrate microphone - finds ambient noise level
void calibrateMicrophone() {
  Serial.println("🎤 Calibrating microphone...");
  setColor(0, 0, 255); // Blue = calibrating
  
  int samples = 100;
  long total = 0;
  int maxVal = 0;
  int minVal = 4095;
  
  for (int i = 0; i < samples; i++) {
    int val = readAnalogSound();
    total += val;
    if (val > maxVal) maxVal = val;
    if (val < minVal) minVal = val;
    delay(10);
  }
  
  int avg = total / samples;
  soundThreshold = avg + 100; // Set threshold above ambient
  
  Serial.println("🎤 Calibration complete:");
  Serial.print("   Min: "); Serial.println(minVal);
  Serial.print("   Max: "); Serial.println(maxVal);
  Serial.print("   Avg: "); Serial.println(avg);
  Serial.print("   Threshold: "); Serial.println(soundThreshold);
  
  if (deviceConnected) {
    char msg[50];
    sprintf(msg, "MIC_CALIBRATED:%d,%d,%d", minVal, maxVal, soundThreshold);
    pCharacteristic->setValue(msg);
    pCharacteristic->notify();
  }
  
  setColor(0, 255, 0); // Back to green
}

// Test microphone and send data to app
void testMicrophone() {
  Serial.println("🎤 Testing microphone for 5 seconds...");
  
  if (deviceConnected) {
    pCharacteristic->setValue("MIC_TEST_START");
    pCharacteristic->notify();
  }
  
  setColor(255, 255, 0); // Yellow = testing
  
  unsigned long startTime = millis();
  int sampleCount = 0;
  int maxSound = 0;
  int minSound = 4095;
  int triggerCount = 0;
  
  while (millis() - startTime < 5000) {
    int analogVal = readAnalogSound();
    bool digitalVal = readDigitalSound();
    
    if (analogVal > maxSound) maxSound = analogVal;
    if (analogVal < minSound) minSound = analogVal;
    if (digitalVal) triggerCount++;
    
    // Visual feedback - LED brightness follows sound
    int brightness = map(analogVal, 0, 4095, 0, 255);
    setColor(255, 255, brightness);
    
    // Send to app every 100ms
    if (sampleCount % 10 == 0 && deviceConnected) {
      char msg[30];
      sprintf(msg, "MIC_LEVEL:%d,%d", analogVal, digitalVal);
      pCharacteristic->setValue(msg);
      pCharacteristic->notify();
    }
    
    sampleCount++;
    delay(10);
  }
  
  // Test complete
  Serial.println("🎤 TEST COMPLETE:");
  Serial.print("   Min: "); Serial.println(minSound);
  Serial.print("   Max: "); Serial.println(maxSound);
  Serial.print("   Triggers: "); Serial.println(triggerCount);
  
  if (deviceConnected) {
    char result[60];
    sprintf(result, "MIC_RESULT:%d,%d,%d,%d", minSound, maxSound, triggerCount, soundThreshold);
    pCharacteristic->setValue(result);
    pCharacteristic->notify();
  }
  
  setColor(0, 255, 0); // Back to green
}

// Check for claps using analog reading
void checkForClaps() {
  int sound = readAnalogSound();
  
  if (sound > soundThreshold) {
    // Sound detected above threshold
    unsigned long now = millis();
    
    if (now - lastClapTime < clapWindow) {
      // Double clap!
      Serial.println("👏 DOUBLE CLAP DETECTED!");
      
      if (deviceConnected) {
        pCharacteristic->setValue("DOUBLE_CLAP");
        pCharacteristic->notify();
      }
      
      // Toggle session on double clap
      if (!sessionActive) {
        startSession();
      } else {
        endSession();
      }
      
      // Visual feedback
      playChime();
      setColor(255, 255, 255); // Flash white
      delay(100);
      setColor(sessionActive ? 0 : 255, sessionActive ? 255 : 0, 0);
      
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
    
    // Debounce
    delay(200);
  }
}

// Check digital sound detection (simpler but less precise)
void checkDigitalSound() {
  if (readDigitalSound()) {
    unsigned long now = millis();
    
    if (now - lastSoundTime < clapWindow) {
      // Double sound
      Serial.println("👏 DOUBLE DETECTED!");
      
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
      
      delay(300); // Debounce
    }
    
    lastSoundTime = now;
  }
}

// ===== SETUP =====
void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n\n🎓 SMARTECO STUDY BUDDY - KY-038 MICROPHONE");
  Serial.println("==========================================");
  
  // Initialize pins
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(LED_BUILTIN, OUTPUT);
  
  // KY-038 Microphone pins
  pinMode(MIC_ANALOG_PIN, INPUT);
  pinMode(MIC_DIGITAL_PIN, INPUT);
  
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
  Serial.println("📱 Initializing BLE...");
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
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);
  pAdvertising->setMinPreferred(0x12);
  BLEDevice::startAdvertising();
  
  Serial.println("✅ BLE Ready! Device: SmartEco Buddy");
  
  // Calibrate microphone on startup
  delay(1000);
  calibrateMicrophone();
  
  // Startup sequence
  digitalWrite(LED_BUILTIN, HIGH);
  setColor(255, 255, 255);
  ledcWrite(buzzerChannel, 200);
  delay(200);
  digitalWrite(LED_BUILTIN, LOW);
  setColor(0, 255, 0);
  ledcWrite(buzzerChannel, 0);
  
  Serial.println("\n🎓 Ready! Commands:");
  Serial.println("  • Press button to cycle colors");
  Serial.println("  • Clap twice to toggle session");
  Serial.println("  • Adjust VR1 screw to change sensitivity");
  Serial.println("  • Connect via Bluetooth to control");
  Serial.println("========================================\n");
}

// ===== MAIN LOOP =====
void loop() {
  // Button handling
  buttonState = digitalRead(buttonPin);
  
  if (buttonState == LOW && lastButtonState == HIGH) {
    delay(50);
    
    if (digitalRead(buttonPin) == LOW) {
      static int colorIndex = 0;
      colorIndex = (colorIndex + 1) % 8;
      
      digitalWrite(LED_BUILTIN, HIGH);
      ledcWrite(buzzerChannel, 255);
      delay(50);
      ledcWrite(buzzerChannel, 0);
      
      switch(colorIndex) {
        case 0: setColor(255, 0, 0); Serial.println("🔴 RED"); break;
        case 1: setColor(0, 255, 0); Serial.println("🟢 GREEN"); break;
        case 2: setColor(0, 0, 255); Serial.println("🔵 BLUE"); break;
        case 3: setColor(255, 255, 0); Serial.println("🟡 YELLOW"); break;
        case 4: setColor(0, 255, 255); Serial.println("🔷 CYAN"); break;
        case 5: setColor(255, 0, 255); Serial.println("🟪 MAGENTA"); break;
        case 6: setColor(255, 255, 255); Serial.println("⚪ WHITE"); break;
        case 7: setColor(0, 0, 0); Serial.println("⚫ OFF"); break;
      }
      
      if (deviceConnected) {
        pCharacteristic->setValue("BUTTON_PRESS");
        pCharacteristic->notify();
      }
      
      digitalWrite(LED_BUILTIN, LOW);
    }
  }
  
  lastButtonState = buttonState;
  
  // Check for claps (using analog reading - more precise)
  checkForClaps();
  
  // Alternative: simpler digital check
  // checkDigitalSound();
  
  // Check session timer
  if (sessionActive) {
    unsigned long elapsedSeconds = (millis() - sessionStartTime) / 1000;
    
    if (elapsedSeconds >= sessionDuration) {
      completeSession();
    }
    
    // Send time updates every 5 seconds
    if (elapsedSeconds % 5 == 0 && deviceConnected) {
      char timeMsg[20];
      sprintf(timeMsg, "TIME:%lu", elapsedSeconds);
      pCharacteristic->setValue(timeMsg);
      pCharacteristic->notify();
    }
  }
  
  delay(10);
}