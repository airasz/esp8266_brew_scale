

#include <ESP8266mDNS.h>
#include <ESPAsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <AsyncElegantOTA.h>
#include <FS.h>

#include <EEPROM.h>
#include "EEPROM_rw_anything.h"
#include "config.h"

#include <NTPClient.h>
#include <WiFiUdp.h>

#include "HX711.h" // Library

// #include <Tone32.h>
#include "note.h"

#include <Adafruit_NeoPixel.h>
#ifdef __AVR__
#include <avr/power.h> // Required for 16 MHz Adafruit Trinket
#endif

// #include <NeoPixelBus.h>
// #include <NeoPixelAnimator.h>

const uint16_t PixelCount = 1; //

const uint8_t PixelPin = 13; //

// NeoPixelBus<NeoGrbFeature, Neo800KbpsMethod> NEO(PixelCount, PixelPin);

Adafruit_NeoPixel NEO(PixelCount, PixelPin, NEO_GRB + NEO_KHZ800);
// RgbColor colore;
uint16_t colore;
#define TARE_PIN 14

#define DOUT 12 // Arduino pin 6 connect to HX711 DOUT
#define CLK 14  //  Arduino pin 5 connect to HX711 CLK

int getAverageRate = 8; // average rate value of load cell reading
HX711 scale;            // Init of library

#define BUZZER_PIN 15
#define BUZZER_CHANNEL 0
int beepingMode = 0; // 0: double beep rise 1:double beep fall 2:single beep

int incwater = 0;
bool pour_limit_watch = 0;

int timeseqIndex = 0;       //
int waterseqIndex = 0;      // total sequence step
int waterseqCountIndex = 0; // sequence step progress
int timerseqCountIndex = 0;
int displayCount = 0;
int wtarget;
bool b_tare = 0;
bool b_increment = 0; // enable/disable increment
int incrementValue = 0;
int i_gram = 0;
float old_grame;
int i_gramPrev = 0;
int pourTimer = 0;
int e_addr = 0;
int interv = 220;
long previousMillisbeep = 0;
bool ledindication = 1;
int intervalInput = 1000;
bool smart_pour = 0;
int second = 0;

int info2Lenght = 0;
long lastPressed = 0;
int beepcount = 0;
#define EEPROM_SIZE 640
#define CONFIG_REVISION 12349L
typedef struct config_t
{
        long magic_number;

        uint8_t pour_mode;
        uint8_t interval1;
        uint8_t duration1;
        uint8_t interval2;
        uint8_t duration2;
        uint8_t interval3;
        uint8_t duration3;
        bool lstatic;

        bool openAP;

} CONFIGGEN;
CONFIGGEN config;
long prevmil1, prevmil2;
int c_mist, c_aerator, c_light, pwm1, pwm2, brightTo, lightinterval, numb;
String s_sts1, old_sts1, s_sts2, s_status;
auto light = false, prepare = false, beepwarning = true;
int light_turn = 0;
auto b_lstatic = false;
const char *http_username = "admin";
const char *http_password = "admin";
auto breboot = false;
auto rmp1 = 0, rmp2 = 0, rmp3 = 0;
auto interv1 = 1, interv2 = 1, interv3 = 1, durat1 = 1, durat2 = 1, durat3 = 1;
auto hn1 = 0, mn1 = 0, hf1 = 0, mf1 = 0, hn2 = 0, mn2 = 0, hf2 = 0, mf2 = 0, hn3 = 0, mn3 = 0, hf3 = 0, mf3 = 0;
auto wt1 = 0, wt2 = 0, wt3 = 0, wt4 = 0, wt5 = 0;
auto dr1 = 0, dr2 = 0, dr3 = 0, dr4 = 0, dr5 = 0;
int wt[] = {0, 0, 0, 0, 0};
int dr[] = {0, 0, 0, 0, 0};
int pourtarget[] = {0, 0, 0, 0, 0, 0};
int timerVal = 45;
int duration = 30;
int cf_t, wt_t, tab, setup_step, pm;
auto countdown1 = 1, countdown2 = 1, countdown3 = 1;
bool reversepin = 0, OFF, ON;
auto running = false;

bool bautotare = 0;
int beepfreq = 0;
String _ssidAP()
{
        String ssid;
        for (int i = 512; i < 512 + 32; i++)
        {
                if (int(EEPROM.read(i)) > 31)
                {
                        ssid += char(EEPROM.read(i));
                }
                // ssid += char(EEPROM.read(i));
        }
        // ssid.replace(/ [^\x00 -\x7F] / g, "");
        // ssid = Regex.Replace(ssid, @"[^u0000-u007F]+", string.Empty);
        return ssid;
}
String _passAP()
{
        String pass;
        for (int i = 512 + 32; i < 512 + 64; i++)
        {
                if (int(EEPROM.read(i)) > 31)
                {
                        pass += char(EEPROM.read(i));
                }
        }
        // pass.replace(/ [^\x00 -\x7F] / g, "");
        if (pass == "")
                pass = "no_password";

        Serial.print("pass=");
        Serial.println(pass);
        return pass;
}
String _passAP_() // suggest by chatGBT
{
        String pass;
        pass.reserve(32); // reserve memory for the String

        for (int i = 512 + 32; i < 512 + 64; i++)
        {
                char c = EEPROM.read(i);
                if (c > 31)
                {
                        pass += c;
                }
        }

        if (pass.isEmpty())
        {
                pass = "no_password";
        }
        Serial.print("pass=");
        Serial.println(pass);
        return pass;
}