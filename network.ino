String getRandom()
{
        int rndnumber = random(1000);

        Serial.println(rndnumber);
        Serial.printf("random number %d\n ", rndnumber);
        return String(rndnumber);
}
// 1= single high short,  2 = single low, 3= single high long, 4= 4x low warning
// 5 =single high short +  flash green
void beeping(int mode)
{
        beepingMode = mode;
        beepcount = 0;
        previousMillisbeep = millis();
}
// Replaces placeholder with LED state value
String processor(const String &var)
{
        // if (var == "random_n")
        // {
        //   return getRandom();
        // }
        // else
        for (int i = 1; i < 6; i++)
        {

                if (var == "wt" + String(i))
                {
                        // Serial.printf("wt%d=%d\n ", i, wt[i - 1]);
                        return String(wt[i - 1]);
                }
        }

        for (int i = 1; i < 6; i++)
        {

                if (var == "dr" + String(i))
                {
                        // Serial.printf("dr%d=%d\n ", i, dr[i - 1]);
                        return String(dr[i - 1]);
                }
        }

        if (var == "ssidcl")
        {
                return _ssid();
        }
        else if (var == "keycl")
        {
                String s = _pass();
                String ss;
                for (int i = 0; i < s.length(); i++)
                {
                        (i < 3) ? ss += s[i] : ss += "*";
                }
                return ss;
        }
        else if (var == "ssidap")
        {
                return _ssidAP();
        }
        else if (var == "keyap")
        {
                String s = _passAP();
                String ss;
                for (int i = 0; i < s.length(); i++)
                {
                        (i < 3) ? ss += s[i] : ss += "*";
                }
                return ss;
        }

        else if (var == "wgh")
        {
                return (!smart_pour) ? "gr" : "ml";
        }
        else if (var == "cf_t")
        {
                return String(cf_t);
        }
        else if (var == "wt_t")
        {
                return String(wt_t);
        }

        else if (var == "abort1")
        {
                String dd = "port 1 aborted";
                return dd;
        }
        else if (var == "info")
        {
                String dd = "0";
                return dd;
        }
        // else if (var == "light")
        // {
        //   Serial.println("light call");
        //   return (light) ? "on" : "off";
        // }
}

// notifyClients(int tag (0=gost, 1=info , 2=warning, 3=error), String s)
void notifyClients(int tag, String s)
{
        if (tag < 6)
                ws.textAll(String(tag) + "=" + s);

        // ws.textAll(s);
}
void handleWebSocketMessage(void *arg, uint8_t *data, size_t len)
{
        AwsFrameInfo *info = (AwsFrameInfo *)arg;
        if (info->final && info->index == 0 && info->len == len && info->opcode == WS_TEXT)
        {
                data[len] = 0;
                if (strcmp((char *)data, "tare") == 0)
                {
                        // ledState = !ledState;rmp1 = 0;
                        b_tare = 1;
                        prevmil1 = millis() - 900;
                        // notifyClients(0, "ok1");
                }
                if (strcmp((char *)data, "abort") == 0)
                {
                        NEO.setPixelColor(0, NEO.Color(0, 200, 0));
                        NEO.show();
                        beeping(3); // single beep
                        b_increment = 0;
                        incwater = 0;
                        tab = 0;
                        setup_step = 0;
                        smart_pour = 0;
                        waterseqCountIndex = 0;
                        timerseqCountIndex = 0;
                        timeseqIndex = 0;  //
                        waterseqIndex = 0; // total sequence step
                        // b_tare = 1;
                        // notifyClients(0, "ok1");
                }
        }
}
void initWebSocket()
{
        ws.onEvent(onEvent);
        server.addHandler(&ws);
}

void onEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type,
             void *arg, uint8_t *data, size_t len)
{
        switch (type)
        {
        case WS_EVT_CONNECT:
                Serial.printf("WebSocket client #%u connected from %s\n", client->id(), client->remoteIP().toString().c_str());
                break;
        case WS_EVT_DISCONNECT:
                Serial.printf("WebSocket client #%u disconnected\n", client->id());
                break;
        case WS_EVT_DATA:
                handleWebSocketMessage(arg, data, len);
                break;
        case WS_EVT_PONG:
        case WS_EVT_ERROR:
                break;
        }
}
void startserver()
{

        Serial.println("Setting AP (Access Point)…");
        // Remove the password parameter, if you want the AP (Access Point) to be open
        // (_passAP != "") ? WiFi.softAP(_ssidAP) : WiFi.softAP(_ssidAP, _passAP);
        WiFi.mode(WIFI_AP);
        // (_passAP().c_str() == "") ? WiFi.softAP(_ssidAP().c_str()) : WiFi.softAP(_ssidAP().c_str(), _passAP().c_str());

        String pass = _passAP().c_str();
        if (pass.length() > 10)
        {
                WiFi.softAP(_ssidAP().c_str());
                Serial.println("create open wifi");
        }
        else
        {
                WiFi.softAP(_ssidAP().c_str(), _passAP().c_str());
                Serial.println("create closed wifi");
        }
        Serial.print("starting AP : ");
        Serial.println(_ssidAP());

        IPAddress IP = WiFi.softAPIP();
        Serial.print("AP IP address: ");
        Serial.println(IP);

        // Print ESP8266 Local IP Address
        Serial.println(WiFi.localIP());

        initWebSocket();

        AsyncElegantOTA.begin(&server); // Start ElegantOTA
        // Route for root / web page
        server.on("/", HTTP_GET, [](AsyncWebServerRequest *request)
                  { request->send(SPIFFS, "/index.html", String(), false, processor); });
        // Route to load style.css file
        // Route to load style.css file
        server.on("/net.html", HTTP_GET, [](AsyncWebServerRequest *request)
                  { request->send(SPIFFS, "/net.html", String(), false, processor); });
        // Route to load style.css file

        // Route to load style.css file
        server.on("/style.css", HTTP_GET, [](AsyncWebServerRequest *request)
                  { request->send(SPIFFS, "/style.css", "text/css"); });
        // Route to load app.js file
        server.on("/app.js", HTTP_GET, [](AsyncWebServerRequest *request)
                  { request->send(SPIFFS, "/app.js", "text/javascript"); });

        // Route to set GPIO to LOW
        server.on("/reboot", HTTP_GET, [](AsyncWebServerRequest *request)
                  {
                          breboot = true;
                          request->send(SPIFFS, "/index.html", String(), false, processor); });
        server.on("/tare", HTTP_GET, [](AsyncWebServerRequest *request)
                  {
                          b_tare = 1;
                          request->send(SPIFFS, "/index.html", String(), false, processor); });
        server.on("/running", HTTP_GET, [](AsyncWebServerRequest *request)
                  {
                // Serial.print("lighting");
                // request->send(SPIFFS, "/index.html", String(), false, processor);
                request->send(200, "text/plain", (smart_pour)?"1":"0"); });

        server.on("/ap_par0", HTTP_GET, [](AsyncWebServerRequest *request)
                  { request->send(200, "text/plain", _ssidAP().c_str()); });
        server.on("/ap_par1", HTTP_GET, [](AsyncWebServerRequest *request)
                  { request->send(200, "text/plain", _passAP().c_str()); });

        server.on("/rmp1", HTTP_GET, [](AsyncWebServerRequest *request)
                  {
                          // Serial.print("lighting");
                          // request->send(SPIFFS, "/index.html", String(), false, processor);
                          request->send(200, "text/plain", String(rmp1).c_str()); });

        server.on("/mist", HTTP_GET, [](AsyncWebServerRequest *request)
                  { request->send_P(200, "text/plain", s_sts1.c_str()); });

        server.on("/tab", HTTP_GET, [](AsyncWebServerRequest *request)
                  { request->send_P(200, "text/plain", String(tab).c_str()); });

        server.on("/setup_step", HTTP_GET, [](AsyncWebServerRequest *request)
                  { request->send_P(200, "text/plain", String(setup_step).c_str()); });

        // server.on("/aeration", HTTP_GET, [](AsyncWebServerRequest *request) { request->send_P(200, "text/plain", s_sts2.c_str()); });
        // // Send a GET request to <ESP_IP>/get?input1=<inputMessage>

        setupPort1();
        setupnetwork();
        // Start server
        server.begin();
}
//============================================================
void setupPort1()
{
        server.on("/dose/get", HTTP_GET, [](AsyncWebServerRequest *request)
                  {
                          String inputMessage;
                          String inputParam;
                          // GET input1 value on <ESP_IP>/get?input1=<inputMessage>
                          if (request->hasParam("cf_t"))
                          {
                                  inputMessage = request->getParam("cf_t")->value();
                                  inputParam = "inputint1";
                                  if (!inputMessage.isEmpty())
                                          cf_t = inputMessage.toInt();
                          }
                          if (request->hasParam("wt_t"))
                          {
                                  inputMessage = request->getParam("wt_t")->value();
                                  inputParam = "inputint1";
                                  if (!inputMessage.isEmpty())
                                          wt_t = inputMessage.toInt();
                          }
                          // request->send_P(200, "text/plain", "saved");

                          NEO.setPixelColor(0, NEO.Color(0, 200, 0));
                          NEO.show();
                          beeping(5); // single beep
                          setup_step = 1;
                          tab = 1;
                          request->redirect("/");
                          // request->send(SPIFFS, "/index.html", "", false, processor);
                          writePref(); });
        server.on("/setpm", HTTP_GET, [](AsyncWebServerRequest *request)
                  {
                          String inputMessage;
                          String inputParam;
                          // /setpm?pm1=pm2
                          if (request->hasParam("pm1"))
                          {
                                  inputMessage = request->getParam("pm1")->value();
                                  inputParam = "rmp1";
                                  Serial.print("pm =  ");
                                  Serial.println(inputMessage);
                                  if (!inputMessage.isEmpty())
                                  {

                                          pm = inputMessage.substring(2).toInt();
                                          if (pm == 0)
                                          {
                                                  NEO.setPixelColor(0, NEO.Color(200, 0, 0));
                                                  NEO.show();
                                                  beeping(1); // single beep
                                                  setup_step = 1;
                                                  request->redirect("/");
                                                  delay(30);
                                                  notifyClients(5, "please select one methode");
                                          }
                                          else
                                          {
                                                  NEO.setPixelColor(0, NEO.Color(0, 200, 0));
                                                  NEO.show();
                                                  beeping(5); // single beep
                                                  calculate(pm);
                                                  setup_step = 2;

                                                  request->redirect("/");
                                          }
                                  }

                                  Serial.printf("pm=>%d\n ", pm);
                          }

                          // request->send(SPIFFS, "/index.html", "", false, processor);
                          // writePref();
                  });
        server.on("/seq/get", HTTP_GET, [](AsyncWebServerRequest *request)
                  {
                          String inputMessage;
                          String inputParam;
                          // rmp1 = 1;
                          // GET input1 value on <ESP_IP>/get?input1=<inputMessage>
                          for (size_t i = 0; i < 5; i++)
                          {
                                  String s = String(i + 1);
                                  if (request->hasParam("wt" + s))
                                  {
                                          inputMessage = request->getParam("wt" + s)->value();
                                          if (!inputMessage.isEmpty())
                                                  wt[i] = inputMessage.toInt();
                                  }
                                  if (request->hasParam("dr" + s))
                                  {
                                          inputMessage = request->getParam("dr" + s)->value();
                                          if (!inputMessage.isEmpty())
                                                  dr[i] = inputMessage.toInt();
                                  }
                          }

                          NEO.setPixelColor(0, NEO.Color(0, 200, 0));
                          NEO.show();
                          beeping(5); // single beep
                          Serial.printf("timeseqindex = %d\n", timeseqIndex);
                          b_increment = 1; // activated increment water
                          incwater = 0;
                          tab = 0;
                          setup_step = 0;
                          smart_pour = 1;
                          waterseqCountIndex = 0;
                          timerseqCountIndex = 0;
                          displayCount = 0;
                          wtarget = wt[0];
                          request->redirect("/");
                          // request->send(SPIFFS, "/index.html", "", false, processor);
                          // writePref();
                  });
}

