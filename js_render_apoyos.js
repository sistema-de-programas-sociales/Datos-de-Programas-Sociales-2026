function renderApoyosTable(rows) {
  const apoyos      = rows.filter(r => r.type === 'apoyo').map(r => r.data);
  const totalGlobal = D.general.total_apoyos || 1;
  const maxTotal    = Math.max(...apoyos.map(a => a.total), 1);

  const iInk = instInk;
  const iBg  = instBg;
  const iAcc = instAcc;

  // ── KPIs (dinámicos según filtro) ──
  const elTipos = document.getElementById('cat-total-tipos');
  const elNum   = document.getElementById('cat-total-num');
  if (elTipos) elTipos.textContent = apoyos.length;
  // Si hay filtro activo → suma de la selección; si no → total canónico
  const filteredTotal = apoyos.reduce((s,a)=>s+a.total,0);
  const isFiltered = (window._catInstFilter && window._catInstFilter !== 'TODOS') ||
                     (document.getElementById('apoyo-search')?.value?.trim());
  if (elNum) elNum.textContent = (isFiltered ? filteredTotal : (D.general.total_apoyos||filteredTotal)).toLocaleString('es-MX');

  // ── Chips (construir una sola vez) ──
  const chipsEl = document.getElementById('cat-inst-chips');
  if (chipsEl && !chipsEl._built) {
    chipsEl._built = true;
    const insts = new Set();
    D.apoyos.forEach(a => a.instituciones.forEach(i => insts.add(i.nombre)));
    chipsEl.innerHTML = ['TODOS', ...[...insts].sort()].map(n => {
      const act = (window._catInstFilter||'TODOS') === n;
      if (n === 'TODOS') {
        return `<button class="cat-chip${act?' active':''}" onclick="catSetInst('${n}',this)">Todos</button>`;
      }
      const acc = instAcc(n);
      const bg  = instBg(n);
      const ink = instInk(n);
      const styleNormal = `background:${acc}18;color:${acc};border-color:${acc}44`;
      const styleActive = `background:${acc};color:#fff;border-color:${acc}`;
      return `<button class="cat-chip" style="${act ? styleActive : styleNormal}"
        onmouseover="if(!this.dataset.active)this.style.cssText='${styleNormal.replace(/'/g,'"')};opacity:.8'"
        onmouseout="if(!this.dataset.active)this.style.cssText='${styleNormal.replace(/'/g,'"')}'"
        data-inst="${n}" data-active="${act?'1':''}"
        onclick="catSetInst('${n}',this)">${n}</button>`;
    }).join('');
  } else if (chipsEl) {
    const active = window._catInstFilter || 'TODOS';
    chipsEl.querySelectorAll('.cat-chip').forEach(c => {
      c.classList.toggle('active', c.textContent === active || (active==='TODOS' && c.textContent==='Todos'));
    });
  }

  if (!apoyos.length) {
    document.getElementById('apoyos-tbody').innerHTML = '<div class="cat-no-results">Sin resultados para esta búsqueda.</div>';
    return;
  }

  const out = apoyos.map(a => {
    const pctM  = a.total > 0 ? Math.round(a.m / a.total * 100) : 0;
    const pctH  = 100 - pctM;
    const barW  = Math.round(a.total / maxTotal * 100);
    const isExp = (window._catExpanded || new Set()).has(a.nombre);
    const progs = [];
    a.instituciones.forEach(inst => inst.programas.forEach(p => progs.push({...p, inst: inst.nombre})));
    progs.sort((x, y) => y.total - x.total);

    const firstInst = a.instituciones[0]?.nombre || '';
    const acc       = iAcc(firstInst);

    const badges = a.instituciones.map(i =>
      `<span class="cat-badge" style="background:${iBg(i.nombre)};color:${iInk(i.nombre)}">${i.nombre}</span>`
    ).join('');

    const detRows = progs.map(p => {
      const pM = p.total > 0 ? Math.round(p.m / p.total * 100) : 0;
      return `<div class="cat-prog-row">
        <div class="cat-prog-name">${toTitle(p.nombre)}<span class="cat-prog-inst-badge" style="background:${iBg(p.inst)};color:${iInk(p.inst)}">${p.inst}</span></div>
        <div class="cat-prog-nums">
          <span class="cat-prog-num">${fmt(p.total)}<span class="cat-prog-num-lbl">apoyos</span></span>
          <div class="cat-prog-bar-wrap"><div class="cat-prog-bar-fill" style="width:${pM}%"></div></div>
          <span style="font-size:11px;color:#D4537E;font-weight:600">♀ ${pM}%</span>
          <span style="font-size:11px;color:#185FA5;font-weight:600">♂ ${100-pM}%</span>
          <span style="font-size:11px;color:var(--cat-ink3)">${p.muns||'—'} mun.</span>
        </div>
      </div>`;
    }).join('');

    // sin rango por apoyo disponible en el JSON

    const safeName = a.nombre.replace(/'/g,'&#39;');

    // Color accent — filtro activo o gradiente multi-inst
    const accentColor = (() => {
      const filtro = window._catInstFilter || 'TODOS';
      if (filtro !== 'TODOS') return iAcc(filtro);
      return a.instituciones.length === 1
        ? acc
        : `linear-gradient(to right,${a.instituciones.map((inst,i) => {
            const c = iAcc(inst.nombre);
            const s = Math.round(i/a.instituciones.length*100);
            const e = Math.round((i+1)/a.instituciones.length*100);
            return `${c} ${s}%,${c} ${e}%`;
          }).join(',')})`;
    })();

    // Icono grande estilo GV
    const iconColor = (() => {
      const filtro = window._catInstFilter || 'TODOS';
      return filtro !== 'TODOS' ? iAcc(filtro) : acc;
    })();

    return `<div class="cat-card" style="padding:0;gap:0;overflow:hidden">

      <!-- Barra accent superior -->
      <div style="height:4px;background:${accentColor};border-radius:14px 14px 0 0;flex-shrink:0"></div>

      <!-- Cuerpo de la card -->
      <div style="padding:16px;display:flex;flex-direction:column;gap:12px;flex:1">

        <!-- TOP: icono + nombre -->
        <div style="display:flex;align-items:flex-start;gap:12px">
          <!-- Icono -->
          <div style="flex-shrink:0;width:52px;height:52px;border-radius:12px;background:${iconColor}18;border:1px solid ${iconColor}33;display:flex;align-items:center;justify-content:center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${getApoyoIcon(a.nombre)}</svg>
          </div>
          <!-- Nombre + instituciones -->
          <div style="flex:1;min-width:0;min-height:52px;display:flex;flex-direction:column;justify-content:center;gap:5px">
            <div class="cat-apoyo-name" style="font-size:14px">${toTitle(a.nombre)}</div>
            <div style="display:flex;flex-wrap:wrap;align-items:center;gap:4px">
              ${a.instituciones.map((i,idx) => `<span style="font-size:10px;font-weight:700;color:${iAcc(i.nombre)}">${i.nombre}</span>${idx < a.instituciones.length-1 ? '<span style="color:#484f58;font-size:10px">·</span>' : ''}`).join('')}
            </div>
          </div>
        </div>

        <!-- DIVISOR -->
        <div style="height:0.5px;background:rgba(205,217,229,.08)"></div>

        <!-- KPIs: Apoyos / Municipios / Rango -->
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0">
          <div class="cat-dato">
            <div class="cat-dato-val">${fmt(a.total)}</div>
            <div class="cat-dato-lbl">Apoyos</div>
          </div>
          <div class="cat-dato">
            <div class="cat-dato-val">${a.n_muns}</div>
            <div class="cat-dato-lbl">Municipios</div>
          </div>
          <div class="cat-dato">
            <div class="cat-dato-val" style="font-size:14px">${a.rango_dom || '—'}</div>
            <div class="cat-dato-lbl">Rango Mayor</div>
          </div>
        </div>

        <!-- DIVISOR -->
        <div style="height:0.5px;background:rgba(205,217,229,.08)"></div>

        <!-- Botones desglose -->
        <div style="display:flex;gap:5px;flex-wrap:wrap">
          <button class="cat-ver-btn" onclick="catModal('${safeName}','sexo')" style="font-size:11px;padding:5px 10px;flex:1">
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="4.5" cy="3" r="2"/><path d="M1 11c0-2 1.5-3 3.5-3s3.5 1 3.5 3"/><circle cx="9" cy="3" r="1.5"/><path d="M7.5 11c0-1.5 1-2.5 2-2.5"/></svg>
            Sexo
          </button>
          <button class="cat-ver-btn" onclick="catModal('${safeName}','edad')" style="font-size:11px;padding:5px 10px;flex:1">
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="2" width="10" height="9" rx="1"/><path d="M4 2V1M8 2V1M1 5h10"/></svg>
            Edad
          </button>
          <button class="cat-ver-btn" onclick="catModal('${safeName}','municipios')" style="font-size:11px;padding:5px 10px;flex:1">
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 1C4 1 2 3 2 5c0 3 4 7 4 7s4-4 4-7c0-2-1.8-4-4-4z"/><circle cx="6" cy="5" r="1.2"/></svg>
            Municipios
          </button>
        </div>

      </div><!-- /cuerpo -->
    </div>`;
  }).join('');

  document.getElementById('apoyos-tbody').innerHTML = out;
}

function catToggle(nombre) {
  // ya no se usa para expandir — se mantiene por compatibilidad
}
