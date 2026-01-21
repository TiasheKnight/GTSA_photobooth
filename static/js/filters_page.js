(() => {
  const video = document.getElementById("webcamPreview");
  const startBtn = document.getElementById("startCameraBtn");
  const statusEl = document.getElementById("cameraStatus");
  const canvas = document.getElementById("stripPreview");
  const radios = Array.from(document.querySelectorAll('input[name="filter"]'));

  let currentFilter = "none";
  let template = null; // { img, frames, overlay }
  let rafId = null;

  function setStatus(msg) {
    if (statusEl) statusEl.textContent = msg || "";
  }

  function readFilter() {
    const checked = radios.find((r) => r.checked);
    currentFilter = checked?.value || "none";
  }

  function drawTemplateOnly() {
    if (!template || !canvas) return;
    canvas.width = template.img.naturalWidth;
    canvas.height = template.img.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(template.img, 0, 0);
  }

  function loop() {
    if (!template || !canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background behind frame holes
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw webcam into frames with selected filter
    ctx.save();
    ctx.filter = getCanvasFilter(currentFilter);
    for (const r of template.frames) {
      Photostrip.drawSourceCover(ctx, video, r.x, r.y, r.w, r.h);
    }
    ctx.restore();

    // Overlay on top
    ctx.drawImage(template.overlay, 0, 0);

    rafId = requestAnimationFrame(loop);
  }

  async function startCamera() {
    if (!video) return;
    if (!startBtn) return;

    startBtn.disabled = true;
    setStatus("Starting camera...");

    try {
      await startWebcam({ videoEl: video, facingMode: "user" });
    } catch (e) {
      console.error(e);
      startBtn.disabled = false;
      setStatus("Camera blocked. Use https:// or localhost (especially on iPhone/iPad).");
      return;
    }

    startBtn.classList.add("d-none");
    setStatus("Preview ready — pick a filter, then start capture.");

    if (rafId) cancelAnimationFrame(rafId);
    loop();
  }

  async function init() {
    readFilter();
    radios.forEach((r) => r.addEventListener("change", () => readFilter()));

    try {
      template = await Photostrip.loadTemplate(TEMPLATE_ID);
      drawTemplateOnly();
      setStatus("Template ready.");
    } catch (e) {
      console.error(e);
      setStatus("Failed to load template preview.");
    }

    if (startBtn) startBtn.addEventListener("click", startCamera);
  }

  init();

  window.addEventListener("beforeunload", () => {
    if (rafId) cancelAnimationFrame(rafId);
    try { stopWebcam("webcamPreview"); } catch (_) {}
  });
})();

