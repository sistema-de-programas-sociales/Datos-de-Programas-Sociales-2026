function catModal(nombre, tipo='sexo') {
  const apoyo = D.apoyos.find(a => a.nombre === nombre);
  if (!apoyo) return;

  const iInk = instInk;
  const iBg  = instBg;

  const progs = [];
  apoyo.instituciones.forEach(inst => inst.programas.forEach(p => progs.push({...p, inst: inst.nombre})));
  progs.sort((x, y) => y.total - x.total);
  const totalApoyo = apoyo.total || 1;

  const tipoLabel = {'sexo':'Desglose por Sexo','edad':'Desglose por Edad','municipios':'Desglose por Municipio'};
  document.getElementById('cat-modal-title').textContent = toTitle(apoyo.nombre);
  document.getElementById('cat-modal-sub').textContent =
    `${tipoLabel[tipo]||tipo} · ${apoyo.total.toLocaleString('es-MX')} apoyos · ${apoyo.n_muns} municipios`;

  // ── SEXO ──────────────────────────────────────────────────────────────────
  if (tipo === 'sexo') {
    const pM_total = apoyo.total > 0 ? Math.round(apoyo.m / apoyo.total * 100) : 0;
    const pH_total = 100 - pM_total;

    // HTML del resumen general
    const resumenHTML = `
      <!-- KPIs generales -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
        <div class="cat-modal-stat" style="text-align:center">
          <div class="cat-modal-stat-val" style="color:#f778ba">${fmt(apoyo.m)}</div>
          <div class="cat-modal-stat-lbl">Mujeres · ${pM_total}%</div>
        </div>
        <div class="cat-modal-stat" style="text-align:center">
          <div class="cat-modal-stat-val" style="color:#79c0ff">${fmt(apoyo.h)}</div>
          <div class="cat-modal-stat-lbl">Hombres · ${pH_total}%</div>
        </div>
      </div>
      <!-- Barra global -->
      <div style="height:14px;border-radius:4px;overflow:hidden;display:flex;margin-bottom:16px">
        <div style="width:${pM_total}%;background:#f778ba"></div>
        <div style="width:${pH_total}%;background:#79c0ff;opacity:.75"></div>
      </div>
      `;

    document.getElementById('cat-modal-body').innerHTML = resumenHTML;
  }

  // ── EDAD ───────────────────────────────────────────────────────────────────
  else if (tipo === 'edad') {
    const RKEYS  = ['0-5','6-11','12-17','18-29','30-49','50-64','65+'];
    const RLABS  = {'0-5':'0–5 años','6-11':'6–11 años','12-17':'12–17 años','18-29':'18–29 años','30-49':'30–49 años','50-64':'50–64 años','65+':'65+ años'};
    const RCOLS  = {'0-5':'#7ecef4','6-11':'#4db8f0','12-17':'#10b981','18-29':'#0d7fb5','30-49':'#2196d4','50-64':'#e07b2a','65+':'#9b59b6'};
    const rangos = apoyo.rangos || {};
    const maxR   = Math.max(...RKEYS.map(k => rangos[k]||0), 1);
    const totR   = RKEYS.reduce((s,k) => s+(rangos[k]||0), 0) || 1;
    const sinD   = apoyo.total - totR;
    document.getElementById('cat-modal-body').innerHTML =
      RKEYS.map(k => {
        const v   = rangos[k] || 0;
        const pct = Math.round(v / totR * 100);
        const w   = Math.round(v / maxR * 100);
        return `<div class="cat-modal-prog" style="padding:12px 14px">
          <div style="display:flex;align-items:center;gap:10px">
            <div style="font-size:13px;font-weight:600;color:#cdd9e5;min-width:72px">${RLABS[k]}</div>
            <div style="flex:1;height:18px;background:rgba(205,217,229,.08);border-radius:3px;overflow:hidden">
              <div style="height:100%;width:${w}%;background:${RCOLS[k]};border-radius:3px;transition:width .5s ease"></div>
            </div>
            <div style="font-family:'DM Mono',monospace;font-size:13px;color:#e6edf3;min-width:52px;text-align:right">${fmt(v)}</div>
            <div style="font-size:12px;color:#8b949e;min-width:36px;text-align:right">${pct}%</div>
          </div>
        </div>`;
      }).join('') +
      (sinD > 0 ? `<div class="cat-modal-prog" style="padding:12px 14px;opacity:.6">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="font-size:13px;color:#8b949e;min-width:72px">Sin dato</div>
          <div style="flex:1;height:6px;background:rgba(205,217,229,.06);border-radius:3px"></div>
          <div style="font-family:'DM Mono',monospace;font-size:13px;color:#8b949e;min-width:52px;text-align:right">${fmt(sinD)}</div>
          <div style="font-size:12px;color:#484f58;min-width:36px;text-align:right">${Math.round(sinD/apoyo.total*100)}%</div>
        </div>
      </div>` : '');
  }

  // ── MUNICIPIOS ─────────────────────────────────────────────────────────────
  else if (tipo === 'municipios') {
    // Destruir mini-mapa anterior si existe
    if (window._catMiniMap) { try { window._catMiniMap.remove(); } catch(e){} window._catMiniMap = null; }

    // Filtrar foráneo (no es municipio real)
    const FORANEO_RE = /for[aá]ne/i;
    const topMunsRaw = (apoyo.por_municipio || []);
    const topMuns = topMunsRaw.filter(m => !FORANEO_RE.test(m.nombre));
    const maxMun  = topMuns[0]?.total || 1;
    const accC    = instAcc(apoyo.instituciones[0]?.nombre||'');

    // Renderizar: contenedor del mini-mapa + lista de ranking
    const body = document.getElementById('cat-modal-body');
    body.style.padding = '0';
    body.style.gap = '0';
    body.innerHTML = `
      <div id="cat-mini-map-wrap" style="width:100%;height:200px;background:#0d1117;position:relative;flex-shrink:0;border-bottom:0.5px solid rgba(205,217,229,.08)">
        <div id="cat-mini-map" style="width:100%;height:100%"></div>
        <div style="position:absolute;bottom:10px;left:12px;z-index:1000;background:rgba(8,18,32,.85);border:0.5px solid rgba(255,255,255,.12);border-radius:8px;padding:7px 12px;backdrop-filter:blur(4px)">
          <div style="font-size:10px;font-weight:700;color:#8b949e;text-transform:uppercase;letter-spacing:.08em;margin-bottom:5px">Beneficiarios</div>
          <div id="cat-mini-legend-items" style="display:flex;flex-direction:column;gap:3px"></div>
        </div>
        <div style="position:absolute;top:10px;right:12px;z-index:1000;background:rgba(8,18,32,.85);border:0.5px solid rgba(255,255,255,.12);border-radius:6px;padding:5px 10px;font-size:11px;color:#8b949e;backdrop-filter:blur(4px)">
          ${topMuns.length} municipio${topMuns.length!==1?'s':''} con presencia
        </div>
      </div>
      <div id="cat-mini-ranking" style="overflow-y:auto;flex:1;padding:12px 14px;display:flex;flex-direction:column;gap:6px">
        ${topMuns.map((m,i) => {
          const w  = Math.round(m.total / maxMun * 100);
          const pm = m.total > 0 ? Math.round(m.m / m.total * 100) : 0;
          return `<div class="cat-modal-prog" style="padding:8px 12px">
            <div style="display:flex;align-items:center;gap:10px">
              <div style="font-size:11px;color:#484f58;min-width:18px;text-align:right">${i+1}</div>
              <div style="font-size:12px;font-weight:500;color:#cdd9e5;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${toTitle(m.nombre)}</div>
              <div style="width:70px;height:5px;background:rgba(205,217,229,.08);border-radius:3px;overflow:hidden;flex-shrink:0">
                <div style="height:100%;width:${w}%;background:${accC};border-radius:3px"></div>
              </div>
              <div style="font-family:'DM Mono',monospace;font-size:12px;color:#e6edf3;min-width:44px;text-align:right">${fmt(m.total)}</div>
            </div>
            <div style="display:flex;gap:10px;margin-top:3px;padding-left:26px">
              <span style="font-size:10px;color:#f778ba">♀ ${fmt(m.m)} (${pm}%)</span>
              <span style="font-size:10px;color:#79c0ff">♂ ${fmt(m.h)} (${100-pm}%)</span>
            </div>
          </div>`;
        }).join('')}
      </div>`;

    // Guardar datos para inicializar el mapa después de que el modal sea visible
    window._catMiniMapPending = { topMuns: topMuns, accC: accC };
  }

  // Guardar nombre y tipo activo para el switcher de tabs
  document.getElementById('cat-modal-box')._nombre = nombre;
  // Actualizar tab activo visualmente
  document.querySelectorAll('.cat-modal-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tipo === tipo);
  });
  document.getElementById('cat-modal-overlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  // ── Inicializar mini-mapa DESPUÉS de que el modal es visible ──────────
  if (tipo === 'municipios' && window._catMiniMapPending) {
    var _pend = window._catMiniMapPending;
    window._catMiniMapPending = null;
    setTimeout(function() {
      if (typeof L === 'undefined' || typeof GEO === 'undefined') return;
      var mapEl = document.getElementById('cat-mini-map');
      if (!mapEl || mapEl.offsetWidth === 0) return;

      var topMuns2 = _pend.topMuns;
      var accC2    = _pend.accC;
      var baseHex  = (accC2 && accC2.startsWith('#')) ? accC2 : '#388bfd';

      function _h2r(h){ return [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]; }
      function _lerp(t,lo,hi){
        var a=_h2r(lo),b=_h2r(hi);
        return '#'+[0,1,2].map(function(i){return Math.round(a[i]+(b[i]-a[i])*t).toString(16).padStart(2,'0');}).join('');
      }
      var cLo='#1c2a38', cHi=baseHex;

      var mm = L.map('cat-mini-map', {
        center:[28.3,-106.5], zoom:6,
        zoomControl:false, attributionControl:false,
        keyboard:false, scrollWheelZoom:false,
        doubleClickZoom:false, dragging:false,
        touchZoom:false, boxZoom:false
      });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {subdomains:'abcd',maxZoom:13,minZoom:5}).addTo(mm);

      var vals2 = topMuns2.map(function(m){return m.total;}).filter(function(v){return v>0;});
      var vMin2 = vals2.length ? Math.min.apply(null,vals2) : 0;
      var vMax2 = vals2.length ? Math.max.apply(null,vals2) : 1;

      // Lookup por nombre normalizado y por clave
      var byN = {};
      topMuns2.forEach(function(m){
        byN[m.nombre.toLowerCase().trim()] = m;
        if (m.clave) byN[m.clave] = m;
      });

      L.geoJSON(GEO, {
        style: function(feat){
          var k  = feat.properties.clave;
          var no = (feat.properties.nombre||'').toLowerCase().trim();
          var mu = byN[k] || byN[no];
          if (!mu || mu.total === 0) return {fillColor:'#080908',fillOpacity:1,color:'rgba(255,255,255,.15)',weight:0.7};
          return {fillColor:baseHex,fillOpacity:0.85,color:'rgba(255,255,255,.5)',weight:1.2};
        },
        onEachFeature: function(feat,layer){
          var k  = feat.properties.clave;
          var no = (feat.properties.nombre||'').toLowerCase().trim();
          var mu = byN[k] || byN[no];
          var nomMun = feat.properties.nombre || '';
          if (!mu || mu.total === 0) {
            layer.bindTooltip(
              '<div style="font-size:12px;font-weight:600;color:#6e7f8d">'+nomMun+'</div>'+
              '<div style="font-size:10px;color:#484f58;margin-top:2px">Sin beneficiarios de este apoyo</div>',
              {sticky:true,direction:'right',offset:[10,0],className:'ltt',opacity:0.97}
            );
            return;
          }
          var pm = mu.total>0 ? Math.round(mu.m/mu.total*100) : 0;
          layer.bindTooltip(
            '<div style="font-size:12px;font-weight:600;color:#e6edf3">'+nomMun+'</div>'+
            '<div style="font-size:13px;font-weight:700;color:'+baseHex+';margin-top:3px">'+fmt(mu.total)+' beneficiarios</div>'+
            '<div style="font-size:10px;color:#8b949e;margin-top:2px">♀ '+fmt(mu.m)+' ('+pm+'%) · ♂ '+fmt(mu.h)+' ('+(100-pm)+'%)</div>',
            {sticky:true,direction:'right',offset:[10,0],className:'ltt',opacity:0.97}
          );
        }
      }).addTo(mm);

      mm.fitBounds([[25.3,-109.2],[31.8,-103.0]],{padding:[6,6],maxZoom:7});

      // Leyenda — solo un item: municipios con presencia
      var legEl = document.getElementById('cat-mini-legend-items');
      if (legEl) {
        legEl.innerHTML = '<div style="display:flex;align-items:center;gap:6px">'+
          '<div style="width:10px;height:10px;border-radius:2px;background:'+baseHex+';border:0.5px solid rgba(255,255,255,.2)"></div>'+
          '<div style="font-size:10px;color:#cdd9e5">Con beneficiarios</div></div>';
      }

      window._catMiniMap = mm;
    }, 120);
  }
}


