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

    const safeName = a.nombre.replace(/'/g, "\\'");
    return `<div class="cat-card">
      <div class="cat-card-accent" style="background:${(() => {
        const filtro = window._catInstFilter || 'TODOS';
        if (filtro !== 'TODOS') {
          // Filtro activo — usar solo el color de esa institución
          return iAcc(filtro);
        }
        // Sin filtro — todos los colores
        return a.instituciones.length === 1
          ? acc
          : `linear-gradient(to right,${a.instituciones.map((inst,i) => {
              const c = iAcc(inst.nombre);
              const start = Math.round(i/a.instituciones.length*100);
              const end   = Math.round((i+1)/a.instituciones.length*100);
              return `${c} ${start}%,${c} ${end}%`;
            }).join(',')})`;
      })()}"></div>

      <!-- FILA 1: Nombre + icono -->
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;min-height:58px">
        <div class="cat-apoyo-name" style="min-height:auto;flex:1">${toTitle(a.nombre)}</div>
        ${(() => {
          const filtro = window._catInstFilter || 'TODOS';
          const accs = a.instituciones.map(i => iAcc(i.nombre));
          const n = accs.length;
          // Si hay filtro activo, usar solo ese color
          if (filtro !== 'TODOS') {
            const c = iAcc(filtro);
            return `<div style="flex-shrink:0;width:36px;height:36px;border-radius:8px;background:${c}20;border:1px solid ${c}55;display:flex;align-items:center;justify-content:center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${getApoyoIcon(a.nombre)}</svg>
            </div>`;
          }
          const outlineStyle = n > 1
            ? `background:linear-gradient(#161b22,#161b22) padding-box,linear-gradient(135deg,${accs.join(',')}) border-box;border:2px solid transparent;`
            : `background:${accs[0]}20;border:1px solid ${accs[0]}55;`;
          return `<div style="flex-shrink:0;width:36px;height:36px;border-radius:8px;${outlineStyle}display:flex;align-items:center;justify-content:center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${accs[0]}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${getApoyoIcon(a.nombre)}</svg>
          </div>`;
        })()}
      </div>

      <!-- FILA 2: 3 botones de desglose -->
      <div style="min-height:36px;display:flex;align-items:center;gap:5px;flex-wrap:wrap">
        <button class="cat-ver-btn" onclick="catModal('${safeName}','sexo')" style="font-size:11px;padding:5px 10px">
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="4.5" cy="3" r="2"/><path d="M1 11c0-2 1.5-3 3.5-3s3.5 1 3.5 3"/><circle cx="9" cy="3" r="1.5"/><path d="M7.5 11c0-1.5 1-2.5 2-2.5"/></svg>
          Sexo
        </button>
        <button class="cat-ver-btn" onclick="catModal('${safeName}','edad')" style="font-size:11px;padding:5px 10px">
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="2" width="10" height="9" rx="1"/><path d="M4 2V1M8 2V1M1 5h10"/></svg>
          Edad
        </button>
        <button class="cat-ver-btn" onclick="catModal('${safeName}','municipios')" style="font-size:11px;padding:5px 10px">
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 1C4 1 2 3 2 5c0 3 4 7 4 7s4-4 4-7c0-2-1.8-4-4-4z"/><circle cx="6" cy="5" r="1.2"/></svg>
          Municipios
        </button>
      </div>

      <!-- FILA 3: Instituciones -->
      <div class="cat-apoyo-meta">${badges}</div>

      <!-- DIVISOR -->
      <div style="border-top:0.5px solid rgba(205,217,229,.1);margin:2px 0"></div>

      <!-- FILA 4: KPIs — Apoyos / Municipios / Rango más beneficiado -->
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0;padding:6px 0">
        <div class="cat-dato">
          <div class="cat-dato-val">${fmt(a.total)}</div>
          <div class="cat-dato-lbl">Apoyos</div>
        </div>
        <div class="cat-dato">
          <div class="cat-dato-val">${a.n_muns}</div>
          <div class="cat-dato-lbl">Municipios</div>
        </div>
        <div class="cat-dato">
          <div class="cat-dato-val" style="font-size:16px">${a.rango_dom || '—'}</div>
          <div class="cat-dato-lbl">Rango Mayor</div>
        </div>
      </div>

      <!-- DIVISOR -->


      </div>
    </div>`;
  }).join('');

  document.getElementById('apoyos-tbody').innerHTML = out;
}

function catToggle(nombre) {
  // ya no se usa para expandir — se mantiene por compatibilidad
}
