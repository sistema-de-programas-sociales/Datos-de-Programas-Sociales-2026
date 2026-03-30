function renderMunicipios() {
  const muns = D.municipios;
  const g    = D.general;

  /* ── KPI strip x7 ── */
  const topMun    = muns[0];
  const munMenor  = muns[muns.length-1];
  const avgMun    = Math.round(g.total_benef / muns.length);
  const topLocKpi = [...muns].sort((a,b)=>(b.localizables/b.total||0)-(a.localizables/a.total||0))[0];
  const botLocKpi = [...muns].filter(m=>m.total>100).sort((a,b)=>(a.localizables/a.total||1)-(b.localizables/b.total||1))[0];
  const topCobKpi = [...muns].filter(m=>m.poblacion>0).sort((a,b)=>(b.total/b.poblacion)-(a.total/a.poblacion))[0];
  const botCobKpi = [...muns].filter(m=>m.poblacion>0).sort((a,b)=>(a.total/a.poblacion)-(b.total/b.poblacion))[0];
  const avgApoyos = Math.round(g.total_apoyos / muns.length);
  document.getElementById('kpi-mun').innerHTML =
    kpiSS('Beneficiarios Únicos',      fmt(g.total_benef),        'total padrón estatal','cb','b') +
    kpiSS('Beneficiarios Localizables',fmt(D.localizables.total),  pct(D.localizables.total,g.total_benef)+' del padrón','cgr','gr') +
    kpiSS('Municipio Líder',           toTitle(topMun.nombre),     fmt(topMun.total)+' beneficiarios','ck','') +
    kpiSS('Municipio Menor',           toTitle(munMenor.nombre),   fmt(munMenor.total)+' beneficiarios','cr','r') +
    kpiSS('Mayor Cobertura',           toTitle(topCobKpi?.nombre||'—'), topCobKpi ? (topCobKpi.total/topCobKpi.poblacion*100).toFixed(1)+'% de su pob.' : '—','cb','b') +
    kpiSS('Menor Cobertura',           toTitle(botCobKpi?.nombre||'—'), botCobKpi ? (botCobKpi.total/botCobKpi.poblacion*100).toFixed(1)+'% de su pob.' : '—','cr','r') +
    kpiSS('Prom. Benef./Municipio',    fmt(avgMun),               'beneficiarios únicos','cg','g') +
    kpiSS('Prom. Apoyos/Municipio',    fmt(avgApoyos),            'apoyos por municipio','cg','g');

  /* ── KPI localización ── */
  
  renderMunTable(muns);
  showMunPanel(0); // asegurar pestaña activa al renderizar
}