function catModalDesgloseProg(nombre, tipo, btn) {
  const apoyo = D.apoyos.find(a => a.nombre === nombre);
  if (!apoyo) return;
  const iInk = instInk, iBg = instBg;
  const progs = [];
  apoyo.instituciones.forEach(inst => inst.programas.forEach(p => progs.push({...p, inst: inst.nombre})));
  progs.sort((x, y) => y.total - x.total);
  const totalApoyo = apoyo.total || 1;

  const safeKey = nombre.replace(/[^a-z0-9]/gi,'_');
  const cid = 'dp-' + safeKey + '_' + tipo;
  const container = document.getElementById(cid);
  const chev = btn.querySelector('svg:last-child');
  if (!container) return;

  const open = container.style.display === 'flex';
  container.style.display = open ? 'none' : 'flex';
  container.style.flexDirection = 'column';
  container.style.gap = '8px';
  if (chev) chev.style.transform = open ? '' : 'rotate(180deg)';
  btn.style.background = open ? 'rgba(56,139,253,.08)' : 'rgba(56,139,253,.15)';

  // Colapsar/expandir el mapa según si el desglose está abierto
  var mapWrap = document.getElementById('cat-mini-map-wrap');
  if (mapWrap) {
    mapWrap.style.height = open ? '200px' : '120px';
    var mapEl = document.getElementById('cat-mini-map');
    if (mapEl) mapEl.style.height = open ? '200px' : '120px';
    if (window._catMiniMap) setTimeout(function(){ window._catMiniMap.invalidateSize(); }, 50);
  }

  if (!open && !container._built) {
    container._built = true;

    // ══ SEXO por programa ══════════════════════════════════════════════════
    if (tipo === 'sexo') {
      container.innerHTML = progs.map(p => {
        const pM = p.total > 0 ? Math.round(p.m / p.total * 100) : 0;
        const pW = Math.round(p.total / totalApoyo * 100);
        return `<div class="cat-modal-prog">
          <div class="cat-modal-prog-header">
            <div class="cat-modal-prog-name">${toTitle(p.nombre)}</div>
            <span class="cat-modal-prog-inst" style="background:${iBg(p.inst)};color:${iInk(p.inst)}">${p.inst}</span>
            <div class="cat-modal-prog-total">${fmt(p.total)}</div>
          </div>
          <div class="cat-modal-prog-stats">
            <div class="cat-modal-stat"><div class="cat-modal-stat-val">${fmt(p.m)}</div><div class="cat-modal-stat-lbl">Mujeres (${pM}%)</div></div>
            <div class="cat-modal-stat"><div class="cat-modal-stat-val">${fmt(p.h)}</div><div class="cat-modal-stat-lbl">Hombres (${100-pM}%)</div></div>
          </div>
          <div class="cat-modal-bar-wrap">
            <div class="cat-modal-bar-row">
              <div class="cat-modal-bar-dot" style="background:#f778ba"></div>
              <div class="cat-modal-bar-track"><div class="cat-modal-bar-fill" style="width:${pM}%;background:#f778ba"></div></div>
              <span class="cat-modal-bar-val">${fmt(p.m)} · ${pM}%</span>
            </div>
            <div class="cat-modal-bar-row">
              <div class="cat-modal-bar-dot" style="background:#79c0ff;opacity:.8"></div>
              <div class="cat-modal-bar-track"><div class="cat-modal-bar-fill" style="width:${100-pM}%;background:#79c0ff;opacity:.8"></div></div>
              <span class="cat-modal-bar-val">${fmt(p.h)} · ${100-pM}%</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;margin-top:8px">
              <span style="font-size:10px;color:#8b949e">Peso dentro del apoyo</span>
              <div style="flex:1;height:3px;border-radius:2px;background:rgba(205,217,229,.1);overflow:hidden">
                <div style="height:100%;width:${pW}%;background:#388bfd;border-radius:2px"></div>
              </div>
              <span style="font-size:11px;color:#8b949e">${pW}%</span>
            </div>
          </div>
        </div>`;
      }).join('');
    }

    // ══ EDAD por programa ══════════════════════════════════════════════════
    else if (tipo === 'edad') {
      const RKEYS = ['0-5','6-11','12-17','18-29','30-49','50-64','65+'];
      const RLABS = {'0-5':'0–5','6-11':'6–11','12-17':'12–17','18-29':'18–29','30-49':'30–49','50-64':'50–64','65+':'65+'};
      const RCOLS = {'0-5':'#7ecef4','6-11':'#4db8f0','12-17':'#10b981','18-29':'#0d7fb5','30-49':'#2196d4','50-64':'#e07b2a','65+':'#9b59b6'};
      // Para cada programa mostrar sus rangos de edad (si disponibles) o M/H como proxy
      container.innerHTML = progs.map(p => {
        const pM = p.total > 0 ? Math.round(p.m / p.total * 100) : 0;
        const pW = Math.round(p.total / totalApoyo * 100);
        // Rangos del programa — desde p.rangos (generado por generar_dashboard_data.py)
        const rp = p.rangos || {};
        const totRp = RKEYS.reduce((s,k)=>s+(rp[k]||0),0) || 1;
        const maxRp = Math.max(...RKEYS.map(k=>rp[k]||0), 1);
        const hasRangos = RKEYS.some(k => (rp[k]||0) > 0);
        const rangoRows = hasRangos
          ? RKEYS.map(k => {
              const v = rp[k] || 0;
              if (v === 0) return '';
              const w   = Math.round(v / maxRp * 100);
              const pct = Math.round(v / totRp * 100);
              return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
                <div style="font-size:11px;color:#8b949e;min-width:36px">${RLABS[k]}</div>
                <div style="flex:1;height:10px;background:rgba(205,217,229,.08);border-radius:2px;overflow:hidden">
                  <div style="height:100%;width:${w}%;background:${RCOLS[k]};border-radius:2px"></div>
                </div>
                <div style="font-family:'DM Mono',monospace;font-size:11px;color:#cdd9e5;min-width:36px;text-align:right">${fmt(v)}</div>
                <div style="font-size:10px;color:#8b949e;min-width:28px;text-align:right">${pct}%</div>
              </div>`;
            }).join('')
          : `<div style="font-size:11px;color:#8b949e;margin-top:4px">Sin datos de edad disponibles</div>`;
        return `<div class="cat-modal-prog">
          <div class="cat-modal-prog-header">
            <div class="cat-modal-prog-name">${toTitle(p.nombre)}</div>
            <span class="cat-modal-prog-inst" style="background:${iBg(p.inst)};color:${iInk(p.inst)}">${p.inst}</span>
            <div class="cat-modal-prog-total">${fmt(p.total)}</div>
          </div>
          <div style="margin-top:8px">${rangoRows}</div>
          <div style="display:flex;align-items:center;gap:8px;margin-top:8px">
            <span style="font-size:10px;color:#8b949e">Peso del programa</span>
            <div style="flex:1;height:3px;border-radius:2px;background:rgba(205,217,229,.1);overflow:hidden">
              <div style="height:100%;width:${pW}%;background:#388bfd;border-radius:2px"></div>
            </div>
            <span style="font-size:11px;color:#8b949e">${pW}%</span>
          </div>
        </div>`;
      }).join('');
    }

    // ══ MUNICIPIOS por programa ════════════════════════════════════════════
    else if (tipo === 'municipios') {
      // Para cada municipio del padrón, mostrar cuántos programas del apoyo están presentes
      // Fuente: D.municipios + el número de muns por programa
      const accC = instAcc(apoyo.instituciones[0]?.nombre||'');
      // Agrupar programas que tienen municipios
      const progsConMuns = progs.filter(p => p.muns > 0);
      const maxMuns = Math.max(...progsConMuns.map(p => p.muns), 1);

      container.innerHTML = progsConMuns.map(p => {
        const pW    = Math.round(p.total / totalApoyo * 100);
        const wM    = Math.round(p.muns / maxMuns * 100);
        const pM    = p.total > 0 ? Math.round(p.m / p.total * 100) : 0;
        const c     = iInk(p.inst);
        const lista = p.muns_lista || [];
        // Construir lista de municipios (máx 10 visibles)
        const munItems = lista.slice(0,10).map(mn =>
          `<span style="font-size:10px;background:rgba(205,217,229,.07);color:#8b949e;padding:2px 7px;border-radius:10px;border:0.5px solid rgba(205,217,229,.12)">${toTitle(mn)}</span>`
        ).join('');
        const masLabel = lista.length > 10
          ? `<span style="font-size:10px;color:#484f58">+${lista.length-10} más</span>` : '';
        return `<div class="cat-modal-prog">
          <div class="cat-modal-prog-header">
            <div class="cat-modal-prog-name">${toTitle(p.nombre)}</div>
            <span class="cat-modal-prog-inst" style="background:${iBg(p.inst)};color:${c}">${p.inst}</span>
            <div class="cat-modal-prog-total">${fmt(p.total)}</div>
          </div>
          <!-- Barra de municipios -->
          <div style="display:flex;align-items:center;gap:8px;margin-top:8px">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.5"><path d="M12 2C9.24 2 7 4.24 7 7c0 4.17 5 11 5 11s5-6.83 5-11c0-2.76-2.24-5-5-5z"/></svg>
            <div style="font-size:12px;color:#cdd9e5;font-weight:600">${p.muns} mun.</div>
            <div style="flex:1;height:5px;background:rgba(205,217,229,.08);border-radius:3px;overflow:hidden">
              <div style="height:100%;width:${wM}%;background:${c};border-radius:3px"></div>
            </div>
            <div style="font-size:10px;color:#8b949e">${Math.round(p.muns/67*100)}% del estado</div>
          </div>
          <!-- Lista de municipios -->
          ${lista.length ? `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:8px">${munItems}${masLabel}</div>` : ''}
          <!-- M/H y peso -->
          <div style="display:flex;gap:10px;margin-top:8px;align-items:center">
            <div style="font-size:11px;color:#f778ba">♀ ${fmt(p.m)} (${pM}%)</div>
            <div style="font-size:11px;color:#79c0ff">♂ ${fmt(p.h)} (${100-pM}%)</div>
            <div style="font-size:10px;color:#8b949e;margin-left:auto">Peso: ${pW}%</div>
          </div>
        </div>`;
      }).join('') || `<div style="padding:16px;text-align:center;color:#8b949e;font-size:13px">Sin datos de municipios por programa</div>`;
    }
  }
}


function catModalToggleDesglose(btn) {
  const panel = document.getElementById('cat-modal-desglose-panel');
  const nombre = document.getElementById('cat-modal-box')._nombre;
  const tipo   = document.querySelector('.cat-modal-tab.active')?.dataset.tipo || 'sexo';
  if (!panel || !nombre) return;

  const isOpen = panel.style.display === 'flex';
  btn.classList.toggle('active', !isOpen);

  if (isOpen) {
    panel.style.display = 'none';
    panel.innerHTML = '';
    return;
  }

  // Construir el desglose
  const apoyo = D.apoyos.find(a => a.nombre === nombre);
  if (!apoyo) return;
  const iInk = instInk, iBg = instBg;
  const progs = [];
  apoyo.instituciones.forEach(inst => inst.programas.forEach(p => progs.push({...p, inst: inst.nombre})));
  progs.sort((x, y) => y.total - x.total);
  const totalApoyo = apoyo.total || 1;

  const RKEYS = ['0-5','6-11','12-17','18-29','30-49','50-64','65+'];
  const RLABS = {'0-5':'0–5','6-11':'6–11','12-17':'12–17','18-29':'18–29','30-49':'30–49','50-64':'50–64','65+':'65+'};
  const RCOLS = {'0-5':'#7ecef4','6-11':'#4db8f0','12-17':'#10b981','18-29':'#0d7fb5','30-49':'#2196d4','50-64':'#e07b2a','65+':'#9b59b6'};

  panel.innerHTML = progs.map(p => {
    const pM = p.total > 0 ? Math.round(p.m / p.total * 100) : 0;
    const pW = Math.round(p.total / totalApoyo * 100);

    let inner = '';

    if (tipo === 'sexo') {
      inner = `
        <div class="cat-modal-prog-stats" style="margin-top:8px">
          <div class="cat-modal-stat"><div class="cat-modal-stat-val">${fmt(p.m)}</div><div class="cat-modal-stat-lbl">Mujeres (${pM}%)</div></div>
          <div class="cat-modal-stat"><div class="cat-modal-stat-val">${fmt(p.h)}</div><div class="cat-modal-stat-lbl">Hombres (${100-pM}%)</div></div>
        </div>
        <div class="cat-modal-bar-wrap">
          <div class="cat-modal-bar-row">
            <div class="cat-modal-bar-dot" style="background:#f778ba"></div>
            <div class="cat-modal-bar-track"><div class="cat-modal-bar-fill" style="width:${pM}%;background:#f778ba"></div></div>
            <span class="cat-modal-bar-val">${fmt(p.m)} · ${pM}%</span>
          </div>
          <div class="cat-modal-bar-row">
            <div class="cat-modal-bar-dot" style="background:#79c0ff;opacity:.8"></div>
            <div class="cat-modal-bar-track"><div class="cat-modal-bar-fill" style="width:${100-pM}%;background:#79c0ff;opacity:.8"></div></div>
            <span class="cat-modal-bar-val">${fmt(p.h)} · ${100-pM}%</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;margin-top:6px">
            <span style="font-size:10px;color:#8b949e">Peso</span>
            <div style="flex:1;height:3px;border-radius:2px;background:rgba(205,217,229,.1);overflow:hidden">
              <div style="height:100%;width:${pW}%;background:#388bfd;border-radius:2px"></div>
            </div>
            <span style="font-size:11px;color:#8b949e">${pW}%</span>
          </div>
        </div>`;
    } else if (tipo === 'edad') {
      const rp = p.rangos || {};
      const totRp = RKEYS.reduce((s,k)=>s+(rp[k]||0),0) || 1;
      const maxRp = Math.max(...RKEYS.map(k=>rp[k]||0), 1);
      inner = '<div style="margin-top:8px">' + RKEYS.map(k => {
        const v = rp[k] || 0;
        if (!v) return '';
        const w = Math.round(v/maxRp*100);
        const pct = Math.round(v/totRp*100);
        return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <div style="font-size:11px;color:#8b949e;min-width:34px">${RLABS[k]}</div>
          <div style="flex:1;height:9px;background:rgba(205,217,229,.08);border-radius:2px;overflow:hidden">
            <div style="height:100%;width:${w}%;background:${RCOLS[k]};border-radius:2px"></div>
          </div>
          <div style="font-family:'DM Mono',monospace;font-size:11px;color:#cdd9e5;min-width:34px;text-align:right">${fmt(v)}</div>
          <div style="font-size:10px;color:#8b949e;min-width:26px;text-align:right">${pct}%</div>
        </div>`;
      }).join('') + '</div>';
    } else if (tipo === 'municipios') {
      const lista = p.muns_lista || [];
      const pills = lista.slice(0,12).map(mn =>
        `<span style="font-size:10px;background:rgba(205,217,229,.07);color:#8b949e;padding:2px 7px;border-radius:10px;border:0.5px solid rgba(205,217,229,.12)">${toTitle(mn)}</span>`
      ).join('');
      const masLabel = lista.length > 12
        ? `<span style="font-size:10px;color:#484f58">+${lista.length-12} más</span>` : '';
      inner = `<div style="margin-top:8px">
        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px">${pills}${masLabel}</div>
        <div style="display:flex;gap:10px;align-items:center">
          <span style="font-size:11px;color:#f778ba">♀ ${fmt(p.m)} (${pM}%)</span>
          <span style="font-size:11px;color:#79c0ff">♂ ${fmt(p.h)} (${100-pM}%)</span>
        </div>
      </div>`;
    }

    return `<div class="cat-modal-prog" style="padding:10px 14px">
      <div class="cat-modal-prog-header">
        <div class="cat-modal-prog-name">${toTitle(p.nombre)}</div>
        <span class="cat-modal-prog-inst" style="background:${iBg(p.inst)};color:${iInk(p.inst)}">${p.inst}</span>
        <div class="cat-modal-prog-total">${fmt(p.total)}</div>
      </div>
      ${inner}
    </div>`;
  }).join('');

  panel.style.display = 'flex';
  panel.style.flexDirection = 'column';
}

function catModalSwitchTab(btn) {
  // Destruir mini-mapa si existía (al salir de tab municipios)
  if (window._catMiniMap) { try { window._catMiniMap.remove(); } catch(e){} window._catMiniMap = null; }
  // Restaurar estilos del body del modal
  var mb = document.getElementById('cat-modal-body');
  if (mb) { mb.style.padding = ''; mb.style.gap = ''; }
  // Actualizar tabs activos
  document.querySelectorAll('.cat-modal-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  // Cerrar panel de desglose al cambiar pestaña
  const panel = document.getElementById('cat-modal-desglose-panel');
  const desBtn = document.getElementById('cat-modal-desglose-btn');
  if (panel) { panel.style.display='none'; panel.innerHTML=''; }
  if (desBtn) desBtn.classList.remove('active');
  // Re-renderizar el body con el tipo seleccionado
  const nombre = document.getElementById('cat-modal-box')._nombre;
  if (nombre) catModal(nombre, btn.dataset.tipo);
}
