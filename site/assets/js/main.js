"use strict";

/* ============================================================
   Dugun geri sayim ekrani (kiosk)
   Tarih buradan duzenlenir.
   ============================================================ */

const CONFIG = {
  nameA: "Şule",
  nameB: "Berkay",
  dateISO: "2026-10-25T16:00:00+03:00"
};

const $ = (s, p) => (p || document).querySelector(s);
const $$ = (s, p) => Array.from((p || document).querySelectorAll(s));
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[(Math.random() * arr.length) | 0];
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------
   Isim baglama
   ------------------------------------------------------------ */

function fillConfig() {
  const vals = {
    "name-a": CONFIG.nameA,
    "name-b": CONFIG.nameB
  };
  $$("[data-cfg]").forEach((el) => {
    const v = vals[el.dataset.cfg];
    if (v != null) el.textContent = v;
  });
  document.title = CONFIG.nameA + " & " + CONFIG.nameB + " · Düğünümüze kalan süre";
}

/* ------------------------------------------------------------
   Yaprak ve kalp parcaciklari (canvas)
   ------------------------------------------------------------ */

const petalCanvas = $("#petals");
const pctx = petalCanvas.getContext("2d");
const PETAL_COLORS = ["#F6C7D3", "#E4D5F1", "#FBE3C6", "#D6EADF", "#F3DCE0"];
const HEART_COLORS = ["#E89AB4", "#D67BA0", "#C9A0E0", "#E7B6C6", "#D9A2B8"];
let W = 0, H = 0;
let petals = [];
let hearts = [];
let lastT = 0;

function makePetal(fromTop) {
  return {
    x: rand(0, W),
    y: fromTop ? rand(-60, -20) : rand(0, H),
    size: rand(9, 17),
    speed: rand(18, 44),
    sway: rand(8, 24),
    swayFreq: rand(0.4, 1),
    phase: rand(0, Math.PI * 2),
    rot: rand(0, Math.PI * 2),
    vr: rand(-0.7, 0.7),
    color: pick(PETAL_COLORS),
    alpha: rand(0.4, 0.75)
  };
}

function resizePetals() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth;
  H = window.innerHeight;
  petalCanvas.width = Math.round(W * dpr);
  petalCanvas.height = Math.round(H * dpr);
  petalCanvas.style.width = W + "px";
  petalCanvas.style.height = H + "px";
  pctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const target = Math.round(Math.min(28, Math.max(13, (W * H) / 44000)));
  while (petals.length < target) petals.push(makePetal(false));
  petals.length = target;
}

function drawPetal(p) {
  pctx.save();
  pctx.translate(p.x, p.y);
  pctx.rotate(p.rot);
  pctx.globalAlpha = p.alpha;
  pctx.fillStyle = p.color;
  const s = p.size;
  pctx.beginPath();
  pctx.moveTo(0, -s * 0.5);
  pctx.bezierCurveTo(s * 0.55, -s * 0.32, s * 0.5, s * 0.35, 0, s * 0.55);
  pctx.bezierCurveTo(-s * 0.5, s * 0.35, -s * 0.55, -s * 0.32, 0, -s * 0.5);
  pctx.fill();
  pctx.restore();
}

function drawHeart(h) {
  const s = h.size;
  pctx.save();
  pctx.translate(h.x, h.y);
  pctx.rotate(h.rot);
  pctx.globalAlpha = Math.max(0, Math.min(1, h.life / h.maxLife));
  pctx.fillStyle = h.color;
  pctx.beginPath();
  pctx.moveTo(0, s * 0.3);
  pctx.bezierCurveTo(s * 0.62, -s * 0.35, s * 1.05, s * 0.25, 0, s);
  pctx.bezierCurveTo(-s * 1.05, s * 0.25, -s * 0.62, -s * 0.35, 0, s * 0.3);
  pctx.fill();
  pctx.restore();
}

function burstHearts(x, y, n) {
  for (let i = 0; i < n; i++) {
    hearts.push({
      x, y,
      vx: rand(-140, 140),
      vy: rand(-320, -120),
      grav: 340,
      size: rand(7, 15),
      rot: rand(-0.6, 0.6),
      vr: rand(-3, 3),
      color: pick(HEART_COLORS),
      life: rand(1, 1.6),
      maxLife: 1.6
    });
  }
}

