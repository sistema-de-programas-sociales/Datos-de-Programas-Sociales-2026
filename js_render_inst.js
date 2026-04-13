function renderInstituciones() {
  const insts  = D.instituciones;
  const g      = D.general;
  const inst   = k => insts[k] || {total:0,m:0,h:0,sn:0,apoyos:0,programas:[],rangos:{}};
  const locByI = {};
  (D.localizables?.por_institucion||[]).forEach(x => { locByI[x.nombre] = x; });

  /* orden dinámico — SALUD primero por su peso dominante, resto por volumen desc */
  const ORDER = Object.keys(insts)
    .filter(k => insts[k] && Number(insts[k].total) > 0)
    .sort((a, b) => {
      if (a === 'SALUD') return -1;
      if (b === 'SALUD') return 1;
      return Number(insts[b].total) - Number(insts[a].total);
    });

  /* ── helpers ── */
  const fmtPct = (n,d) => d ? (n/d*100).toFixed(1)+'%' : '—';

  const genderBar = (m,h,t) => {
    if (!t) return '';
    const mp = (m/t*100).toFixed(1), hp = (h/t*100).toFixed(1);
    return `
      <div style="display:flex;justify-content:space-between;font-family:var(--sans);font-size:14px;margin-bottom:5px">
        <span style="color:var(--fem)"><strong>${fmt(m)}</strong> Mujeres <span style="opacity:.6">(${mp}%)</span></span>
        <span style="color:var(--male)"><strong>${fmt(h)}</strong> Hombres <span style="opacity:.6">(${hp}%)</span></span>
      </div>
      <div style="display:flex;height:18px;border-radius:2px;overflow:hidden">
        <div style="width:${mp}%;background:var(--fem)"></div>
        <div style="width:${hp}%;background:var(--male)"></div>
      </div>`;
  };

  const rangoChart = (rangos, av, total) => {
    const keys = ['65+','50-64','30-49','18-29','12-17','6-11','0-5'];
    const sumaRangos = keys.reduce((s,k) => s + (rangos[k]||0), 0);
    const sinD = (rangos['sin_datos'] > 0)
      ? rangos['sin_datos']
      : (total > sumaRangos ? total - sumaRangos : 0);
    const allKeys = [...keys, 'sin_datos'];
    const allLabels = {...RANGOS_LABELS, 'sin_datos': 'Sin identificar'};
    const vals  = allKeys.map(k => k === 'sin_datos' ? sinD : (rangos[k]||0));
    const tot   = vals.reduce((s,x)=>s+x,0) || 1;
    return allKeys.map((k,i) => {
      const w   = (vals[i]/tot*100).toFixed(1);
      const isSin = k === 'sin_datos';
      const barColor = isSin ? 'rgba(150,150,150,.35)' : av;
      return `<div style="margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:5px">
          <div style="font-family:var(--sans);font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${isSin?'#484f58':'#8b949e'}">${allLabels[k]}</div>
          <div style="display:flex;align-items:baseline;gap:6px">
            <span style="font-family:'DM Mono',monospace;font-size:14px;font-weight:400;color:${isSin?'#484f58':'#e6edf3'}">${fmt(vals[i])}</span>
            <span style="font-family:var(--sans);font-size:11px;color:#484f58">${w}%</span>
          </div>
        </div>
        <div style="height:18px;background:rgba(205,217,229,.07);border-radius:3px;overflow:hidden">
          <div style="height:100%;width:${w}%;background:${barColor};border-radius:3px;transition:width .8s ease${isSin?';opacity:.7':''}"></div>
        </div>
      </div>`;
    }).join('');
  };

  const apoyosBar = (v, av) => {
    if (!v.programas.length) return '';
    const maxP = Math.max(...v.programas.map(p=>p.apoyos||p.total));
    return v.programas.map(p => {
      const val  = p.apoyos || p.total;
      const w    = maxP ? (val/maxP*100).toFixed(1) : 0;
      const n    = p.nombre.length>38 ? p.nombre.slice(0,36)+'…' : p.nombre;
      return `<div class="bar-row" style="margin-bottom:5px">
        <div class="bar-name" style="font-size:13px;min-width:0" title="${p.nombre}">${n}</div>
        <div class="bar-track" style="height:18px">
          <div class="bar-fill" style="width:${w}%;background:${av}cc">
            <span style="font-size:13px">${fmt(val)}</span>
          </div>
        </div>
      </div>`;
    }).join('');
  };

  /* ── construir filas ── */
  const container = document.getElementById('inst-rows-container');
  if (!container) return;

  container.innerHTML = ORDER.map((k, rowIdx) => {
    const v    = inst(k);
    const meta = INST_META[k] || {av:'#555',fullname:k,muns:0,img:'',caption:''};
    const locI = locByI[k];
    const locT = locI?.total || 0;
    const locPct = v.total ? (locT/v.total*100).toFixed(1) : 0;
    const apoyosRatio = v.total ? (v.apoyos/v.total).toFixed(2) : '—';
    const sinDato = v.rangos['sin_datos'] || 0;
    const border = rowIdx < ORDER.length-1
      ? `border-bottom:3px solid ${meta.av}33;margin-bottom:0;padding-bottom:24px`
      : '';

    return `
    <!-- ══ FILA ${k} ══ -->
    <div style="${border}" id="inst-row-${k}">
      <div class="np-2col mt4" style="align-items:stretch">

        <!-- COL IZQ: kicker · titular (sin número) + imagen inline · texto · KPIs -->
        <div class="np-2col-art" style="display:flex;flex-direction:column;justify-content:space-between">
          <div class="kicker mb8 mt12" style="color:${meta.av}">${meta.fullname} · ${meta.muns} municipios</div>

          <!-- Imagen a ancho completo + titular debajo -->
          <div id="inst-img-wrap-${k}" style="width:100%;aspect-ratio:5/2;max-height:350px;overflow:hidden;border-radius:8px;border:1px solid ${meta.av}33;margin-bottom:14px;flex-shrink:0">
            <img src="${meta.img}" alt="${meta.fullname}"
              style="width:100%;height:100%;object-fit:cover;object-position: 50% 15%;display:block;"
              onerror="this.style.display='none';document.getElementById('inst-img-ph-${k}').style.display='flex'">
            <div id="inst-img-ph-${k}" style="display:none;width:100%;height:100%;background:${meta.av}12;align-items:center;justify-content:center;flex-direction:column;gap:6px">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="${meta.av}" stroke-width="1.2" opacity=".5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <div style="font-family:var(--sans);font-size:13px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${meta.av};opacity:.7;text-align:center;padding:0 6px">${k}</div>
            </div>
          </div>
          <!-- Titular -->
          <div style="font-family:var(--head);font-weight:900;line-height:1.05;color:#e6edf3;font-size:36px">
            ${instTitular(k, v, meta)}
          </div>

          <hr class="rule-heavy">
          <div class="body-copy dropcap mt12" id="inst-cuerpo-${k}">—</div>
          <div class="deck mt4" style="font-style:italic;opacity:.7">${meta.caption}</div>
          <div class="stat-strip c2" id="inst-kpi-${k}" style="border:1px solid ${meta.av}44;border-top:3px solid ${meta.av};margin-top:16px"></div>
        </div>

        <div class="v-rule"></div>

        <!-- COL DER: solo 3 gráficas: sexo · rangos etarios · localización -->
        <div class="np-2col-art" style="display:flex;flex-direction:column;gap:20px;padding-top:12px">

          <!-- 1. Sexo -->
          <div>
            <div class="kicker mb6">Distribución por Sexo</div>
            <div id="inst-sexo-${k}"></div>
          </div>

          <!-- 2. Rangos etarios -->
          <div>
            <div class="kicker mb8">Distribución por Rango de Edad</div>
            <div id="inst-rangos-${k}"></div>
            ${sinDato > 0 ? `<p class="nota" style="margin-top:6px">* ${fmt(sinDato)} sin rango de edad registrado.</p>` : ''}
          </div>

          <!-- 3. Localización -->
          <div>
            <div class="kicker mb4">Tasa de Localización <span style="font-weight:400;opacity:.7">· Datos de contacto verificados</span></div>
            <div class="cov-track mt4">
              <div class="cov-fill" id="inst-loc-bar-${k}" style="width:0%;background:linear-gradient(90deg,${meta.av},${meta.av}88)">
                <span id="inst-loc-pct-${k}"></span>
              </div>
            </div>
            <div class="deck mt4">${fmt(locT)} localizables de ${fmt(v.total)} beneficiarios</div>
          </div>

          <!-- 4. Panel KPIs 2x3 -->
          <div style="margin-top:auto;background:rgba(205,217,229,.03);border:1px solid ${meta.av}22;border-left:3px solid ${meta.av};border-radius:8px;overflow:hidden" id="inst-mun-panel-${k}">

            <!-- FILA 1: Municipios con cobertura · Apoyos/benef global · Apoyo más entregado -->
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;border-bottom:1px solid rgba(205,217,229,.06)">
              <div style="padding:12px 14px;border-right:1px solid rgba(205,217,229,.06)">
                <div style="font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#484f58;margin-bottom:5px">Municipios con cobertura</div>
                <div style="font-family:'DM Mono',monospace;font-size:26px;font-weight:500;color:${meta.av};line-height:1">${meta.muns}</div>
              </div>
              <div style="padding:12px 14px;border-right:1px solid rgba(205,217,229,.06)">
                <div style="font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#484f58;margin-bottom:5px">Apoyos p. benef. (global)</div>
                <div style="font-family:'DM Mono',monospace;font-size:26px;font-weight:400;color:#e6edf3;line-height:1">${(v.apoyos/(v.total||1)).toFixed(2)}</div>
              </div>
              <div style="padding:12px 14px">
                <div style="font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#484f58;margin-bottom:5px">Apoyo más entregado</div>
                <div style="font-size:12px;font-weight:400;color:#e6edf3;line-height:1.3;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical" id="inst-prog-max-${k}">—</div>
              </div>
            </div>

            <!-- FILA 2: Municipio con mayor entrega · Apoyos/benef top municipio · Apoyo menos entregado -->
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr">
              <div style="padding:12px 14px;border-right:1px solid rgba(205,217,229,.06)">
                <div style="font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#484f58;margin-bottom:5px">Municipio con mayor entrega</div>
                <div style="font-size:13px;font-weight:400;color:${meta.av};line-height:1.2" id="inst-top-mun-${k}">—</div>
                <div style="font-size:10px;color:#6e7f8d;margin-top:3px" id="inst-top-mun-val-${k}">—</div>
              </div>
              <div style="padding:12px 14px;border-right:1px solid rgba(205,217,229,.06)">
                <div style="font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#484f58;margin-bottom:5px">Apoyos p. benef. (municipio)</div>
                <div style="font-family:'DM Mono',monospace;font-size:26px;font-weight:400;color:#e6edf3;line-height:1" id="inst-ratio-mun-${k}">—</div>
              </div>
              <div style="padding:12px 14px">
                <div style="font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#484f58;margin-bottom:5px">Apoyo menos entregado</div>
                <div style="font-size:12px;font-weight:400;color:#8b949e;line-height:1.3;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical" id="inst-prog-min-${k}">—</div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>`;
  }).join('');

  /* ── poblar datos dinámicos ── */
  ORDER.forEach(k => {
    const v    = inst(k);
    const meta = INST_META[k] || {av:'#555'};
    const locI = locByI[k];
    const locT = locI?.total || 0;
    const locPct = v.total ? (locT/v.total*100).toFixed(1) : 0;

    /* héroe animado */
    const heroEl = document.getElementById('inst-hero-'+k);
    if (heroEl) { heroEl.textContent='0'; animCount(heroEl, v.total); }

    /* top municipio + KPIs dinámicos */
    const topMunEl  = document.getElementById('inst-top-mun-'+k);
    const topMunVal = document.getElementById('inst-top-mun-val-'+k);
    if (topMunEl) {
      const munList = (D.municipios||[]).filter(m => m.inst && m.inst[k] && m.inst[k].apoyos > 0);
      const topMun  = munList.reduce((best, m) => (!best || m.inst[k].apoyos > best.inst[k].apoyos) ? m : best, null);
      if (topMun) {
        topMunEl.textContent  = toTitle(topMun.nombre);
        topMunVal.textContent = fmt(topMun.inst[k].apoyos) + ' apoyos · ' + fmt(topMun.inst[k].benef) + ' beneficiarios';
        const ratioMunEl = document.getElementById('inst-ratio-mun-'+k);
        if (ratioMunEl) {
          const r = topMun.inst[k].benef > 0 ? (topMun.inst[k].apoyos / topMun.inst[k].benef).toFixed(2) : '—';
          ratioMunEl.textContent = r;
        }
      } else { topMunEl.textContent = '—'; }
    }
    /* apoyo más/menos entregado — desde D.apoyos filtrado por institución */
    const progMaxEl = document.getElementById('inst-prog-max-'+k);
    const progMinEl = document.getElementById('inst-prog-min-'+k);
    if (progMaxEl || progMinEl) {
      const instApoyos = [];
      (D.apoyos||[]).forEach(a => {
        const instEntry = (a.instituciones||[]).find(i => i.nombre === k);
        if (instEntry && instEntry.total > 0) {
          instApoyos.push({nombre: a.nombre, total: instEntry.total});
        }
      });
      if (instApoyos.length) {
        const aMax = instApoyos.reduce((a,b) => a.total >= b.total ? a : b);
        const aMin = instApoyos.reduce((a,b) => a.total <= b.total ? a : b);
        if (progMaxEl) { progMaxEl.textContent = toTitle(aMax.nombre); progMaxEl.title = fmt(aMax.total)+' apoyos'; }
        if (progMinEl) { progMinEl.textContent = toTitle(aMin.nombre); progMinEl.title = fmt(aMin.total)+' apoyos'; }
      }
    }

    /* texto editorial */
    const cuerpoEl = document.getElementById('inst-cuerpo-'+k);
    if (cuerpoEl) {
      /* ── Función de texto analítico: genera texto según datos reales de cada institución ── */
      const locByInst2 = {};
      (D.localizables?.por_institucion||[]).forEach(x => { locByInst2[x.nombre] = x; });

      const textoInst = (k, v, meta) => {
        const locI    = locByInst2[k] || {};
        const locT    = locI.total || 0;
        const locPct  = v.total ? (locT/v.total*100).toFixed(1) : 0;
        const mPct    = v.total ? (v.m/v.total*100).toFixed(1) : 0;
        const hPct    = v.total ? (v.h/v.total*100).toFixed(1) : 0;
        const ratio   = v.total ? (v.apoyos/v.total).toFixed(2) : 0;
        const padPct  = g.total_benef ? (v.total/g.total_benef*100).toFixed(1) : 0;
        const rg      = v.rangos || {};
        const rkeys   = ['0-5','6-11','12-17','18-29','30-49','50-64','65+'];
        const sinD    = rg['sin_datos'] || 0;
        const rangTot = rkeys.reduce((s,rk)=>s+(rg[rk]||0),0);
        const topRang = rkeys.reduce((a,rk)=>(rg[rk]||0)>(rg[a]||0)?rk:a, rkeys[0]);
        const topRangN = rg[topRang]||0;
        const topRangPct = rangTot ? (topRangN/rangTot*100).toFixed(1) : 0;
        const muns    = meta.muns || 0;
        const p0      = v.programas[0] || {};
        const p0Pct   = v.total ? (p0.total/v.total*100).toFixed(1) : 0;
        const c       = meta.av;

        const texts = {
          SALUD: () => {
            const sinDPct = v.total ? (sinD/v.total*100).toFixed(1) : 0;
            const r3049 = rg['30-49']||0, r5064 = rg['50-64']||0, r65 = rg['65+']||0;
            const adultos = r3049+r5064+r65;
            const adPct = rangTot ? (adultos/rangTot*100).toFixed(1) : 0;
            const cobEst = D._meta?.pob_estatal ? (v.total/D._meta.pob_estatal*100).toFixed(1) : 0;
            return `<strong style="color:${c}">Secretaría de Salud</strong> concentra el <strong>${padPct}%</strong> del padrón `+
              `con <strong>${fmt(v.total)}</strong> beneficiarios, todos en el programa <strong>MediChihuahua</strong> —el único presente en los <strong>67 municipios</strong> del estado. `+
              `Al agrupar casi <strong>9 de cada 10 registros</strong> del padrón estatal, el peso de esta institución domina los totales consolidados, `+
              `por lo que conviene analizarla de forma separada para entender el comportamiento real del resto del sistema. `+
              `La cobertura alcanza al <strong>${cobEst}%</strong> de los ${fmt(D._meta?.pob_estatal||0)} habitantes del estado. `+
              `El padrón registra <strong>${fmt(v.m)} mujeres</strong> (${mPct}%) y <strong>${fmt(v.h)} hombres</strong> (${hPct}%), `+
              `con un promedio de <strong>${ratio}</strong> apoyos por persona. `+
              `El <strong>${sinDPct}%</strong> no tiene edad registrada; entre quienes sí la tienen, `+
              `los adultos de 30 años en adelante suman el <strong>${adPct}%</strong>. `+
              `El <strong>${locPct}%</strong> de los beneficiarios cuenta con datos de contacto verificados.`;
          },
          SDHyBC: () => {
            const prog0 = v.programas[0]||{}, prog1 = v.programas[1]||{}, prog2 = v.programas[2]||{};
            const p0p = v.total?(prog0.total/v.total*100).toFixed(1):0;
            const p1p = v.total?(prog1.total/v.total*100).toFixed(1):0;
            const p2p = v.total?(prog2.total/v.total*100).toFixed(1):0;
            const r65 = rg['65+']||0, r65p = rangTot?(r65/rangTot*100).toFixed(1):0;
            const r1217 = rg['12-17']||0, r1217p = rangTot?(r1217/rangTot*100).toFixed(1):0;
            return `<strong style="color:${c}">SDHyBC</strong> es la institución con más programas sociales activos: `+
              `<strong>${v.programas.length} programas</strong> en <strong>63 municipios</strong> y <strong>${fmt(v.total)}</strong> beneficiarios únicos. `+
              `El programa más grande es <strong>${toTitle(prog0.nombre||'—')}</strong> con <strong>${fmt(prog0.total||0)}</strong> beneficiarios (${p0p}%), `+
              `seguido de <strong>${toTitle(prog1.nombre||'—')}</strong> con <strong>${fmt(prog1.total||0)}</strong> (${p1p}%) `+
              `y <strong>${toTitle(prog2.nombre||'Apoyo a Personas Mayores')}</strong> con <strong>${fmt(prog2.total||0)}</strong> (${p2p}%). `+
              `Los adultos mayores de 65 años representan el <strong>${r65p}%</strong> y los adolescentes de 12 a 17 el <strong>${r1217p}%</strong>, `+
              `mostrando que la institución atiende tanto a los más jóvenes como a los más mayores. `+
              `Con un promedio de <strong>${ratio}</strong> apoyos por persona —el más alto entre las instituciones con mayor número de beneficiarios—, `+
              `el <strong>${locPct}%</strong> de sus beneficiarios cuenta con datos de contacto verificados.`;
          },
          DIF: () => {
            const prog0 = v.programas[0]||{}, prog1 = v.programas[1]||{};
            const p0pct = v.total?(prog0.total/v.total*100).toFixed(1):0;
            const p1pct = v.total?(prog1.total/v.total*100).toFixed(1):0;
            const p1mPct = prog1.total?(prog1.m/prog1.total*100).toFixed(1):0;
            const p1hPct = prog1.total?(prog1.h/prog1.total*100).toFixed(1):0;
            const r1829 = rg['18-29']||0, r3049 = rg['30-49']||0;
            const adultoPct = rangTot?((r1829+r3049)/rangTot*100).toFixed(1):0;
            return `<strong style="color:${c}">DIF Chihuahua</strong> opera <strong>${v.programas.length} programas</strong> en <strong>33 municipios</strong> `+
              `con <strong>${fmt(v.total)}</strong> beneficiarios. Tiene la proporción más alta de mujeres del sistema: `+
              `<strong>${mPct}%</strong> (<strong>${fmt(v.m)}</strong>), lo que refleja que sus programas están orientados principalmente hacia jefas de hogar y mujeres en situación vulnerable. `+
              `El programa más grande es <strong>${toTitle(prog0.nombre||'—')}</strong> con <strong>${fmt(prog0.total||0)}</strong> beneficiarios (${p0pct}%). `+
              `Le sigue <strong>${toTitle(prog1.nombre||'Rehabilitación Integral')}</strong> con <strong>${fmt(prog1.total||0)}</strong> (${p1pct}%), `+
              `que es el más equilibrado en género: ${p1mPct}% mujeres y ${p1hPct}% hombres. `+
              `Los adultos de 18 a 49 años concentran el <strong>${adultoPct}%</strong> de los beneficiarios con edad registrada. `+
              `Solo el <strong>${locPct}%</strong> tiene datos de contacto verificados —la tasa más baja del sistema—, `+
              `lo que representa una oportunidad de mejora importante en la gestión del padrón.`;
          },
          SPyCI: () => {
            const r1217 = rg['12-17']||0, r1829 = rg['18-29']||0;
            const jovPct = rangTot?((r1217+r1829)/rangTot*100).toFixed(1):0;
            const prod0 = v.programas[0]||{};
            return `<strong style="color:${c}">SPyCI</strong> atiende a la <strong>población indígena chihuahuense</strong> `+
              `con <strong>${fmt(v.total)}</strong> beneficiarios en <strong>25 municipios</strong>. `+
              `El programa <strong>${toTitle(prod0.nombre||'Asistencia Social para la Población Indígena')}</strong> agrupa al <strong>99.1%</strong> del padrón (<strong>${fmt(prod0.total||0)}</strong> personas). `+
              `El <strong>${mPct}%</strong> son mujeres (<strong>${fmt(v.m)}</strong>), consistente con el rol que tienen en el acceso a servicios sociales en comunidades originarias. `+
              `Los jóvenes de 12 a 29 años representan el <strong>${jovPct}%</strong> de los beneficiarios con edad registrada, `+
              `el perfil más joven de todas las instituciones. `+
              `La tasa de localización del <strong>${locPct}%</strong> refleja los retos propios de atender comunidades en zonas de difícil acceso.`;
          },
          ICHIJUV: () => {
            const r1217 = rg['12-17']||0, r1217p = rangTot?(r1217/rangTot*100).toFixed(1):0;
            const r1829 = rg['18-29']||0, r1829p = rangTot?(r1829/rangTot*100).toFixed(1):0;
            return `<strong style="color:${c}">ICHIJUV</strong> atiende a jóvenes chihuahuenses en <strong>9 municipios</strong> `+
              `con <strong>${fmt(v.total)}</strong> beneficiarios. Es la institución con la distribución de género más equilibrada: `+
              `<strong>${fmt(v.m)} mujeres</strong> (${mPct}%) y <strong>${fmt(v.h)} hombres</strong> (${hPct}%), `+
              `lo que muestra que los programas de juventud llegan de forma similar a ambos grupos. `+
              `El <strong>${r1217p}%</strong> tiene entre 12 y 17 años y el <strong>${r1829p}%</strong> entre 18 y 29, `+
              `confirmando que los apoyos llegan efectivamente al grupo al que están dirigidos. `+
              `El promedio de <strong>${ratio}</strong> apoyos por persona indica que cada beneficiario recibe prácticamente un apoyo por ciclo. `+
              `Solo el <strong>${locPct}%</strong> tiene datos de contacto verificados, lo que dificulta el seguimiento de los beneficiarios.`;
          },
          ICHDII: () => {
            const r1829 = rg['18-29']||0, r3049 = rg['30-49']||0, r5064 = rg['50-64']||0;
            const adPct = rangTot?((r1829+r3049+r5064)/rangTot*100).toFixed(1):0;
            return `<strong style="color:${c}">ICHDII</strong> opera el <strong>Programa de Estancias Infantiles</strong> `+
              `con <strong>${fmt(v.total)}</strong> beneficiarios en <strong>1 municipio</strong>. `+
              `Su separación de SDHyBC como institución independiente permite medir y evaluar de forma propia la atención a la primera infancia. `+
              `Aunque el programa atiende a niñas y niños, el padrón registra a los <strong>adultos responsables</strong>: `+
              `el <strong>${adPct}%</strong> tiene entre 18 y 64 años, lo que indica que son los padres o cuidadores quienes aparecen en el registro. `+
              `El <strong>${mPct}%</strong> son mujeres (<strong>${fmt(v.m)}</strong>), reflejo de que son principalmente las madres quienes gestionan el acceso al servicio. `+
              `Su tasa de localización del <strong>100%</strong> es la más alta del sistema, `+
              `resultado natural de operar con un padrón pequeño y manejable.`;
          },
          CULTURA: () => {
            const prog0 = v.programas[0]||{};
            const mujPct = mPct, homPct = hPct;
            const topMun = muns;
            const topRangLabel = RANGOS_LABELS[topRang]||topRang;
            return `<strong style="color:${c}">Secretaría de Cultura</strong> promueve el acceso a expresiones artísticas, culturales y recreativas para la población chihuahuense, `+
              `operando en <strong>${topMun} municipios</strong> del estado con <strong>${fmt(v.total)}</strong> beneficiarios únicos —el <strong>${padPct}%</strong> del padrón estatal. `+
              `La institución canaliza sus apoyos a través del programa <strong>${toTitle(prog0.nombre||'Apoyos a la Cultura')}</strong>, `+
              `con un registro de <strong>${fmt(v.apoyos)}</strong> apoyos otorgados y un promedio de <strong>${ratio}</strong> apoyo por beneficiario, `+
              `lo que refleja una distribución directa e individual de sus intervenciones culturales. `+
              `La composición de género muestra una participación predominantemente femenina: <strong>${fmt(v.m)} mujeres</strong> (${mujPct}%) frente a <strong>${fmt(v.h)} hombres</strong> (${homPct}%), `+
              `con el rango etario de <strong>${topRangLabel}</strong> como el más representado dentro del padrón. `+
              `La tasa de localización del <strong>${locPct}%</strong> —con <strong>${fmt(locT)}</strong> beneficiarios con datos de contacto verificados— `+
              `indica un área de oportunidad para fortalecer el seguimiento y la medición del impacto cultural en la población atendida.`;
          },
        };

        /* Fallback para instituciones nuevas sin texto definido */
        if (texts[k]) return texts[k]();
        const progNombres = v.programas.map(p=>p.nombre).join(', ');
        return `<strong style="color:${meta.av}">${meta.fullname}</strong> opera en <strong>${muns} municipios</strong> `+
          `con <strong>${fmt(v.total)}</strong> beneficiarios únicos (<strong>${padPct}%</strong> del padrón estatal). `+
          `Composición de género: <strong>${fmt(v.m)} mujeres</strong> (${mPct}%) y <strong>${fmt(v.h)} hombres</strong> (${hPct}%). `+
          `Programas activos: ${progNombres||'—'}. `+
          `<strong>${fmt(v.apoyos)}</strong> apoyos registrados —promedio <strong>${ratio}</strong> por beneficiario. `+
          `Tasa de localización: <strong>${locPct}%</strong> (<strong>${fmt(locT)}</strong> beneficiarios con datos verificados).`;
      };

      cuerpoEl.innerHTML = textoInst(k, v, meta);
    }

    /* género */
    const sexoEl = document.getElementById('inst-sexo-'+k);
    if (sexoEl) sexoEl.innerHTML = genderBar(v.m, v.h, v.total);

    /* rangos etarios */
    const rangosEl = document.getElementById('inst-rangos-'+k);
    if (rangosEl) rangosEl.innerHTML = rangoChart(v.rangos, meta.av, v.total);


    /* barra localización */
    setTimeout(() => {
      const bar = document.getElementById('inst-loc-bar-'+k);
      if (bar) bar.style.width = locPct+'%';
      const sp  = document.getElementById('inst-loc-pct-'+k);
      if (sp)  sp.textContent  = locPct+'%';
    }, 300);

    /* KPI strip — color del número = color institucional */
    const kpiEl = document.getElementById('inst-kpi-'+k);
    if (kpiEl) kpiEl.innerHTML =
      `<div class="ss-cell" style="position:relative">
        <div style="position:absolute;top:0;left:0;right:0;height:3px;background:${meta.av}"></div>
        <div class="ss-lbl">Beneficiarios</div>
        <div class="ss-num fmt" style="color:${meta.av}">${fmt(v.total)}</div>
        <div class="ss-sub">${fmtPct(v.total,g.total_benef)} del padrón</div>
      </div>` +
      `<div class="ss-cell" style="position:relative">
        <div style="position:absolute;top:0;left:0;right:0;height:3px;background:${meta.av}"></div>
        <div class="ss-lbl">Apoyos</div>
        <div class="ss-num fmt" style="color:${meta.av}">${fmt(v.apoyos)}</div>
        <div class="ss-sub">${(v.apoyos/v.total||0).toFixed(2)} por benef.</div>
      </div>`;
  });
}

/* ════════════════════════════════════════════════
   TAB: MUNICIPIOS
════════════════════════════════════════════════ */