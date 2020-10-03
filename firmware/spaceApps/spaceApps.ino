#include <ESP8266WiFi.h>
#include "config.h"


void setup() {
  Serial.begin(115200);
  Serial.println();

  /* this part probably isn't necessary as the esp8266 will act as a client
  IPAddress STATIC_IP;
  IPAddress GATEWAY;
  IPAddress SUBNET_MASK;
  WiFi.config(ip, gateway, subnet_mask);
  WiFi.mode(WIFI_STA);
  */
  
  WiFi.begin(SSID_LOCAL, WLAN_KEY);
  

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
