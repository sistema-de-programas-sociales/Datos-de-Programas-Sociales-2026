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

    return '<div style="background:#161b22;border:1px solid rgba(205,217,229,.08);border-radius:14px;overflow:hidden;display:flex;flex-direction:column;height:100%">'      + '<div style="height:4px;background:' + cardAccColor + ';flex-shrink:0"></div>'      + '<div style="padding:16px;display:flex;flex-direction:column;gap:12px;flex:1">'        + '<div style="display:flex;align-items:flex-start;gap:12px">'          + '<div style="flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:5px">'            + '<div style="width:52px;height:52px;border-radius:12px;' + cardIconStyle + ';display:flex;align-items:center;justify-content:center">'              + '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="' + cardIconStroke + '" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' + iconSvg + '</svg>'            + '</div>'            + '<div style="font-size:10px;font-weight:700;color:' + cardAccColor + ';text-align:center;max-width:60px;line-height:1.2">' + (p.inst||'') + '</div>'          + '</div>'          + '<div style="flex:1;min-width:0;min-height:72px;display:flex;flex-direction:column;justify-content:center">'            + '<div style="font-size:11px;color:' + cardAccColor + ';font-weight:800;letter-spacing:.08em;margin-bottom:3px;font-family:\'DM Mono\',monospace">' + (p.clave||'') + '</div>'            + '<div style="font-size:13px;font-weight:600;color:#e6edf3;line-height:1.3;overflow:hidden;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical">' + toTitle(p.nombre) + '</div>'          + '</div>'        + '</div>'        + '<div style="height:0.5px;background:rgba(205,217,229,.08)"></div>'        + '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0">'          + '<div style="text-align:center;padding:0 8px;border-right:0.5px solid rgba(205,217,229,.08)">'            + '<div style="font-family:\'DM Mono\',monospace;font-size:16px;font-weight:700;color:#e6edf3">' + (unicos > 0 ? unicos.toLocaleString('es-MX') : '0') + '</div>'            + '<div style="font-size:10px;color:#8b949e;margin-top:3px;text-transform:uppercase;letter-spacing:.06em">Beneficiarios</div>'          + '</div>'          + '<div style="text-align:center;padding:0 8px;border-right:0.5px solid rgba(205,217,229,.08)">'            + '<div style="font-family:\'DM Mono\',monospace;font-size:16px;font-weight:700;color:#e6edf3">' + (nMuns > 0 ? nMuns : '—') + '</div>'            + '<div style="font-size:10px;color:#8b949e;margin-top:3px;text-transform:uppercase;letter-spacing:.06em">Municipios</div>'          + '</div>'          + '<div style="text-align:center;padding:0 8px">'            + '<div style="font-size:16px;font-weight:700;color:' + cardAccColor + '">' + rangoLabel + '</div>'            + '<div style="font-size:10px;color:#8b949e;margin-top:3px;text-transform:uppercase;letter-spacing:.06em">Rango Mayor</div>'          + '</div>'        + '</div>'        + '<div style="height:0.5px;background:rgba(205,217,229,.08)"></div>'        + '<button onclick="progModal(\''+p.clave+'\')" style="width:100%;display:flex;align-items:center;justify-content:center;gap:6px;padding:8px;background:' + cardAccColor + '12;border:0.5px solid ' + cardAccColor + '35;border-radius:8px;color:' + cardAccColor + ';font-size:12px;font-weight:600;cursor:pointer">'          + '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'          + ' Más datos'        + '</button>'      + '</div>'    + '</div>';
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
  const POB_VUL = D._meta?.pob_vulnerable || 1792324;
  const ateT    = D.general.total_benef;
  const grupos  = gv.grupos || [];
  const gruposConCob = grupos.filter(g =>
    g.pob_vulnerable > 0 && g.atendidos > 0 &&
    !g.nombre.toLowerCase().includes('muj') &&
    !g.nombre.toLowerCase().includes('hom'));
  const grupoMax = gruposConCob.length ? gruposConCob.reduce((a,b) => b.atendidos/b.pob_vulnerable > a.atendidos/a.pob_vulnerable ? b : a) : null;
  const grupoMin = gruposConCob.length ? gruposConCob.reduce((a,b) => b.atendidos/b.pob_vulnerable < a.atendidos/a.pob_vulnerable ? b : a) : null;
  const s = document.getElementById('vul-kpis');
  if (s) s.innerHTML =
    kpiSS('Pob. Vulnerable', fmt(POB_VUL), 'personas en situación vulnerable', 'cr','r') +
    kpiSS('Población Atendida', fmt(ateT), pct(ateT, POB_VUL)+' de cobertura', 'cb','b') +
    (grupoMax ? kpiSS('Mayor Cobertura · '+grupoMax.nombre, pct(grupoMax.atendidos, grupoMax.pob_vulnerable), fmt(grupoMax.atendidos)+' atendidos', 'cgr','gr') : '') +
    (grupoMin ? kpiSS('Menor Cobertura · '+grupoMin.nombre, pct(grupoMin.atendidos, grupoMin.pob_vulnerable), fmt(grupoMin.atendidos)+' atendidos', 'cm','m') : '');
  const badge = document.getElementById('vul-badge-count');
  if (badge) badge.textContent = grupos.length + ' grupos';
  function cobColor(p) {
    if (p === null || p === undefined) return '#2a2f3a';
    if (p >= 20) return '#56d364';
    if (p >= 8)  return '#ffa657';
    if (p > 0)   return '#f85149';
    return '#2a2f3a';
  }

  const cobGeneral = (ateT / POB_VUL * 100);
  const cobColor2 = cobGeneral >= 20 ? '#56d364' : cobGeneral >= 8 ? '#ffa657' : '#f85149';

  const DATA_2025 = {
    'Mujeres': 621392, 'Hombres': 461573,
    'Niños y adolescentes (0-17)': 341473, 'Jovenes (18-29)': 170036,
    'Adultos (30-64)': 367465, 'Personas mayores (65+)': 110977,
    'Personas con pobreza multidimensional': 569065,
    'Personas en pobreza (sin contar alimentacion)': 152682,
    'Personas con carencia alimentaria': 416383,
    'Personas indígenas': 134134, 'Personas con discapacidad': 18876,
    'Personas en situacion de vulnerabilidad y violencia familiar': 2253,
  };
  const GV_IMGS = {
    'mujeres':          'imagenes/mujeres_gv.jpg',
    'hombres':          'imagenes/hombres_gv.avif',
    'ni':               'imagenes/017_gv.jpg',
    'jovenes':          'imagenes/1829_gv.jpg',
    'adultos':          'imagenes/3064_gv.avif',
    'mayores':          'imagenes/65_gv.jpg',
    'multidimensional': 'imagenes/personaspobrezam_gv.webp',
    'sin contar':       'imagenes/pobrezaalim_gv.webp',
    'alimentaria':      'imagenes/carenciaalim_gv.webp',
    'indígenas':        'imagenes/indigenas_gv.jpg',
    'discapacidad':     'imagenes/discapacidad_gv.jpeg',
    'violencia':        'imagenes/famvuln_gv.jpg',
  };
  function getImg(nombre) {
    const n = nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    for (const [k,v] of Object.entries(GV_IMGS)) {
      if (n.includes(k.normalize('NFD').replace(/[\u0300-\u036f]/g,''))) return v;
    }
    return null;
  }
  const container = document.getElementById('vul-main-container');
  if (!container) return;

  let html = '';
  html += '<style>.gv-card{background:#161b22;border:1px solid rgba(205,217,229,.08);border-radius:14px;padding:18px 16px;cursor:pointer;transition:transform .18s ease,border-color .18s ease;position:relative;overflow:hidden;display:flex;flex-direction:column;gap:10px;}';
  html += '.gv-card:hover{transform:translateY(-3px);border-color:rgba(205,217,229,.18);background:#1c2330;}';
  html += '.gv-card.active{border-color:rgba(205,217,229,.3)!important;}';
  html += '.gv-card.no-data{opacity:.55;cursor:default;}.gv-card.no-data:hover{transform:none;background:#161b22;}';
  html += '@keyframes gv-fadein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}.gv-card{animation:gv-fadein .35s ease both;}</style>';
  html += '<div style="display:grid;grid-template-columns:1fr 300px;gap:20px;align-items:start">';
  html += '<div>';
  html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;padding:0 2px">';
  html += '<div style="display:flex;align-items:center;gap:10px">';
  html += '<span style="font-size:17px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#8b949e">GRUPOS VULNERABLES · CHIHUAHUA 2026</span>';
  html += '<span id="vul-badge-count2" style="font-size:15px;color:#f778ba;background:rgba(247,120,186,.08);padding:2px 9px;border-radius:20px;border:0.5px solid rgba(247,120,186,.2)">'+grupos.length+' grupos</span>';
  html += '</div>';
  html += '<div style="display:flex;gap:10px;font-size:14px">';
  html += '<span style="display:flex;align-items:center;gap:4px;color:#56d364"><span style="width:6px;height:6px;background:#56d364;border-radius:50%;display:inline-block"></span>≥ 20%</span>';
  html += '<span style="display:flex;align-items:center;gap:4px;color:#ffa657"><span style="width:6px;height:6px;background:#ffa657;border-radius:50%;display:inline-block"></span>8–19%</span>';
  html += '<span style="display:flex;align-items:center;gap:4px;color:#f85149"><span style="width:6px;height:6px;background:#f85149;border-radius:50%;display:inline-block"></span>&lt; 8%</span>';
  html += '<span style="display:flex;align-items:center;gap:4px;color:#484f58"><span style="width:6px;height:6px;background:#484f58;border-radius:50%;display:inline-block"></span>Sin datos</span>';
  html += '</div></div>';
  html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">';

  grupos.forEach(function(g, i) {
    const cobNum = g.pob_vulnerable > 0 && g.atendidos > 0 ? (g.atendidos / g.pob_vulnerable * 100) : null;
    const hasDatos = cobNum !== null;
    const cc = cobNum === null ? '#2a2f3a' : cobNum >= 20 ? '#56d364' : cobNum >= 8 ? '#ffa657' : '#f85149';
    const ringR = 36, circ = 2 * Math.PI * ringR;
    const dash = hasDatos ? (Math.min(cobNum/100,1)*circ).toFixed(1) : '0';
    const pobRel = g.atendidos > 0 ? (g.atendidos / POB_VUL * 100).toFixed(1) : 0;
    const delay = (i * 0.05).toFixed(2);
    const imgSrc = getImg(g.nombre);
    const at2025 = DATA_2025[g.nombre] || 0;
    const diff25 = hasDatos && at2025 > 0 ? g.atendidos - at2025 : null;
    const diffPct25 = diff25 !== null ? (diff25 / at2025 * 100) : null;
    const isUp25 = diff25 !== null && diff25 >= 0;
    const dCol25 = diff25 === null ? '#484f58' : isUp25 ? '#56d364' : '#f85149';
    const maxB = Math.max(g.atendidos || 0, at2025) || 1;
    const w26b = g.atendidos > 0 ? Math.round(g.atendidos / maxB * 100) : 0;
    const w25b = at2025 > 0 ? Math.round(at2025 / maxB * 100) : 0;

    html += '<div class="gv-card'+(hasDatos?'':' no-data')+'" id="gv-card-'+i+'" style="animation-delay:'+delay+'s" '+(hasDatos?'onclick="gvSelectCard('+i+')"':'')+' >';
    html += '<div style="display:flex;align-items:center;gap:12px">';
    html += '<div style="position:relative;flex-shrink:0;width:88px;height:88px">';
    html += '<div style="position:absolute;inset:7px;border-radius:50%;overflow:hidden;background:#161b22">';
    if (imgSrc) html += '<img src="'+imgSrc+'" style="width:100%;height:100%;object-fit:cover;opacity:'+(hasDatos?'1':'0.35')+'" onerror="this.style.display=\'none\'"/>';
    html += '</div>';
    html += '<svg width="88" height="88" viewBox="0 0 88 88" style="position:absolute;inset:0">';
    html += '<circle cx="44" cy="44" r="'+ringR+'" fill="none" stroke="rgba(205,217,229,.08)" stroke-width="7"/>';
    html += '<circle cx="44" cy="44" r="'+ringR+'" fill="none" stroke="'+cc+'" stroke-width="7" stroke-linecap="round" stroke-dasharray="'+dash+' '+circ.toFixed(1)+'" transform="rotate(-90 44 44)" '+(hasDatos?'':'opacity=".25"')+'/>';
    html += '</svg>';
    if (hasDatos) html += '<div style="position:absolute;bottom:-4px;right:-4px;background:#0d1117;border:1px solid '+cc+'55;border-radius:7px;padding:2px 6px;font-size:15px;font-weight:800;color:'+cc+';font-family:DM Mono,monospace;line-height:1.3;">'+cobNum.toFixed(1)+'%</div>';
    html += '</div>';
    html += '<div style="flex:1;min-width:0">';
    html += '<div style="font-size:17px;font-weight:600;color:'+(hasDatos?'#e6edf3':'#6e7f8d')+';line-height:1.3;margin-bottom:4px">'+g.nombre+'</div>';
    html += '<div style="font-size:15px;color:#484f58;margin-bottom:4px">Pob. vulnerable</div>';
    html += '<div style="font-size:17px;font-weight:700;color:#8b949e;font-family:DM Mono,monospace">'+(g.pob_vulnerable > 0 ? fmt(g.pob_vulnerable) : '—')+'</div>';
    html += '</div></div>';
    html += '<div><div style="display:flex;justify-content:space-between;margin-bottom:3px">';
    html += '<span style="font-size:14px;color:#6e7f8d">% atendidos / pob. vulnerable</span>';
    html += '<span style="font-size:14px;color:#cdd9e5;font-weight:600">'+pobRel+'%</span></div>';
    html += '<div style="height:3px;background:rgba(205,217,229,.06);border-radius:2px;overflow:hidden">';
    html += '<div style="height:100%;width:'+pobRel+'%;background:rgba(205,217,229,.2);border-radius:2px"></div></div></div>';
    if (hasDatos) {
      html += '<div style="padding-top:8px;border-top:1px solid rgba(205,217,229,.05)">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">';
      html += '<span style="font-size:13px;font-weight:700;letter-spacing:.06em;color:#8b949e;text-transform:uppercase">2026 vs 2025</span>';
      if (diff25 !== null) html += '<span style="font-size:13px;font-weight:800;color:'+dCol25+';background:'+dCol25+'18;padding:1px 7px;border-radius:4px">'+(isUp25?'▲':'▼')+' '+Math.abs(diffPct25).toFixed(1)+'%</span>';
      html += '</div>';
      html += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">';
      html += '<span style="font-size:12px;font-weight:700;color:#ffa657;min-width:28px">2026</span>';
      html += '<div style="flex:1;height:7px;background:rgba(205,217,229,.06);border-radius:4px;overflow:hidden">';
      html += '<div style="height:100%;width:'+w26b+'%;background:#ffa657;border-radius:4px"></div></div>';
      html += '<span style="font-size:13px;font-weight:700;color:#ffa657;font-family:DM Mono,monospace;min-width:52px;text-align:right">'+fmt(g.atendidos)+'</span></div>';
      if (at2025 > 0) {
        html += '<div style="display:flex;align-items:center;gap:6px">';
        html += '<span style="font-size:12px;font-weight:700;color:#6e7f8d;min-width:28px">2025</span>';
        html += '<div style="flex:1;height:7px;background:rgba(205,217,229,.06);border-radius:4px;overflow:hidden">';
        html += '<div style="height:100%;width:'+w25b+'%;background:#6e7f8d;border-radius:4px;opacity:.6"></div></div>';
        html += '<span style="font-size:13px;font-weight:700;color:#6e7f8d;font-family:DM Mono,monospace;min-width:52px;text-align:right">'+fmt(at2025)+'</span></div>';
      }
      html += '</div>';
    } else {
      html += '<div style="padding-top:6px;border-top:1px solid rgba(205,217,229,.04);font-size:16px;color:#484f58;text-align:center">Sin datos de cobertura</div>';
    }
    html += '</div>';
  });

  html += '</div></div>';

  // Panel lateral
  const arcP2 = Math.min(cobGeneral/100,1);
  const arcR2=80, arcCx2=100, arcCy2=100;
  const arcEx2 = arcCx2 + arcR2*Math.cos(Math.PI+arcP2*Math.PI);
  const arcEy2 = arcCy2 + arcR2*Math.sin(Math.PI+arcP2*Math.PI);
  const arcLg2 = arcP2>0.5?1:0;
  const at2025g=1083185, maxGb=Math.max(ateT,at2025g);
  const w26g=Math.round(ateT/maxGb*100);
  const diffG=ateT-at2025g, diffPctG=(diffG/at2025g*100);
  const colG=diffG>=0?'#56d364':'#f85149', signG=diffG>=0?'▲':'▼';

  html += '<div style="display:flex;flex-direction:column;gap:12px">';
  html += '<div style="background:#161b22;border:1px solid rgba(205,217,229,.08);border-radius:14px;overflow:hidden">';
  html += '<div style="padding:11px 16px;border-bottom:1px solid rgba(205,217,229,.06);display:flex;align-items:center;gap:8px">';
  html += '<div style="width:3px;height:13px;background:'+cobColor2+';border-radius:2px"></div>';
  html += '<span style="font-size:13px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#484f58">COBERTURA · 2026</span></div>';
  html += '<div style="padding:16px 16px 0;display:flex;justify-content:center">';
  html += '<div style="position:relative;width:100%;max-width:220px">';
  html += '<svg viewBox="0 0 200 110" style="width:100%;display:block">';
  html += '<path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(205,217,229,.07)" stroke-width="18" stroke-linecap="round"/>';
  html += '<path d="M 20 100 A 80 80 0 '+arcLg2+' 1 '+arcEx2.toFixed(1)+' '+arcEy2.toFixed(1)+'" fill="none" stroke="'+cobColor2+'" stroke-width="18" stroke-linecap="round"/>';
  html += '</svg>';
  html += '<div style="position:absolute;bottom:14px;left:0;right:0;text-align:center">';
  html += '<div style="font-size:31px;font-weight:900;color:'+cobColor2+';font-family:DM Mono,monospace;line-height:1">'+cobGeneral.toFixed(1)+'<span style="font-size:17px">%</span></div>';
  html += '<div style="font-size:12px;color:#6e7f8d;margin-top:3px">de pob. vulnerable</div>';
  html += '</div></div></div>';
  html += '<div style="padding:12px 16px 16px;border-top:1px solid rgba(205,217,229,.06)">';
  html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">';
  html += '<span style="font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#484f58">Beneficiarios únicos · 2026 vs 2025</span>';
  html += '<span style="font-size:13px;font-weight:800;color:'+colG+';background:'+colG+'18;padding:2px 8px;border-radius:5px">'+signG+' '+Math.abs(diffPctG).toFixed(1)+'%</span></div>';
  html += '<div style="display:flex;flex-direction:column;gap:6px">';
  html += '<div style="display:flex;align-items:center;gap:8px">';
  html += '<span style="font-size:12px;font-weight:700;color:'+colG+';min-width:28px">2026</span>';
  html += '<div style="flex:1;height:10px;background:rgba(205,217,229,.06);border-radius:5px;overflow:hidden">';
  html += '<div style="height:100%;width:'+w26g+'%;background:'+colG+';border-radius:5px"></div></div>';
  html += '<span style="font-size:13px;font-weight:700;color:'+colG+';font-family:DM Mono,monospace;min-width:60px;text-align:right">'+fmt(ateT)+'</span></div>';
  html += '<div style="display:flex;align-items:center;gap:8px">';
  html += '<span style="font-size:12px;font-weight:700;color:#6e7f8d;min-width:28px">2025</span>';
  html += '<div style="flex:1;height:10px;background:rgba(205,217,229,.06);border-radius:5px;overflow:hidden">';
  html += '<div style="height:100%;width:100%;background:#6e7f8d;border-radius:5px;opacity:.5"></div></div>';
  html += '<span style="font-size:13px;font-weight:700;color:#6e7f8d;font-family:DM Mono,monospace;min-width:60px;text-align:right">1,083,185</span></div>';
  html += '</div></div></div>';

  html += '<div id="gv-detail-panel" style="background:#161b22;border:1px solid rgba(205,217,229,.08);border-radius:14px;overflow:hidden">';
  html += '<div style="padding:11px 16px;background:#161b22;border-bottom:1px solid rgba(205,217,229,.06);display:flex;align-items:center;gap:8px">';
  html += '<div style="width:3px;height:13px;background:#484f58;border-radius:2px"></div>';
  html += '<span style="font-size:13px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#484f58">ANÁLISIS DE GRUPO</span></div>';
  html += '<div style="padding:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:200px;gap:10px;color:#484f58">';
  html += '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".3"><path d="M15 15l5 5M10 17A7 7 0 1 0 10 3a7 7 0 0 0 0 14z"/></svg>';
  html += '<span style="font-size:15px;text-align:center;line-height:1.5;max-width:180px">Haz clic en una tarjeta para ver su análisis</span></div></div>';
  html += '</div></div>';

  container.innerHTML = html;

  window._gvGrupos = grupos;
  window._gvAteT   = ateT;
  window._gvPobVul = POB_VUL;
  window.gvSelectCard = function(i) {
    const g = window._gvGrupos[i];
    if (!g || !g.atendidos) return;
    document.querySelectorAll('.gv-card').forEach(c => { c.classList.remove('active'); });
    const card = document.getElementById('gv-card-'+i);
    if (card) card.classList.add('active');
    const cobNum2 = (g.atendidos / g.pob_vulnerable * 100);
    const cc2 = cobColor(cobNum2);
    const noAtend = g.pob_vulnerable - g.atendidos;
    const cobGenPct = (window._gvAteT / window._gvPobVul * 100);
    const diff2 = cobNum2 - cobGenPct;
    const diffStr2 = diff2 >= 0
      ? '<span style="color:#56d364">+'+diff2.toFixed(1)+'pp</span>'
      : '<span style="color:#f85149">'+diff2.toFixed(1)+'pp</span>';
    const ranked = window._gvGrupos
      .filter(x => x.atendidos > 0 && x.pob_vulnerable > 0)
      .sort((a,b) => (b.atendidos/b.pob_vulnerable)-(a.atendidos/a.pob_vulnerable));
    const rank = ranked.findIndex(x => x.nombre === g.nombre) + 1;
    const imgSrc3 = getImg(g.nombre);
    const panel = document.getElementById('gv-detail-panel');
    if (!panel) return;
    let ph = '';
    ph += '<div style="position:relative;height:90px;overflow:hidden;border-bottom:1px solid rgba(205,217,229,.06)">';
    if (imgSrc3) ph += '<img src="'+imgSrc3+'" style="width:100%;height:100%;object-fit:cover;opacity:.18;filter:saturate(.7)" onerror="this.style.display=\'none\'"/>';
    ph += '<div style="position:absolute;inset:0;background:linear-gradient(to right,#161b22 0%,transparent 100%)"></div>';
    ph += '<div style="position:absolute;inset:0;padding:12px 16px;display:flex;align-items:center;gap:10px">';
    ph += '<div style="width:3px;height:100%;background:'+cc2+';border-radius:2px;flex-shrink:0"></div>';
    ph += '<div><div style="font-size:13px;color:#484f58;text-transform:uppercase;letter-spacing:.12em;margin-bottom:3px">ANÁLISIS DE GRUPO</div>';
    ph += '<div style="font-size:16px;font-weight:700;color:#e6edf3;line-height:1.3">'+g.nombre+'</div></div>';
    ph += '<div style="margin-left:auto;background:'+cc2+'20;border:1px solid '+cc2+'40;border-radius:8px;padding:4px 10px;text-align:center;flex-shrink:0">';
    ph += '<div style="font-size:20px;font-weight:800;color:'+cc2+';font-family:DM Mono,monospace;line-height:1">'+cobNum2.toFixed(1)+'%</div>';
    ph += '<div style="font-size:12px;color:#6e7f8d;margin-top:1px">#'+rank+' ranking</div></div></div></div>';
    ph += '<div style="padding:14px 16px;display:flex;flex-direction:column;gap:10px">';
    ph += '<div style="background:#161b22;border-radius:10px;padding:10px 12px;display:flex;justify-content:space-between;align-items:center">';
    ph += '<div><div style="font-size:13px;color:#484f58;text-transform:uppercase;letter-spacing:.08em;margin-bottom:3px">vs. promedio general</div>';
    ph += '<div style="font-size:16px;font-weight:700">'+diffStr2+' '+(Math.abs(diff2)<1?'· similar':diff2>0?'· por encima':'· por debajo')+'</div></div>';
    ph += '<div style="text-align:right"><div style="font-size:13px;color:#484f58;margin-bottom:2px">General</div>';
    ph += '<div style="font-size:15px;color:#6e7f8d;font-family:DM Mono,monospace">'+cobGenPct.toFixed(1)+'%</div></div></div>';
    ph += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">';
    ph += '<div style="background:#161b22;border-radius:8px;padding:9px 11px"><div style="color:#484f58;font-size:12px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:3px">Atendidos</div><div style="color:#ffa657;font-weight:700;font-family:DM Mono,monospace;font-size:16px">'+fmt(g.atendidos)+'</div></div>';
    ph += '<div style="background:#161b22;border-radius:8px;padding:9px 11px"><div style="color:#484f58;font-size:12px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:3px">Sin atender</div><div style="color:#f85149;font-weight:700;font-family:DM Mono,monospace;font-size:16px">'+fmt(noAtend)+'</div></div>';
    ph += '<div style="background:#161b22;border-radius:8px;padding:9px 11px"><div style="color:#484f58;font-size:12px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:3px">Pob. vulnerable</div><div style="color:#8b949e;font-weight:700;font-family:DM Mono,monospace;font-size:16px">'+fmt(g.pob_vulnerable)+'</div></div>';
    ph += '<div style="background:#161b22;border-radius:8px;padding:9px 11px"><div style="color:#484f58;font-size:12px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:3px">Cobertura</div><div style="color:'+cc2+';font-weight:700;font-family:DM Mono,monospace;font-size:16px">'+cobNum2.toFixed(1)+'%</div></div>';
    ph += '</div></div>';
    panel.innerHTML = ph;
  };
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
