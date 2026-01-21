const video = document.getElementById("webcam");
const previewCanvas = document.getElementById("previewCanvas");
const ctx = previewCanvas?.getContext("2d");
const shutter = new Audio("/static/sfx/shutter.wav");
const startBtn = document.getElementById("startCaptureBtn");

let photos = [];
let countdownEl = document.getElementById("countdown");

function sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
}

function flashScreen() {
    const flash = document.getElementById("flash");
    if (!flash) return;
    flash.classList.add("flash-show");
    setTimeout(() => flash.classList.remove("flash-show"), 120);
}

async function runShotCountdown(seconds) {
    for (let t = seconds; t > 0; t--) {
        if (countdownEl) countdownEl.innerText = String(t);
        await sleep(1000);
    }
    if (countdownEl) countdownEl.innerText = "Smile!";
    await sleep(250);
    if (countdownEl) countdownEl.innerText = "";
}

function captureFrame() {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    const tctx = tempCanvas.getContext("2d");

    tctx.filter = getCanvasFilter(FILTER);
    tctx.drawImage(video, 0, 0);

    return tempCanvas;
}

async function compositePhotostrip() {
    const { img: template, frames: frameRects, overlay } = await Photostrip.loadTemplate(TEMPLATE_ID);

    // Match canvas to template size for crisp output
    previewCanvas.width = template.naturalWidth || previewCanvas.width;
    previewCanvas.height = template.naturalHeight || previewCanvas.height;

    ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

    // Draw photos into detected frames
    frameRects.forEach((r, i) => {
        const photo = photos[i];
        if (!photo) return;
        Photostrip.drawSourceCover(ctx, photo, r.x, r.y, r.w, r.h);
    });

    // Draw overlay with transparent frame holes on top (keeps stickers/logos above)
    ctx.drawImage(overlay, 0, 0);

    const dataUrl = previewCanvas.toDataURL("image/png");
    sessionStorage.setItem("last_photostrip", dataUrl);

    const hidden = document.getElementById("photostrip_data");
    if (hidden) hidden.value = dataUrl;
}

function showNextButton() {
    const btn = document.getElementById("sendBtn");
    if (btn) btn.classList.remove("d-none");
}

async function beginCaptureFlow() {
    if (!video || !previewCanvas || !ctx) return;

    if (startBtn) {
        startBtn.disabled = true;
        startBtn.innerText = "Starting camera...";
    }

    try {
        // Must be triggered by a user gesture on iOS/Safari
        await startWebcam({ videoEl: video, facingMode: "user" });
    } catch (err) {
        if (startBtn) {
            startBtn.disabled = false;
            startBtn.innerText = "Start Camera & Begin";
        }
        alert("Camera access is required. On iPhone/iPad, you must use https:// or localhost.");
        return;
    }

    if (startBtn) startBtn.classList.add("d-none");

    photos = [];
    for (let i = 0; i < 3; i++) {
        await runShotCountdown(3);
        photos.push(captureFrame());

        shutter.currentTime = 0;
        shutter.play().catch(() => {});
        flashScreen();

        if (i < 2) {
            if (countdownEl) countdownEl.innerText = "Next photo...";
            await sleep(750);
            if (countdownEl) countdownEl.innerText = "";
        }

        // Small pause after shot
        await sleep(250);
    }

    await compositePhotostrip();
    showNextButton();

    // Save battery / release camera as soon as we have the strip
    try { stopWebcam("webcam"); } catch (_) {}
}

if (startBtn) {
    startBtn.addEventListener("click", () => {
        beginCaptureFlow();
    });
} else {
    // Desktop fallback (may be blocked on iOS)
    beginCaptureFlow();
}