function renderMunTable(data) {
  const maxT  = D.municipios[0]?.total || 1;
  const RL    = {'0-5':'0–5','6-11':'6–11','12-17':'12–17','18-29':'18–29','30-49':'30–49','50-64':'50–64','65+':'65+'};
  const _TD   = 'padding:10px 8px;border-bottom:1px solid rgba(205,217,229,.06);font-family:"DM Sans",system-ui,sans-serif;font-size:15px;';
  const td    = (content, extra='') => `<td style="${_TD}text-align:center;${extra}">${content}</td>`;
  const tdL   = (content, extra='') => `<td style="${_TD}text-align:left;${extra}">${content}</td>`;
  const tdC   = (content, extra='') => `<td style="${_TD}text-align:center;${extra}">${content}</td>`;

  document.getElementById('mun-tbody').innerHTML = data.map((m,i) => {
    const mp     = m.total ? (m.m/m.total*100).toFixed(1) : 50;
    const hp     = (100-parseFloat(mp)).toFixed(1);
    const locPct = m.total ? (m.localizables/m.total*100).toFixed(1) : '0';
    const cobPct = m.poblacion ? (m.total/m.poblacion*100).toFixed(1) : null;
    const locC   = parseFloat(locPct)>=80?'#3fb950':parseFloat(locPct)>=50?'#e3b341':'#ff7b72';
    const locBg  = parseFloat(locPct)>=80?'rgba(63,185,80,.15)':parseFloat(locPct)>=50?'rgba(227,179,65,.15)':'rgba(255,123,114,.15)';
    const barW   = Math.round((m.total/maxT)*100);

    const benBar = `<div style="display:flex;align-items:center;justify-content:center;gap:7px">
      <div style="width:44px;height:4px;background:rgba(205,217,229,.1);border-radius:2px;overflow:hidden;flex-shrink:0">
        <div style="height:100%;width:${barW}%;background:#388bfd;border-radius:2px"></div>
      </div>
      <span style="font-family:'DM Mono',monospace;font-size:15px;font-weight:500;color:#e6edf3;letter-spacing:-.01em">${fmt(m.total)}</span>
    </div>`;

    const mhCell = `<div style="min-width:100px">
      <div style="height:5px;border-radius:3px;overflow:hidden;display:flex;margin-bottom:4px">
        <div style="width:${mp}%;background:#BE185D;opacity:.75"></div>
        <div style="width:${hp}%;background:#1D4ED8;opacity:.55"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:15px;font-family:'DM Sans',system-ui,sans-serif">
        <span style="color:#BE185D;font-weight:600">${mp}%</span>
        <span style="color:#1D4ED8;font-weight:600">${hp}%</span>
      </div>
    </div>`;

    const locBar = `<div style="display:flex;align-items:center;justify-content:center;gap:6px">
      <div style="width:36px;height:4px;background:rgba(205,217,229,.1);border-radius:2px;overflow:hidden;flex-shrink:0">
        <div style="height:100%;width:${locPct}%;background:${locC};border-radius:2px"></div>
      </div>
      <span style="font-family:'DM Mono',monospace;font-size:15px;font-weight:500;color:${locC}">${locPct}%</span>
    </div>`;

    const cobStr = cobPct
      ? `<span style="font-family:'DM Mono',monospace;font-size:15px;font-weight:600;background:rgba(148,163,184,.08);color:#94a3b8;padding:3px 9px;border-radius:20px;border:0.5px solid rgba(148,163,184,.2)">${cobPct}%</span>`
      : '<span style="opacity:.3">—</span>';

    const rowClass = i%2===0 ? 'mun-row-even' : 'mun-row-odd';
    return `<tr class="${rowClass} mun-row">
      ${tdC(`<span style="font-family:'DM Mono',monospace;font-size:15px;font-weight:600;background:rgba(205,217,229,.06);color:#484f58;padding:2px 7px;border-radius:20px;border:0.5px solid rgba(205,217,229,.08)">${i+1}</span>`)}\
      ${tdL(`<span style="font-weight:600;font-size:15px;color:#e6edf3;font-family:'DM Sans',system-ui,sans-serif">${toTitle(m.nombre)}</span>`)}\
      ${td(benBar)}\
      ${tdC(mhCell,'min-width:110px')}\
      ${td(`<span style="font-family:'DM Mono',monospace;font-size:15px;font-weight:600;background:rgba(210,168,255,.1);color:#d2a8ff;padding:3px 9px;border-radius:20px;border:0.5px solid rgba(210,168,255,.2)">${fmt(m.total_apoyos)}</span>`)}\
      ${tdC(`<span style="font-family:'DM Mono',monospace;font-size:15px;font-weight:700;background:rgba(210,168,255,.1);color:#d2a8ff;padding:3px 9px;border-radius:20px;border:0.5px solid rgba(210,168,255,.2)">${m.n_programas}</span>`)}\
      ${td(`<span style="font-family:'DM Mono',monospace;font-size:15px;font-weight:600;background:${locBg};color:${locC};padding:3px 9px;border-radius:20px;border:0.5px solid ${locC}33">${fmt(m.localizables)}</span>`)}\
      ${tdC(locBar)}\
      ${td(cobStr)}\
      ${tdC(m.rango_dom ? `<span style="font-family:'DM Sans',system-ui,sans-serif;font-size:15px;font-weight:700;letter-spacing:.04em;background:rgba(56,139,253,.15);color:#79c0ff;padding:3px 8px;border-radius:20px;border:0.5px solid rgba(56,139,253,.25)">${RL[m.rango_dom]||m.rango_dom}</span>` : '<span style="opacity:.3">—</span>')}\
      ${tdC(m.rango_min ? `<span style="font-family:'DM Sans',system-ui,sans-serif;font-size:15px;font-weight:600;background:rgba(255,166,87,.12);color:#ffa657;padding:3px 8px;border-radius:20px;border:0.5px solid rgba(255,166,87,.25)">${RL[m.rango_min]||m.rango_min}</span>` : '<span style="opacity:.3;color:#484f58">—</span>')}\
    </tr>`;
  }).join('');

  /* fila totales */
  const isFullSet = data.length === D.municipios.length;
  const totT   = isFullSet ? D.general.total_benef  : data.reduce((s,m)=>s+m.total,0);
  const totM   = data.reduce((s,m)=>s+m.m,0);
  const totH   = data.reduce((s,m)=>s+m.h,0);
  const totAp  = isFullSet ? D.general.total_apoyos : data.reduce((s,m)=>s+m.total_apoyos,0);
  const totLoc = isFullSet ? D.localizables.total   : data.reduce((s,m)=>s+m.localizables,0);
  const totLocPct = totT ? (totLoc/totT*100).toFixed(1) : 0;
  // Totales adicionales
  const totPct_m   = totT ? (totM/totT*100).toFixed(1) : 0;
  const totPct_h   = totT ? (totH/totT*100).toFixed(1) : 0;
  const totProgs   = data.reduce((s,m)=>s+(m.n_programas||0),0);
  const avgProgs   = data.length ? Math.round(totProgs/data.length) : 0;
  const totCobSum  = data.filter(m=>m.poblacion>0).reduce((s,m)=>s+m.total/m.poblacion*100,0);
  const avgCob     = data.filter(m=>m.poblacion>0).length ? (totCobSum/data.filter(m=>m.poblacion>0).length).toFixed(1) : null;
  const locC_tot   = parseFloat(totLocPct)>=80?'#3fb950':parseFloat(totLocPct)>=50?'#e3b341':'#ff7b72';
  const locBg_tot  = parseFloat(totLocPct)>=80?'rgba(63,185,80,.15)':parseFloat(totLocPct)>=50?'rgba(227,179,65,.15)':'rgba(255,123,114,.15)';

  // Celda Beneficiarios — barra + número
  const totBenBar = `<div style="display:flex;align-items:center;justify-content:center;gap:7px">
    <div style="width:44px;height:4px;background:rgba(205,217,229,.1);border-radius:2px;overflow:hidden;flex-shrink:0">
      <div style="height:100%;width:100%;background:#388bfd;border-radius:2px"></div>
    </div>
    <span style="font-family:'DM Mono',monospace;font-size:15px;font-weight:600;color:#e6edf3">${fmt(totT)}</span>
  </div>`;

  // Celda M/H
  const totMHCell = `<div style="min-width:100px">
    <div style="height:5px;border-radius:3px;overflow:hidden;display:flex;margin-bottom:4px">
      <div style="width:${totPct_m}%;background:#f778ba;opacity:.85"></div>
      <div style="width:${totPct_h}%;background:#79c0ff;opacity:.7"></div>
    </div>
    <div style="display:flex;justify-content:space-between;font-size:13px;font-family:'DM Sans',system-ui,sans-serif">
      <span style="color:#f778ba;font-weight:600">${totPct_m}%</span>
      <span style="color:#79c0ff;font-weight:600">${totPct_h}%</span>
    </div>
  </div>`;

  // Celda Apoyos — pill morado
  const totApCell = `<span style="font-family:'DM Mono',monospace;font-size:15px;font-weight:600;
    background:rgba(210,168,255,.12);color:#d2a8ff;padding:3px 10px;border-radius:20px;
    border:0.5px solid rgba(210,168,255,.25)">${fmt(totAp)}</span>`;

  // Celda Progs — promedio
  const totProgsCell = `<span style="font-family:'DM Mono',monospace;font-size:13px;font-weight:600;color:#d2a8ff">
    ~${avgProgs}<span style="font-size:11px;font-weight:400;color:#8b949e;margin-left:2px">prom</span></span>`;

  // Celda Localización — número + color
  const totLocCell = `<span style="font-family:'DM Mono',monospace;font-size:15px;font-weight:600;color:${locC_tot}">${fmt(totLoc)}</span>`;

  // Celda % Loc — barra + %
  const totLocBarCell = `<div style="display:flex;align-items:center;justify-content:center;gap:6px">
    <div style="width:36px;height:4px;background:rgba(205,217,229,.1);border-radius:2px;overflow:hidden;flex-shrink:0">
      <div style="height:100%;width:${totLocPct}%;background:${locC_tot};border-radius:2px"></div>
    </div>
    <span style="font-family:'DM Mono',monospace;font-size:15px;font-weight:600;color:${locC_tot}">${totLocPct}%</span>
  </div>`;

  // Celda Cobertura
  const totCobCell = avgCob
    ? `<span style="font-family:'DM Mono',monospace;font-size:15px;font-weight:600;color:#94a3b8">${avgCob}%<span style="font-size:11px;font-weight:400;color:#8b949e;margin-left:2px">prom</span></span>`
    : '<span style="opacity:.3;color:#484f58">—</span>';

  // Rango más y menos atendido — desde D.rangos_edad (Tabla S, valores reales del padrón)
  const RANGO_KEYS   = ['0-5','6-11','12-17','18-29','30-49','50-64','65+'];
  const RANGO_LABELS = {'0-5':'0–5','6-11':'6–11','12-17':'12–17','18-29':'18–29','30-49':'30–49','50-64':'50–64','65+':'65+'};
  const totRangos = {};
  (D.rangos_edad || []).forEach(r => { if (r.key !== 'sin_datos') totRangos[r.key] = r.total; });
  const keysConDato = RANGO_KEYS.filter(k => (totRangos[k] || 0) > 0);
  const rMay = keysConDato.length ? keysConDato.reduce((a,b) => totRangos[a] >= totRangos[b] ? a : b) : null;
  const rMin = keysConDato.length > 1 ? keysConDato.reduce((a,b) => totRangos[a] <= totRangos[b] ? a : b) : null;

  const totRangoMayCell = rMay
    ? `<div style="display:flex;flex-direction:column;align-items:center;gap:3px">
        <span style="font-family:'DM Sans',system-ui,sans-serif;font-size:13px;font-weight:700;
          background:rgba(56,139,253,.15);color:#79c0ff;padding:3px 9px;border-radius:20px;
          border:0.5px solid rgba(56,139,253,.25)">${RANGO_LABELS[rMay]}</span>
        <span style="font-family:'DM Mono',monospace;font-size:12px;color:#8b949e">${fmt(totRangos[rMay])}</span>
      </div>`
    : '<span style="opacity:.25;color:#8b949e">—</span>';

  const totRangoMinCell = rMin
    ? `<div style="display:flex;flex-direction:column;align-items:center;gap:3px">
        <span style="font-family:'DM Sans',system-ui,sans-serif;font-size:13px;font-weight:600;
          background:rgba(255,166,87,.12);color:#ffa657;padding:3px 9px;border-radius:20px;
          border:0.5px solid rgba(255,166,87,.25)">${RANGO_LABELS[rMin]}</span>
        <span style="font-family:'DM Mono',monospace;font-size:12px;color:#8b949e">${fmt(totRangos[rMin])}</span>
      </div>`
    : '<span style="opacity:.25;color:#8b949e">—</span>';

  const foot = document.getElementById('mun-tfoot');
  if (foot) foot.innerHTML = `<tr style="background:#161b22;border-top:1px solid rgba(205,217,229,.2)">
    <td style="padding:12px 8px;text-align:center">
      <span style="font-family:'DM Mono',monospace;font-size:13px;color:#484f58">Σ</span>
    </td>
    <td style="padding:12px 14px;font-family:'DM Sans',system-ui,sans-serif;font-size:13px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#8b949e">
      Total · ${data.length} mun.
    </td>
    <td style="padding:12px 8px;text-align:center">${totBenBar}</td>
    <td style="padding:12px 8px;text-align:center;min-width:110px">${totMHCell}</td>
    <td style="padding:12px 8px;text-align:center">${totApCell}</td>
    <td style="padding:12px 8px;text-align:center">${totProgsCell}</td>
    <td style="padding:12px 8px;text-align:center">${totLocCell}</td>
    <td style="padding:12px 8px;text-align:center">${totLocBarCell}</td>
    <td style="padding:12px 8px;text-align:center">${totCobCell}</td>
    <td style="padding:12px 8px;text-align:center">${totRangoMayCell}</td>
    <td style="padding:12px 8px;text-align:center">${totRangoMinCell}</td>
  </tr>`;
}

