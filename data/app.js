var hours, minutes, seconds;
var running_1 = false;
var running_2 = false;
var running_3 = false;
var running = false;
var interval = 1000;
var rcolor = ["#e60000", "#e65c00", "#e6e600", "#008000", "#0000e6", "#e6005c", "#b300b3", "#00e600", "#005ce6", "#ff00bf"];


var gateway = `ws://${window.location.hostname}/ws`;
var websocket;
window.addEventListener('load', onLoad);
function initWebSocket() {
    console.log('Trying to open a WebSocket connection...');
    websocket = new WebSocket(gateway);
    websocket.onopen = onOpen;
    websocket.onclose = onClose;
    websocket.onmessage = onMessage; // <-- add this line
}
function onOpen(event) {
    console.log('Connection opened');
}
function onClose(event) {
    console.log('Connection closed');
    setTimeout(initWebSocket, 2000);
}
//0=data, 1=weight, 2=timer, 3=info
function onMessage(event) {
    // alert(event.data);
    if (event.data.startsWith("0")) {

        var sdata = event.data.substring(2);
        if (sdata.startsWith("tab")) {
            var iss = parseInt(sdata.substring(3));
            document.getElementById(iss).click();
        } else if (sdata.startsWith("stimer")) {
            document.getElementById("divtimer").style.display = "block"
        } else if (sdata.startsWith("htimer")) {
            document.getElementById("divtimer").style.display = "none"
        }

    } else if (event.data.startsWith("1")) {
        var sdata = event.data.substring(2);
        var el = document.getElementById("mist");//wieght value
        if (sdata.length > 5) {
            el.style.fontSize = "56px"
        } else {
            el.style.fontSize = "110px"
        }
        el.innerHTML = sdata;
    } else if (event.data.startsWith("2")) {
        var sdata = event.data.substring(2);
        document.getElementById("light").innerHTML = sdata;// timer clock
    } else {

        var sdata = event.data.substring(2);
        printInfo(parseInt(event.data.substring(0, 1)), sdata);
        // alert("hai");
    }



    document.getElementById('state').innerHTML = state;
}
function printInfo(mode, msg) {
    // var pop = document.getElementById("popinfo");
    var popi = document.getElementById("info");
    var tO = 4000;
    switch (mode) {
        case 3:
            //regular info 
            // var popi = document.getElementById("info");
            var rnd = Math.floor(Math.random() * 100);
            var par = document.createElement("h4");
            var t = document.createTextNode(msg);
            var sid = "id_" + String(rnd);
            par.setAttribute("id", sid.split(''));
            par.style.backgroundColor = "rgb(0, 204, 255)";
            par.style.marginTop = "1mm"; par.style.marginBottom = "1mm";
            // par.innerText = msg;
            par.appendChild(t);
            popi.appendChild(par);
            tO += (msg.length * 100);
            if (msg.startsWith("enjoy")) {
                tO += 15000;
                document.getElementById("1").style.display = "inline";
                document.getElementById("2").style.display = "inline";
            }
            setTimeout(function () { par.remove(); }, tO);
            // setTimeout(clearinfo(sid), 3000);
            // alert("info 1");
            break;
        case 4:
            // warning info
            // var popi = document.getElementById("info");
            var rnd = Math.floor(Math.random() * 100);
            var par = document.createElement("h4");
            var t = document.createTextNode(msg);
            var sid = "id_" + String(rnd);
            par.setAttribute("id", sid.split(''));
            par.style.marginTop = "1mm"; par.style.marginBottom = "1mm";
            par.style.backgroundColor = "yellow";
            par.style.fontWeight = "lighter";
            // par.innerText = msg;
            par.appendChild(t);
            popi.appendChild(par);
            tO += (msg.length * 100);
            setTimeout(function () { par.remove(); }, tO);
            break;
        case 5:
            //erorr info
            var rnd = Math.floor(Math.random() * 100);
            var par = document.createElement("h4");
            var t = document.createTextNode(msg);
            var sid = "id_" + String(rnd);
            par.setAttribute("id", sid.split(''));
            par.style.marginTop = "1mm"; par.style.marginBottom = "1mm";
            par.style.backgroundColor = "red";
            // par.innerText = msg;
            par.appendChild(t);
            popi.appendChild(par);
            tO += (msg.length * 100);
            setTimeout(function () { par.remove(); }, tO);
            break;

        default:
            break;
    }

    // pop.style.display = "block";
    // pop.innerHTML = msg;
    // setTimeout(clearinfo, 3000);

}
function clearinfo(id) {
    var pop = document.getElementById(id);
    pop.remove();
}
function onLoad(event) {
    initWebSocket();
    initButton();
}
function loadonce() {

    getTheme();
    gettab();
    // alert("test");
    isSmart();
    var pstp = "p_step";
    for (let i = 0; i < 3; i++) {
        document.getElementById("p_step" + i).style.display = "none";
    }
    var setup_step = send_get("/setup_step");
    var iss = parseInt(setup_step);
    var ele = document.getElementById("setup");
    var btnupdt = document.createElement("button");
    btnupdt.setAttribute("class", "port");
    // btnupdt.onclick = "updatef()";
    btnupdt.innerHTML = "update firmware"
    btnupdt.addEventListener("click", function () {
        window.location.href = "/update";
        alert("button click");
    });
    ele.appendChild(btnupdt)
    // openTab(event, '2')
    // alert(setup_step);
    // document.getElementById(setup_step).click();
    // alert("test");
    drawbggradient();

}
function getTheme() {
    var xhttp = new XMLHttpRequest();
    var btnn = document.getElementById("ctheme");
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var stime = this.responseText;
            if (stime == "0") {
                theme.setAttribute('href', 'light.css');
                btnn.innerHTML = "switch to dark";
            } else if (stime == "1") {
                theme.setAttribute('href', 'dark.css');
                btnn.innerHTML = "switch to light";
            }
        }
    };

    xhttp.open("GET", "/theme", true);
    xhttp.send();
}


