(function () {
    var canvas = document.getElementById('info'),
        ctx = canvas.getContext('2d'),
        imageData = ctx.getImageData(0, 0, canvas.getAttribute('width'), canvas.getAttribute('height')),
        pixels = imageData.data,
        gradient = GradientGenerator.createGradient('#000000 #c50106 #f5f100 #ffffff'),
        val,
        color,
        base,
        x,
        y;
    for (y = 0; y < imageData.height; ++y) {
        for (x = 0; x < imageData.width; ++x) {
            val = (x + y) / (imageData.width + imageData.height);
            color = gradient.getColorBytesAt(val);
            base = (y * imageData.width + x) * 4;
            pixels[base] = color.r;
            pixels[base + 1] = color.g;
            pixels[base + 2] = color.b;
            pixels[base + 3] = 255;
        }
    }
    ctx.putImageData(imageData, 0, 0);
})();
function drawbggradient() {
    // alert("called"); 
    var x = document.getElementsByTagName("BODY")[0];
    // document.getElementById(sid).style.backgroundColor = getRandomColor();
    // x.style.background = "linear - gradient(90deg, rgba(2, 0, 36, 1) 0 %, rgba(13, 200, 28, 1) 0 %, rgba(2, 182, 223, 1) 78 %, rgba(0, 111, 182, 1) 100 %)";

    // x.style.background = "#004455";

    //mesh gradient
    x.setAttribute("style", "background-image: linear-gradient(to right bottom, #e00381, #e70092, #ec00a5, #ee0eb9, #ef1ece, #cd5bea, #a87afa, #8590ff, #42b0ff, #00caff, #00e1ff, #5ff4fb);");
    x.setAttribute("style", "background-image: url(\"data: image / svg + xml,% 3Csvg xmlns = 'http://www.w3.org/2000/svg' width = '340' height = '56.7' viewBox = '0 0 600 100' % 3E % 3Cg stroke = '%2313FBFF' stroke - width='0' stroke - miterlimit='10' % 3E % 3Ccircle fill = '%23037B79' cx = '0' cy = '0' r = '50' /% 3E % 3Ccircle fill = '%23A3DE5F' cx = '100' cy = '0' r = '50' /% 3E % 3Ccircle fill = '%23FCFF18' cx = '200' cy = '0' r = '50' /% 3E % 3Ccircle fill = '%2311FF67' cx = '300' cy = '0' r = '50' /% 3E % 3Ccircle fill = '%231994FF' cx = '400' cy = '0' r = '50' /% 3E % 3Ccircle fill = '%23062EB4' cx = '500' cy = '0' r = '50' /% 3E % 3Ccircle fill = '%23037B79' cx = '600' cy = '0' r = '50' /% 3E % 3Ccircle cx = '-50' cy = '50' r = '50' /% 3E % 3Ccircle fill = '%2337b07c' cx = '50' cy = '50' r = '50' /% 3E % 3Ccircle fill = '%23cbf045' cx = '150' cy = '50' r = '50' /% 3E % 3Ccircle fill = '%23FFA701' cx = '250' cy = '50' r = '50' /% 3E % 3Ccircle fill = '%2300d8ff' cx = '350' cy = '50' r = '50' /% 3E % 3Ccircle fill = '%230063dd' cx = '450' cy = '50' r = '50' /% 3E % 3Ccircle fill = '%230065ac' cx = '550' cy = '50' r = '50' /% 3E % 3Ccircle cx = '650' cy = '50' r = '50' /% 3E % 3Ccircle fill = '%23037B79' cx = '0' cy = '100' r = '50' /% 3E % 3Ccircle fill = '%23A3DE5F' cx = '100' cy = '100' r = '50' /% 3E % 3Ccircle fill = '%23FCFF18' cx = '200' cy = '100' r = '50' /% 3E % 3Ccircle fill = '%2311FF67' cx = '300' cy = '100' r = '50' /% 3E % 3Ccircle fill = '%231994FF' cx = '400' cy = '100' r = '50' /% 3E % 3Ccircle fill = '%23062EB4' cx = '500' cy = '100' r = '50' /% 3E % 3Ccircle fill = '%23037B79' cx = '600' cy = '100' r = '50' /% 3E % 3Ccircle cx = '50' cy = '150' r = '50' /% 3E % 3Ccircle cx = '150' cy = '150' r = '50' /% 3E % 3Ccircle cx = '250' cy = '150' r = '50' /% 3E % 3Ccircle cx = '350' cy = '150' r = '50' /% 3E % 3Ccircle cx = '450' cy = '150' r = '50' /% 3E % 3Ccircle cx = '550' cy = '150' r = '50' /% 3E % 3C / g % 3E % 3C / svg % 3E\");");

}