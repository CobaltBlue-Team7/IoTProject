#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>

//Time interval between measuring distance.
int interval = 15000;   // One Minute

// Data regarding sensor
//int sonarPin = A0;
//int sensorValue;
const int trigPin = D1;
const int echoPin = D2;

// defines variables
long duration;
int distance;
int first_mea;
int temp_mea;
int height_bin = -1;

// Information needed to connect to Wifi
const char* ssid     = "AS712a";
const char* password = "dcclab(!)";

// Information needed to connect to ThingSpeak
const char* host     = "api.thingspeak.com";
String url           = "/update?api_key=LUIAXBEYKEWW2B6R";
const int httpPort   = 80;

// Information needed to connect to the server(Ubuntu VM @ Sogang Univ)
const char* private_server = "163.239.78.89";
const int serverPort       = 5000;
const int serverPort2     = 8000;

// Get distance data from sensor
String working(int trigger, int echo) {
  /*sensorValue=analogRead(sonarPin);
  delay(50);
  Serial.println(sensorValue);
  delay(100);
  return String(sensorValue);*/
  // Clears the trigPin
  digitalWrite(trigger, LOW);
  delayMicroseconds(2);
  // Sets the trigPin on HIGH state for 10 micro seconds
  digitalWrite(trigger, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigger, LOW);
  // Reads the echoPin, returns the sound wave travel time in microseconds
  duration = pulseIn(echo, HIGH);
  // Calculating the distance
  distance= duration*0.034/2;
  // Prints the distance on the Serial Monitor
  Serial.print("Distance: ");
  Serial.println(distance);
  Serial.print("check height_bin :");
  Serial.println(height_bin);
  if(height_bin == -1 && distance <= 100) { // 쓰레기통 높이 결정
    
    height_bin = distance;
    Serial.println("height_bin : ");
    Serial.print(height_bin);
    return String(0.0);
  }
  if(distance <= height_bin) {
    Serial.println("Distance : ");
    Serial.print(distance);
    return String(((float)height_bin-(float)distance) / (float)height_bin * 100.0);
    
  }
  distance = -1;
  return String(-1);
}

// Send the sensor data to 
void delivering(String payload, int bin_num) { 
  String getheader;
  WiFiClient client;
  Serial.print("\nconnecting to Host: ");
  Serial.println(host);

  //Connect to ThingSpeak Server
  if (client.connect(host, httpPort)) {
    //http call to server by using GET Method.
    getheader = "GET "+ String(url) +"&field1="+ String(payload) +" HTTP/1.1";
    client.println(getheader);
    client.println("User-Agent: ESP8266");  
    client.println("Host: " + String(host));  
    client.println("Connection: close");  
    client.println();

    Serial.println(getheader);//To Check
    while (client.connected()) {
      String line = client.readStringUntil('\n');
      Serial.println(line);
    }
  }
  else{
    Serial.print("connection failed to ");
    Serial.println(host);
  }

  Serial.print("\nconnecting to Host: ");
  Serial.println(private_server);

  //Connect to the server
  if(client.connect(private_server,serverPort)){
    //http call to server by using GET Method.
    String getheader = "GET /?temp="+ String(payload) +" HTTP/1.1";
    client.println(getheader);
    client.println("User-Agent: ESP8266");  
    client.println("Host: " + String(private_server));  
    client.println("Connection: close");  
    client.println();
  
    Serial.println(getheader);//To Check
    while (client.connected()) {
      String line = client.readStringUntil('\n');
      Serial.println(line);
    }
  }
  else{
    Serial.print("connection failed to ");
    Serial.println(private_server);
  }
  
  Serial.println("Done cycle.");
}

//Connect to WiFi
void connect_ap() {
  Serial.println();
  Serial.print("connecting to WiFi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.print("\n Got WiFi, IP address: ");
  Serial.println(WiFi.localIP());  
}

void setup() {
  //pinMode(sonarPin,INPUT);
  //Serial.begin(115200);
  pinMode(trigPin, OUTPUT); // Sets the trigPin as an Output
  pinMode(echoPin, INPUT); // Sets the echoPin as an Input
 
  Serial.begin(9600); // Starts the serial communication
  
  connect_ap(); // connect to WiFi
  Serial.println();
  Serial.println("Arduino: Measure The Amount of Trash"); 
  //sensors.begin();
}

unsigned long mark = 0;
void loop() {
  if (millis() > mark ) {
     mark = millis() + interval;
     String payload = working(trigPin, echoPin);  // get sensor data
     if(distance != -1) 
        delivering(payload, 1);   // deliver it to Thingspeak and Linux server via WiFi
   
  }
}