function gettab() {
    // alert("Page is loaded");
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var stime = this.responseText;
            var iss = parseInt(stime);
            // alert(iss);
            document.getElementById(iss).click();
            // for (let i = 0; i < iss + 1; i++) {
            //     document.getElementById("p_step" + iss).style.display = "block";
            // }
        }
    };

    xhttp.open("GET", "/tab", true);
    xhttp.send();
    getsstep();
}
function tare() {
    websocket.send('tare');
}
function abort() {

    websocket.send('abort');
    setTimeout(function () { location.reload(); }, 300);
}
function getsstep() {
    // alert("Page is loaded");
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var stime = this.responseText;
            var iss = parseInt(stime);
            // alert(iss);
            // document.getElementById(iss).click();
            // for (let i = 0; i < iss + 1; i++) {
            document.getElementById("p_step" + iss).style.display = "block";
            // }
        }
    };

    xhttp.open("GET", "/setup_step", true);
    xhttp.send();
}
function send_get(url) {
    var resp = "";
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            resp = this.responseText;
        }
    };

    xhttp.open("GET", url, true);
    xhttp.send();
    return resp;
}

function isSmart() {
    // hidden setup and pour tab
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            if (this.responseText == '1') {
                document.getElementById("divtimer").style.display = "block";
                document.getElementById("1").style.display = "none";
                document.getElementById("2").style.display = "none";
            } else {
                document.getElementById("divtimer").style.display = "none";
                document.getElementById("1").style.display = "inline";
                document.getElementById("2").style.display = "inline";
            }
        }
    };
    xhttp.open("GET", "/running", true);
    xhttp.send();
}
function reboot() {
    var conf = confirm("Sure to reboot device?");
    if (conf) {

        var xhttp = new XMLHttpRequest();

        xhttp.open("GET", "/reboot", true);
        xhttp.send();
    }
}


function setsync() {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "/tare", true);
    xhttp.send();
    // location.reload();
}


function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var lettersDark = '0123456789A';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += lettersDark[Math.floor(Math.random() * lettersDark.length)];
    }
    return color;
}
function getRandomColorMajor() {
    var rndnum = 0;
    var colorrt;
    const d = new Date();
    let seconds = d.getSeconds().toString;
    if (seconds > 9) {
        return rcolor[parseInt(seconds.substring(1))];
    } else {
        return rcolor[parseInt(seconds)]
    }

}
function drawbggradient() {
    // alert("called");
    var x = document.getElementsByTagName("BODY")[0];
    // document.getElementById(sid).style.backgroundColor = getRandomColor();
    // x.style.background = "linear - gradient(90deg, rgba(2, 0, 36, 1) 0 %, rgba(13, 200, 28, 1) 0 %, rgba(2, 182, 223, 1) 78 %, rgba(0, 111, 182, 1) 100 %)";

    // x.style.background = "#004455";

    // x.setAttribute("style", "background-image: linear-gradient(to right, #e00381, #e70092, #ec00a5, #ee0eb9, #a2138b, #cbe810, #a87afa, #3c70d2, #088dec, #00caff, #bed22c, #5ff4fb);");

    x.setAttribute("style", "background-image: linear-gradient(to right, "
        + getRandomColor() + ", "
        + getRandomColor() + ", "
        + getRandomColor() + ", "
        + getRandomColor() + ", "
        + getRandomColor() + ", "
        + getRandomColor() + ", "
        + getRandomColor() + ", "
        + getRandomColor() + ", "
        + getRandomColor() + ", "
        + getRandomColor() + ", "
        + getRandomColor() + ", "
        + getRandomColor() + ");");

}