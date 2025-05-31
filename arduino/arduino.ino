int serialPort = 9600;
String streamingPins[10];

void setup() {
  Serial.begin(serialPort);

  //Agregar 10 posiciones vacías (NULL) en streaming
  for (int index = 0; index < 10; index++) {
    streamingPins[index] = "";
  }
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

void loop() {
  //Streams
  streamAllPins();




  if (Serial.available()) {

    String message = Serial.readStringUntil('\n');
    message.trim();

    String method = sliceString(message, 0, 1);

    int value = -1;

    if (method == "p") {  //pa1

      String pinType = sliceString(message, 1, 2);
      String pinStr = sliceString(message, 2, 0);
      int pin = pinStr.toInt();

      if (pinType == "a") {
        value = readAnalogSensor(pin);
      } else if (pinType == "d") {
        value = readDigitalSensor(pin);
      }

      sendMessage(String(value));

    } else if (method == "w") {  //wa1:255
      String pinType = sliceString(message, 1, 2);

      String infoStr = sliceString(message, 2, 0);

      String pinStr = splitString(infoStr, ":", 0);
      int pin = pinStr.toInt();

      String valueStr = splitString(infoStr, ":", 1);
      int value = valueStr.toInt();

      if (pinType == "d") {
        writeDigitalSensor(pin, value);

      } else if (pinType == "a") {
        writeAnalogSensor(pin, value);
      }

    } else if (method == "s") {
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
    }
  }
}