function showMunPanel(idx) {
  // Si se llama con el panel ya activo (flecha izq desde panel 0 o flecha der desde panel 1), ciclar
  const panels = 2;
  idx = ((idx % panels) + panels) % panels;
  document.getElementById('mun-panel-0').style.display = idx === 0 ? '' : 'none';
  document.getElementById('mun-panel-1').style.display = idx === 1 ? '' : 'none';
  document.getElementById('mun-tab-0').classList.toggle('active', idx === 0);
  document.getElementById('mun-tab-1').classList.toggle('active', idx === 1);
}

function showApoyosPanel(idx) {
  const panels = 2;
  idx = ((idx % panels) + panels) % panels;
  document.getElementById('apoyos-panel-0').style.display = idx === 0 ? '' : 'none';
  document.getElementById('apoyos-panel-1').style.display = idx === 1 ? '' : 'none';
  document.getElementById('apoyos-tab-0').classList.toggle('active', idx === 0);
  document.getElementById('apoyos-tab-1').classList.toggle('active', idx === 1);
}

function filterMuns() {
  const q = norm(document.getElementById('mun-search').value);
  renderMunTable(D.municipios.filter(m => norm(m.nombre).includes(q)));
}

/* ════════════════════════════════════════════════
   TAB: COBERTURA ESTATAL
════════════════════════════════════════════════ */
let _cobRendered = false;

