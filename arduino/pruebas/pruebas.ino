void setup() {
  Serial.begin(9600);
}

int readAnalogSensor(int pin) {
  // No uses pinMode aquí
  return analogRead(pin);
}

int readDigitalSensor(int pin) {
  pinMode(pin, INPUT);
  return digitalRead(pin);
}

String sliceString(String text, int from, int to) {
  text.trim();
  if (to <= 0 || to > text.length()) {
    to = text.length();
  }
  return text.substring(from, to);
}

void loop() {
  if (Serial.available()) {
    String message = Serial.readStringUntil('\n');
    message.trim();

    if (message.length() < 3) return;

    String method = sliceString(message, 0, 1);
    String pinType = sliceString(message, 1, 2);
    String pinStr = sliceString(message, 2, 0);
    int pin = pinStr.toInt();

    int value = -1;

    if (method == "p") {
      if (pinType == "a") {
        value = readAnalogSensor(pin);
      } else if (pinType == "d") {
        value = readDigitalSensor(pin);
      }

      Serial.println(String(value));  // Envío final limpio
    }
  }
}
