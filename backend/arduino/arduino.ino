int serialPort = 9600;
String streamingPins[10];
String proximitySensors[10];

void setup() {
  Serial.begin(serialPort);

  //Agregar 10 posiciones vacías (NULL) en streaming
  for (int index = 0; index < 10; index++) {
    streamingPins[index] = "";
  }

  Serial.println("READY");
}

//----READ SENSORS
int readAnalogSensor(int pin) {
  // No uses pinMode aquí
  return analogRead(pin);
}

int readDigitalSensor(int pin) {
  pinMode(pin, INPUT);
  return digitalRead(pin);
}

//----WRITE SENSORS
void writeDigitalSensor(int pin, int value) {  //Solo permite valores negativos o positivos
  pinMode(pin, OUTPUT);

  if (value > 0) {
    digitalWrite(pin, HIGH);

  } else if (value <= 0) {
    digitalWrite(pin, LOW);
  }
}
void writeAnalogSensor(int pin, int value) {  //Solo permite valores 0-255
  pinMode(pin, OUTPUT);

  if (value > 255) {
    value = 255;

  } else if (value < 0) {
    value = 0;
  }

  analogWrite(pin, value);
}

//----TRANSFORMS
String sliceString(String text, int from, int to) {
  text.trim();
  if (to <= 0 || to > text.length()) {
    to = text.length();
  }
  return text.substring(from, to);
}

void sendMessage(String message) {
  Serial.println(message);
}

String splitString(String text, const char* delimiter, int position) {
  char buffer[64];  // Asegúrate de que sea lo bastante grande
  text.toCharArray(buffer, sizeof(buffer));

  char* token = strtok(buffer, delimiter);
  int currentPos = 0;

  while (token != NULL) {
    if (currentPos == position) {
      return String(token);  // Convertimos char* a String antes de retornar
    }

    token = strtok(NULL, delimiter);
    currentPos++;
  }

  return "";  // Si no se encuentra la posición deseada
}

//----STREAMS
int pinFromStreamStr(String text) {
  return splitString(text, "-", 1).toInt();
}
String typeFromStreamStr(String text) {
  return splitString(text, "-", 0);
}

bool pinIsStreaming(String streamingText) {

  for (int index = 0; index < (sizeof(streamingPins) / sizeof(streamingPins[0])); index++) {
    String streamingText = streamingPins[index];

    if (streamingText == streamingText) {
      return true;
    }
  }

  return false;
}

int findStreamingPinIndex(String streamingText) {
  for (int index = 0; index < (sizeof(streamingPins) / sizeof(streamingPins[0])); index++) {
    String actualStreamingText = streamingPins[index];

    if (actualStreamingText == streamingText) {
      return index;
    }
  }

  return -1;
}

void startStream(String streamingText) {
  if (findStreamingPinIndex(streamingText) > -1) {
    return;
  }

  //Encontrar una posición vacía
  int newPosition = 0;
  for (int index = 0; index <= (sizeof(streamingPins) / sizeof(streamingPins[0])); index++) {
    if (!streamingPins[index].length()) {
      newPosition = index;
    }
  }

  streamingPins[newPosition] = streamingText;
}

void endStream(String streamingText) {
  for (int index = 0; index < (sizeof(streamingPins) / sizeof(streamingPins[0])); index++) {
    if (streamingPins[index] == streamingText) {
      streamingPins[index] = "";

      break;
    }
  }
}

void streamAllPins() {
  for (int index = 0; index < (sizeof(streamingPins) / sizeof(streamingPins[0])); index++) {
    String actualStreamingText = streamingPins[index];

    if (actualStreamingText.length()) {
      String actualType = typeFromStreamStr(actualStreamingText);
      int actualpin = pinFromStreamStr(actualStreamingText);

      if (actualType == "d") {
        Serial.println(actualStreamingText + ":" + readDigitalSensor(actualpin));

      } else if (actualType == "a") {
        Serial.println(actualStreamingText + ":" + readAnalogSensor(actualpin));
      }
    }
  }
}

String genStreamingtext(int pin, String type) {
  String streamingText = type + "-" + String(pin);

  return streamingText;
}

//----PROXIMITY
void startProximity(String info) {
  bool exist = false;
  int freeIndex = 0;
  for (int index = 0; index < (sizeof(proximitySensors) / sizeof(proximitySensors[0])); index++) {
    String actualProximitySensor = proximitySensors[index];

    if (actualProximitySensor == info) {
      exist = true;

    } else if (actualProximitySensor.length() == 0) {
      freeIndex = index;
    }
  }

  if (!exist) {
    proximitySensors[freeIndex] = info;
  }
}
void endProximity(String info) {
  for (int index = 0; index < (sizeof(proximitySensors) / sizeof(proximitySensors[0])); index++) {
    String actualProximitySensor = proximitySensors[index];

    if (actualProximitySensor == info) {
      proximitySensors[index] = "";

      break;
    }
  }
}

