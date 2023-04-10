// Import required libraries

#include "esp8266_brew_scale.h"

// Set LED GPIO
const int pinPort1 = 4;
// const int pinPort3 = 12;
// const int pinPort2 = 14;
// Stores LED state
String ledState;

// Create AsyncWebServer object on port 80
AsyncWebServer server(80);

AsyncWebSocket ws("/ws");
void setup()
{
  // put your setup code here, to run once:
  delay(1000);
  Serial.begin(115200);
  // Initialize SPIFFS
  if (!SPIFFS.begin())
  {
    Serial.println("An Error has occurred while mounting SPIFFS");
    return;
  }

  OFF = (!reversepin) ? 0 : 1;
  ON = (!reversepin) ? 1 : 0;

  NEO.begin();
  if (!ledindication)
  {
    // colore =RgbColor(0, 0, 0);
    NEO.setPixelColor(0, 0);
    NEO.show();
  }
  pinMode(pinPort1, OUTPUT);
  // pinMode(pinPort3, OUTPUT);
  // pinMode(pinPort2, OUTPUT);
  // pinMode(D6, OUTPUT);
  // pinMode(D7, OUTPUT);
  // digitalWrite(D6, 1);
  // digitalWrite(D7, 1);
  // digitalWrite(pinPort1, 1);
  analogWriteFreq(100);
  // pwm.setup(D5, 100, 1);
  // pwm.start();
  Serial.println("init scale");
  scale.begin(DOUT, CLK);
  Serial.println("done. init scale");
  // pinMode(2, OUTPUT);
  // digitalWrite(2, HIGH);
  scale.set_scale(1132675); // Start scale
  scale.tare();
  EEPROM.begin(EEPROM_SIZE);
  EEPROM_readAnything(0, config); // get saved settings
  // Serial.print("ssid_cl = ");
  // Serial.print(_ssid());
  // Serial.print("|key_cl = ");
  // Serial.println(_pass());
  // Serial.print("ssid_ap = ");
  // Serial.print(_ssidAP());
  // Serial.print("|key_ap = ");
  // Serial.println(_passAP());
  if (config.magic_number != CONFIG_REVISION)
  { // this will set it up for very first use

    Serial.printf("magic wrong, was %ld, should be %ld\n", config.magic_number, CONFIG_REVISION);
    config.magic_number = CONFIG_REVISION;
    config.pour_mode = 0;
    config.interval1 = 4;  // minute
    config.duration1 = 40; // second
    config.interval2 = 2;
    config.duration2 = 50;
    config.interval3 = 2;
    config.duration3 = 50;
    config.lstatic = false;
    config.openAP = true;
    EEPROM_writeAnything(0, config);
    String ap = "kopi_scale";
    for (int i = 0; i < 32; i++)
    {
      EEPROM.write(512 + i, 0);
    }
    for (size_t i = 0; i < ap.length(); i++)
    {
      EEPROM.write(512 + i, ap[i]);
      Serial.println(ap[i]);
    }
    EEPROM.commit();
  }
  b_lstatic = config.lstatic;
  // connectToAP();
  Serial.println("starting server");
  startserver();
  // If you're doing some debug output to serial, this should go in that section
  Serial.print("Host Name: ");
  Serial.println(WiFi.hostname());
}

void connectToAP()
{
  if (!WiFi.config(local_IP, gateway, subnet, primaryDNS, secondaryDNS))
  {
    Serial.println("STA Failed to configure");
  }
  WiFi.hostname(hostname);
  // wifi_station_set_hostname("sendhang");
  WiFi.begin(_ssid(), _pass());
  // WiFi.begin("ASUS", "air46664");
  if (WiFi.waitForConnectResult() != WL_CONNECTED)
  {
    Serial.println("WiFi Failed!");
    Serial.println("acces only from AP!");
    return;
  }
  // WiFi.setHostname("sendhang");
  if (WiFi.status() == WL_CONNECTED)
  {
    if (MDNS.begin("esp8266"))
    {
      Serial.println("mDNS started");
    }
  }
  MDNS.addService("http", "tcp", 80);

  // timeClient.begin();
  // setSyncProvider(timeClient.getEpochTime());
  // setTime(int hr, int min, int sec, int dy, int mnth, int yr)
  // startserver();
}
long oldMil = 0;
// long prevmil2 = 0;
void loop()
{

  ws.cleanupClients();
  AsyncElegantOTA.loop();
  pour_timer();
  beep();
  // put your main code here, to run repeatedly:
  if (millis() > prevmil1 + 1000)
  {
    if (b_tare)
    {
      Serial.println("begin tare");
      // scale.power_up();
      scale.set_scale(1132675); // Start scale
      scale.tare();             // Reset scale to zero
      yield();
      // scale.power_down();
      b_tare = 0;
      beeping(3); // single beep
      Serial.println("end tare");
    }
    if (breboot)
      ESP.restart();
    prevmil1 = millis();
  }
  if (millis() > prevmil2 + interv)
  {
    timbang();
    prevmil2 = millis();
  }
}

