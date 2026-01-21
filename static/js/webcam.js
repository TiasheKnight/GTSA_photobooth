async function startWebcam(options = {}) {
    const {
        videoEl = null,
        videoElId = "webcam",
        facingMode = "user",
        width = undefined,
        height = undefined,
    } = options;

    const video = videoEl || document.getElementById(videoElId);
    if (!video) return null;

    if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("getUserMedia is not supported in this browser");
    }

    // iOS/Safari requirements
    video.setAttribute("playsinline", "");
    video.muted = true;
    video.autoplay = true;

    const constraints = {
        audio: false,
        video: {
            facingMode: { ideal: facingMode },
            ...(width ? { width: { ideal: width } } : {}),
            ...(height ? { height: { ideal: height } } : {}),
        },
    };

    try {
        // Stop any previous stream
        if (video.srcObject) {
            try {
                video.srcObject.getTracks().forEach((t) => t.stop());
            } catch (_) {
                // ignore
            }
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;

        // Wait for metadata so videoWidth/videoHeight are available
        await new Promise((resolve) => {
            if (video.readyState >= 1) return resolve();
            video.onloadedmetadata = () => resolve();
        });

        // On iOS this must be triggered by a user gesture (button click)
        await video.play();

        return stream;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

function stopWebcam(videoElId = "webcam") {
    const video = document.getElementById(videoElId);
    if (!video?.srcObject) return;
    try {
        video.srcObject.getTracks().forEach((t) => t.stop());
    } finally {
        video.srcObject = null;
    }
}

window.startWebcam = startWebcam;
window.stopWebcam = stopWebcam;
