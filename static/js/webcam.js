async function startWebcam() {
    const video = document.getElementById("webcam");
    if (!video) return;

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
    } catch (err) {
        alert("Webcam access required!");
        console.error(err);
    }
}

startWebcam();