void timbang()
{

  // scale.power_up();
  float grame = scale.get_units(getAverageRate) * 1000;
  // yield();
  // detect water is pour
  if (b_increment)
  {
    i_gram = int(grame);
    if (grame > old_grame)
    {
      incrementValue++;
      old_grame = grame;
    }
    else
    {
      incrementValue = 0;
      old_grame = grame;
    }

    if (incrementValue > 6)
    {
      // pouring detected
      waterseqCountIndex++;
      timerseqCountIndex++;
      Serial.printf(" timerseqCountIndex : %d \n", timerseqCountIndex);
      incrementValue = 0;
      beeping(1); // single beep
      pourTimer = 1;
      intervalInput = 1000;
      b_increment = 0;
      Serial.println("timer starting ");
      // timeseqIndex++;
      timerVal = dr[timerseqCountIndex - 1];
      Serial.printf("------------timerval= : %d \n", timerVal);
      Serial.printf("waterseq[%1d] = %2d\n ", waterseqCountIndex - 1, wt[waterseqCountIndex - 1]);
      Serial.printf("timerseq[%1d] = %2d\n ", timerseqCountIndex - 1, dr[timerseqCountIndex - 1]);
      pour_limit_watch = 1;
      incwater += wt[waterseqCountIndex - 1];
      // timerVal=timseq[timeseqIndex-1];
    }
  } // end b_increment

  // give a warning if almost reach the target pour weight
  if (pour_limit_watch)
  {
    i_gram = int(grame);
    if (i_gram > incwater - warning_threshold && i_gram < incwater) // yellow
    {
      // yellow led for almost water pour target
      if (beepwarning)
      {
        beeping(4); // single beep
        beepwarning = false;
        NEO.setPixelColor(0, NEO.Color(200, 150, 0));
        NEO.show();
      }
    }
    if (i_gram > wtarget) // red
    {
      // red led for overpour
      //  incwater+=waterseq[waterseqCountIndex];
      int b = int(grame);
      NEO.setPixelColor(0, NEO.Color(b * 2, 0, 0));
      NEO.show();
    }
    if (i_gram < wtarget - 8) // blue
    {
      int b = int(grame);
      // int bl = (incwater - b - 8) * 2;
      int bl = map((incwater - b - 8) * 2, wt[waterseqCountIndex - 1], 0, 255, 0);
      // int bl = map(b, wt[waterseqCountIndex - 1], wt[waterseqCountIndex], wt[waterseqCountIndex] - wt[waterseqCountIndex - 1], 0);
      bl = constrain(bl, 0, 255);
      NEO.setPixelColor(0, NEO.Color(0, 0, bl));
      NEO.show();
    }
  }

  if (grame > 1.5) // normal mode
  {
    int b = int(grame);
    (b > 255) && (b = 255);
    if (ledindication)
    {
      if (!smart_pour)
      {
        NEO.setPixelColor(0, NEO.Color(0, 0, b));
        NEO.show();
      }
    }
    interv = 80;
    getAverageRate = 3;
  }
  else if (grame < (-1.5))
  {
    int b = int(grame) * (-1);
    (b > 255) && (b = 255);
    if (ledindication)
    {
      // colore =RgbColor(b, 0, 0);
      NEO.setPixelColor(0, NEO.Color(b, 0, 0));
      NEO.show();
    }
    interv = 200;
    getAverageRate = 3;
    // Serial.printf("b color %d\n",b);
  }
  else if (grame > (-1.5) && grame < 1.5)
  {
    // colore =RgbColor(0, 0, 0);
    if (ledindication)
    {
      NEO.setPixelColor(0, NEO.Color(0, 0, 0));
      NEO.show();
    }
    interv = 220;
    getAverageRate = 3;
  }

  s_sts1 = String(grame, 1);
  // if (pourTimer > 0)
  if (smart_pour)
  {
    s_sts1 += "/";
    s_sts1 += String(wtarget);
  }

  if (old_sts1 != s_sts1)
  {
    notifyClients(1, s_sts1);
    old_sts1 = s_sts1;
  }
}