void setupnetwork()
{
        server.on("/netap", HTTP_GET, [](AsyncWebServerRequest *request)
                  {
                          String inputMessage;
                          String inputParam;
                          // GET input1 value on <ESP_IP>/get?input1=<inputMessage>
                          if (request->hasParam("ssidap"))
                          {
                                  inputMessage = request->getParam("ssidap")->value();
                                  inputParam = "inputint1";
                                  Serial.print("ssid client=  ");
                                  Serial.println(inputMessage);

                                  if (!inputMessage.isEmpty())
                                  {
                                          for (int i = 0; i < 32; i++)
                                          {
                                                  EEPROM.write(512 + i, 0);
                                          }
                                          for (size_t i = 0; i < inputMessage.length(); i++)
                                          {
                                                  EEPROM.write(512 + i, inputMessage[i]);
                                                  Serial.println(inputMessage[i]);
                                          }
                                          EEPROM.commit();
                                  }
                          }
                          if (request->hasParam("keyap"))
                          {
                                  inputMessage = request->getParam("keyap")->value();
                                  inputParam = "rmp1";
                                  Serial.print("key client=  ");
                                  Serial.println(inputMessage);
                                  if (!inputMessage.isEmpty() && inputMessage.length() > 7)
                                  {
                                          Serial.println("writing key AP");
                                          for (int i = 0; i < 32; i++)
                                          {
                                                  EEPROM.write(512 + 32 + i, 0);
                                          }
                                          for (size_t i = 0; i < inputMessage.length(); i++)
                                          { // use size_t for length comparison
                                                  EEPROM.write(512 + 32 + i, inputMessage[i]);
                                          }
                                          EEPROM.commit();
                                  }
                                  else if (!inputMessage.isEmpty())
                                  { // added check for empty inputMessage
                                          config.openAP = true;
                                          writePref();
                                  }
                          }

                          request->redirect("/");
                          // request->send(SPIFFS, "/index.html", "", false, processor);
                          writePref();
                          // breboot = 1;
                  });
}

