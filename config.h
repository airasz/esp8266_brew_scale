#include <ESP8266WiFi.h>

// Replace with your network credentials
const char *ssid = "";
const char *password = "";
// Set your Static IP address
IPAddress local_IP(192, 168, 2, 10);
// Set your Gateway IP address
// IPAddress gateway(192, 168, 2, 110); // yk-l1 firmware
IPAddress gateway(192, 168, 1, 1);

IPAddress subnet(255, 255, 0, 0);
IPAddress primaryDNS(8, 8, 8, 8);   // optional
IPAddress secondaryDNS(8, 8, 4, 4); // optional

String hostname = "sendhang";
String APname = "aPlug";
