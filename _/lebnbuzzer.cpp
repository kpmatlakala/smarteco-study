#include <Arduino.h>

#ifndef LED_BUILTIN
  #define LED_BUILTIN 2
#endif

int buzzer = 25;
int channel = 0;

void setup() {
  Serial.begin(115200);
  pinMode(LED_BUILTIN, OUTPUT);

  Serial.println("ESP32 LED + Buzzer Test");

  // Setup PWM
  ledcSetup(channel, 2000, 8);
  ledcAttachPin(buzzer, channel);
}

void loop() {
  Serial.println("ON");

  digitalWrite(LED_BUILTIN, HIGH);
  ledcWrite(channel, 128); // buzzer ON

  delay(1000);

  Serial.println("OFF");

  digitalWrite(LED_BUILTIN, LOW);
  ledcWrite(channel, 0); // buzzer OFF

  delay(1000);
}