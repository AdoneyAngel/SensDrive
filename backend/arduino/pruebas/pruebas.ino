const int trigPin = 2;   // Pin digital
const int echoPin = 3;  // Pin digital (NO analógico)

void setup() {
  Serial.begin(9600);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  digitalWrite(trigPin, LOW);
}

void loop() {
  // Pulso de trigger
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  // Medir duración del pulso Echo
  long duration = pulseIn(echoPin, HIGH, 30000); // timeout 30 ms (~5 m)

  if (duration == 0) {
    Serial.println("Sin eco");
  } else {
    long distance = duration * 0.034 / 2; // cm
    Serial.print("Distancia: ");
    Serial.print(distance);
    Serial.println(" cm");
  }

  delay(200);
}
