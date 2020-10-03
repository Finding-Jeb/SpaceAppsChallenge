#include <ArduinoJson.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include "config.h"

HTTPClient data_client;
int compass;
int elevation;

//https://arduinojson.org/v6/assistant/
const size_t capacity = JSON_OBJECT_SIZE(2) + 20;    
DynamicJsonDocument doc(capacity);    



char readBuffer[40];

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

  
  data_client.begin(LOCAL_SERVER);
  Serial.println("Connected to local server");
  
  
}

void loop() {

  char httpCode = data_client.GET();
  if(httpCode){
      
    //https://arduinojson.org/v6/assistant/  
    String json = data_client.getString(); 
    deserializeJson(doc, json);    
    compass = doc["compass"];
    elevation = doc["elevation"]; 

    Serial.print("compass = ");
    Serial.print(compass);
    Serial.print(", elevation = ");
    Serial.println(elevation);
    
  } 

}