void readAllProximity() {
  //Set off
  for (int index = 0; index < (sizeof(proximitySensors) / sizeof(proximitySensors[0])); index++) {
    String actualProximitySensor = proximitySensors[index];

    if (actualProximitySensor.length() > 0) {
      String trigger = splitString(actualProximitySensor, "-", 1);
      String echo = splitString(actualProximitySensor, "-", 0);

      pinMode(echo.toInt(), INPUT);
      pinMode(trigger.toInt(), OUTPUT);

      digitalWrite(trigger.toInt(), LOW);
    }
  }

  delayMicroseconds(2);

  //Trigger

  for (int index = 0; index < (sizeof(proximitySensors) / sizeof(proximitySensors[0])); index++) {
    String actualProximitySensor = proximitySensors[index];

    if (actualProximitySensor.length() > 0) {
      String pin = splitString(actualProximitySensor, "-", 1);

      digitalWrite(pin.toInt(), HIGH);
    }
  }

  delayMicroseconds(10);

  //Set off

  for (int index = 0; index < (sizeof(proximitySensors) / sizeof(proximitySensors[0])); index++) {
    String actualProximitySensor = proximitySensors[index];

    if (actualProximitySensor.length() > 0) {
      String pin = splitString(actualProximitySensor, "-", 1);

      digitalWrite(pin.toInt(), LOW);
    }
  }

  //Calc

  for (int index = 0; index < (sizeof(proximitySensors) / sizeof(proximitySensors[0])); index++) {
    String actualProximitySensor = proximitySensors[index];

    if (actualProximitySensor.length() > 0) {
      String readPin = splitString(actualProximitySensor, "-", 0);
      String pin = splitString(actualProximitySensor, "-", 1);

      long duration = pulseIn(readPin.toInt(), HIGH);
      long distance = duration * 0.034 / 2;

      Serial.println(readPin.toInt());

      Serial.println("r" + readPin + "-" + pin + ":" + String(distance));
    }
  }

  delay(25);
}
//----PROXIMITY

void loop() {
  //Proximity
  readAllProximity();

  //Streams
  streamAllPins();


  if (Serial.available()) {

    String message = Serial.readStringUntil('\n');
    message.trim();

    String method = sliceString(message, 0, 1);

    int value = -1;

    if (method == "p") {  //p[a/d][pin] //Read pin

      String pinType = sliceString(message, 1, 2);
      String pinStr = sliceString(message, 2, 0);
      int pin = pinStr.toInt();

      if (pinType == "a") {  //Analog pin
        value = readAnalogSensor(pin);

      } else if (pinType == "d") {  //Digital pin
        value = readDigitalSensor(pin);
      }

      String responseMessage = "p" + pinType + pinStr + ":" + String(value);

      sendMessage(responseMessage);

    } else if (method == "w") {  //w[a/d][pin]:[value] //Write/send to pin
      String pinType = sliceString(message, 1, 2);

      String infoStr = sliceString(message, 2, 0);

      String pinStr = splitString(infoStr, ":", 0);
      int pin = pinStr.toInt();

      String valueStr = splitString(infoStr, ":", 1);
      int value = valueStr.toInt();

      if (pinType == "d") {  //To digital pin
        writeDigitalSensor(pin, value);

      } else if (pinType == "a") {  //To analog pin
        writeAnalogSensor(pin, value);
      }

    } else if (method == "s") {                    //Stream                //s[+/-][d/a][pin]
      String action = sliceString(message, 1, 2);  //-\+ (stop\star streaming)
      String type = sliceString(message, 2, 3);
      String pin = sliceString(message, 3, 0);

      if (type == "d" || type == "a") {
        if (action == "+") {
          startStream(genStreamingtext(pin.toInt(), type));

        } else if (action == "-") {
          endStream(genStreamingtext(pin.toInt(), type));
        }
      }

    } else if (method == "t") {  //Tone  //t4:1000-100 t[pin]:[frecuency]-[duration]
      String info = sliceString(message, 1, 0);
      String pin = splitString(info, ":", 0);
      String frecuencyInfo = splitString(info, ":", 1);
      String frecuency = splitString(frecuencyInfo, "-", 0);
      String duration = splitString(frecuencyInfo, "-", 1);

      tone(pin.toInt(), frecuency.toInt(), duration.toInt());

    } else if (method == "r") {  //Proximity  //r[+/-][readPin]-[pin]
      String action = sliceString(message, 1, 2);
      String info = sliceString(message, 2, 0);
      String readPin = splitString(info, "-", 0);
      String pin = splitString(info, "-", 1);

      if (action == "+") {  //Start proximity stream
        startProximity(readPin + "-" + pin);

      } else if (action == "-") {  //End proximity
        endProximity(readPin + "-" + pin);
      }
    }
  }
}