// handle beep
// we using millis instead sdelay
//
void beep()
{

  if (millis() > (previousMillisbeep + duration))
  {

    if (beepingMode > 0)
    {
      beepcount += 1;
      if (beepcount == 2)
      {
        if (beepingMode == 1)
        {
          // tone(BUZZER_PIN, NOTE_A7, BUZZER_CHANNEL);
        }
        else if (beepingMode == 2)
        {
          // tone(BUZZER_PIN, NOTE_D8, BUZZER_CHANNEL);
        }
      }
      else if (beepcount == 3)
      {
        // noTone(BUZZER_PIN, BUZZER_CHANNEL);
        if (beepingMode == 3)
        {
          tone(BUZZER_PIN, NOTE_D8, BUZZER_CHANNEL);
          // colore =RgbColor(0, 200, 0);
          //  NEO.setPixelColor(0, NEO.Color(0, 0, 0));
          //  NEO.show();
        }
      }
      else if (beepcount == 4)
      {
        if (beepingMode == 1)
        {
          // noTone(BUZZER_PIN, BUZZER_CHANNEL);
          tone(BUZZER_PIN, NOTE_D8, BUZZER_CHANNEL);
        }
        else if (beepingMode == 2)
        {
          // noTone(BUZZER_PIN, BUZZER_CHANNEL);
          tone(BUZZER_PIN, NOTE_A7, BUZZER_CHANNEL);
        }
        else if (beepingMode == 4)
        {

          tone(BUZZER_PIN, NOTE_A7, BUZZER_CHANNEL);
        }
      }
      else if (beepcount == 6)
      {

        // colore =RgbColor(0, 0, 0);
        //  Serial.println("flash green");
        //  NEO.setPixelColor(0, NEO.Color(0, 0, 0));
        //  NEO.show();
        //  noTone(BUZZER_PIN, BUZZER_CHANNEL);
        noTone(BUZZER_PIN);
        if (beepingMode == 4)
        {
          // Serial.printf("beeping mode = %d\n ", beepingMode );
          beepfreq++;
          if (beepfreq > 4)
          {
            beepfreq = 0;
            beeping(0); // single beep
          }
          beepcount = 3;
        }
        else
        {
          beeping(0); // single beep
        }
      }
    }

    // beepcount = 0;
    previousMillisbeep = millis();
  }
}

// timer pouring
String nextp = "WAITING FOR NEXT POUR";
int prevtimerVal = 10;
void pour_timer()
{
  if (millis() > lastPressed + intervalInput) // 1seconds called
  {

    if (pourTimer == 1)
    { // after increse detected
      second++;
      s_sts2 = String((timerVal - second));
      notifyClients(2, s_sts2);
      if (second > timerVal)
      {
        second = 0;
        pourTimer = 2;
        prepare = true;
        lastPressed = millis();
        b_increment = 1;
        int in = dr[timerseqCountIndex - 1];
        int inn = dr[timerseqCountIndex];
        if (inn != 0)
        {
          int w = wt[waterseqCountIndex];
          if (waterseqCountIndex < timeseqIndex)
          {
            String s = "pour next ";
            s += String(w);
            s += " ml";
            notifyClients(3, s);
          }
        }
        s_sts2 = String(in);
        notifyClients(2, s_sts2);
        info2Lenght = nextp.length();

        intervalInput = 10;
        beeping(2); // single beep
        NEO.setPixelColor(0, NEO.Color(0, 0, 0));
        NEO.show();
        if (bautotare)
          b_tare = 1;
      }
    }
    if (pourTimer == 2)
    { // countdown timer done. prepare next timer val
      // substr += 2;
      if (timerseqCountIndex < timeseqIndex)
      {
        // Serial.println("timerseqCountIndex < timeseqIndex");
        if (prepare)
        {
          pour_limit_watch = false;
          s_sts2 = String(dr[timerseqCountIndex]);
          displayCount++;
          // wtarget += wt[displayCount];
          wtarget = pourtarget[displayCount];
          Serial.printf("wtarget = : %d \n", wtarget);
          notifyClients(2, s_sts2);
          prevtimerVal = timerVal;
          pourTimer = 0;
          beepwarning = true;
          prepare = false;
        }
      }
      else
      {
        smart_pour = 0;
        s_sts2 = "done";
        notifyClients(2, s_sts2);

        notifyClients(0, "htimer"); // hide timer face
        notifyClients(3, "enjoy your coffee");
        b_increment = 0;
        pourTimer = 0;
        resetSmartValue();
      }
    } // end pourtimer==2

    lastPressed = millis();
  } // end if milllis
} // end void
void resetSmartValue()
{

  b_increment = 0;
  pourTimer = 0;
  for (size_t i = 0; i < 5; i++)
  {
    wt[i] = 0;
    dr[i] = 0;
  }
  wtarget = 0;
  incwater = 0;
  waterseqCountIndex = 0;
  timerseqCountIndex = 0;
}
// function for writePref
void writePref()
{
  EEPROM_writeAnything(0, config);
  EEPROM.commit();
} // end of writePref

// function for readPref
void readPref()
{
  EEPROM_readAnything(0, config); // get saved settings
} // end of readPref
String _ssid()
{
  String ssid;
  for (int i = 512; i < 512 + 32; i++)
  {
    if (int(EEPROM.read(i)) > 31)
    {
      ssid += char(EEPROM.read(i));
    }
  }
  // ssid.replace(/ [^\x00 -\x7F] / g, "");
  return ssid;
}
String _pass()
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
  return pass;
}
