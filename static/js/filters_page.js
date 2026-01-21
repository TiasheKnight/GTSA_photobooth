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
    // Filter is now updated, loop will use the new filter on next frame
    console.log("Filter changed to:", currentFilter);
  }

  function drawTemplateOnly() {
    if (!template || !canvas) return;
    const w = template.img.naturalWidth;
    const h = template.img.naturalHeight;
    
    console.log("Drawing template, dimensions:", w, h, "image ready:", template.img.complete);
    
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(template.img, 0, 0);
    console.log("Template drawn to canvas");
  }

  function loop() {
    if (!template || !canvas || !video) return;
    const ctx = canvas.getContext("2d");
    const w = template.img.naturalWidth;
    const h = template.img.naturalHeight;
    
    ctx.clearRect(0, 0, w, h);

    // Draw white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    // Draw webcam into frames with selected filter (flipped)
    ctx.save();
    ctx.filter = getCanvasFilter(currentFilter);
    for (const r of template.frames) {
      // Flip the context for this frame
      ctx.save();
      ctx.translate(r.x + r.w, r.y);
      ctx.scale(-1, 1);
      Photostrip.drawSourceCover(ctx, video, 0, 0, r.w, r.h);
      ctx.restore();
    }
    ctx.restore();

    // Draw template on top (with logo and borders visible)
    ctx.drawImage(template.img, 0, 0);

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
      console.log("Template loaded in filters_page:", template);
      console.log("Frames detected:", template.frames.length, template.frames);
      drawTemplateOnly();
      setStatus("Template ready.");
    } catch (e) {
      console.error(e);
      setStatus("Failed to load template preview.");
    }

    if (startBtn) startBtn.addEventListener("click", startCamera);
    
    // Auto-start camera
    await startCamera();
  }

  init();

  window.addEventListener("beforeunload", () => {
    if (rafId) cancelAnimationFrame(rafId);
    try { stopWebcam("webcamPreview"); } catch (_) {}
  });
})();

