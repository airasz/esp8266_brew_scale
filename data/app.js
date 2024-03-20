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

    // x.setAttribute("style", "background-image: linear-gradient(to right, "
    //     + getRandomColor() + ", "
    //     + getRandomColor() + ", "
    //     + getRandomColor() + ", "
    //     + getRandomColor() + ", "
    //     + getRandomColor() + ", "
    //     + getRandomColor() + ", "
    //     + getRandomColor() + ", "
    //     + getRandomColor() + ", "
    //     + getRandomColor() + ", "
    //     + getRandomColor() + ", "
    //     + getRandomColor() + ", "
    //     + getRandomColor() + ");");

    // var img = "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8' standalone='no'%3F%3E%3Csvg width='6mm' height='6mm' viewBox='0 0 6 6' version='1.1' id='svg19960' xmlns='http://www.w3.org/2000/svg' xmlns:svg='http://www.w3.org/2000/svg'%3E%3Cdefs id='defs19957' /%3E%3Cg id='layer1'%3E%3Crect style='fill:%23008000;stroke-width:0.665001' id='rect20444' width='6' height='6' x='0' y='0' /%3E%3C/g%3E%3C/svg%3E%0A";
    // img += "encoding=\'UTF-8\' standalone=\'no\'%3F%3E%3C!-- Created with Inkscape (http://www.inkscape.org/) --%3E%3Csvg width=\'39.503845mm\' height=\'68.422623mm\' viewBox=\'0 0 39.503845 68.422623\' version=\'1.1\' id=\'svg17357\' xmlns=\'http://www.w3.org/2000/svg\' xmlns:svg=\'http://www.w3.org/2000/svg\'%3E%3Cdefs ";
    // img += "id=\'defs17354\'/%3E%3Cg id=\'layer1\' transform=\'translate(1.8e-5)\'%3E%3Cpath id=\'rect15305-3-19\' style=\'fill:%23800000%3Bstroke-width:0.567197\' d=\'m -1.8e-5 22.80754 3.0000002 1.73206 v 9.67171 H -1.8e-5 Z\'/%3E%3Cpath id=\'rect15305-3-19-0\' style=\'fill:%23800000%3Bstroke-width:0.567197\' d=\'m 39.503827 22.80754 -3 1.73206 v 9.67171 h 3 z\'/%3E%3Cpath id=\'rect15305-3\' style=\'fill:%23800000%3Bstroke-width:0.567197\'";
    // img += "d=\'m 19.751898 11.40377 -3 -1.73206 V 0 h 3 z\'/%3E%3Cpath id=\'rect15305-3-1\' style=\'fill:%23800000%3Bstroke-width:0.567197\' d=\'m 19.751898 11.40377 3 -1.73206 V 0 h -3 z\'/%3E%3Cpath id=\'rect15305-9-4\' style=\'fill:%23800000%3Bstroke-width:0.802138\' d=\'m -8e-6 19.349566 v 3.45797 L 19.751889 11.403773 16.751907 9.671712 Z\'/%3E%3Cpath id=\'rect15305-9-4-1\' style=\'fill:%23800000%3Bstroke-width:0.802138\' d=\'m 19.751913 14.86175 -10e-7 -3.45797 19.751897 11.40376 -2.999982 1.73206 z\'/%3E%3Cpath id=\'rect15305-9-4-3\' style=\'fill:%23800000%3Bstroke-width:0.802138\' d=\'m 19.751896 14.86175 1e-6 -3.45798 L 0 22.80754 2.9999822 24.5396 Z\'/%3E%3Cpath id=\'rect15305-9-4-2\' style=\'fill:%23800000%3Bstroke-width:0.802138\' d=\'m 39.503811 19.34957 v 3.45797 l -19.7519 -11.40376 2.99999 -1.73206 z\'/%3E%3Cpath id=\'rect15305-3-19-7\' style=\'fill:%23800000%3Bstroke-width:0.567197\' d=\'M -1.8e-5 45.61508 2.9999822 43.88302 V 34.21131 H -1.8e-5 Z\'/%3E%3Cpath id=\'rect15305-3-19-0-4\' style=\'fill:%23800000%3Bstroke-width:0.567197\' d=\'m 39.503827 45.61508 -3 -1.73206 v -9.67171 h 3 z\'/%3E%3Cpath id=\'rect15305-3-2\' style=\'fill:%23800000%3Bstroke-width:0.567197\' d=\'m 19.751898 57.01885 -3 1.73206 v 9.67171 h 3 z\'/%3E%3Cpath id=\'rect15305-3-1-3\' style=\'fill:%23800000%3Bstroke-width:0.567197\' d=\'m 19.751898 57.01885 3 1.73206 v 9.67171 h -3 z\'/%3E%3Cpath id=\'rect15305-9-4-9\' style=\'fill:%23800000%3Bstroke-width:0.802138\' d=\'m -8e-6 49.073054 v -3.45797 l 19.751897 11.403763 -2.999982 1.732061 z\'/%3E%3Cpath id=\'rect15305-9-4-1-1\' style=\'fill:%23800000%3Bstroke-width:0.802138\' d=\'m 19.751913 53.56087 -10e-7 3.45797 19.751897 -11.40376 -2.999982 -1.73206 z\'/%3E%3Cpath id=\'rect15305-9-4-3-5\' style=\'fill:%23800000%3Bstroke-width:0.802138\' d=\'m 19.751896 53.56087 1e-6 3.45798 L 0 45.61508 2.9999822 43.88302 Z\'/%3E%3Cpath id=\'rect15305-9-4-2-2\' style=\'fill:%23800000%3Bstroke-width:0.802138\' d=\'m 39.503811 49.07305 v -3.45797 l -19.7519 11.40376 2.99999 1.73206 z\'/%3E%3C/g%3E%3C/svg%3E";
    // alert(getRandomColor().substring(1));

    // var img = "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8' standalone='no'%3F%3E%3Csvg width='5.7786899mm' height='10.009mm' viewBox='0 0 39.503845 68.422623' version='1.1' id='svg17357' ";
    // img += "xmlns='http://www.w3.org/2000/svg' xmlns:svg='http://www.w3.org/2000/svg'%3E%3Cdefs id='defs17354' /%3E%3Cg id='layer1' transform='translate(1.8e-5)'%3E%3Cpath id='rect15305-3-19' style='fill:%23";
    // // img += "800000";
    // img += getRandomColor().substring(1);
    // img += ";stroke-width:0' d='M 16.751931,0 V 9.6717611 L -1.8e-5,19.349723 v 3.45767 11.403955 11.403956 3.45767 l 16.751949,9.677962 v 9.671761 h 2.999817 3.000334 V 58.750936 L 39.504031,49.072974 V 45.615304 34.211348 22.807393 19.349723 L 22.752082,9.6717611 V 0 h -3.000334 z m 2.999817,14.861625 16.751949,9.677962 v 9.671761 9.671762 L 19.751748,53.561072 2.9997989,43.88311 v -9.671762 -9.671761 z' /%3E%3C/g%3E%3C/svg%3E%0A";


    var img = "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8' standalone='no'%3F%3E%3Csvg width='50mm' height='50mm' viewBox='0 0 50 50' version='1.1' id='svg19960' ";
    img += "xmlns:inkscape='http://www.inkscape.org/namespaces/inkscape' xmlns:sodipodi='http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd' xmlns='http://www.w3.org/2000/svg' xmlns:svg='http://www.w3.org/2000/svg'%3E%3Cdefs id='defs19957' /%3E%3Cg inkscape:label='Layer 1' inkscape:groupmode='layer' ";
    img += "id='layer1'%3E%3Crect style='fill:%23ffffff;fill-opacity:1;stroke:none;stroke-width:0;stroke-dasharray:none' id='rect20444' width='10' height='10' x='0' y='0' /%3E%3Crect style='fill:%23ffffff;fill-opacity:1;stroke:none;stroke-width:0;stroke-dasharray:none' id='rect20444-0' width='10' height='10' x='10' y='-2.3841858e-07' /%3E%3Crect style='fill:%23ffffff;fill-opacity:1;stroke:none;stroke-width:0;stroke-dasharray:none' ";
    img += " id='rect20444-2' width='10' height='10' x='20' y='-2.9802322e-07' /%3E%3Crect style='fill:%23ffffff;fill-opacity:1;stroke:none;stroke-width:0;stroke-dasharray:none' id='rect20444-9' width='10' height='10' x='30' y='-2.9802322e-07' /%3E%3Crect style='fill:%23ffffff;fill-opacity:1;stroke:none;stroke-width:0;stroke-dasharray:none' id='rect20444-9-7' width='10' height='10' x='40' y='-2.9802322e-07' /%3E%3Crect style='fill:%23ffffff;fill-opacity:1;stroke:none;stroke-width:0;stroke-dasharray:none' id='rect20444-7' width='10' height='10' x='-4.7683716e-07' y='10' /%3E%3Crect style='fill:%23ffffff;fill-opacity:1;stroke:none;stroke-width:0;stroke-dasharray:none' id='rect20444-0-2' width='10' height='10' x='10' y='10' /%3E%3Crect style='fill:%23ffffff;fill-opacity:1;stroke:none;stroke-width:0;stroke-dasharray:none' id='rect20444-2-4' width='10' height='10' x='20' y='10' /%3E%3Crect ";
    img += "style='fill:%23ffffff;fill-opacity:1;stroke:none;stroke-width:0;stroke-dasharray:none' id='rect20444-9-5' width='10' height='10' x='30' y='10' /%3E%3Crect style='fill:%23ffffff;fill-opacity:1;stroke:none;stroke-width:0;stroke-dasharray:none' id='rect20444-9-7-3' width='10' height='10' x='40' y='10' /%3E%3Crect style='fill:%23ffffff;fill-opacity:1;stroke:none;stroke-width:0;stroke-dasharray:none' id='rect20444-5' width='10' height='10' x='3.5762787e-07' y='20' /%3E%3Crect style='fill:%23ffffff;fill-opacity:1;stroke:none;stroke-width:0;stroke-dasharray:none' id='rect20444-0-7' width='10' height='10' x='10' y='20' /%3E%3Crect style='fill:%23ffffff;fill-opacity:1;stroke:none;stroke-width:0;stroke-dasharray:none' id='rect20444-2-7' width='10' height='10' x='20' y='20' /%3E%3Crect style='fill:%23ffffff;fill-opacity:1;stroke:none;stroke-width:0;stroke-dasharray:none' ";
    img += " id='rect20444-9-6' width='10' height='10' x='30' y='20' /%3E%3Crect style='fill:%23ffffff;fill-opacity:1;stroke:none;stroke-width:0;stroke-dasharray:none' id='rect20444-9-7-1' width='10' height='10' x='40' y='20' /%3E%3Crect style='fill:%23ffffff;fill-opacity:1;stroke:none;stroke-width:0;stroke-dasharray:none' id='rect20444-7-6' width='10' height='10' x='-1.1920929e-07' y='29.999998' /%3E%3Crect style='fill:%23ffffff;fill-opacity:1;stroke:none;stroke-width:0;stroke-dasharray:none' id='rect20444-0-2-4' width='10' height='10' x='10' y='29.999998' /%3E%3Crect style='fill:%23ffffff;fill-opacity:1;stroke:none;stroke-width:0;stroke-dasharray:none' id='rect20444-2-4-1' width='10' height='10' x='20' y='29.999998' /%3E%3Crect style='fill:%23ffffff;fill-opacity:1;stroke:none;stroke-width:0;stroke-dasharray:none' id='rect20444-9-5-5' width='10' height='10' x='30' y='29.999998' /%3E%3Crect style='fill:%23ffffff;fill-opacity:1;stroke:none;stroke-width:0;stroke-dasharray:none' id='rect20444-9-7-3-1' width='10' height='10' x='40' y='29.999998' /%3E%3Crect style='fill:%23ffffff;fill-opacity:1;stroke:none;stroke-width:0;stroke-dasharray:none' id='rect20444-7-6-7' width='10' height='10' x='-1.0458753e-06' y='39.999996' /%3E%3Crect style='fill:%23ffffff;fill-opacity:1;stroke:none;stroke-width:0;stroke-dasharray:none' id='rect20444-0-2-4-4' width='10' height='10' x='9.999999' y='39.999996' /%3E%3Crect style='fill:%23ffffff;fill-opacity:1;stroke:none;stroke-width:0;stroke-dasharray:none' id='rect20444-2-4-1-2' width='10' height='10' x='20' y='39.999996' /%3E%3Crect style='fill:%23ffffff;fill-opacity:1;stroke:none;stroke-width:0;stroke-dasharray:none' id='rect20444-9-5-5-1' width='10' height='10' x='30' y='39.999996' /%3E%3Crect style='fill:%23ffffff;fill-opacity:1;stroke:none;stroke-width:0;stroke-dasharray:none' id='rect20444-9-7-3-1-5' width='10' height='10' x='40' y='39.999996' /%3E%3C/g%3E%3C/svg%3E%0A"

    // while (img.indexOf("ffffff") > 0) {

    // }
    for (let i = 0; i < 25; i++) {
        img = img.replace("ffffff", getRandomColor().substring(1));
    }
    x.setAttribute("style", "background-image: url(\"" + img + "\")");
}