function heartRain(n) {
  for (let i = 0; i < n; i++) {
    setTimeout(() => {
      hearts.push({
        x: rand(0, W),
        y: -20,
        vx: rand(-30, 30),
        vy: rand(50, 130),
        grav: 45,
        size: rand(8, 16),
        rot: rand(-0.5, 0.5),
        vr: rand(-1.5, 1.5),
        color: pick(HEART_COLORS),
        life: rand(3.2, 4.5),
        maxLife: 4.5
      });
    }, i * 55);
  }
}

function petalsFrame(t) {
  const dt = Math.min((t - lastT) / 1000, 0.05) || 0.016;
  lastT = t;
  const now = t / 1000;
  pctx.clearRect(0, 0, W, H);

  for (const p of petals) {
    p.x += Math.sin(now * p.swayFreq + p.phase) * p.sway * dt;
    p.y += p.speed * dt;
    p.rot += p.vr * dt;
    if (p.y > H + 40) {
      p.y = rand(-60, -20);
      p.x = rand(0, W);
    }
    drawPetal(p);
  }

  for (let i = hearts.length - 1; i >= 0; i--) {
    const h = hearts[i];
    h.vy += h.grav * dt;
    h.x += h.vx * dt;
    h.y += h.vy * dt;
    h.rot += h.vr * dt;
    h.life -= dt;
    if (h.life <= 0 || h.y > H + 60) {
      hearts.splice(i, 1);
      continue;
    }
    drawHeart(h);
  }

  requestAnimationFrame(petalsFrame);
}

function initPetals() {
  if (reduced) return;
  resizePetals();
  let rT;
  window.addEventListener("resize", () => {
    clearTimeout(rT);
    rT = setTimeout(resizePetals, 160);
  });
  requestAnimationFrame((t) => {
    lastT = t;
    requestAnimationFrame(petalsFrame);
  });
}

/* ------------------------------------------------------------
   Geri sayim
   ------------------------------------------------------------ */

const cdTarget = new Date(CONFIG.dateISO).getTime();
const cdEls = { d: $("#cdD"), h: $("#cdH"), m: $("#cdM"), s: $("#cdS") };
let countdownZero = false;
let tickTimer = null;

function setNum(el, value) {
  const str = String(value).padStart(2, "0");
  if (el.dataset.v === str) return;
  el.dataset.v = str;
  el.querySelectorAll(".slot.leave").forEach((s) => s.remove());
  const prev = el.querySelector(".slot.cur");
  const next = document.createElement("span");
  next.className = "slot cur enter";
  next.textContent = str;
  el.appendChild(next);
  if (prev) {
    prev.classList.remove("cur");
    prev.classList.add("leave");
    setTimeout(() => prev.remove(), 700);
  }
  if (reduced) {
    next.classList.remove("enter");
    return;
  }
  void next.offsetWidth;
  next.classList.remove("enter");
}

function zeroState() {
  if (countdownZero) return;
  countdownZero = true;
  clearTimeout(tickTimer);
  Object.values(cdEls).forEach((el) => setNum(el, 0));
  const title = $(".lt-count-title");
  if (title) title.textContent = "Bugün büyük günümüz!";
  if (!reduced) heartRain(46);
}

function scheduleTick(delay) {
  clearTimeout(tickTimer);
  tickTimer = setTimeout(countdownTick, delay);
}

function countdownTick() {
  const diff = cdTarget - Date.now();
  if (diff <= 0) {
    zeroState();
    return;
  }
  setNum(cdEls.d, Math.floor(diff / 86400000));
  setNum(cdEls.h, Math.floor(diff / 3600000) % 24);
  setNum(cdEls.m, Math.floor(diff / 60000) % 60);
  setNum(cdEls.s, Math.floor(diff / 1000) % 60);
  scheduleTick(1000 - (Date.now() % 1000));
}

/* ------------------------------------------------------------
   Zarf acilisi -> kart cikisi -> surukleme -> tam ekran
   ------------------------------------------------------------ */

