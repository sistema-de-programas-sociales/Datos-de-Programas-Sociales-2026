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

  const POB_VUL_CANON = D._meta?.pob_vulnerable || 1792324;
  const ateT = D.general.total_benef;
  const grupos = gv.grupos || [];

  // ── Texto dinámico ───────────────────────────────────────────────────────
  const elTotal = document.getElementById('vul-txt-total');
  const elAte   = document.getElementById('vul-txt-atendidos');
  const elPct   = document.getElementById('vul-txt-pct');
  if (elTotal) elTotal.textContent = fmt(POB_VUL_CANON);
  if (elAte)   elAte.textContent   = fmt(ateT);
  if (elPct)   elPct.textContent   = pct(ateT, POB_VUL_CANON);

  // ── KPIs ─────────────────────────────────────────────────────────────────
  const gruposConCob = grupos.filter(g =>
    g.pob_vulnerable > 0 && g.atendidos > 0 &&
    !g.nombre.toLowerCase().includes('muj') &&
    !g.nombre.toLowerCase().includes('hom'));
  const grupoMax = gruposConCob.length
    ? gruposConCob.reduce((a,b) => b.atendidos/b.pob_vulnerable > a.atendidos/a.pob_vulnerable ? b : a)
    : null;
  const grupoMin = gruposConCob.length
    ? gruposConCob.reduce((a,b) => b.atendidos/b.pob_vulnerable < a.atendidos/a.pob_vulnerable ? b : a)
    : null;

  const s = document.getElementById('vul-kpis');
  if (s) s.innerHTML =
    kpiSS('Pob. Vulnerable', fmt(POB_VUL_CANON), 'personas en situación vulnerable', 'cr','r') +
    kpiSS('Población Atendida', fmt(ateT), pct(ateT, POB_VUL_CANON)+' de cobertura', 'cb','b') +
    (grupoMax ? kpiSS('Mayor Cobertura · '+grupoMax.nombre, pct(grupoMax.atendidos, grupoMax.pob_vulnerable), fmt(grupoMax.atendidos)+' atendidos', 'cgr','gr') : '') +
    (grupoMin ? kpiSS('Menor Cobertura · '+grupoMin.nombre, pct(grupoMin.atendidos, grupoMin.pob_vulnerable), fmt(grupoMin.atendidos)+' atendidos', 'cm','m') : '');

  // ── Badge count ──────────────────────────────────────────────────────────
  const badge = document.getElementById('vul-badge-count');
  if (badge) badge.textContent = grupos.length + ' grupos';

  // ── Gauge de cobertura general ───────────────────────────────────────────
  const cobGeneral = ateT / POB_VUL_CANON * 100;
  const gaugeEl = document.getElementById('vul-gauge-svg');
  const gaugeLabel = document.getElementById('vul-gauge-label');
  if (gaugeEl) {
    const cx = 60, cy = 58, r = 44;
    const startDeg = 180, endDeg = 0; // semicírculo de izquierda a derecha
    const cobColor = cobGeneral >= 20 ? '#56d364' : cobGeneral >= 8 ? '#ffa657' : '#f85149';
    // Trazar arco: coordenadas para semicírculo
    // Start: (cx-r, cy) = izquierda  End: (cx+r, cy) = derecha
    const fillAngle = Math.PI * Math.min(cobGeneral / 100, 1); // 0..π
    const ex = cx - r * Math.cos(fillAngle);
    const ey = cy - r * Math.sin(fillAngle);
    // Track completo (semicírculo)
    const trackD = `M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`;
    // Fill (porción coloreada)
    const fillD = cobGeneral >= 99.5
      ? trackD
      : `M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`;
    // Ticks de referencia (25%, 50%, 75%)
    const ticks = [0.25, 0.5, 0.75].map(p => {
      const angle = Math.PI * p;
      const tx = cx - r * Math.cos(angle);
      const ty = cy - r * Math.sin(angle);
      const tx2 = cx - (r-7) * Math.cos(angle);
      const ty2 = cy - (r-7) * Math.sin(angle);
      return `<line x1="${tx.toFixed(1)}" y1="${ty.toFixed(1)}" x2="${tx2.toFixed(1)}" y2="${ty2.toFixed(1)}" stroke="rgba(205,217,229,.15)" stroke-width="1"/>`;
    }).join('');
    gaugeEl.innerHTML =
      `<path d="${trackD}" fill="none" stroke="rgba(205,217,229,.07)" stroke-width="10" stroke-linecap="round"/>` +
      `<path d="${fillD}" fill="none" stroke="${cobColor}" stroke-width="10" stroke-linecap="round"/>` +
      ticks +
      `<text x="17" y="${cy+14}" text-anchor="middle" font-size="8" fill="#484f58">0%</text>` +
      `<text x="103" y="${cy+14}" text-anchor="middle" font-size="8" fill="#484f58">100%</text>` +
      `<text x="${cx}" y="${cy+2}" text-anchor="middle" font-size="9" fill="#6e7f8d">de pob. vulnerable</text>`;
  }
  if (gaugeLabel) {
    const cobColor = cobGeneral >= 20 ? '#56d364' : cobGeneral >= 8 ? '#ffa657' : '#f85149';
    gaugeLabel.textContent = cobGeneral.toFixed(1) + '%';
    gaugeLabel.style.color = cobColor;
  }

  // ── Grupos sin datos ─────────────────────────────────────────────────────
  const sinDatosEl = document.getElementById('vul-sin-datos');
  const sinDatos = grupos.filter(g => !g.atendidos || g.atendidos === 0);
  if (sinDatosEl) {
    sinDatosEl.innerHTML = sinDatos.length
      ? sinDatos.map(g => `<div style="display:flex;align-items:center;gap:6px">
          <span style="width:5px;height:5px;background:rgba(205,217,229,.2);border-radius:50%;display:inline-block;flex-shrink:0"></span>
          <span>${g.nombre}</span>
        </div>`).join('')
      : '<span style="color:#3fb950">Todos con datos ✓</span>';
  }

  // ── Tabla ────────────────────────────────────────────────────────────────
  const tbody = document.getElementById('vul-tbody');
  const tfoot = document.getElementById('vul-tfoot');
  if (!tbody) return;

  const gruposConDatos = grupos.filter(g => g.atendidos > 0);
  const maxCob = gruposConDatos.length
    ? Math.max(...gruposConDatos.map(g => g.atendidos / g.pob_vulnerable * 100))
    : 100;

  tbody.innerHTML = grupos.map((g, i) => {
    const cobNum  = g.pob_vulnerable > 0 && g.atendidos > 0 ? (g.atendidos / g.pob_vulnerable * 100) : null;
    const cobStr  = cobNum !== null ? cobNum.toFixed(1)+'%' : '—';
    const cobColor = cobNum === null ? '#484f58'
      : cobNum >= 20 ? '#56d364' : cobNum >= 8 ? '#ffa657' : '#f85149';
    // Barra relativa al máximo del grupo
    const barW = cobNum !== null ? Math.min((cobNum / maxCob) * 100, 100).toFixed(1) : 0;
    const rowBg = i % 2 === 0 ? 'transparent' : 'rgba(205,217,229,.02)';
    const hasDatos = g.atendidos > 0;

    return `<tr id="vul-row-${i}" style="background:${rowBg};border-bottom:0.5px solid rgba(205,217,229,.05);cursor:${hasDatos?'pointer':'default'};transition:background .1s"
      onmouseover="this.style.background='rgba(205,217,229,.05)'"
      onmouseout="this.style.background='${rowBg}'"
      onclick="vulSelectRow(${i})">
      <td style="padding:10px 8px;text-align:center;font-family:'DM Mono',monospace;font-size:11px;color:#484f58">${i+1}</td>
      <td style="padding:10px 14px;font-size:13px;font-weight:500;color:${hasDatos?'#e6edf3':'#6e7f8d'}">${g.nombre}</td>
      <td style="padding:10px 12px;text-align:right;font-family:'DM Mono',monospace;font-size:12px;color:#8b949e">
        ${g.pob_vulnerable > 0 ? fmt(g.pob_vulnerable) : '—'}
      </td>
      <td style="padding:10px 12px;text-align:right;font-family:'DM Mono',monospace;font-size:13px;font-weight:700;color:${hasDatos?'#ffa657':'#484f58'}">
        ${hasDatos ? fmt(g.atendidos) : '—'}
      </td>
      <td style="padding:10px 8px;text-align:right;font-family:'DM Mono',monospace;font-size:13px;font-weight:700;color:${cobColor}">
        ${cobStr}
      </td>
      <td style="padding:10px 14px">
        ${hasDatos ? `<div style="height:5px;background:rgba(205,217,229,.07);border-radius:3px;overflow:hidden">
          <div style="height:100%;width:${barW}%;background:${cobColor};border-radius:3px;transition:width .4s ease"></div>
        </div>
        <div style="font-size:9px;color:#484f58;margin-top:2px">${cobNum < maxCob ? cobNum.toFixed(1)+'% de '+maxCob.toFixed(1)+'% máx' : 'Mayor cobertura'}</div>` : ''}
      </td>
    </tr>`;
  }).join('');

  // Fila total
  if (tfoot) tfoot.innerHTML = `<tr style="background:#161b22;border-top:2px solid rgba(205,217,229,.12)">
    <td style="padding:9px 8px"></td>
    <td style="padding:9px 14px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#8b949e">Total padrón</td>
    <td style="padding:9px 12px;text-align:right;font-family:'DM Mono',monospace;font-size:12px;font-weight:700;color:#f778ba">${fmt(POB_VUL_CANON)}</td>
    <td style="padding:9px 12px;text-align:right;font-family:'DM Mono',monospace;font-size:13px;font-weight:700;color:#ffa657">${fmt(ateT)}</td>
    <td style="padding:9px 8px;text-align:right;font-family:'DM Mono',monospace;font-size:13px;font-weight:700;color:#79c0ff">${pct(ateT, POB_VUL_CANON)}</td>
    <td></td>
  </tr>`;

  // Seleccionar fila activa
  window._vulGrupos = grupos;
  window._vulAteT = ateT;
  window._vulPobVul = POB_VUL_CANON;
  window.vulSelectRow = function(i) {
    const g = window._vulGrupos[i];
    if (!g || !g.atendidos) return;
    // Highlight fila
    document.querySelectorAll('[id^="vul-row-"]').forEach(r => {
      r.style.outline = 'none'; r.style.background = '';
    });
    const row = document.getElementById('vul-row-'+i);
    if (row) { row.style.outline = '1.5px solid rgba(205,217,229,.25)'; row.style.background = 'rgba(205,217,229,.05)'; }

    const cobNum = g.pob_vulnerable > 0 ? (g.atendidos / g.pob_vulnerable * 100) : 0;
    const cobColor = cobNum >= 20 ? '#56d364' : cobNum >= 8 ? '#ffa657' : '#f85149';
    const noAtend = g.pob_vulnerable - g.atendidos;
    const cobVsGeneral = cobNum - (window._vulAteT / window._vulPobVul * 100);
    const vsStr = cobVsGeneral >= 0
      ? `<span style="color:#56d364">▲ ${cobVsGeneral.toFixed(1)}pp</span> sobre el promedio`
      : `<span style="color:#f85149">▼ ${Math.abs(cobVsGeneral).toFixed(1)}pp</span> bajo el promedio`;

    // Rango de cobertura con todos los grupos para ranking
    const gruposOrdenados = window._vulGrupos
      .filter(x => x.atendidos > 0 && x.pob_vulnerable > 0)
      .sort((a,b) => (b.atendidos/b.pob_vulnerable) - (a.atendidos/a.pob_vulnerable));
    const rank = gruposOrdenados.findIndex(x => x.nombre === g.nombre) + 1;
    const totalRank = gruposOrdenados.length;

    // Personas que faltan para llegar a 20%
    const meta20 = Math.ceil(g.pob_vulnerable * 0.20);
    const faltaMeta = Math.max(0, meta20 - g.atendidos);

    const insightEl = document.getElementById('vul-insight-body');
    if (insightEl) insightEl.innerHTML = `
      <div style="font-size:13px;font-weight:700;color:#e6edf3;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid rgba(205,217,229,.07)">${g.nombre}</div>

      <!-- Ranking y comparativa -->
      <div style="background:#161b22;border-radius:8px;padding:10px 12px;margin-bottom:8px">
        <div style="font-size:9px;color:#484f58;text-transform:uppercase;letter-spacing:.1em;margin-bottom:6px">Posición en el estado</div>
        <div style="font-size:13px;font-weight:700;color:#e6edf3;margin-bottom:3px">${rank}° de ${totalRank} grupos con datos</div>
        <div style="font-size:11px;color:#8b949e">${vsStr}</div>
      </div>

      <!-- Brecha visual -->
      <div style="background:#161b22;border-radius:8px;padding:10px 12px;margin-bottom:8px">
        <div style="font-size:9px;color:#484f58;text-transform:uppercase;letter-spacing:.1em;margin-bottom:6px">Distribución de cobertura</div>
        <div style="position:relative;height:10px;background:rgba(205,217,229,.06);border-radius:5px;overflow:hidden;margin-bottom:5px">
          <div style="position:absolute;left:0;top:0;height:100%;width:${Math.min(cobNum,100)}%;background:${cobColor};border-radius:5px"></div>
          <div style="position:absolute;left:20%;top:-1px;width:1.5px;height:12px;background:rgba(255,255,255,.2)"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:10px;color:#6e7f8d">
          <span style="color:${cobColor};font-weight:600">${fmt(g.atendidos)} atendidos</span>
          <span>${fmt(noAtend)} sin atender</span>
        </div>
        <div style="font-size:9px;color:#484f58;margin-top:3px">Línea blanca = meta 20%</div>
      </div>

      <!-- Proyección a meta 20% -->
      <div style="background:#161b22;border-radius:8px;padding:10px 12px">
        <div style="font-size:9px;color:#484f58;text-transform:uppercase;letter-spacing:.1em;margin-bottom:5px">Para alcanzar cobertura 20%</div>
        ${faltaMeta > 0
          ? `<div style="font-size:13px;font-weight:700;color:#ffa657">${fmt(faltaMeta)} personas más</div>
             <div style="font-size:10px;color:#6e7f8d;margin-top:2px">= ${(faltaMeta/g.atendidos*100).toFixed(0)}% adicional sobre lo actual</div>`
          : `<div style="font-size:13px;font-weight:700;color:#56d364">✓ Meta superada</div>
             <div style="font-size:10px;color:#6e7f8d;margin-top:2px">${(cobNum-20).toFixed(1)}pp sobre el umbral mínimo</div>`
        }
      </div>`;
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
