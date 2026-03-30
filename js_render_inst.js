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
    const sinD = rangos['sin_datos'] || 0;
    const allKeys = [...keys, ...(sinD > 0 ? ['sin_datos'] : [])];
    const allLabels = {...RANGOS_LABELS, 'sin_datos': 'Sin identificar'};
    const vals  = allKeys.map(k => rangos[k]||0);
    const tot   = vals.reduce((s,x)=>s+x,0) || 1;
    return allKeys.map((k,i) => {
      const w   = (vals[i]/tot*100).toFixed(1);
      const isSin = k === 'sin_datos';
      const barColor = isSin ? 'rgba(100,100,100,.4)' : av;
      return `<div style="margin-bottom:6px">
        <div style="font-family:var(--sans);font-size:13px;font-weight:700;color:${isSin?'var(--ink3)':'var(--ink2)'};margin-bottom:1px">${allLabels[k]}</div>
        <div style="display:flex;align-items:center;gap:8px">
          <div style="flex:1;height:20px;background:var(--border3);border-radius:2px;overflow:hidden">
            <div style="height:100%;width:${w}%;background:${barColor};border-radius:2px;transition:width .8s ease${isSin?';opacity:.7':''}"></div>
          </div>
          <div style="font-family:var(--sans);font-size:13px;color:${isSin?'var(--ink3)':'var(--ink2)'};width:90px;flex-shrink:0;white-space:nowrap;text-align:right">${fmt(vals[i])} <span style="opacity:.6;font-size:11px">${w}%</span></div>
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
      <div class="np-2col mt4">

        <!-- COL IZQ: kicker · titular (sin número) + imagen inline · texto · KPIs -->
        <div class="np-2col-art" style="display:flex;flex-direction:column">
          <div class="kicker mb8 mt12" style="color:${meta.av}">${meta.fullname} · ${meta.muns} municipios</div>

          <!-- Titular texto + imagen en fila -->
          <div style="display:grid;grid-template-columns:1fr auto;gap:14px;align-items:start">
            <div style="font-family:var(--head);font-weight:900;line-height:1.05;color:var(--ink);font-size:36px">
              ${instTitular(k, v, meta)}
            </div>
            <div id="inst-img-wrap-${k}" style="width:180px;aspect-ratio:4/3;flex-shrink:0;overflow:hidden;border:1px solid ${meta.av}33">
              <img src="${meta.img}" alt="${meta.fullname}"
                style="width:100%;height:100%;object-fit:cover;display:block;"
                onerror="this.style.display='none';document.getElementById('inst-img-ph-${k}').style.display='flex'">
              <div id="inst-img-ph-${k}" style="display:none;width:100%;height:100%;background:${meta.av}12;align-items:center;justify-content:center;flex-direction:column;gap:6px">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="${meta.av}" stroke-width="1.2" opacity=".5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <div style="font-family:var(--sans);font-size:13px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${meta.av};opacity:.7;text-align:center;padding:0 6px">${k}</div>
              </div>
            </div>
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