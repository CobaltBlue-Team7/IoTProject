#include <Arduino.h>
#include <ESP8266WiFi.h>
#ifdef ESP8266
extern "C" {
#include "user_interface.h"
#include "wpa2_enterprise.h"
}
#endif

static u8 ent_username[] = "yourusername"; // same as the mdoification to lipwpa2.a file
static u8 ent_password[] = "your password";
const char* host = "api.thingspeak.com";

void setup(){
  pinMode(LED_BUILTIN, OUTPUT);
  char a[100];
  ip_info info;
  wifi_get_ip_info(0, &info);

  Serial.begin(115200);

  wifi_station_disconnect();
  wifi_set_opmode(STATION_MODE);

  char ssid[32] = "yourssid";
  char password[64] = {0x00};
  struct station_config stationConf;
  stationConf.bssid_set = 0;  //need not check MAC address of AP
  memcpy(&stationConf.ssid, ssid, 32);
  memcpy(&stationConf.password, password, 64);

  if(!wifi_station_set_config(&stationConf)){
    Serial.print("\r\nset config fail\r\n");
  }

  // switch to WPA2 Enterprise 
  wifi_station_set_wpa2_enterprise_auth(1); 

  if(wifi_station_set_enterprise_username (ent_username, strlen((char*)ent_username))){
    Serial.print("\r\nusername set fail\r\n");
  }
  if(wifi_station_set_enterprise_password (ent_password, strlen((char*)ent_password))){
    Serial.print("\r\npassword set fail\r\n");
  }

  if(!wifi_station_connect()){
    Serial.print("\r\nconnect fail\r\n");
  }

  Serial.print("\r\ntrying to connect...");

  while(info.ip.addr == 0){
    ESP.wdtFeed();
    Serial.print(".");
    delay(1000);
    wifi_get_ip_info(0, &info);
  }

  sprintf(a, "%"PRIu32,info.ip.addr);
  Serial.print("\r\nip addr: ");
  Serial.print(a);
  Serial.print("\r\n");
}


void loop()
{ 
  WiFiClient client;
  const int httpPort = 80;

  if (!client.connect(host, httpPort)) {
    Serial.println("connection failed");
    return;
  }
  else
  {
    Serial.println("connected !");
  }


  //client.print("GET /update?key=82RS9VJ7YHQGMWT1&field1=1000\n");

  char buffer[200];
  int adcValue = analogRead(A0);
  Serial.println(adcValue);
  sprintf(buffer, "GET /update?key=IYFDMJ5JMSCC8NP4&field1=%d\n", adcValue);
  client.print(buffer);

  while (client.available()) {
    String line = client.readStringUntil('\r');
    Serial.print(line);
  }

  client.stop();
  Serial.println("closing connection");
  digitalWrite(LED_BUILTIN, LOW);  // Turn the LED off by making the voltage HIGH
  delay(2000);
  digitalWrite(LED_BUILTIN, HIGH);  // Turn the LED off by making the voltage HIGH
  delay(2000);

delay(60000);
}