function initEnvelope() {
  const envelope = $("#envelope");
  const seal = $("#seal");
  const scene = $("#envScene");
  const card = $("#letterCard");
  let opened = false;
  let full = false;
  let dragY = 0;
  let yIn = 0, yOut = 0;
  let dragging = false, moved = false, startPy = 0, startDragY = 0, startT = 0;

  /* Kart konum sinirlari: icerde tamamen zarfin arkasinda,
     dista alt kenari zarfin agzinda. Kart hangi ekranda olursa
     olsun zarfin icine tamamen sigmasi icin --k gerektigi kadar
     kucultulur. */
  function measure() {
    const env = envelope.getBoundingClientRect();
    const fullH = card.offsetHeight;
    const baseK = parseFloat(getComputedStyle(card).getPropertyValue("--k")) || .45;
    const k = Math.min(
      baseK,
      (env.width * 0.98) / card.offsetWidth,
      (env.height * 0.9) / fullH
    );
    card.style.setProperty("--k", k.toFixed(3));
    /* gBCR gecis animasyonu ortasinda yanlis olcer; olceksiz yerlesim boyutundan hesapla */
    const cardHalf = (fullH * k) / 2;
    const envCenterY = env.top + env.height / 2;
    const stageCenterY = window.innerHeight / 2;
    yIn = envCenterY - stageCenterY;
    yOut = env.top - cardHalf - stageCenterY;
  }

  function setDragY(y, clamped) {
    /* yIn: zarf icinde (buyuk deger), yOut: agzinda (kucuk deger) */
    dragY = clamped ? Math.min(Math.max(y, yOut), yIn) : y;
    card.style.setProperty("--drag-y", dragY.toFixed(1) + "px");
  }

  function openEnvelope() {
    if (opened || full) return;
    opened = true;
    seal.classList.add("pop");
    if (!reduced) {
      const r = seal.getBoundingClientRect();
      burstHearts(r.left + r.width / 2, r.top + r.height / 2, 16);
    }
    measure();
    setTimeout(() => envelope.classList.add("open"), 380);
    /* kapak 380ms + .12s gecikme + 1.05s = ~1.55s'te tam acilir;
       tam acilinca arkaya gecer, ardindan kart hafifce yukselir */
    setTimeout(() => envelope.classList.add("behind"), 1600);
    setTimeout(() => {
      card.classList.add("peek");
      setDragY(yIn + (yOut - yIn) * 0.45);
    }, 1750);
  }

  function openFull() {
    if (full) return;
    full = true;
    card.classList.remove("peek", "dragging");
    card.classList.add("full");
    envelope.classList.add("flown");
    setTimeout(() => scene.classList.add("gone"), 1250);
  }

  envelope.addEventListener("click", openEnvelope);

  card.addEventListener("pointerdown", (e) => {
    if (!opened || full) return;
    dragging = true;
    moved = false;
    startPy = e.clientY;
    startDragY = dragY;
    startT = performance.now();
    card.classList.add("dragging");
    try { card.setPointerCapture(e.pointerId); } catch (_) { /* sentetik olaylarda.capture olmayabilir */ }
  });

  card.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dy = e.clientY - startPy;
    if (Math.abs(dy) > 6) moved = true;
    if (moved) setDragY(startDragY + dy, true);
  });

  card.addEventListener("pointerup", () => {
    if (!dragging) return;
    dragging = false;
    card.classList.remove("dragging");
    if (!moved && performance.now() - startT < 600) openFull();
  });

  card.addEventListener("pointercancel", () => {
    dragging = false;
    card.classList.remove("dragging");
  });

  card.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    if (!opened) openEnvelope();
    else openFull();
  });

  window.addEventListener("resize", () => {
    if (!opened || full) return;
    measure();
    setDragY(dragY, true);
  });
}

/* ------------------------------------------------------------
   Baslat
   ------------------------------------------------------------ */

fillConfig();
initPetals();
countdownTick();
initEnvelope();

/* Arka planda kalan sekme geri dondugunde sayac gecmis saniyeyi telafi etsin;
   donmus olabilecek slot gecislerini de tazele */
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && !countdownZero) {
    Object.values(cdEls).forEach((el) => { delete el.dataset.v; });
    countdownTick();
  }
});
