#include <CheapStepper.h>
#include <Servo.h>
#include <ArduinoJson.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include "config.h"

HTTPClient data_client;
int compass = 0;
int elevation = 0;

//https://arduinojson.org/v6/assistant/
const size_t capacity = JSON_OBJECT_SIZE(2) + 20;    
DynamicJsonDocument doc(capacity);    

//Motors
CheapStepper stepper(0, 4, 5, 16);
bool moveClockwise = true;

Servo servo;

void setup() {
  Serial.begin(115200);
  Serial.println();
  
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
  

  /*Motor setup */
  stepper.setRpm(12); //Fairly low for higher torque
  
  Serial.println();
  Serial.println("Stepper motor:");
  Serial.print(stepper.getRpm()); // get the RPM of the stepper
  Serial.print(" rpm = delay of ");
  Serial.print(stepper.getDelay()); // get delay between steps for set RPM
  Serial.println(" microseconds between steps");

  servo.attach(2);
  servo.write(0);
  delay(500);
}

void loop() {

  
  stepper.run();

  int stepsLeft = stepper.getStepsLeft();

  if(!stepsLeft){
    //Get data from server
    char httpCode = data_client.GET();
    if(httpCode){
        
      //https://arduinojson.org/v6/assistant/  
      String json = data_client.getString(); 
      deserializeJson(doc, json);

      if(doc["compass"] >= compass){
        moveClockwise = true;
      }
      else{
        moveClockwise = false;
      }
      compass = doc["compass"];
      elevation = doc["elevation"]; 
  
      //Serial.print("compass = ");
      //Serial.print(compass);
      //Serial.print(", elevation = ");
      //Serial.println(elevation);    
    }
    
    

    //Use data to drive motors
    stepper.newMoveToDegree(moveClockwise, compass); //do this first, it's non blocking
    servo.write(elevation);
    delay(2000);    
    
   }
  
  
  delay(10);
  

}
