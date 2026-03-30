function filterApoyos() {
  const q    = norm(document.getElementById('apoyo-search').value);
  const inst = window._catInstFilter || 'TODOS';

  // Siempre partir del flat completo
  let rows = apoyosFlat.filter(r => r.type === 'apoyo');

  // Filtro texto
  if (q) {
    const matchedApoyo = new Set();
    apoyosFlat.filter(r => r.q.includes(q)).forEach(r => {
      if (r.type === 'apoyo') matchedApoyo.add(r.data.nombre);
      else if (r.parent) matchedApoyo.add(r.parent);
    });
    rows = rows.filter(r => matchedApoyo.has(r.data.nombre));
  }

  // Filtro institución
  if (inst !== 'TODOS') {
    rows = rows.filter(r => r.data.instituciones.some(i => i.nombre === inst));
  }

  renderApoyosTable(rows);
}


function renderProgsTable(data) {
  const elTotal = document.getElementById('cat-prog-total');
  if (elTotal) elTotal.textContent = data.length;

  // KPI beneficiarios únicos
  const elBenef = document.getElementById('cat-prog-benef');
  if (elBenef) {
    const instFilter = window._progInstFilter;
    const searchVal  = document.getElementById('prog-search')?.value?.trim();
    let display;
    const hasInstFilter = instFilter && instFilter !== 'TODOS';
    const hasSearch     = !!searchVal;
    if (hasInstFilter && !hasSearch) {
      // Filtro de institución puro → canónico de D.instituciones
      display = D.instituciones?.[instFilter]?.total || 0;
    } else if (!hasInstFilter && !hasSearch) {
      // Sin ningún filtro → total canónico global
      display = D.general.total_benef || 0;
    } else {
      // Búsqueda de texto (con o sin filtro de inst) → suma de los programas visibles
      display = data.reduce((s,p) => s + (p.benef_unicos||0), 0);
    }
    elBenef.textContent = display > 0 ? display.toLocaleString('es-MX') : '—';
  }

  const RLABS = {'0-5':'0–5','6-11':'6–11','12-17':'12–17','18-29':'18–29','30-49':'30–49','50-64':'50–64','65+':'65+'};

  // Chips de instituciones (construir una sola vez)
  const progChipsEl = document.getElementById('prog-inst-chips');
  if (progChipsEl && !progChipsEl._built) {
    progChipsEl._built = true;
    const insts = [...new Set(D.indicadores.map(p => p.inst))].sort();
    progChipsEl.innerHTML = ['TODOS', ...insts].map(n => {
      const act = (window._progInstFilter||'TODOS') === n;
      if (n === 'TODOS') {
        return '<button class="cat-chip' + (act?' active':'') + '" onclick="progSetInst(\'TODOS\',this)">Todos</button>';
      }
      const acc = instAcc(n);
      const hasData = D.instituciones && D.instituciones[n] && (D.instituciones[n].total||0) > 0;
      const styleNormal = hasData
        ? 'background:' + acc + '18;color:' + acc + ';border-color:' + acc + '44'
        : 'background:rgba(139,148,158,.08);color:rgba(139,148,158,.5);border-color:rgba(139,148,158,.2)';
      const styleActive = hasData
        ? 'background:' + acc + ';color:#fff;border-color:' + acc
        : 'background:rgba(139,148,158,.3);color:#8b949e;border-color:rgba(139,148,158,.4)';
      return '<button class="cat-chip" style="' + (act ? styleActive : styleNormal) + '" data-inst="' + n + '" onclick="progSetInst(\''+n+'\',this)">' + n + '</button>';
    }).join('');
  } else if (progChipsEl) {
    const active = window._progInstFilter || 'TODOS';
    progChipsEl.querySelectorAll('.cat-chip').forEach(function(c) {
      const isActive = c.dataset.inst === active || (!c.dataset.inst && active === 'TODOS');
      if (!c.dataset.inst) {
        c.classList.toggle('active', active === 'TODOS');
      } else {
        const acc = instAcc(c.dataset.inst);
        const hasData = D.instituciones && D.instituciones[c.dataset.inst] && (D.instituciones[c.dataset.inst].total||0) > 0;
        if (isActive) {
          c.style.cssText = hasData ? 'background:'+acc+';color:#fff;border-color:'+acc : 'background:rgba(139,148,158,.3);color:#8b949e;border-color:rgba(139,148,158,.4)';
        } else {
          c.style.cssText = hasData ? 'background:'+acc+'18;color:'+acc+';border-color:'+acc+'44' : 'background:rgba(139,148,158,.08);color:rgba(139,148,158,.5);border-color:rgba(139,148,158,.2)';
        }
      }
    });
  }

  if (!data.length) {
    document.getElementById('prog-tbody').innerHTML = '<div style="padding:48px;text-align:center;font-size:14px;color:#8b949e">Sin resultados.</div>';
    return;
  }

  // ── Generar cards por PROGRAMA (no por institución) ──
  const out = data.map(function(p) {
    const acc      = instAcc(p.inst);
    const instData = D.instituciones?.[p.inst] || {};
    const noData   = !instData.total;
    const cardBorder = noData
      ? 'border:1.5px solid rgba(205,217,229,.1);border-top:3px solid rgba(205,217,229,.15)'
      : 'border:1.5px solid ' + acc + '30;border-top:3px solid ' + acc;
    const cardAccColor = noData ? '#484f58' : acc;
    const cardIconStyle = noData
      ? 'background:rgba(139,148,158,.1);border:0.5px solid rgba(139,148,158,.2)'
      : 'background:' + acc + '18;border:0.5px solid ' + acc + '44';
    const cardIconStroke = noData ? 'rgba(139,148,158,.4)' : acc;

    const unicos  = p.benef_unicos  || 0;
    const mujeres = p.mujeres || 0;
    const hombres = p.hombres || 0;
    const total   = unicos || (mujeres + hombres);
    const pctM    = total > 0 ? Math.round(mujeres / total * 100) : 0;
    const pctH    = 100 - pctM;

    // Rango dominante
    const RKEYS = ['0-5','6-11','12-17','18-29','30-49','50-64','65+'];
    const rangos = p.rangos || {};
    const rangoDom = RKEYS.filter(k=>rangos[k]).sort((a,b)=>(rangos[b]||0)-(rangos[a]||0))[0];
    const rangoLabel = rangoDom ? RLABS[rangoDom] : '—';

    const nMuns = (p.municipios||[]).filter(function(m){ return m && m !== 'NO IDENTIFICADO' && m !== 'FORANEO'; }).length;
    const iconSvg = getApoyoIcon(p.nombre + ' ' + p.inst);
    const safeName = (p.nombre||'').replace(/'/g,"\'");

    return '<div style="background:#161b22;' + cardBorder + ';border-radius:10px;overflow:hidden;display:flex;flex-direction:column;height:100%">'
      // HEADER: clave + nombre + icono (altura fija)
      + '<div style="display:flex;align-items:flex-start;justify-content:space-between;padding:16px 18px 12px;gap:10px;min-height:96px">'
        + '<div style="flex:1;min-width:0">'
          + '<div style="font-size:13px;color:' + cardAccColor + ';font-weight:800;letter-spacing:.06em;margin-bottom:4px;font-family:\'DM Mono\',monospace">' + (p.clave||'') + '</div>'
          + '<div style="font-size:13px;font-weight:500;color:#e6edf3;line-height:1.35;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">' + toTitle(p.nombre) + '</div>'
          + '<div style="font-size:11px;color:#8b949e;margin-top:3px">' + (p.inst||'') + '</div>'
        + '</div>'
        + '<div style="width:40px;height:40px;border-radius:9px;' + cardIconStyle + ';display:flex;align-items:center;justify-content:center;flex-shrink:0">'
          + '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="' + cardIconStroke + '" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' + iconSvg + '</svg>'
        + '</div>'
      + '</div>'
      // BOTÓN MÁS DATOS
      + '<div style="padding:0 18px 14px">'
        + '<button onclick="progModal(\''+p.clave+'\')" style="display:flex;align-items:center;gap:5px;padding:7px 14px;background:' + cardAccColor + '15;border:0.5px solid ' + cardAccColor + '40;border-radius:16px;color:' + cardAccColor + ';font-size:12px;font-weight:600;cursor:pointer">'
          + '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
          + ' Más datos'
        + '</button>'
      + '</div>'
      // SEPARADOR
      + '<div style="height:0.5px;background:' + cardAccColor + '25;margin:0 18px"></div>'
      // KPIs: beneficiarios / municipios / rango
      + '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0;padding:14px 0 14px;margin-top:auto">'
        + '<div style="text-align:center;padding:0 8px;border-right:0.5px solid rgba(205,217,229,.08)">'
          + '<div style="font-family:\'DM Mono\',monospace;font-size:18px;font-weight:700;color:#e6edf3">' + (unicos > 0 ? unicos.toLocaleString('es-MX') : '0') + '</div>'
          + '<div style="font-size:11px;color:#8b949e;margin-top:3px;text-transform:uppercase;letter-spacing:.04em">Beneficiarios</div>'
        + '</div>'
        + '<div style="text-align:center;padding:0 8px;border-right:0.5px solid rgba(205,217,229,.08)">'
          + '<div style="font-family:\'DM Mono\',monospace;font-size:18px;font-weight:700;color:#e6edf3">' + (nMuns > 0 ? nMuns : '—') + '</div>'
          + '<div style="font-size:11px;color:#8b949e;margin-top:3px;text-transform:uppercase;letter-spacing:.04em">Municipios</div>'
        + '</div>'
        + '<div style="text-align:center;padding:0 8px">'
          + '<div style="font-size:18px;font-weight:700;color:' + cardAccColor + '">' + rangoLabel + '</div>'
          + '<div style="font-size:11px;color:#8b949e;margin-top:3px;text-transform:uppercase;letter-spacing:.04em">Rango Mayor</div>'
        + '</div>'
      + '</div>'
    + '</div>';
  }).join('');

  document.getElementById('prog-tbody').innerHTML = out;
}

function progSetInst(inst, btn) {
  window._progInstFilter = inst;
  // reset chips built flag so they re-render active state
  const el = document.getElementById('prog-inst-chips');
  if (el) el._built = false;
  filterProgs();
}
function filterProgs() {
  const q    = norm(document.getElementById('prog-search').value);
  const inst = window._progInstFilter || 'TODOS';
  let filtered = [...D.indicadores];
  if (q)              filtered = filtered.filter(p => norm(p.nombre).includes(q)||norm(p.inst).includes(q)||norm(p.clave).includes(q));
  if (inst !== 'TODOS') filtered = filtered.filter(p => p.inst === inst);
  renderProgsTable(filtered.sort((a,b) => a.nombre.localeCompare(b.nombre,'es')));
}

/* ════════════════════════════════════════════════
   TAB NAVIGATION
════════════════════════════════════════════════ */
const rendered = {};

function showTab(name, btn) {
  document.querySelectorAll('.tab-pane').forEach(el=>el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el=>el.classList.remove('active'));
  document.getElementById('tab-'+name).classList.add('active');
  btn.classList.add('active');
  // Scroll to top of content when switching tabs
  window.scrollTo({top: 0, behavior: 'smooth'});
  // Reset inline display overrides on sub-panels when switching tabs
  // so CSS .tab-pane { display:none } is not overridden
  ['mun-panel-0','mun-panel-1','apoyos-panel-0','apoyos-panel-1'].forEach(function(id){
    var el=document.getElementById(id);
    if(el) el.style.display='';
  });
  // Restore correct sub-panel state AND tab button state for the active tab
  if(name==='municipios'){
    var p0=document.getElementById('mun-panel-0');
    var p1=document.getElementById('mun-panel-1');
    if(p0) p0.style.display='';
    if(p1) p1.style.display='none';
    // Reset internal tab buttons to match: mapa=active, tabla=inactive
    var t0=document.getElementById('mun-tab-0');
    var t1=document.getElementById('mun-tab-1');
    if(t0){ t0.classList.add('active'); }
    if(t1){ t1.classList.remove('active'); }
  }
  if(name==='apoyos'){
    var a0=document.getElementById('apoyos-panel-0');
    var a1=document.getElementById('apoyos-panel-1');
    if(a0) a0.style.display='';
    if(a1) a1.style.display='none';
    // Reset internal tab buttons: catálogo apoyos=active, programas=inactive
    var at0=document.getElementById('apoyos-tab-0');
    var at1=document.getElementById('apoyos-tab-1');
    if(at0){ at0.classList.add('active'); }
    if(at1){ at1.classList.remove('active'); }
  }
  if (!rendered[name]) {
    rendered[name]=true;
    ({
      general:renderGeneral,
      instituciones:renderInstituciones,
      municipios:renderMunicipios,
      apoyos:renderApoyos,
      vulnerables:renderVulnerables,
      nutrichihuahua:renderNutri
    })[name]?.();
  }
  if (name==='municipios') {
    if (typeof window.mapaLeafletInit==='function') setTimeout(window.mapaLeafletInit,50);
  }
}

/* ─── GRUPOS VULNERABLES ─── */
function renderVulnerables() {
  const gv = D.grupos_vulnerables;
  if (!gv) return;

  const vulM = gv.mujeres?.pob_vulnerable || 0;
  const vulH = gv.hombres?.pob_vulnerable || 0;
  const ateM = D.general.total_m;  // canónico del padrón
  const ateH = D.general.total_h;  // canónico del padrón
  const vulT = vulM + vulH;
  const ateT = ateM + ateH;
  const grupos = gv.grupos || [];

  // ── KPIs globales ─────────────────────────────────────────────────────────
  const s = document.getElementById('vul-kpis');
  if (s) s.innerHTML =
    kpiSS('Pob. Vulnerable Total', fmt(vulT), 'personas identificadas en vulnerabilidad', 'cr','r') +
    kpiSS('Población Atendida',    fmt(ateT), pct(ateT, vulT)+' de la pob. vulnerable', 'cb','b') +
    kpiSS('Mujeres Vulnerables',   fmt(vulM), pct(ateM, vulM)+' atendidas', 'cf','f') +
    kpiSS('Hombres Vulnerables',   fmt(vulH), pct(ateH, vulH)+' atendidos', 'cm','m');

  // ── Tabla de todos los grupos ─────────────────────────────────────────────
  const tablaEl = document.getElementById('vul-grupos-tabla');
  if (tablaEl && grupos.length > 0) {
    const maxVul = Math.max(...grupos.map(g => g.pob_vulnerable), 1);
    tablaEl.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr auto auto auto;gap:0;font-family:var(--sans);font-size:12px;color:var(--ink2);font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:6px 12px;border-bottom:2px solid var(--border)">
        <span>Grupo</span>
        <span style="text-align:right;padding-right:16px">Pob. Vulnerable</span>
        <span style="text-align:right;padding-right:16px">Atendidos</span>
        <span style="text-align:right">Cobertura</span>
      </div>
      ${grupos.map(g => {
        const cob = g.pob_vulnerable > 0 ? (g.atendidos / g.pob_vulnerable * 100).toFixed(1) : '—';
        const barW = (g.pob_vulnerable / maxVul * 100).toFixed(1);
        const cobNum = parseFloat(cob) || 0;
        const cobColor = cobNum >= 20 ? 'var(--green)' : cobNum >= 10 ? 'var(--gold)' : 'var(--red2)';
        return `<div style="display:grid;grid-template-columns:1fr auto auto auto;gap:0;padding:10px 12px;border-bottom:0.5px solid var(--border2);align-items:center">
          <div>
            <div style="font-family:var(--sans);font-size:13px;font-weight:600;color:var(--ink);margin-bottom:4px">${g.nombre}</div>
            <div style="height:4px;background:var(--border3);border-radius:2px;max-width:200px">
              <div style="height:100%;width:${barW}%;background:#e91e8c;border-radius:2px;opacity:.6"></div>
            </div>
          </div>
          <span style="font-family:var(--head);font-size:14px;font-weight:700;color:var(--ink);text-align:right;padding-right:16px">${g.pob_vulnerable > 0 ? fmt(g.pob_vulnerable) : '—'}</span>
          <span style="font-family:var(--head);font-size:14px;font-weight:700;color:var(--gold);text-align:right;padding-right:16px">${g.atendidos > 0 ? fmt(g.atendidos) : '—'}</span>
          <span style="font-family:var(--head);font-size:13px;font-weight:700;color:${cobColor};text-align:right">${g.atendidos > 0 ? cob+'%' : '—'}</span>
        </div>`;
      }).join('')}`;
  }

  // ── Barras comparativas (solo grupos con atendidos) ───────────────────────
  const gruposConAte = grupos.filter(g => g.atendidos > 0);
  barList('bar-vulnerables',
    gruposConAte.map(g => ({ name: g.nombre, val: g.atendidos })),
    'bf-gold'
  );
}

/* ─── NUTRICHIHUAHUA ─── */
function renderNutri() {
  const nutri = D.nutrichihuahua;
  const el = document.getElementById('bar-nutri');
  if (!el) return;
  if (nutri && Object.keys(nutri).length > 0) {
    barList('bar-nutri', Object.entries(nutri).map(([k,v])=>({name:k,val:v})), 'bf-green');
  }
}

/* ─── SLIDER DATOS GENERALES ─── */
const SLIDE_CONFIG = [
  {
    label: 'Sección I · Beneficiarios y Distribución por Sexo',
    kpis: () => {
      const g = D.general, meta = D._meta, loc = D.localizables;
      const gv = D.grupos_vulnerables || {};
      return [
        kpiSS('Beneficiarios Únicos', fmt(g.total_benef), pct(g.total_benef,meta.pob_estatal)+' de pob. estatal','cb','b'),
        kpiSS('Mujeres Atendidas',    fmt(g.total_m),     pct(g.total_m,g.total_benef)+' del padrón','cf','f'),
        kpiSS('Hombres Atendidos',    fmt(g.total_h),     pct(g.total_h,g.total_benef)+' del padrón','cm','m'),
        kpiSS('Cobertura Estatal',    pct(g.total_benef,meta.pob_estatal), fmt(meta.pob_estatal)+' hab. totales','cb','b'),
        kpiSS('Pob. Vulnerable',      pct(g.total_benef,meta.pob_vulnerable), fmt(meta.pob_vulnerable)+' en vulnerabilidad','cr','r'),
        kpiSS('Mujeres Vulnerables',  pct(gv.mujeres?.atendidas||g.total_m, gv.mujeres?.pob_vulnerable||1), fmt(gv.mujeres?.pob_vulnerable||0)+' en vulnerabilidad','cf','f'),
        kpiSS('Hombres Vulnerables',  pct(gv.hombres?.atendidos||g.total_h, gv.hombres?.pob_vulnerable||1), fmt(gv.hombres?.pob_vulnerable||0)+' en vulnerabilidad','cm','m'),
        kpiSS('Localizables',         fmt(loc.total),     pct(loc.total,g.total_benef)+' del padrón','cg','g'),
      ];
    }
  },
  {
    label: 'Sección II · Apoyos y Municipios',
    kpis: () => {
      const g = D.general;
      const insts = Object.entries(D.instituciones||{});
      const topInst = insts.sort((a,b)=>b[1].total-a[1].total)[0];
      const topMun  = (D.municipios||[]).sort((a,b)=>b.total-a.total)[0];
      return [
        kpiSS('Apoyos Otorgados',   fmt(g.total_apoyos),  'registros en el padrón','cg','g'),
        kpiSS('Municipios Activos', fmt(g.mun_activos),   'de 67 municipios del estado','cb','b'),
        kpiSS('Programas Activos',  fmt(g.total_prog),    g.total_inst+' instituciones participantes','cg','g'),
        kpiSS('Instituciones',      fmt(g.total_inst),    'con programas activos 2026','cb','b'),
        kpiSS('Mayor Institución',  topInst?topInst[0]:'—', topInst?fmt(topInst[1].total)+' beneficiarios':'—','cr','r'),
        kpiSS('Municipio Top',      topMun?topMun.nombre:'—', topMun?fmt(topMun.total)+' beneficiarios':'—','cg','g'),
        kpiSS('Promedio x Mun.',    fmt(Math.round(g.total_benef/g.mun_activos)), 'beneficiarios por municipio','cb','b'),
        kpiSS('Apoyos x Benef.',    (g.total_apoyos/g.total_benef).toFixed(1), 'apoyos promedio por persona','cr','r'),
      ];
    }
  },
  {
    label: 'Sección III · Beneficiarios Localizables',
    kpis: () => {
      const g = D.general, loc = D.localizables;
      const locM = loc.m||0, locH = loc.h||0;
      const noLoc = g.total_benef - loc.total;
      return [
        kpiSS('Localizables',        fmt(loc.total),      pct(loc.total,g.total_benef)+' del padrón','cg','g'),
        kpiSS('No Localizables',     fmt(noLoc),          pct(noLoc,g.total_benef)+' sin contacto','cr','r'),
        kpiSS('Mujeres Localiz.',    fmt(locM),           pct(locM,loc.total)+' de localizables','cf','f'),
        kpiSS('Hombres Localiz.',    fmt(locH),           pct(locH,loc.total)+' de localizables','cm','m'),
        kpiSS('Cobertura Estatal',   pct(g.total_benef,D._meta.pob_estatal), fmt(D._meta.pob_estatal)+' hab.','cb','b'),
        kpiSS('Pob. Vulnerable',     pct(g.total_benef,D._meta.pob_vulnerable), fmt(D._meta.pob_vulnerable)+' en vuln.','cr','r'),
        kpiSS('Apoyos Otorgados',    fmt(g.total_apoyos), 'registros totales','cg','g'),
        kpiSS('Municipios Activos',  fmt(g.mun_activos),  'de 67 en el estado','cb','b'),
      ];
    }
  }
];

let currentSlide = 0;

function goToSlide(index) {
  if (index === currentSlide) return;
  const prevSlide = currentSlide;
  currentSlide = index;
  updateSlider(prevSlide);
}

function slideGeneral(dir) {
  const total = SLIDE_CONFIG.length;
  const prevSlide = currentSlide;
  currentSlide = (currentSlide + dir + total) % total;
  updateSlider(prevSlide);
}

function updateSlider(prevSlide) {
  const cfg = SLIDE_CONFIG[currentSlide];

  // Actualizar label
  const lbl = document.getElementById('slider-label');
  if (lbl) lbl.textContent = cfg.label + '  (' + (currentSlide+1) + ' / ' + SLIDE_CONFIG.length + ')';
  const kpiTitle = document.getElementById('kpi-slide-title');
  if (kpiTitle) kpiTitle.textContent = cfg.label;
  const kpiStrip = document.getElementById('kpi-general-all');
  if (kpiStrip) kpiStrip.innerHTML = cfg.kpis().join('');

  // Sin animación en el primer render (prevSlide undefined)
  // Actualizar tabs activos
  document.querySelectorAll('.slide-nav-tab').forEach((tab, i) => {
    tab.classList.toggle('active', i === currentSlide);
  });

  if (prevSlide === undefined) {
    document.querySelectorAll('.g-slide').forEach(el => el.style.display = 'none');
    const active = document.getElementById('gslide-' + currentSlide);
    if (active) active.style.display = '';
    return;
  }

  _slideAnimating = true;
  const outEl = document.getElementById('gslide-' + prevSlide);
  const inEl  = document.getElementById('gslide-' + currentSlide);

  if (outEl) { outEl.style.display = 'none'; }
  if (inEl)  { inEl.style.display = ''; }
  _slideAnimating = false;
}

/* ─── BOOT ─── */
// Ajustar tops sticky del cat-header y cat-chips según altura real del tab-nav
(function() {
  function updateStickyTops() {
    const nav = document.querySelector('.tab-nav');
    if (!nav) return;
    const navH = Math.round(nav.getBoundingClientRect().height);
    const style = document.getElementById('cat-sticky-style') || (function(){
      const s = document.createElement('style');
      s.id = 'cat-sticky-style';
      document.head.appendChild(s);
      return s;
    })();
    // Primero fijar el header al nav
    style.textContent = '.cat-sticky-top{top:' + navH + 'px}';
  }
  updateStickyTops();
  window.addEventListener('resize', updateStickyTops);
})();
renderGeneral();
rendered['general'] = true;
updateSlider();
