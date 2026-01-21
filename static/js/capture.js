const video = document.getElementById("webcam");
const previewCanvas = document.getElementById("previewCanvas");
const shutter = new Audio("/static/sfx/shutter.wav");
const startBtn = document.getElementById("startCaptureBtn");

let photos = [];
let countdownEl = document.getElementById("countdown");
let template = null;
let ctx = null;

function sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
}

function flashScreen() {
    const flash = document.getElementById("flash");
    if (!flash) return;
    flash.classList.add("flash-show");
    setTimeout(() => flash.classList.remove("flash-show"), 500);
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
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
        console.error("Video not ready for capture. Dimensions:", video?.videoWidth, video?.videoHeight);
        return null;
    }
    
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    const tctx = tempCanvas.getContext("2d");

    // Flip horizontally
    tctx.translate(tempCanvas.width, 0);
    tctx.scale(-1, 1);

    tctx.filter = getCanvasFilter(FILTER);
    tctx.drawImage(video, 0, 0);
    
    console.log("Frame captured:", tempCanvas.width, tempCanvas.height);

    return tempCanvas;
}

async function updatePhotoPreview() {
    if (!template || !previewCanvas || !ctx) return;

    const w = template.img.naturalWidth;
    const h = template.img.naturalHeight;

    // Resize canvas to template dimensions
    previewCanvas.width = w;
    previewCanvas.height = h;
    
    // Get fresh context after resize
    ctx = previewCanvas.getContext("2d");

    ctx.clearRect(0, 0, w, h);

    // Draw white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    // Draw photos into detected frames
    template.frames.forEach((r, i) => {
        const photo = photos[i];
        if (!photo) {
            console.warn("Photo", i, "is missing or null");
            return;
        }
        Photostrip.drawSourceCover(ctx, photo, r.x, r.y, r.w, r.h);
    });

    // Draw template on top (with logo and borders visible)
    ctx.drawImage(template.img, 0, 0);
}

async function compositePhotostrip() {
    if (!template || !previewCanvas || !ctx) return;

    await updatePhotoPreview();

    const dataUrl = previewCanvas.toDataURL("image/png");
    sessionStorage.setItem("last_photostrip", dataUrl);

    const hidden = document.getElementById("photostrip_data");
    if (hidden) hidden.value = dataUrl;
}

function showNextButton() {
    const btn = document.getElementById("sendBtn");
    if (btn) btn.classList.remove("d-none");
}

async function initCamera() {
    if (!video || !previewCanvas) return;

    try {
        // Initialize context
        ctx = previewCanvas.getContext("2d");
        console.log("Canvas context initialized, dimensions:", previewCanvas.width, previewCanvas.height);
        
        // Must be triggered by a user gesture on iOS/Safari
        await startWebcam({ videoEl: video, facingMode: "user" });
        console.log("Webcam started, video dimensions:", video.videoWidth, video.videoHeight);
        
        // Load template for preview
        template = await Photostrip.loadTemplate(TEMPLATE_ID);
        console.log("Template loaded:", template);
        console.log("Frame count:", template.frames.length);
        template.frames.forEach((f, i) => {
            console.log(`Frame ${i}:`, f);
        });
        
        // Draw empty template
        if (template) {
            const w = template.img.naturalWidth;
            const h = template.img.naturalHeight;
            console.log("Template dimensions:", w, h);
            previewCanvas.width = w;
            previewCanvas.height = h;
            ctx = previewCanvas.getContext("2d");
            ctx.drawImage(template.img, 0, 0);
            console.log("Template drawn to canvas");
        }
    } catch (err) {
        console.error("Camera initialization failed:", err);
        alert("Camera access is required. On iPhone/iPad, you must use https:// or localhost.");
    }
}

async function beginCaptureFlow() {
    if (!video || !previewCanvas || !ctx) return;

    if (startBtn) {
        startBtn.disabled = true;
        startBtn.innerText = "Capturing...";
    }

    photos = [];
    for (let i = 0; i < 3; i++) {
        await runShotCountdown(3);
        const frame = captureFrame();
        if (!frame) {
            console.error("Failed to capture frame", i);
            continue;
        }
        photos.push(frame);

        shutter.currentTime = 0;
        shutter.play().catch(() => {});
        flashScreen();

        // Update preview after each capture
        await updatePhotoPreview();

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

    if (startBtn) {
        startBtn.disabled = false;
        startBtn.innerText = "Start Capture";
    }

    // Save battery / release camera as soon as we have the strip
    try { stopWebcam("webcam"); } catch (_) {}
}

// Auto-initialize camera on page load
initCamera();

if (startBtn) {
    startBtn.addEventListener("click", () => {
        beginCaptureFlow();
    });
}
