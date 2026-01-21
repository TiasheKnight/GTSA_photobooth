const video = document.getElementById("webcam");
const previewCanvas = document.getElementById("previewCanvas");
const ctx = previewCanvas.getContext("2d");
const shutter = new Audio('/static/sfx/shutter.wav');

let photos = [];
let countdownEl = document.getElementById("countdown");

async function main() {
    // wait for webcam
    await startWebcam();

    runCountdown(3, async () => {
        await takeThreePhotos();
        compositePhotostrip();
        showNextButton();
    });
}

function runCountdown(seconds, callback) {
    let time = seconds;
    countdownEl.innerText = time;

    let interval = setInterval(() => {
        time--;
        if (time <= 0) {
            clearInterval(interval);
            countdownEl.innerText = "Smile!";
            setTimeout(() => {
                countdownEl.innerText = "";
                callback();
            }, 500);
        } else {
            countdownEl.innerText = time;
        }
    }, 1000);
}

async function takeThreePhotos() {
    for (let i = 0; i < 3; i++) {
        await new Promise(res => setTimeout(res, 1000)); // pause before shot
        photos.push(captureFrame());
        countdownEl.innerText = (i < 2) ? "Next..." : "Done!";
        await new Promise(res => setTimeout(res, 1000));
        countdownEl.innerText = "";
    }
}

function captureFrame() {
    shutter.play();
    let tempCanvas = document.createElement("canvas");
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    let tctx = tempCanvas.getContext("2d");

    tctx.filter = getCanvasFilter(FILTER);
    tctx.drawImage(video, 0, 0);

    return tempCanvas;
}

function compositePhotostrip() {
    const template = new Image();
    template.src = `/static/photostrip_templates/template${TEMPLATE_ID}.png`;

    template.onload = () => {
        ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

        // Example layout (you will adjust to match your PNG)
        const slotW = 362;
        const slotH = 216;
        const offsetX = 18;
        const offsetsY = [10, 250, 496];

        // Draw each captured photo
        photos.forEach((photo, i) => {
            ctx.drawImage(photo, offsetX, offsetsY[i], slotW, slotH);
        });

        // Draw template overlay last
        ctx.drawImage(template, 0, 0, previewCanvas.width, previewCanvas.height);

        // Export to base64 for emailing
        let dataUrl = previewCanvas.toDataURL("image/png");
        sessionStorage.setItem('last_photostrip', dataUrl);
        // document.getElementById("photostrip_data").value = dataUrl;
        document.addEventListener("DOMContentLoaded", function() {
            document.getElementById("photostrip_data").value = dataUrl;
        });
        
    };
}

function showNextButton() {
    document.getElementById("sendBtn").classList.remove("d-none");
}

main();
