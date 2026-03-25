
if (typeof window.DASHBOARD_DATA === 'undefined') {
  document.body.innerHTML = `
    <div style="padding:60px;text-align:center;font-family:sans-serif;background:#f5f2eb">
      <div style="font-family:'Playfair Display',serif;font-size:50px;color:#002fa7">Gaceta Social</div>
      <h2 style="color:#0d1117;margin-top:24px">⚠️ Datos no encontrados</h2>
      <p style="margin-top:12px;color:#555">El archivo <code>data_dashboard.js</code> no fue encontrado.<br>
      Ejecuta: <code>python3 generar_dashboard_data.py &lt;archivo&gt;.xlsx</code></p>
    </div>`;
  throw new Error('DASHBOARD_DATA no definido');
}

const D   = window.DASHBOARD_DATA;
const fmt = n => (n == null ? '—' : Number(n).toLocaleString('es-MX'));
const pct = (a,b) => b ? ((a/b)*100).toFixed(1)+'%' : '—';
const norm = s => (s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();

/* ─── FECHA ─── */
const now    = new Date();
const meses  = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const fLong  = now.toLocaleDateString('es-MX',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
const fShort = `${now.getDate()} de ${meses[now.getMonth()]} de ${now.getFullYear()}`;
const wk     = Math.ceil((now - new Date(now.getFullYear(),0,1))/864e5/7);
document.getElementById('mh-fecha').textContent   = fLong.charAt(0).toUpperCase()+fLong.slice(1);
document.getElementById('mh-edition-txt').textContent = `Vol. ${now.getFullYear()} · Núm. ${wk}`;
document.getElementById('footer-dt').textContent  = `Datos al ${fShort}`;
['g-fecha-1','inst-fecha','mun-fecha','cob-fecha'].forEach(id=>{
  const el=document.getElementById(id); if(el) el.textContent=fShort;
});

/* ─── HELPERS ─── */
function instColor(name) {
  const key = Object.keys(INST_COLORS).find(k => name.toUpperCase().replace(/[^A-Z]/g,'').includes(k));
  return key ? INST_COLORS[key].acc : null;
}
/* Convierte NOMBRE EN MAYÚSCULAS a Nombre en minúsculas con primera letra en mayúscula */
function toTitle(str) {
  if (!str) return str;
  const excepciones = new Set(['de','del','y','a','en','con','para','por','la','las','el','los','al']);
  return str.toLowerCase().split(' ').map((w, i) =>
    (i === 0 || !excepciones.has(w)) ? w.charAt(0).toUpperCase() + w.slice(1) : w
  ).join(' ');
}

function barList(containerId, rows, cls, totalForPct=null) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const max = Math.max(...rows.map(r=>r.val),1);
  const colorMap = { 'bf-blue':'var(--blue)', 'bf-gold':'var(--gold)', 'bf-red':'var(--red)', 'bf-fem':'var(--fem)', 'bf-male':'var(--male)', 'bf-green':'var(--green)' };
  const defaultColor = colorMap[cls] || 'var(--blue)';
  el.innerHTML = rows.map(r => {
    const w = (r.val/max*100).toFixed(1);
    const pctStr = totalForPct ? `<span class="bar-pct">${pct(r.val,totalForPct)}</span>` : '';
    const rawName = typeof toTitle === 'function' ? toTitle(r.name) : r.name;
    const label = rawName.length>28 ? rawName.slice(0,26)+'…' : rawName;
    const color = instColor(r.name) || defaultColor;
    return `<div class="bar-row">
      <div class="bar-name" title="${r.name}">${label}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${w}%;background:${color}"></div></div>
      <span class="bar-val">${fmt(r.val)}</span>
      ${pctStr}
    </div>`;
  }).join('');
}

function kpiSS(lbl, val, sub, mod='', numMod='') {
  return `<div class="ss-cell ${mod}">
    <div class="ss-lbl">${lbl}</div>
    <div class="ss-num ${numMod} fmt">${val}</div>
    <div class="ss-sub">${sub}</div>
  </div>`;
}

function genderBar(m, h, total) {
  const mp = total ? ((m/total)*100).toFixed(1) : 50;
  const hp = total ? ((h/total)*100).toFixed(1) : 50;
  return `<div class="g-bar" style="height:8px">
    <div class="gf" style="width:${mp}%"></div>
    <div class="gm" style="width:${hp}%"></div>
  </div>
  <div class="g-labels">
    <span><span class="g-dot" style="background:var(--fem)"></span>M: ${mp}%</span>
    <span><span class="g-dot" style="background:var(--male)"></span>H: ${hp}%</span>
  </div>`;
}

function pyramid(containerId, data) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const keys = ['0-5','6-11','12-17','18-29','30-49','50-64','65+'];
  const maxV = Math.max(...data.map(r=>Math.max(r.m||0,r.h||0)),1);
  const lookup = {};
  data.forEach(r => { lookup[r.key]=r; });
  el.innerHTML = keys.map(k => {
    const r = lookup[k]||{m:0,h:0};
    const mw = ((r.m||0)/maxV*100).toFixed(0);
    const hw = ((r.h||0)/maxV*100).toFixed(0);
    return `<div class="pyr-row">
      <div class="pyr-left"><div class="pyr-seg pyr-f" style="width:${mw}%" title="M: ${fmt(r.m||0)}"></div></div>
      <div class="pyr-lbl">${k}</div>
      <div class="pyr-right"><div class="pyr-seg pyr-m" style="width:${hw}%" title="H: ${fmt(r.h||0)}"></div></div>
    </div>`;
  }).join('');
}

function buildDonut(containerId, total, slices, holeSize='inset:18px') {
  let conic = '', cum = 0;
  slices.forEach(s => {
    const p = (s.val/total*100);
    conic += `${s.color} ${cum.toFixed(2)}% ${(cum+p).toFixed(2)}%, `;
    cum += p;
  });
  conic = conic.slice(0,-2);
  const legHtml = slices.map(s => `
    <div class="leg-item">
      <div class="leg-dot" style="background:${s.color}"></div>
      <span class="leg-lbl">${s.label}</span>
      <span class="leg-val">${fmt(s.val)}</span>
      <span class="leg-pct">(${(s.val/total*100).toFixed(1)}%)</span>
    </div>`).join('');
  return `<div class="donut" style="width:130px;height:130px;background:conic-gradient(${conic})">
    <div class="donut-hole" style="${holeSize}">
      <span class="dv">${fmt(total)}</span><span class="dl">total</span>
    </div>
  </div>
  <div class="legend">${legHtml}</div>`;
}

/* ─── COUNTER ANIMATION ─── */
function animCount(el, target) {
  const dur=900, s=performance.now();
  function step(now) {
    const p=Math.min((now-s)/dur,1), e=1-Math.pow(1-p,4);
    el.textContent=fmt(Math.round(target*e));
    if(p<1)requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ════════════════════════════════════════════════
   TAB: DATOS GENERALES
════════════════════════════════════════════════ */