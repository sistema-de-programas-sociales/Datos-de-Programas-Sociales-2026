function instModalOpen(inst) {
  const progs = D.indicadores.filter(p => p.inst === inst);
  const meta  = INST_META[inst] || {};
  const acc   = instAcc(inst);

  document.getElementById('inst-modal-sigla').textContent = inst;
  document.getElementById('inst-modal-sigla').style.color = acc;
  document.getElementById('inst-modal-title').textContent = meta.fullname || inst;

  // Lista simple: clave + nombre, clickeable
  document.getElementById('inst-modal-body').innerHTML =
    progs.sort((a,b) => (b.benef_reales||0)-(a.benef_reales||0))
    .map((p,i) => {
      const clave = p.clave && p.clave !== 'N/A' && !p.clave.includes('#') ? p.clave : '—';
      return `<div onclick="instProgOpen(${i}, '${inst}')" style="display:flex;align-items:center;gap:12px;padding:11px 20px;border-bottom:0.5px solid rgba(205,217,229,.06);cursor:pointer;transition:background .12s" onmouseover="this.style.background='rgba(205,217,229,.04)'" onmouseout="this.style.background=''">
        <div style="width:3px;height:28px;border-radius:2px;background:${acc};flex-shrink:0"></div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;color:#e6edf3;font-weight:500;line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${toTitle(p.nombre)}</div>
          <div style="font-size:12px;color:#8b949e;font-family:'DM Mono',monospace;font-weight:600;margin-top:2px">${clave}</div>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#484f58" stroke-width="1.5"><path d="M9 18l6-6-6-6"/></svg>
      </div>`;
    }).join('') || `<div style="padding:32px;text-align:center;color:#8b949e;font-size:13px">Sin programas registrados</div>`;

  // Guardar progs en el modal para acceso rápido
  document.getElementById('inst-modal-overlay')._progs = progs;
  document.getElementById('inst-modal-overlay')._inst  = inst;
  document.getElementById('inst-modal-overlay')._directMode = false;

  document.getElementById('inst-modal-overlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function _instProgRender(p, inst, tab) {
  // Destruir mini-mapa previo si existe
  if (window._progMiniMap) { try { window._progMiniMap.remove(); } catch(e){} window._progMiniMap = null; }
  window._progMiniMapPending = null;

  const acc  = instAcc(inst);
  const meta = INST_META[inst] || {};
  const clave = p.clave || '—';
  const RKEYS = ['0-5','6-11','12-17','18-29','30-49','50-64','65+'];
  const RLABS = {'0-5':'0–5 años','6-11':'6–11 años','12-17':'12–17 años','18-29':'18–29 años','30-49':'30–49 años','50-64':'50–64 años','65+':'65+ años'};
  const RCOLS = {'0-5':'#7ecef4','6-11':'#4db8f0','12-17':'#10b981','18-29':'#0d7fb5','30-49':'#2196d4','50-64':'#e07b2a','65+':'#9b59b6'};
  const backLabel = meta.fullname ? toTitle(meta.fullname.split(' ').slice(0,4).join(' ')) : inst;
  tab = tab || 'benef';

  function kpi(label, val, color) {
    const v = val != null ? Number(val).toLocaleString('es-MX') : '—';
    return `<div style="background:#0d1117;border-radius:8px;padding:11px 12px;border:0.5px solid rgba(205,217,229,.08);text-align:center">
      <div style="font-family:'DM Mono',monospace;font-size:17px;font-weight:700;color:${color||'#e6edf3'}">${v}</div>
      <div style="font-size:9px;color:#8b949e;margin-top:2px;text-transform:uppercase;letter-spacing:.04em">${label}</div>
    </div>`;
  }
  function row(label, val, fmt2) {
    if (val == null) return '';
    const v = fmt2 === 'pct' ? (Number(val)*100).toFixed(1)+'%'
            : fmt2 === 'money' ? Number(val).toLocaleString('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0})
            : Number(val).toLocaleString('es-MX');
    return `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:0.5px solid rgba(205,217,229,.06)">
      <span style="font-size:12px;color:#8b949e">${label}</span>
      <span style="font-size:13px;font-weight:600;color:#e6edf3;font-family:'DM Mono',monospace">${v}</span>
    </div>`;
  }

  // Tabs
  const tabs = [
    {id:'benef',  label:'Beneficiarios'},
    {id:'edad',   label:'Edad'},
    {id:'muns',   label:'Municipios'},
    {id:'apoyos', label:'Apoyos'},
    {id:'indic',  label:'Indicadores'},
  ];
  const tabsHTML = `<div style="display:flex;gap:2px;border-bottom:0.5px solid rgba(205,217,229,.08);padding:0 20px;margin-bottom:0">
    ${tabs.map(t => `<button onclick="_instProgRender(document.getElementById('inst-modal-overlay')._prog, document.getElementById('inst-modal-overlay')._inst, '${t.id}')"
      style="padding:8px 12px;font-size:11px;font-weight:600;cursor:pointer;background:none;border-bottom:2px solid ${tab===t.id?acc:'transparent'};color:${tab===t.id?'#e6edf3':'#8b949e'};border-top:none;border-left:none;border-right:none;white-space:nowrap">${t.label}</button>`).join('')}
  </div>`;

  let bodyHTML = '';

  if (tab === 'benef') {
    const total    = p.benef_unicos || 0;
    const mujeres  = p.mujeres  || 0;
    const hombres  = p.hombres  || 0;
    const sinId    = p.sin_id   || 0;
    const pctM     = total > 0 ? Math.round(mujeres / total * 100) : 0;
    const pctH     = total > 0 ? Math.round(hombres / total * 100) : 0;
    const pctS     = total > 0 ? Math.round(sinId   / total * 100) : 0;
    const barW_M   = pctM;
    const barW_H   = Math.max(0, 100 - pctM - pctS);
    const barW_S   = pctS;

    bodyHTML = `<div style="padding:16px 18px;display:flex;flex-direction:column;gap:12px">

      <!-- FILA 1: Población (3 KPIs siempre) -->
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
        <div style="background:#0d1117;border-radius:10px;padding:12px 14px;border:0.5px solid rgba(205,217,229,.08);text-align:center">
          <div style="font-size:10px;font-weight:600;color:#484f58;text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px">Pob. Potencial</div>
          <div style="font-family:'DM Mono',monospace;font-size:20px;font-weight:700;color:#8b949e;line-height:1">${p.pob_potencial != null ? Number(p.pob_potencial).toLocaleString('es-MX') : '—'}</div>
        </div>
        <div style="background:#0d1117;border-radius:10px;padding:12px 14px;border:0.5px solid rgba(205,217,229,.08);text-align:center">
          <div style="font-size:10px;font-weight:600;color:#484f58;text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px">Pob. Objetivo</div>
          <div style="font-family:'DM Mono',monospace;font-size:20px;font-weight:700;color:#8b949e;line-height:1">${p.pob_objetivo != null ? Number(p.pob_objetivo).toLocaleString('es-MX') : '—'}</div>
        </div>
        <div style="background:#0d1117;border-radius:10px;padding:12px 14px;border:0.5px solid rgba(205,217,229,.08);text-align:center">
          <div style="font-size:10px;font-weight:600;color:#484f58;text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px">Pob. Alcanzada</div>
          <div style="font-family:'DM Mono',monospace;font-size:20px;font-weight:700;color:#8b949e;line-height:1">${p.pob_alcanzada != null ? Number(p.pob_alcanzada).toLocaleString('es-MX') : '—'}</div>
        </div>
      </div>

      <!-- FILA 2: Beneficiarios únicos — siempre centrado y prominente -->
      <div style="background:#0d1117;border-radius:10px;padding:14px 18px;border:0.5px solid ${acc}50;text-align:center">
        <div style="font-family:'DM Mono',monospace;font-size:32px;font-weight:700;color:${acc};letter-spacing:-.02em;line-height:1">${Number(total).toLocaleString('es-MX')}</div>
        <div style="font-size:10px;font-weight:600;color:#8b949e;text-transform:uppercase;letter-spacing:.1em;margin-top:5px">Beneficiarios Únicos</div>
      </div>

      <!-- FILA 3: Desglose por sexo — siempre 3 tarjetas -->
      <div>
        <div style="font-size:10px;font-weight:600;color:#484f58;text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px">Desglose por sexo</div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px">
          <div style="background:#f778ba10;border-radius:10px;padding:12px 14px;border:0.5px solid #f778ba25">
            <div style="font-family:'DM Mono',monospace;font-size:22px;font-weight:700;color:#f778ba;line-height:1">${Number(mujeres).toLocaleString('es-MX')}</div>
            <div style="font-size:10px;color:#8b949e;margin-top:5px">Mujeres <span style="color:#f778ba;font-weight:600">${pctM}%</span></div>
          </div>
          <div style="background:#79c0ff10;border-radius:10px;padding:12px 14px;border:0.5px solid #79c0ff25">
            <div style="font-family:'DM Mono',monospace;font-size:22px;font-weight:700;color:#79c0ff;line-height:1">${Number(hombres).toLocaleString('es-MX')}</div>
            <div style="font-size:10px;color:#8b949e;margin-top:5px">Hombres <span style="color:#79c0ff;font-weight:600">${pctH}%</span></div>
          </div>
          <div style="background:rgba(139,148,158,.07);border-radius:10px;padding:12px 14px;border:0.5px solid rgba(139,148,158,.15)">
            <div style="font-family:'DM Mono',monospace;font-size:22px;font-weight:700;color:#8b949e;line-height:1">${sinId > 0 ? Number(sinId).toLocaleString('es-MX') : '—'}</div>
            <div style="font-size:10px;color:#8b949e;margin-top:5px">Sin identificar ${sinId > 0 ? '<span style="font-weight:600">'+pctS+'%</span>' : ''}</div>
          </div>
        </div>
        <!-- Barra proporcional siempre presente -->
        <div style="height:6px;border-radius:3px;overflow:hidden;display:flex;gap:1px">
          <div style="width:${barW_M}%;background:#f778ba;border-radius:3px 0 0 3px;min-width:${mujeres>0?'2px':'0'}"></div>
          <div style="width:${barW_H}%;background:#79c0ff;min-width:${hombres>0?'2px':'0'}"></div>
          <div style="width:${barW_S}%;background:#484f58;border-radius:0 3px 3px 0;min-width:${sinId>0?'2px':'0'}"></div>
        </div>
      </div>

    </div>`;
  }

  else if (tab === 'edad') {
    const rangos   = p.rangos || {};
    const sinDatos = p.sin_datos_edad || 0;
    const totR = RKEYS.reduce((s,k)=>s+(rangos[k]||0),0) + sinDatos || 1;
    const maxR = Math.max(...RKEYS.map(k=>rangos[k]||0), sinDatos, 1);
    const hasData = RKEYS.some(k=>(rangos[k]||0)>0) || sinDatos > 0;
    bodyHTML = `<div style="padding:14px 20px">` +
      (hasData ? RKEYS.map(k => {
        const v = rangos[k]||0;
        if (!v) return '';
        const w = Math.round(v/maxR*100);
        const pct = Math.round(v/totR*100);
        return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
          <div style="font-size:12px;color:#8b949e;min-width:68px">${RLABS[k]}</div>
          <div style="flex:1;height:14px;background:rgba(205,217,229,.08);border-radius:3px;overflow:hidden">
            <div style="height:100%;width:${w}%;background:${RCOLS[k]};border-radius:3px"></div>
          </div>
          <div style="font-family:'DM Mono',monospace;font-size:12px;color:#e6edf3;min-width:44px;text-align:right">${fmt(v)}</div>
          <div style="font-size:11px;color:#8b949e;min-width:32px;text-align:right">${pct}%</div>
        </div>`;
      }).join('') +
      (sinDatos > 0 ? `
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;opacity:.65;margin-top:4px">
          <div style="font-size:12px;color:#8b949e;min-width:68px">Sin ident.</div>
          <div style="flex:1;height:14px;background:rgba(205,217,229,.08);border-radius:3px;overflow:hidden">
            <div style="height:100%;width:${Math.round(sinDatos/maxR*100)}%;background:#484f58;border-radius:3px"></div>
          </div>
          <div style="font-family:'DM Mono',monospace;font-size:12px;color:#8b949e;min-width:44px;text-align:right">${fmt(sinDatos)}</div>
          <div style="font-size:11px;color:#8b949e;min-width:32px;text-align:right">${Math.round(sinDatos/totR*100)}%</div>
        </div>` : '')
      : `<div style="padding:24px 0;text-align:center;color:#8b949e;font-size:13px">Sin datos de edad disponibles</div>`)
    + `</div>`;
  }

  else if (tab === 'muns') {
    // p.municipios: UPPERCASE sin acentos  |  GEO nombres: Title Case con acentos
    // Solución: normalizar ambos a lowercase sin acentos
    function normMun(s) {
      return s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    const listaRaw = p.municipios || p.muns_lista || [];
    const lista = listaRaw.filter(function(mn){
      return mn && mn !== 'NO IDENTIFICADO' && mn !== 'FORANEO' && !/for[aá]ne/i.test(mn);
    });

    // Set normalizado: lookup O(1)
    var listaSetNorm = {};
    lista.forEach(function(mn){ listaSetNorm[normMun(mn)] = true; });

    // Proyección SVG de Chihuahua — bbox fijo probado en Python
    var svgW = 420, svgH = 330;
    var lonMin=-109.2, lonMax=-103.0, latMin=25.3, latMax=31.8;
    var pad = 12;
    var sc2 = Math.min((svgW-pad*2)/(lonMax-lonMin), (svgH-pad*2)/(latMax-latMin));
    var ox = pad + ((svgW-pad*2) - (lonMax-lonMin)*sc2)/2;
    var oy = pad + ((svgH-pad*2) - (latMax-latMin)*sc2)/2;

    function _px(c){ return (ox + (c[0]-lonMin)*sc2).toFixed(1); }
    function _py(c){ return (svgH - (oy + (c[1]-latMin)*sc2)).toFixed(1); }
    function _ring(r){ return r.map(function(c,i){ return (i?'L':'M')+_px(c)+','+_py(c); }).join('')+'Z'; }

    // GEO puede estar en window.GEO (bloque map1) o en el scope global
    var _GEO = (typeof GEO !== 'undefined') ? GEO : (window.GEO || null);

    var paths = '';
    if (_GEO) {
      _GEO.features.forEach(function(f){
        var nm = normMun(f.properties.nombre || '');
        // Exact match OR prefix match (e.g. GeoJSON "Batopilas" vs data "Batopilas de Manuel Gómez Morín")
        var activo = !!listaSetNorm[nm] || Object.keys(listaSetNorm).some(function(k){
          return k.indexOf(nm) === 0 || nm.indexOf(k) === 0;
        });
        var fill   = activo ? acc         : '#111c2b';
        var stroke = activo ? '#ffffff99' : '#ffffff22';
        var sw     = activo ? '1.2'       : '0.4';
        var geom = f.geometry;
        var rings = geom.type === 'Polygon' ? [geom.coordinates[0]] : geom.coordinates.map(function(p){return p[0];});
        rings.forEach(function(r){ paths += '<path d="'+_ring(r)+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>'; });
      });
    }

    bodyHTML = '<div style="padding:0">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 14px 4px">'
      + '<div style="display:flex;align-items:center;gap:10px">'
      + '<div style="display:flex;align-items:center;gap:4px"><div style="width:10px;height:10px;border-radius:2px;background:'+acc+'"></div><span style="font-size:10px;color:#cdd9e5">Con presencia</span></div>'
      + '<div style="display:flex;align-items:center;gap:4px"><div style="width:10px;height:10px;border-radius:2px;background:#111c2b;border:0.5px solid rgba(255,255,255,.2)"></div><span style="font-size:10px;color:#8b949e">Sin presencia</span></div>'
      + '</div>'
      + '<span style="font-size:11px;color:#8b949e;font-weight:600">'+lista.length+' municipios</span>'
      + '</div>'
      + '<div style="padding:0 12px 6px">'
      + '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+svgW+' '+svgH+'" style="width:100%;height:auto;display:block;background:#0a1520;border-radius:8px">'
      + paths
      + '</svg>'
      + '</div>'
      + '<div style="display:flex;flex-wrap:wrap;gap:4px;padding:2px 14px 14px">'
      + lista.map(function(mn){ return '<span style="font-size:10px;background:'+acc+'18;color:'+acc+';padding:2px 7px;border-radius:8px;border:0.5px solid '+acc+'30">'+toTitle(mn)+'</span>'; }).join('')
      + '</div>'
      + '</div>';
  }

  else if (tab === 'apoyos') {
    // Cross-reference D.apoyos to find all tipos de apoyo this program participates in
    const progNorm = (p.nombre||'').trim().toLowerCase();
    const tiposEncontrados = [];
    let totalApoyos = 0;
    (D.apoyos || []).forEach(function(a) {
      a.instituciones.forEach(function(inst) {
        (inst.programas || []).forEach(function(prog) {
          if ((prog.nombre||'').trim().toLowerCase() === progNorm) {
            tiposEncontrados.push({ tipo: a.nombre, total: prog.total||0, m: prog.m||0, h: prog.h||0 });
            totalApoyos += (prog.total||0);
          }
        });
      });
    });
    tiposEncontrados.sort((a,b) => b.total - a.total);
    const maxT = tiposEncontrados.length > 0 ? tiposEncontrados[0].total : 1;

    const tiposHTML = tiposEncontrados.length > 0
      ? tiposEncontrados.map(function(t) {
          const w = maxT > 0 ? (t.total / maxT * 100).toFixed(1) : 0;
          const pctM = t.total > 0 ? Math.round(t.m / t.total * 100) : 0;
          const pctH = t.total > 0 ? Math.round(t.h / t.total * 100) : 0;
          return `<div style="margin-bottom:14px">
            <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px">
              <span style="font-size:12px;color:#cdd9e5;font-weight:600;flex:1;padding-right:8px;line-height:1.3">${toTitle(t.tipo)}</span>
              <span style="font-family:'DM Mono',monospace;font-size:15px;font-weight:700;color:${acc};white-space:nowrap">${fmt(t.total)}</span>
            </div>
            <div style="height:8px;background:rgba(205,217,229,.08);border-radius:3px;overflow:hidden;margin-bottom:4px">
              <div style="height:100%;width:${w}%;background:${acc};border-radius:3px;opacity:.85"></div>
            </div>
            <div style="display:flex;gap:10px;font-size:10px;color:#8b949e">
              <span style="color:var(--fem)">♀ ${pctM}% (${fmt(t.m)})</span>
              <span style="color:var(--male)">♂ ${pctH}% (${fmt(t.h)})</span>
            </div>
          </div>`;
        }).join('')
      : `<div style="padding:24px 0;text-align:center;color:#8b949e;font-size:13px">Sin datos de apoyos disponibles</div>`;

    bodyHTML = `<div style="padding:16px 18px;display:flex;flex-direction:column;gap:4px">
      <!-- KPI total -->
      <div style="background:#0d1117;border-radius:8px;padding:14px 16px;border:0.5px solid ${acc}44;margin-bottom:16px;text-align:center">
        <div style="font-size:10px;color:#8b949e;text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px">Total Apoyos Otorgados</div>
        <div style="font-family:'DM Mono',monospace;font-size:28px;font-weight:900;color:${acc};line-height:1">${fmt(totalApoyos)}</div>
        ${tiposEncontrados.length > 1
          ? `<div style="font-size:11px;color:#8b949e;margin-top:4px">${tiposEncontrados.length} tipos de apoyo</div>`
          : ''}
      </div>
      <!-- Desglose por tipo -->
      ${tiposEncontrados.length > 0 ? `
      <div style="font-size:9px;color:#8b949e;text-transform:uppercase;letter-spacing:.1em;margin-bottom:10px">Desglose por Tipo de Apoyo</div>
      ${tiposHTML}` : tiposHTML}
    </div>`;
  }

  else if (tab === 'indic') {
    const hasIndic = p.presupuesto||p.gasto||p.eficacia!=null||p.eficiencia!=null||p.desempeno!=null||p.metas_prog!=null;
    bodyHTML = `<div style="padding:14px 20px">
      ${hasIndic ? `<div style="background:#0d1117;border-radius:8px;padding:4px 14px;border:0.5px solid rgba(205,217,229,.08)">
        ${row('Presupuesto asignado', p.presupuesto, 'money')}
        ${row('Gasto ejercido', p.gasto, 'money')}
        ${row('Metas programadas', p.metas_prog, '')}
        ${row('Avance de metas', p.avance_metas, '')}
        ${row('Eficacia', p.eficacia, 'pct')}
        ${row('Eficiencia', p.eficiencia, 'pct')}
        ${row('Desempeño', p.desempeno, 'pct')}
        ${p.ep != null ? row('Evaluación de políticas', p.ep, '') : ''}
      </div>` : `<div style="padding:24px 0;text-align:center;color:#8b949e;font-size:13px">Sin indicadores de desempeño disponibles</div>`}
    </div>`;
  }

  document.getElementById('inst-modal-sigla').textContent = clave || '—';
  document.getElementById('inst-modal-sigla').style.color = acc;
  document.getElementById('inst-modal-sigla').style.fontSize = '14px';
  document.getElementById('inst-modal-sigla').style.letterSpacing = '.08em';
  document.getElementById('inst-modal-title').textContent = toTitle(p.nombre);
  document.getElementById('inst-modal-body').innerHTML =
    `<div style="padding:8px 20px 6px">
      <button onclick="document.getElementById('inst-modal-overlay')._directMode ? instModalClose(null) : instModalOpen('${inst}')" style="display:flex;align-items:center;gap:4px;color:#8b949e;font-size:11px;cursor:pointer;background:none;border:none;padding:0">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
        ${backLabel}
      </button>
    </div>
    ${tabsHTML}
    ${bodyHTML}`;

}


function progModal(clave) {
  // Buscar el programa por clave en D.indicadores
  const p = D.indicadores.find(function(x){ return x.clave === clave || x.nombre === clave; });
  if (!p) return;
  const inst = p.inst;
  // Preparar el modal de institución con solo este programa
  const overlay = document.getElementById('inst-modal-overlay');
  overlay._progs = [p];
  overlay._prog  = p;
  overlay._inst  = inst;
  overlay._directMode = true;  // Viene directo de la card, back cierra
  // Mostrar directamente la vista de programa (sin la lista)
  _instProgRender(p, inst, 'benef');
  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function instProgOpen(idx, inst) {
  const progs = document.getElementById('inst-modal-overlay')._progs;
  const p     = progs[idx];
  document.getElementById('inst-modal-overlay')._prog = p;
  document.getElementById('inst-modal-overlay')._inst = inst;
  _instProgRender(p, inst, 'benef');
}

function instModalClose(e) {
  if (e && e.target !== document.getElementById('inst-modal-overlay')) return;
  if (window._progMiniMap) { try { window._progMiniMap.remove(); } catch(er){} window._progMiniMap = null; }
  window._progMiniMapPending = null;
  document.getElementById('inst-modal-overlay').classList.add('hidden');
  document.body.style.overflow = '';
}

// Cerrar con Escape también el modal de institución
document.addEventListener('keydown', function(e){
  if (e.key === 'Escape') { instModalClose(null); catModalClose(null); }
});

function catModalClose(e) {
  if (e && e.target !== document.getElementById('cat-modal-overlay')) return;
  // Destruir mini-mapa si existe
  if (window._catMiniMap) { try { window._catMiniMap.remove(); } catch(e2){} window._catMiniMap = null; }
  window._catMiniMapPending = null;
  // Restaurar estilos del body del modal
  var mb = document.getElementById('cat-modal-body');
  if (mb) { mb.style.padding = ''; mb.style.gap = ''; }
  document.getElementById('cat-modal-overlay').classList.add('hidden');
  document.body.style.overflow = '';
}

// Cerrar con Escape
document.addEventListener('keydown', function(e){
  if (e.key==='Escape') catModalClose(null);
});

function catSetInst(inst, btn) {
  window._catInstFilter = inst;
  // Actualizar estilos de todos los chips con color por institución
  document.querySelectorAll('#cat-inst-chips .cat-chip').forEach(c => {
    const n = c.dataset.inst || 'TODOS';
    const isActive = n === inst || (inst === 'TODOS' && !c.dataset.inst);
    c.dataset.active = isActive ? '1' : '';
    if (!c.dataset.inst) {
      // chip Todos
      c.classList.toggle('active', isActive);
      return;
    }
    const acc = instAcc(n);
    c.style.cssText = isActive
      ? `background:${acc};color:#fff;border-color:${acc}`
      : `background:${acc}18;color:${acc};border-color:${acc}44`;
  });
  window._catExpanded   = new Set(); // limpiar expandidos al cambiar filtro
  document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  filterApoyos();
}
