(() => {
  const video = document.getElementById("webcam");
  const startBtn = document.getElementById("startPreviewBtn");
  const statusEl = document.getElementById("cameraStatus");
  const canvases = Array.from(document.querySelectorAll("canvas.template-canvas[data-template-id]"));

  const templateCache = new Map(); // id -> { img, frames, overlay }
  let rafId = null;

  function setStatus(msg) {
    if (statusEl) statusEl.textContent = msg || "";
  }

  function getCanvasForId(id) {
    return canvases.find((c) => String(c.dataset.templateId) === String(id));
  }

  async function loadAllTemplates() {
    const ids = [1, 2, 3, 4, 5, 6];
    await Promise.all(
      ids.map(async (id) => {
        const t = await Photostrip.loadTemplate(id);
        templateCache.set(String(id), t);

        const canvas = getCanvasForId(id);
        if (!canvas) return;
        canvas.width = t.img.naturalWidth;
        canvas.height = t.img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(t.img, 0, 0);
      })
    );
  }

  function drawLoop() {
    for (const canvas of canvases) {
      const id = canvas.dataset.templateId;
      const t = templateCache.get(String(id));
      if (!t) continue;

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw white background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw webcam into each frame (flipped)
      ctx.save();
      ctx.filter = "none";
      for (const r of t.frames) {
        // Flip the context for this frame
        ctx.save();
        ctx.translate(r.x + r.w, r.y);
        ctx.scale(-1, 1);
        Photostrip.drawSourceCover(ctx, video, 0, 0, r.w, r.h);
        ctx.restore();
      }
      ctx.restore();

      // Draw template on top (with logo and borders visible)
      ctx.drawImage(t.img, 0, 0);
    }

    rafId = requestAnimationFrame(drawLoop);
  }

  async function startPreview() {
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
    setStatus("Preview ready — pick your template.");

    if (rafId) cancelAnimationFrame(rafId);
    drawLoop();
  }

  // Init
  loadAllTemplates().then(() => setStatus("Templates ready.")).catch((e) => {
    console.error(e);
    setStatus("Could not load templates.");
  });

  // Auto-start preview
  startPreview();

  if (startBtn) startBtn.addEventListener("click", startPreview);

  window.addEventListener("beforeunload", () => {
    if (rafId) cancelAnimationFrame(rafId);
    try { stopWebcam("webcam"); } catch (_) {}
  });
})();

