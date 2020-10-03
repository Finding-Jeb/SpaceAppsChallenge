#include <ESP8266WiFi.h>
#include "config.h"

void setup() {
  Serial.begin(115200);
  Serial.println();
  
  WiFi.begin("SSID", "WLAN_KEY");

  Serial.print("Connecting");
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }
  Serial.println();

  Serial.print("Connected, IP address: ");
  Serial.println(WiFi.localIP());

  

}

void loop() {
  // put your main code here, to run repeatedly:

}
