/* ============================================================
  GOOD GRACES INTAKE
  ------------------------------------------------------------
  sheetUrl   your Google Apps Script Web App URL (/exec)
  webhookUrl optional second destination (GHL, Zapier, Make)
  Both empty? The form falls back to a pre-filled email.

  Field names match the original form so the sheet keeps working.
  Internally the community path is still called "church" and the
  name/size fields are still church_name / congregation_size.
  One new optional field: "tradition".

  Modal mode (index): any [data-gg-open] opens it.
    data-gg-path="church" or "investor" skips the first question.
  Inline mode (5-spots): form has data-fixed-path="church".
  ============================================================ */
const GG_CONFIG = {
  sheetUrl: "https://script.google.com/macros/s/AKfycbwX1AQ5lQr3WhmyehdSJyrSwRuwEnBi8T67OE8NhBQjPpZJ9ugpvI6IZRqIB5OfQ021/exec",
  webhookUrl: "",
  fallbackEmail: "avelino@goodgraces.app",
  redirectUrl: "",
  debug: false,
  triggerSelector: "[data-gg-open]"
};

(function () {
  const form = document.getElementById("ggForm");
  if (!form) return;

  const $ = id => document.getElementById(id);
  const nav = $("ggNav"), back = $("ggBack"), next = $("ggNext"), chip = $("ggChip");
  const count = $("ggCount"), prog = $("ggProg"), progLabel = $("ggProgLabel");
  const doneMsg = $("ggDoneMsg"), fail = $("ggFail"), overlay = $("ggOverlay");
  const fixed = form.dataset.fixedPath || "";
  const inline = !overlay;

  const LABELS = {
    "":       ["Who you are", "Your details", "Where you are now"],
    church:   ["Who you are", "Your community", "How you stay in touch"],
    investor: ["Who you are", "Your details", "What you need"]
  };

  let step = fixed ? 2 : 1;
  let path = fixed;

  const first = () => (fixed ? 2 : 1);
  const total = () => (fixed ? 2 : 3);
  const shown = n => n - first() + 1;

  const visible = () =>
    [...form.querySelectorAll('.gg-step[data-step="' + step + '"]')]
      .filter(s => !s.dataset.path || s.dataset.path === path);

  function render() {
    form.querySelectorAll(".gg-step").forEach(s => { s.hidden = true; });
    visible().forEach(s => { s.hidden = false; });

    const done = step === "done";
    count.textContent = done ? "Sent" : "Step " + shown(step) + " of " + total();
    prog.style.setProperty("--n", total());
    [...prog.children].forEach((seg, i) => {
      seg.dataset.on = (done || i + 1 <= shown(step)) ? "1" : "0";
    });
    const labels = (LABELS[path] || LABELS[""]).slice(first() - 1);
    progLabel.textContent = done ? "All set" : labels[shown(step) - 1];

    if (chip) {
      const showChip = path && !done && !fixed;
      chip.hidden = !showChip;
      if (showChip) chip.textContent = path === "church" ? "Community" : "Investor"; chip.title = "Change this answer";
    }
    back.hidden = step === first() || done;
    next.textContent = step === 3 ? "Send request" : "Continue";
    nav.hidden = done;
  }

  /* ---------- validation ---------- */
  function setErr(key, msg) {
    const el = form.querySelector('[data-err="' + key + '"]');
    if (el) el.textContent = msg || "";
  }

  function validate() {
    let ok = true, firstBad = null;
    if (step === 1) {
      if (!path) { setErr("path", "Choose one to continue."); return false; }
      setErr("path", ""); return true;
    }
    visible().forEach(section => {
      section.querySelectorAll("[data-req]").forEach(f => {
        const key = f.id || f.name;
        let bad = "";
        if (f.type === "checkbox") { if (!f.checked) bad = "Check this box to continue."; }
        else if (!f.value.trim()) bad = "Required.";
        else if (f.hasAttribute("data-email") && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.value.trim()))
          bad = "Enter a full email address, like name@example.org.";
        f.setAttribute("aria-invalid", bad ? "true" : "false");
        setErr(key, bad);
        if (bad) { ok = false; firstBad = firstBad || f; }
      });
      section.querySelectorAll("[data-reqgroup]").forEach(g => {
        const key = g.dataset.reqgroup;
        const any = [...g.querySelectorAll("input")].some(i => i.checked);
        setErr(key, any ? "" : "Select at least one.");
        if (!any) { ok = false; firstBad = firstBad || g.querySelector("input"); }
      });
    });
    if (firstBad) firstBad.focus();
    return ok;
  }

  /* ---------- payload ---------- */
  function payload() {
    const data = { path, submitted_at: new Date().toISOString(), source_url: location.href };
    const q = new URLSearchParams(location.search);
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(k => {
      if (q.get(k)) data[k] = q.get(k);
    });
    form.querySelectorAll('.gg-step[data-path="' + path + '"]').forEach(section => {
      section.querySelectorAll("input, select, textarea").forEach(f => {
        if (!f.name || f.name === "path") return;
        if (f.type === "checkbox") {
          if (!f.checked) return;
          if (f.name === "consent") { data.consent = true; return; }
          (data[f.name] = data[f.name] || []).push(f.value);
        } else if (f.value.trim()) data[f.name] = f.value.trim();
      });
    });
    Object.keys(data).forEach(k => { if (Array.isArray(data[k])) data[k] = data[k].join(", "); });
    return data;
  }

  function mailtoHref(d) {
    const body = Object.entries(d).map(([k, v]) => k.replace(/_/g, " ") + ": " + v).join("\n");
    const subject = (d.path === "church" ? "Community interest: " : "Investor interest: ") + (d.name || "New inquiry");
    return "mailto:" + GG_CONFIG.fallbackEmail + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  }

  function showFail(d) {
    fail.hidden = false;
    fail.textContent = "Your request didn’t go through and nothing was saved. Try again, or ";
    const a = document.createElement("a");
    a.href = mailtoHref(d);
    a.textContent = "send it by email instead";
    fail.appendChild(a);
    fail.appendChild(document.createTextNode("."));
  }

  async function postReadable(url, d) {
    try {
      const r = await fetch(url, {
        method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(d), redirect: "follow"
      });
      const j = await r.json().catch(() => null);
      if (GG_CONFIG.debug) console.log("[GG] fetch:", r.status, j);
      return r.ok && (!j || j.ok !== false);
    } catch (e) {
      if (GG_CONFIG.debug) console.warn("[GG] fetch blocked:", e.message);
      return false;
    }
  }

  function postViaForm(url, d) {
    return new Promise(resolve => {
      const sink = $("ggSink");
      const f = document.createElement("form");
      f.method = "POST"; f.action = url; f.target = "gg_sink"; f.style.display = "none";
      Object.entries(d).forEach(([k, v]) => {
        const i = document.createElement("input");
        i.type = "hidden"; i.name = k; i.value = String(v); f.appendChild(i);
      });
      document.body.appendChild(f);
      let settled = false;
      const finish = ok => { if (settled) return; settled = true; f.remove(); resolve(ok); };
      sink.addEventListener("load", () => finish(true), { once: true });
      setTimeout(() => finish(true), 4000);
      try { f.submit(); } catch (e) { finish(false); }
    });
  }

  async function submit() {
    if (form.querySelector(".gg-hp").value) return;
    const d = payload();
    fail.hidden = true;
    next.disabled = true;
    next.textContent = "Sending…";
    if (GG_CONFIG.debug) console.log("[GG] payload:", d);

    let delivered = false;
    if (GG_CONFIG.sheetUrl) {
      delivered = await postReadable(GG_CONFIG.sheetUrl, d);
      if (!delivered) delivered = await postViaForm(GG_CONFIG.sheetUrl, d);
    }
    if (GG_CONFIG.webhookUrl) {
      try {
        const r = await fetch(GG_CONFIG.webhookUrl, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d)
        });
        delivered = delivered || r.ok;
      } catch (e) {}
    }
    next.disabled = false;
    if (!delivered) { next.textContent = "Send request"; showFail(d); return; }

    doneMsg.textContent = d.path === "church"
      ? "We’ll reach out at " + (d.email || "your email") + " within two business days with next steps for " + (d.church_name || "your community") + "."
      : "We’ll send materials to " + (d.email || "your email") + " within two business days and follow up to find a time.";
    step = "done";
    render();
    $("gg").scrollIntoView({ behavior: "smooth", block: "start" });
    if (GG_CONFIG.redirectUrl) setTimeout(() => { location.href = GG_CONFIG.redirectUrl; }, 2500);
  }

  /* ---------- events ---------- */
  form.querySelectorAll('input[name="path"]').forEach(r => {
    r.addEventListener("change", () => { path = r.value; setErr("path", ""); render(); });
  });

  next.addEventListener("click", () => {
    if (!validate()) return;
    if (step === 3) { submit(); return; }
    step++;
    render();
    const h = form.querySelector(".gg-step:not([hidden]) .gg-q");
    if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
    $("gg").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  back.addEventListener("click", () => { if (step > first()) { step--; fail.hidden = true; render(); } });
  if (chip) chip.addEventListener("click", () => { step = 1; render(); });
  form.addEventListener("submit", e => e.preventDefault());
  form.addEventListener("keydown", e => {
    if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") { e.preventDefault(); next.click(); }
  });

  /* ---------- modal ---------- */
  if (!inline) {
    const closeBtn = $("ggClose");
    let lastFocused = null;

    function reset() {
      form.reset();
      form.querySelectorAll('[aria-invalid="true"]').forEach(f => f.setAttribute("aria-invalid", "false"));
      form.querySelectorAll(".gg-err").forEach(el => { el.textContent = ""; });
      fail.hidden = true; step = 1; path = ""; render();
    }
    function openModal(preset) {
      lastFocused = document.activeElement;
      if (preset === "church" || preset === "investor") {
        const radio = form.querySelector('input[name="path"][value="' + preset + '"]');
        if (radio) radio.checked = true;
        path = preset;
        if (step === 1) step = 2;
      }
      render();
      overlay.hidden = false;
      document.body.style.overflow = "hidden";
      const f = form.querySelector(".gg-step:not([hidden]) input:not([type=radio]), .gg-step:not([hidden]) select, .gg-step:not([hidden]) input");
      if (f) f.focus({ preventScroll: true });
    }
    function closeModal() {
      overlay.hidden = true;
      document.body.style.overflow = "";
      if (lastFocused && lastFocused.focus) lastFocused.focus();
      reset();
    }
    document.addEventListener("click", e => {
      const t = e.target.closest && e.target.closest(GG_CONFIG.triggerSelector);
      if (!t) return;
      e.preventDefault();
      openModal(t.getAttribute("data-gg-path"));
    });
    closeBtn.addEventListener("click", closeModal);
    overlay.addEventListener("mousedown", e => { if (e.target === overlay) closeModal(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && !overlay.hidden) closeModal(); });
    overlay.addEventListener("keydown", e => {
      if (e.key !== "Tab") return;
      const f = [...overlay.querySelectorAll("button, input, select, textarea, a[href]")]
        .filter(el => !el.disabled && el.offsetParent !== null);
      if (!f.length) return;
      const a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    });
    window.GoodGracesForm = { open: openModal, close: closeModal };
  }

  render();
})();
