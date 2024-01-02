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
    x.setAttribute("style", "background-image: linear-gradient(to right bottom, #e00381, #e70092, #ec00a5, #ee0eb9, #ef1ece, #cd5bea, #a87afa, #8590ff, #42b0ff, #00caff, #00e1ff, #5ff4fb);");

}