/* ════════════════════════════════════════════════
   TAB: APOYOS Y PROGRAMAS
════════════════════════════════════════════════ */
let apoyosFlat = [];

function renderApoyos() {
  const g = D.general;

  // Tabla de apoyos flat — orden alfabético por nombre del apoyo
  apoyosFlat = [];
  const apoyosOrdenados = [...D.apoyos].sort((a,b)=>a.nombre.localeCompare(b.nombre,'es'));
  apoyosOrdenados.forEach(a => {
    apoyosFlat.push({type:'apoyo', data:a, q: norm(a.nombre)});
    [...a.instituciones].sort((x,y)=>x.nombre.localeCompare(y.nombre,'es')).forEach(inst => {
      apoyosFlat.push({type:'inst', data:inst, parent:a.nombre, q: norm(inst.nombre)+norm(a.nombre)});
      [...inst.programas].sort((x,y)=>x.nombre.localeCompare(y.nombre,'es')).forEach(p => {
        apoyosFlat.push({type:'prog', data:p, parent:a.nombre, q: norm(p.nombre)+norm(inst.nombre)+norm(a.nombre)});
      });
    });
  });
  // Programas en orden alfabético por nombre
  const indicadoresOrdenados = [...D.indicadores].sort((a,b)=>a.nombre.localeCompare(b.nombre,'es'));
  renderApoyosTable(apoyosFlat);
  renderProgsTable(indicadoresOrdenados);
  showApoyosPanel(0); // asegurar pestaña activa al renderizar
}


  // ── Mapa de iconos por apoyo ──────────────────────────────────────────────
  function getApoyoIcon(nombre) {
    const n = nombre.toUpperCase();
    const icons = {
      // Salud / médico
      'SALUD':      '<path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 5v4H8m4-4v4h4"/>',
      'CLINICO':    '<path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8l-5-5H9zm3 9v4m-2-2h4"/>',
      'CONSULTA':   '<circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>',
      'MEDICAMENT': '<path d="M10.5 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v3"/><circle cx="17" cy="17" r="5"/><path d="M14.5 17h5M17 14.5v5"/>',
      'CIRUGIA':    '<path d="m12 12 4-4M8 8l4 4m-4-4 4 4m4-4-4 4M3 7l3-3 14 14-3 3L3 7z"/>',
      'PAGO DE':    '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
      'PROTESIS':   '<path d="M15 3v4a1 1 0 0 0 1 1h4"/><path d="M18 17h-7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4l5 5v7a2 2 0 0 1-2 2z"/>',
      'OSTEOSINT':  '<path d="M3.5 5.5L5 7l2.5-2.5M3.5 11.5L5 13l2.5-2.5M3.5 17.5L5 19l2.5-2.5M11 6h9M11 12h9M11 18h9"/>',

      // Discapacidad / movilidad
      'SILLA DE':   '<circle cx="12" cy="5" r="2"/><path d="M9 9h3l2 5h3M9 9v5l2 1.5"/>',
      'ANDADERA':   '<path d="M5 3v18M19 3v18M5 12h14M5 18c0 1.1.9 2 2 2h10a2 2 0 0 0 2-2"/>',
      'MULETAS':    '<path d="M6 2v20M6 2l4 3M6 10l4-2M18 22V10a2 2 0 0 0-2-2h-3l-3-6"/>',
      'AUXILIAR A': '<path d="M12 1a3 3 0 0 0-3 3c0 1.7 1.3 3 3 3s3-1.3 3-3a3 3 0 0 0-3-3zm0 6c-3.5 0-6 2-7 5l2 .5C8 10 9.8 9 12 9s4 1 5 3.5l2-.5c-1-3-3.5-5-7-5z"/>',
      'ARTÍCULOS':  '<path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2z"/>',
      'DISCAPACID': '<circle cx="12" cy="5" r="2"/><path d="M9 9h6v6H9zm3 6v5m-3-3h6"/>',
      'TRANSPORTE': '<path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2M7 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0m8 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0"/>',

      // Alimentación
      'DESPENSA':   '<path d="M6 2v6m4-6v6m4-6v6M2 9h20v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9z"/>',
      'ALIMENTOS':  '<path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zm4-4v4m4-4v4m4-4v4"/>',
      'ASISTENCIA A': '<path d="M3 11l9-9 9 9v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9z"/><polyline points="9 22 9 12 15 12 15 22"/>',
      'PAQUETE':    '<path d="M21 16V8a2 2 0 0 0-1-1.73L13 2.27a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>',
      'COBIJA':     '<path d="M2 8c0-1.1.9-2 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8zm4 4h12"/>',
      'CAMA':       '<path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v6H2m6-6v6"/>',
      'HOSPEDAJE':  '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',

      // Educación / capacitación
      'CURSO':      '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zm20 0h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
      'TALLER':     '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
      'CAPACITACI': '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
      'EDUCACI':    '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
      'BECAS':      '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
      'BECA':       '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0 2 2v16"/>',
      'ÚTILES':     '<path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',

      // Económico / apoyo financiero
      'ECONÓMICO':  '<line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
      'PROYECTO P': '<path d="M3 3h18v18H3zM3 9h18M9 21V9"/>',
      'CONDONA':    '<path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm-1 13l-4-4 1.41-1.41L11 12.17l5.59-5.58L18 8l-7 7z"/>',
      'CREDENCIAL': '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M7 15h.01M11 15h2"/>',
      'INSUMOS':    '<path d="M21 16V8a2 2 0 0 0-1-1.73L13 2.27a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>',

      // Social / comunidad
      'TERAPIA':    '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
      'PSICOSOCIAL':'<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
      'ALBERGUE':   '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
      'FUNERARIO':  '<path d="M12 2L8 6H3v14h18V6h-5zM9 9h6m-6 4h6"/>',
      'VINCULACI':  '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>',
      'LABORAL':    '<path d="M20 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zm-9 9v-4l-2 2-2-2v4m10-4v4"/>',
      'CULTURA':    '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
      'PASAJES':    '<path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>',
      'INFRAESTRU': '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
      'CENTROS':    '<circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>',
      'GESTIÓN':    '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
      'DESARROLLO': '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
      'ASISTENCIA T':'<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
      'MATERIAL':   '<path d="M21 16V8a2 2 0 0 0-1-1.73L13 2.27a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>',
      'LENTES':     '<path d="M2 12h2m16 0h2M7 12a5 5 0 0 0 10 0 5 5 0 0 0-10 0zm5 0a5 5 0 0 1 5 5H7a5 5 0 0 1 5-5z"/>',
      'APOYO DIV':  '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
      'APOYO EXT':  '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
      'PENDIENTE':  '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
    };

    // Buscar coincidencia por prefijo de palabras clave
    for (const [key, path] of Object.entries(icons)) {
      if (n.includes(key)) return path;
    }
    // Default: estrella / apoyo genérico
    return '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>';
  }