void calculate(int mode)
{
        switch (mode)
        {
        case 1:
                // aero press
                wt[0] = 60;
                wt[1] = wt_t - 60;
                dr[0] = 25;
                dr[1] = 30;
                for (int i = 2; i < 5; i++)
                {
                        wt[i] = 0;
                        dr[i] = 0;
                }
                break;
        case 2:
                // standart v60
                for (int i = 0; i < 5; i++)
                {
                        wt[i] = wt_t / 5;
                        dr[i] = 30;
                }
                break;
        case 3:
                // maria galova methode
                wt_t = cf_t * 15;
                for (int i = 0; i < 5; i++)
                {
                        wt[i] = (i < 3) ? wt_t / 3 : 0;
                        dr[i] = (i < 3) ? 75 : 0;
                }
                break;
        default:
                break;
        }
        for (int i = 0; i < 5; i++)
        {

                if (wt[i] != 0)
                        timeseqIndex++;
                // if (i != 0)
                // {
                //         pourtarget[i] = pourtarget[i - 1] + wt[i];
                // }
                // else
                // {
                //         pourtarget[i] = wt[i];
                // }
                pourtarget[i] = (i != 0) ? pourtarget[i - 1] + wt[i] : pourtarget[i] = wt[i];
                Serial.printf(" pourtarget[%d] : %d \n", i, pourtarget[i]);
        }
}