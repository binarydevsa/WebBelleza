// ===== Config: change these for a real client =====
const CONFIG = {
  // WhatsApp number with country code, digits only (e.g. "19735550123"). Empty = demo mode.
  whatsappNumber: "",
  // Direct Google review link from the business profile. Empty = demo mode.
  reviewUrl: "",
  times: ["10:00", "11:30", "13:00", "14:30", "16:00", "17:30"],
  closedDays: [1] // 0 = Sunday, 1 = Monday...
};

const UI = {
  es: {
    days: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
    months: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
    toggleLabel: "Switch to English",
    errService: "Escoge un servicio.",
    errDay: "Escoge el día.",
    errTime: "Escoge la hora.",
    errName: "Escribe tu nombre.",
    msgBook: (s, d, t, n, c) => `Hola, soy ${n}. Quiero reservar ${s} el ${d} a las ${t}, en tono ${c}. ¿Hay espacio?`,
    msgGeneral: "Hola, vi su página y quiero información sobre sus servicios.",
    msgPromo: "Hola, quiero la promo del mes: mani + pedi spa por $55.",
    demoTitle: "Así funciona en tu página",
    demoWa: "Se abre WhatsApp con este mensaje ya escrito para el salón:",
    demoReview: "Se abre directo la ventana para dejar una reseña en el perfil de Google del negocio."
  },
  en: {
    days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    toggleLabel: "Cambiar a español",
    errService: "Choose a service.",
    errDay: "Choose a day.",
    errTime: "Choose a time.",
    errName: "Enter your name.",
    msgBook: (s, d, t, n, c) => `Hi, I'm ${n}. I'd like to book ${s} on ${d} at ${t}, in the shade ${c}. Do you have a spot?`,
    msgGeneral: "Hi, I saw your page and I'd like info about your services.",
    msgPromo: "Hi, I'd like the promo of the month: mani + spa pedi for $55.",
    demoTitle: "How it works on your page",
    demoWa: "WhatsApp opens with this message already written to the salon:",
    demoReview: "It opens the window to leave a review on the business's Google profile."
  }
};

let lang = "es";
let selectedDay = null;
let selectedTime = null;
let shadeIndex = 0;
const ES = {};
const $ = (id) => document.getElementById(id);

// ===== i18n =====
function captureSpanish() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (!(key in ES)) ES[key] = el.innerHTML;
  });
  document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
    const [attr, key] = el.dataset.i18nAttr.split(":");
    if (!(key in ES)) ES[key] = el.getAttribute(attr);
  });
}

function applyLang(next) {
  lang = next;
  const dict = lang === "en" ? window.I18N_EN : ES;
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const v = dict[el.dataset.i18n];
    if (v !== undefined) el.innerHTML = v;
  });
  document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
    const [attr, key] = el.dataset.i18nAttr.split(":");
    if (dict[key] !== undefined) el.setAttribute(attr, dict[key]);
  });
  const toggle = $("lang-toggle");
  toggle.textContent = lang === "en" ? "ES" : "EN";
  toggle.setAttribute("aria-label", UI[lang].toggleLabel);
  renderDays();
  renderTimes();
  setShade(shadeIndex, false);
  updateSummary();
  try { localStorage.setItem("lang", lang); } catch (e) { /* storage unavailable */ }
}

// ===== Shade wheel =====
function tips() { return Array.from(document.querySelectorAll(".tip")); }
function shadeName(i) { return tips()[i].dataset[lang]; }

function setShade(i, focus) {
  const all = tips();
  shadeIndex = (i + all.length) % all.length;
  const tip = all[shadeIndex];
  all.forEach((t, n) => {
    t.setAttribute("aria-checked", String(n === shadeIndex));
    t.tabIndex = n === shadeIndex ? 0 : -1;
    t.setAttribute("aria-label", t.dataset[lang]);
  });
  const root = document.documentElement.style;
  root.setProperty("--accent", tip.dataset.deep);
  $("wheel").style.setProperty("--turn", `${-shadeIndex * 30}deg`);
  $("shade-name").textContent = tip.dataset[lang];
  if (focus) tip.focus();
  updateSummary();
}

function setupWheel() {
  tips().forEach((t, i) => {
    t.style.setProperty("--fill", t.dataset.fill);
    t.addEventListener("click", () => setShade(i, false));
  });
  $("wheel").addEventListener("keydown", (e) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (step) { e.preventDefault(); setShade(shadeIndex + step, true); }
  });
}

