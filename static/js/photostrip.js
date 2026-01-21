/**
 * Utilities for rendering webcam frames into photostrip templates.
 * - Detects the 3 large "frame" rectangles by scanning dark pixel density.
 * - Creates an overlay canvas with transparent holes inside the frames.
 * - Draws a video/canvas/image source into a frame using "cover" cropping.
 */
(() => {
  function isDarkPixel(r, g, b, a) {
    if (a < 20) return false;
    return r < 40 && g < 40 && b < 40;
  }

  function getSourceSize(src) {
    if (!src) return { w: 0, h: 0 };
    if (src instanceof HTMLVideoElement) return { w: src.videoWidth, h: src.videoHeight };
    if (src instanceof HTMLCanvasElement) return { w: src.width, h: src.height };
    return { w: src.naturalWidth || src.width || 0, h: src.naturalHeight || src.height || 0 };
  }

  function drawSourceCover(ctx, src, dx, dy, dw, dh) {
    const { w: sw, h: sh } = getSourceSize(src);
    if (!sw || !sh) return;

    const sAspect = sw / sh;
    const dAspect = dw / dh;

    let sx = 0, sy = 0, sW = sw, sH = sh;
    if (sAspect > dAspect) {
      sW = Math.round(sh * dAspect);
      sx = Math.round((sw - sW) / 2);
    } else if (sAspect < dAspect) {
      sH = Math.round(sw / dAspect);
      sy = Math.round((sh - sH) / 2);
    }

    ctx.drawImage(src, sx, sy, sW, sH, dx, dy, dw, dh);
  }

  function detectFrameRects(templateImg) {
    const w = templateImg.naturalWidth;
    const h = templateImg.naturalHeight;
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const cctx = c.getContext("2d", { willReadFrequently: true });
    cctx.drawImage(templateImg, 0, 0);

    const img = cctx.getImageData(0, 0, w, h);
    const data = img.data;

    const rowCount = new Uint32Array(h);
    for (let y = 0; y < h; y++) {
      let cnt = 0;
      const rowStart = y * w * 4;
      for (let x = 0; x < w; x++) {
        const i = rowStart + x * 4;
        if (isDarkPixel(data[i], data[i + 1], data[i + 2], data[i + 3])) cnt++;
      }
      rowCount[y] = cnt;
    }

    const denseThreshold = Math.floor(w * 0.35);
    const bands = [];
    let inBand = false;
    let startY = 0;
    for (let y = 0; y < h; y++) {
      const dense = rowCount[y] > denseThreshold;
      if (dense && !inBand) {
        inBand = true;
        startY = y;
      } else if (!dense && inBand) {
        const endY = y - 1;
        if (endY - startY > Math.floor(h * 0.05)) bands.push([startY, endY]);
        inBand = false;
      }
    }
    if (inBand) bands.push([startY, h - 1]);

    const rects = bands.map(([y1, y2]) => {
      let minX = w;
      let maxX = 0;
      for (let y = y1; y <= y2; y++) {
        const rowStart = y * w * 4;
        for (let x = 0; x < w; x++) {
          const i = rowStart + x * 4;
          if (isDarkPixel(data[i], data[i + 1], data[i + 2], data[i + 3])) {
            if (x < minX) minX = x;
            break;
          }
        }
        for (let x = w - 1; x >= 0; x--) {
          const i = rowStart + x * 4;
          if (isDarkPixel(data[i], data[i + 1], data[i + 2], data[i + 3])) {
            if (x > maxX) maxX = x;
            break;
          }
        }
      }
      return { x: minX, y: y1, w: Math.max(0, maxX - minX + 1), h: Math.max(0, y2 - y1 + 1) };
    });

    rects.sort((a, b) => b.w * b.h - a.w * a.h);
    return rects.slice(0, 3).sort((a, b) => a.y - b.y);
  }

  function makeTemplateOverlayCanvas(templateImg, frameRects) {
    const w = templateImg.naturalWidth;
    const h = templateImg.naturalHeight;
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const cctx = c.getContext("2d", { willReadFrequently: true });
    cctx.drawImage(templateImg, 0, 0);

    const img = cctx.getImageData(0, 0, w, h);
    const data = img.data;

    for (const r of frameRects) {
      const x1 = Math.max(0, r.x);
      const y1 = Math.max(0, r.y);
      const x2 = Math.min(w - 1, r.x + r.w - 1);
      const y2 = Math.min(h - 1, r.y + r.h - 1);

      for (let y = y1; y <= y2; y++) {
        const rowStart = y * w * 4;
        for (let x = x1; x <= x2; x++) {
          const i = rowStart + x * 4;
          if (isDarkPixel(data[i], data[i + 1], data[i + 2], data[i + 3])) {
            data[i + 3] = 0;
          }
        }
      }
    }

    cctx.putImageData(img, 0, 0);
    return c;
  }

  async function loadTemplate(templateId) {
    const img = new Image();
    img.src = `/static/photostrip_templates/template${templateId}.png`;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    const frames = detectFrameRects(img);
    const overlay = makeTemplateOverlayCanvas(img, frames);
    return { img, frames, overlay };
  }

  window.Photostrip = {
    loadTemplate,
    detectFrameRects,
    makeTemplateOverlayCanvas,
    drawSourceCover,
    getSourceSize,
  };
})();