// ===== Booking =====
function nextOpenDays(count) {
  const out = [];
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  while (out.length < count) {
    d.setDate(d.getDate() + 1);
    if (!CONFIG.closedDays.includes(d.getDay())) out.push(new Date(d));
  }
  return out;
}

function isoLocal(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dayLabel(d) {
  const t = UI[lang];
  return { top: t.days[d.getDay()], bottom: `${d.getDate()} ${t.months[d.getMonth()]}` };
}

function formatTime(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "p.m." : "a.m.";
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

function makeChip(value, top, bottom, isSelected, onPick) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "chip";
  b.setAttribute("aria-pressed", String(isSelected));
  b.append(document.createTextNode(top));
  if (bottom) {
    const s = document.createElement("small");
    s.textContent = bottom;
    b.append(s);
  }
  b.addEventListener("click", () => onPick(value));
  return b;
}

function renderDays() {
  const box = $("day-chips");
  box.replaceChildren();
  nextOpenDays(6).forEach((d) => {
    const iso = isoLocal(d);
    const l = dayLabel(d);
    box.append(makeChip(iso, l.top, l.bottom, selectedDay === iso, (v) => { selectedDay = v; renderDays(); updateSummary(); }));
  });
}

function renderTimes() {
  const box = $("time-chips");
  box.replaceChildren();
  CONFIG.times.forEach((t) => {
    box.append(makeChip(t, formatTime(t), "", selectedTime === t, (v) => { selectedTime = v; renderTimes(); updateSummary(); }));
  });
}

function selectedDayText() {
  if (!selectedDay) return "—";
  const l = dayLabel(new Date(`${selectedDay}T12:00:00`));
  return `${l.top} ${l.bottom}`;
}

function updateSummary() {
  const service = $("f-service");
  if (!service || !$("sum-service")) return;
  $("sum-service").textContent = service.value ? service.options[service.selectedIndex].textContent.trim() : "—";
  $("sum-day").textContent = selectedDayText();
  $("sum-time").textContent = selectedTime ? formatTime(selectedTime) : "—";
  $("sum-shade").textContent = shadeName(shadeIndex);
}

// ===== WhatsApp, review, toast =====
let toastTimer;
function showToast(title, body, quote) {
  const toast = $("toast");
  toast.replaceChildren();
  const s = document.createElement("strong");
  s.textContent = title;
  toast.append(s, document.createTextNode(body));
  if (quote) {
    const pre = document.createElement("pre");
    pre.textContent = quote;
    toast.append(pre);
  }
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 8000);
}

function sendWhatsApp(text) {
  if (CONFIG.whatsappNumber) {
    window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  } else {
    showToast(UI[lang].demoTitle, UI[lang].demoWa, text);
  }
}

function setupLinks() {
  document.querySelectorAll(".js-wa").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      sendWhatsApp(a.dataset.wa === "promo" ? UI[lang].msgPromo : UI[lang].msgGeneral);
    });
  });
  document.querySelectorAll(".js-review").forEach((a) => {
    if (CONFIG.reviewUrl) {
      a.href = CONFIG.reviewUrl;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      return;
    }
    a.addEventListener("click", (e) => {
      e.preventDefault();
      showToast(UI[lang].demoTitle, UI[lang].demoReview);
    });
  });
}

function setupForm() {
  const form = $("book-form");
  const err = $("form-error");
  form.service.addEventListener("change", updateSummary);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const t = UI[lang];
    const name = form.name.value.trim();
    let msg = "";
    let focusEl = null;
    if (!form.service.value) { msg = t.errService; focusEl = form.service; }
    else if (!selectedDay) { msg = t.errDay; focusEl = document.querySelector("#day-chips .chip"); }
    else if (!selectedTime) { msg = t.errTime; focusEl = document.querySelector("#time-chips .chip"); }
    else if (!name) { msg = t.errName; focusEl = form.name; }
    if (msg) {
      err.textContent = msg;
      err.hidden = false;
      if (focusEl) focusEl.focus();
      return;
    }
    err.hidden = true;
    const serviceText = form.service.options[form.service.selectedIndex].textContent.trim();
    sendWhatsApp(t.msgBook(serviceText, selectedDayText(), formatTime(selectedTime), name, shadeName(shadeIndex)));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  captureSpanish();
  setupWheel();
  let saved = "es";
  try { saved = localStorage.getItem("lang") || "es"; } catch (e) { /* storage unavailable */ }
  applyLang(saved === "en" ? "en" : "es");
  $("lang-toggle").addEventListener("click", () => applyLang(lang === "es" ? "en" : "es"));
  setupLinks();
  setupForm();
});
