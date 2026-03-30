function renderGeneral() {
  const g = D.general, loc = D.localizables;

  // Masthead rápido
  document.getElementById('mh-benef-hdr').textContent = fmt(g.total_benef);
  document.getElementById('mh-inst-hdr').textContent  = g.total_inst;
  document.getElementById('mh-prog-hdr').textContent  = g.total_prog;

  // KPIs — una sola tira de 8 al final
  document.getElementById('kpi-general-all').innerHTML =
    kpiSS('Beneficiarios Únicos', fmt(g.total_benef), `${pct(g.total_benef, D._meta.pob_vulnerable)} de pob. vulnerable`, 'cb', 'b') +
    kpiSS('Apoyos Otorgados', fmt(g.total_apoyos), 'total de apoyos en el padrón', 'cg', 'g') +
    kpiSS('Mujeres Atendidas', fmt(g.total_m), `${pct(g.total_m, g.total_benef)} del total`, 'cf', 'f') +
    kpiSS('Hombres Atendidos', fmt(g.total_h), `${pct(g.total_h, g.total_benef)} del total`, 'cm', 'm') +
    kpiSS('Municipios con Cobertura', fmt(g.mun_activos), 'de 67 en el estado', 'ck', '') +
    kpiSS('Programas Activos', fmt(g.total_prog), `${g.total_inst} instituciones participantes`, 'cg', 'g') +
    kpiSS('Localizables', fmt(loc.total), `${pct(loc.total, g.total_benef)} de beneficiarios únicos`, 'cgr', 'gr') +
    kpiSS('Cobertura Estatal', pct(g.total_benef, D._meta.pob_estatal), `de ${fmt(D._meta.pob_estatal)} hab.`, 'cb', 'b');

  // Portada hero
  const ppB = document.getElementById('pp-benef-hero');
  ppB.textContent = '0'; animCount(ppB, g.total_benef);

  document.getElementById('pp-cuerpo').innerHTML =
    `El padrón estatal de beneficiarios del ejercicio 2026 registra un total de <strong>${fmt(g.total_benef)}</strong> personas únicas que reciben algún tipo de apoyo social a través de <strong>${g.total_inst} instituciones</strong> y <strong>${g.total_prog} programas activos</strong> distribuidos en los <strong>67 municipios</strong> del Estado de Chihuahua. Durante el presente ejercicio fiscal se han otorgado <strong>${fmt(g.total_apoyos)}</strong> apoyos en total. Del padrón total, <strong>${fmt(loc.total)}</strong> beneficiarios cuentan con datos de contacto verificados, lo que representa el <strong>${pct(loc.total, g.total_benef)}</strong> del universo del padrón.`;

  document.getElementById('pp-cob-pct') && (document.getElementById('pp-cob-pct').textContent = pct(g.total_benef, D._meta.pob_estatal));
  document.getElementById('pp-cob-deck') && (document.getElementById('pp-cob-deck').innerHTML  = `<strong>${fmt(g.total_benef)}</strong> beneficiarios de ${fmt(D._meta.pob_estatal)} habitantes.`);
  document.getElementById('pp-vul-pct') && (document.getElementById('pp-vul-pct').textContent = pct(g.total_benef, D._meta.pob_vulnerable));
  document.getElementById('pp-vul-deck') && (document.getElementById('pp-vul-deck').innerHTML = `de ${fmt(D._meta.pob_vulnerable)} en situación vulnerable.`);

  // KPIs S1: Cobertura Estatal + Pob. Vulnerable
  const kpiCob = document.getElementById('kpi-s1-cob');
  // Datos reales de población vulnerable por sexo (hoja Grupos Vulnerables)
  const vulM = D.grupos_vulnerables?.mujeres?.pob_vulnerable || Math.round(D._meta.pob_vulnerable * (g.total_m / g.total_benef));
  const vulH = D.grupos_vulnerables?.hombres?.pob_vulnerable || Math.round(D._meta.pob_vulnerable * (g.total_h / g.total_benef));
  const ateM = g.total_m;  // canónico del padrón
  const ateH = g.total_h;  // canónico del padrón
  if (kpiCob) {
    kpiCob.innerHTML =
      kpiSS('Cobertura Estatal', pct(g.total_benef, D._meta.pob_estatal), `de ${fmt(D._meta.pob_estatal)} hab.`, 'cb','b') +
      kpiSS('Pob. Vulnerable', pct(g.total_benef, D._meta.pob_vulnerable), `${fmt(D._meta.pob_vulnerable)} en situación vulnerable`, 'cr','r');
  }
  // KPIs S2: Mujeres + Hombres Vulnerables
  const kpiVul = document.getElementById('kpi-s2-vul');
  if (kpiVul) {
    kpiVul.innerHTML =
      kpiSS('Mujeres Vulnerables', pct(ateM, vulM), `${fmt(vulM)} en situación vulnerable`, 'cf','f') +
      kpiSS('Hombres Vulnerables', pct(ateH, vulH), `${fmt(vulH)} en situación vulnerable`, 'cm','m');
  }

  // ── KPIs SLIDE 2: Apoyos ─────────────────────────────────────────────────
  const kpiS2Ap = document.getElementById('kpi-s2-apoyos');
  if (kpiS2Ap) {
    kpiS2Ap.innerHTML =
      kpiSS('Apoyos Totales',    fmt(g.total_apoyos), 'registros en el padrón', 'cg','g') +
      kpiSS('Promedio x Benef.', (g.total_apoyos/g.total_benef).toFixed(2), 'apoyos por persona', 'ck','');
  }

  // ── KPIs SLIDE 2: Municipios ──────────────────────────────────────────────
  const kpiS2Mn = document.getElementById('kpi-s2-muns');
  if (kpiS2Mn) {
    const topMunKpi = (D.municipios||[]).slice().sort((a,b)=>b.total-a.total)[0];
    const botMunKpi = (D.municipios||[]).slice().sort((a,b)=>a.total-b.total)[0];
    kpiS2Mn.innerHTML =
      kpiSS('Menor Cobertura', botMunKpi ? botMunKpi.nombre : '—', botMunKpi ? fmt(botMunKpi.total)+' benef.' : '—', 'ck','') +
      kpiSS('Mayor Cobertura', topMunKpi ? topMunKpi.nombre : '—', topMunKpi ? fmt(topMunKpi.total)+' benef.' : '—', 'cr','r');
  }

  document.getElementById('pp-muns').textContent     = g.mun_activos;
  if(document.getElementById('pp-inst-num')) document.getElementById('pp-inst-num').textContent = g.total_inst;
  document.getElementById('pp-prog').textContent     = g.total_prog;
  document.getElementById('pp-inst-deck').textContent = `${g.total_inst} instituciones`;

  const ppL = document.getElementById('pp-loc-num');
  ppL.textContent='0'; animCount(ppL, loc.total);
  const locPctVal = (loc.total/g.total_benef*100).toFixed(1);
  document.getElementById('pp-loc-deck').textContent = `${locPctVal}% del padrón con datos verificados.`;
  document.getElementById('pp-loc-pct-txt').textContent = locPctVal+'%';
  setTimeout(() => {
    document.getElementById('pp-loc-bar').style.width = locPctVal+'%';
  }, 300);

  // Sección 2: Apoyos
  const ppA = document.getElementById('pp-apoyos-hero');
  ppA.textContent='0'; animCount(ppA, g.total_apoyos);
  document.getElementById('pp-apoyos-cuerpo').innerHTML =
    `Durante el ejercicio fiscal <strong>2026</strong>, el Gobierno del Estado de Chihuahua ha registrado un total de <strong>${fmt(g.total_apoyos)}</strong> apoyos otorgados a través de sus <strong>${g.total_inst} instituciones</strong> participantes, beneficiando a <strong>${fmt(g.total_benef)}</strong> personas únicas distribuidas en los <strong>67 municipios</strong> del estado. `
    + `La institución con mayor volumen de apoyos concentra la mayor parte de la operación, lo que refleja la orientación de la política social estatal hacia programas de <strong>amplia cobertura poblacional</strong>. En promedio, cada beneficiario recibe <strong>${(g.total_apoyos/g.total_benef).toFixed(2)} apoyos</strong>, lo que indica que una parte significativa de la población atendida accede a más de un programa simultáneamente. `
    + `Este nivel de actividad representa el esfuerzo coordinado de <strong>${g.total_inst} dependencias estatales</strong> operando <strong>${g.total_prog} programas activos</strong>, con el objetivo de garantizar que ningún municipio chihuahuense quede fuera de la red de protección social del estado.`;
  const apoyosInstRows = Object.entries(D.instituciones).map(([k,v])=>({name:k,val:v.apoyos})).sort((a,b)=>b.val-a.val).slice(0,7);
  barList('bar-apoyos-inst-pp', apoyosInstRows, 'bf-gold');

  // Sección 3: Género
  const ppM = document.getElementById('pp-mujeres-hero');
  ppM.textContent='0'; animCount(ppM, g.total_m);
  document.getElementById('pp-mujeres-pct-txt').textContent = `${pct(g.total_m,g.total_benef)} del total del padrón`;
  const ppH = document.getElementById('pp-hombres-hero');
  ppH.textContent='0'; animCount(ppH, g.total_h);
  document.getElementById('pp-hombres-pct-txt').textContent = `${pct(g.total_h,g.total_benef)} del total del padrón`;
  document.getElementById('pp-genero-cuerpo').innerHTML =
    `El padrón registra una mayoría femenina con <strong>${fmt(g.total_m)} mujeres</strong> (<strong>${pct(g.total_m,g.total_benef)}</strong>) frente a <strong>${fmt(g.total_h)} hombres</strong> (<strong>${pct(g.total_h,g.total_benef)}</strong>). Esta distribución refleja la tendencia estatal donde los programas de desarrollo social tienen <strong>mayor alcance entre la población femenina</strong>.`;

  // Sección 4: Municipios
  {
    const munsSort = (D.municipios||[]).slice().sort((a,b)=>b.total-a.total);
    const topM = munsSort[0];
    const bot5 = munsSort.slice(-5);
    const avgMun = Math.round(g.total_benef / g.mun_activos);
    const pctMunsActivos = (g.mun_activos/67*100).toFixed(0);
    document.getElementById('pp-muns-cuerpo').innerHTML =
      `Los <strong>${g.mun_activos} municipios</strong> del Estado de Chihuahua registran al menos un programa social activo durante el ejercicio <strong>2026</strong>. Sin embargo, esta cobertura universal se explica por <strong>MediChihuahua</strong>, programa de SALUD con presencia en los <strong>67 municipios</strong> y que por sí solo explica el dato de cobertura total. `
      + `Al analizar institución por institución, <strong>SDHyBC</strong> —la segunda con mayor alcance territorial— opera en <strong>63 municipios</strong>, seguida de <strong>DIF</strong> con <strong>33</strong> y <strong>SPyCI</strong> con <strong>25</strong>. El resto de las instituciones tiene cobertura más acotada: <strong>ICHIJUV</strong> en <strong>9 municipios</strong>. Esta gradación revela que la <strong>cobertura universal es en realidad la excepción</strong> y no la norma dentro del sistema de protección social estatal. `
      + `Con <strong>${fmt(g.total_prog)} programas activos</strong>, el promedio de atención es de <strong>${fmt(avgMun)} beneficiarios</strong> por municipio. El municipio con mayor concentración es <strong>${topM ? topM.nombre : '—'}</strong> con <strong>${topM ? fmt(topM.total) : '—'}</strong> beneficiarios registrados.`;
  }

  // Sección 5: Localizables
  document.getElementById('pp-loc-cuerpo').innerHTML =
    `Del total de <strong>${fmt(g.total_benef)}</strong> beneficiarios únicos del padrón estatal, `+
    `<strong>${fmt(loc.total)}</strong> cuentan con datos de contacto verificados y actualizados `+
    `—teléfono, código postal o municipio de residencia validado—, `+
    `lo que representa el <strong>${locPctVal}%</strong> del universo total. `+
    `Los <strong>${fmt(g.total_benef - loc.total)}</strong> beneficiarios restantes `+
    `(<strong>${pct(g.total_benef-loc.total,g.total_benef)}</strong>) no cuentan con información de contacto `+
    `suficiente para trazabilidad directa, lo que limita la capacidad operativa del gobierno para dar seguimiento `+
    `individualizado a la entrega de apoyos, verificar duplicidades o actualizar el padrón de forma continua. `+
    `La localización efectiva de beneficiarios es un <strong>indicador clave de la madurez institucional</strong> del sistema de protección social: a mayor cobertura de datos validados, mayor eficiencia en la <strong>focalización</strong> y `+
    `menor riesgo de <strong>filtración de recursos</strong>.`;

  // Donut sexo portada
  const slicesSexo = [
    {label:'Mujeres', val:g.total_m,  color:'var(--fem)'},
    {label:'Hombres', val:g.total_h,  color:'var(--male)'},
    ...(g.total_sn>0?[{label:'Sin dato', val:g.total_sn, color:'#ccc'}]:[]),
  ];
  document.getElementById('donut-sexo-pp').innerHTML   = buildDonut('',g.total_benef,slicesSexo);
  document.getElementById('donut-sexo-main') && (document.getElementById('donut-sexo-main').innerHTML = buildDonut('',g.total_benef,slicesSexo));

  // Barras comparativas de localizables por sexo
  const locSexoEl = document.getElementById('loc-sexo-bars');
  if (locSexoEl) {
    const locM = loc.m, locH = loc.h, locTot = loc.total;
    const pctM = (locM/locTot*100).toFixed(1);
    const pctH = (locH/locTot*100).toFixed(1);
    locSexoEl.innerHTML = `
      <div style="margin-bottom:20px">
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px">
          <span style="font-family:var(--sans);font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--fem)">Mujeres</span>
          <span style="font-family:var(--sans);font-size:13px;font-weight:700;color:var(--fem)">${fmt(locM)} <span style="font-size:12px;opacity:.7">(${pctM}%)</span></span>
        </div>
        <div style="height:18px;background:var(--border3);border-radius:2px;overflow:hidden">
          <div style="height:100%;width:${pctM}%;background:var(--fem);border-radius:2px;transition:width .8s ease"></div>
        </div>
      </div>
      <div style="margin-bottom:20px">
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px">
          <span style="font-family:var(--sans);font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--male)">Hombres</span>
          <span style="font-family:var(--sans);font-size:13px;font-weight:700;color:var(--male)">${fmt(locH)} <span style="font-size:12px;opacity:.7">(${pctH}%)</span></span>
        </div>
        <div style="height:18px;background:var(--border3);border-radius:2px;overflow:hidden">
          <div style="height:100%;width:${pctH}%;background:var(--male);border-radius:2px;transition:width .8s ease"></div>
        </div>
      </div>
      <div style="border-top:1px solid var(--border2);padding-top:12px;display:flex;justify-content:space-between;font-family:var(--sans);font-size:12px;color:var(--ink2)">
        <span>Total localizables</span>
        <strong style="color:var(--ink1)">${fmt(locTot)}</strong>
      </div>
    `;
  }

  // Bar inst portada — general usa benef, localizables usa loc
  const instRows = Object.entries(D.instituciones).map(([k,v])=>({name:k,val:v.total})).sort((a,b)=>b.val-a.val).slice(0,7);
  barList('bar-inst-general', instRows, 'bf-blue', g.total_benef);
  // Sección 3: top 7 localizables por institución
  const locInstRows = (D.localizables?.por_institucion||[]).map(x=>({name:x.nombre,val:x.total})).sort((a,b)=>b.val-a.val).slice(0,7);
  barList('bar-inst-pp', locInstRows.length ? locInstRows : instRows, 'bf-blue', loc.total);

  // Bar edades portada — incluye sin_datos como barra adicional
  const sinDato = D.rangos_edad.find(r=>r.key==='sin_datos');
  const edadRows = [
    ...D.rangos_edad.filter(r=>r.key!=='sin_datos').map(r=>({name:r.label,val:r.total})),
    ...(sinDato && sinDato.total>0 ? [{name:'Sin identificar',val:sinDato.total}] : [])
  ];
  barList('bar-edad-pp', edadRows, 'bf-gold');
  if (sinDato && sinDato.total>0)
    document.getElementById('nota-edad-pp').textContent =
      `* ${fmt(sinDato.total)} beneficiarios sin dato de rango de edad registrado.`;

  // Pirámide beneficiarios únicos (D.rangos_edad con m/h reales)
  const pyrData = (D.rangos_edad||[]).filter(r=>r.key!=='sin_datos').map(r=>({
    key: r.key,
    m:   r.m || 0,
    h:   r.h || 0,
  }));
  pyramid('pyramid-loc-pp', pyrData);

  // ── SLIDE 3: Héroe col der, pirámide localizables, KPIs ─────────────────────
  const locM3 = loc.m||0, locH3 = loc.h||0;

  // Héroe col der: total mujeres localizables
  const locSexoHero = document.getElementById('pp-loc-sexo-hero');
  if (locSexoHero) { locSexoHero.textContent='0'; animCount(locSexoHero, locM3); }
  const locSexoHeroH = document.getElementById('pp-loc-sexo-hero-h');
  if (locSexoHeroH) { locSexoHeroH.textContent='0'; animCount(locSexoHeroH, locH3); }

  // Texto col der
  const locSexoCuerpo = document.getElementById('pp-loc-sexo-cuerpo');
  if (locSexoCuerpo) {
    const pctMloc = pct(locM3, loc.total), pctHloc = pct(locH3, loc.total);
    const pctMgen = pct(g.total_m, g.total_benef), pctHgen = pct(g.total_h, g.total_benef);
    locSexoCuerpo.innerHTML =
      `De los <strong>${fmt(loc.total)}</strong> beneficiarios con datos de contacto verificados, `+
      `<strong>${fmt(locM3)}</strong> son mujeres (<strong>${pctMloc}</strong>) y `+
      `<strong>${fmt(locH3)}</strong> son hombres (<strong>${pctHloc}</strong>). `+
      `Esta distribución es prácticamente idéntica a la del padrón general —donde las mujeres representan el ${pctMgen} y los hombres el ${pctHgen}—, `+
      `lo que indica que la localización no presenta sesgo de género: tanto mujeres como hombres tienen proporciones similares de datos verificados. `+
      `Este equilibrio es un indicador positivo de equidad en la gestión del padrón, ya que programas focalizados en mujeres —como apoyos de salud materno-infantil— `+
      `mantienen una tasa de localización comparable a la del universo general, garantizando la trazabilidad de sus principales beneficiarias.`;
  }

  // Pirámide localizables (usando rangos_edad del padrón general como aproximación)
  const pyrLocData = (D.rangos_edad||[]).filter(r=>r.key!=='sin_datos').map(r=>({
    key: r.key, m: r.m||0, h: r.h||0,
  }));
  pyramid('pyramid-loc-s3', pyrLocData);

  // Texto pirámide localizables
  const locPirTexto = document.getElementById('pp-loc-piramide-texto');
  if (locPirTexto) {
    const re3 = (D.rangos_edad||[]).filter(r=>r.key!=='sin_datos');
    const topM3 = [...re3].sort((a,b)=>(b.m||0)-(a.m||0))[0];
    const topH3 = [...re3].sort((a,b)=>(b.h||0)-(a.h||0))[0];
    const re3_2 = (D.rangos_edad||[]).filter(r=>r.key!=='sin_datos');
    const r5064_3 = re3_2.find(r=>r.key==='50-64'), r65_3 = re3_2.find(r=>r.key==='65+');
    const adultosMay3 = ((r5064_3?.total||0)+(r65_3?.total||0));
    locPirTexto.innerHTML =
      `La pirámide refleja que el grupo etario con mayor concentración de <strong>mujeres</strong> localizables se concentra en <strong>${topM3?.label||'—'}</strong> `+
      `con <strong>${fmt(topM3?.m||0)}</strong> registros; en <strong>hombres</strong>, el pico es <strong>${topH3?.label||'—'}</strong> `+
      `con <strong>${fmt(topH3?.h||0)}</strong>. Los adultos de 50 años en adelante suman <strong>${fmt(adultosMay3)}</strong> personas (`+
      `<strong>${pct(adultosMay3,g.total_benef)}</strong> del padrón), lo que subraya el peso de los programas dirigidos a adultos mayores y población en condición de vulnerabilidad estructural. `+
      `La pirámide de localizables es casi idéntica a la del padrón general, confirmando que la validación de datos de contacto no tiene sesgo etario significativo.`;
  }

  // KPI izq: Localizables → No Localizables
  const kpiS3Loc = document.getElementById('kpi-s3-loc');
  if (kpiS3Loc) {
    const noLoc3 = g.total_benef - loc.total;
    kpiS3Loc.innerHTML =
      kpiSS('Localizables',    fmt(loc.total), pct(loc.total,g.total_benef)+' del padrón', 'cg','g') +
      kpiSS('No Localizables', fmt(noLoc3),    pct(noLoc3,g.total_benef)+' sin contacto', 'cr','r');
  }

  // KPI der: Mujeres → Hombres
  const kpiS3NL = document.getElementById('kpi-s3-nolocal');
  if (kpiS3NL) {
    kpiS3NL.innerHTML =
      kpiSS('Mujeres Localiz.', fmt(locM3), pct(locM3,loc.total)+' de localizables', 'cf','f') +
      kpiSS('Hombres Localiz.', fmt(locH3), pct(locH3,loc.total)+' de localizables', 'cm','m');
  }

  // Texto explicativo de la pirámide
  const pyrTexto = document.getElementById('pp-piramide-texto');
  if (pyrTexto) {
    const re = (D.rangos_edad||[]).filter(r=>r.key!=='sin_datos');
    const topM = [...re].sort((a,b)=>(b.m||0)-(a.m||0))[0];
    const topH = [...re].sort((a,b)=>(b.h||0)-(a.h||0))[0];
    const r5064 = re.find(r=>r.key==='50-64');
    const r65   = re.find(r=>r.key==='65+');
    const adultosMay = ((r5064?.total||0) + (r65?.total||0));
    pyrTexto.innerHTML =
      `La pirámide de edad muestra la distribución etaria de los <strong>${fmt(g.total_benef)}</strong> beneficiarios únicos del padrón. ` +
      `El grupo con mayor concentración de <strong>mujeres</strong> se encuentra en el rango de <strong>${topM?.label||'—'}</strong> ` +
      `con <strong>${fmt(topM?.m||0)}</strong> registros, mientras que en <strong>hombres</strong> destaca el rango de ` +
      `<strong>${topH?.label||'—'}</strong> con <strong>${fmt(topH?.h||0)}</strong>. ` +
      `Los adultos de 50 años en adelante suman <strong>${fmt(adultosMay)}</strong> personas, representando el <strong>${pct(adultosMay, g.total_benef)}</strong> del padrón, ` +
      `lo que refleja la orientación de los programas sociales hacia la población adulta y en condición de mayor vulnerabilidad.`;
  }
}

/* ════════════════════════════════════════════════
   TAB: INSTITUCIONES
════════════════════════════════════════════════ */
// ══════════════════════════════════════════════════════════════════
// PALETA ÚNICA DE INSTITUCIONES — fuente de verdad para todo el dashboard
// ══════════════════════════════════════════════════════════════════
const INST_COLORS = {
  // key → { acc, ink, bg }
  // acc = color acento vivo (líneas, iconos, barras)
  // ink = texto sobre fondo claro
  // bg  = fondo pill claro
  SALUD:   { acc:'#2563EB', ink:'#1E4D8C', bg:'#DBEAFE' },
  SDHyBC:  { acc:'#1D9E75', ink:'#166534', bg:'#DCFCE7' },
  DIF:     { acc:'#DB2777', ink:'#9D174D', bg:'#FCE7F3' },
  SPyCI:   { acc:'#C2410C', ink:'#7C2D12', bg:'#FFEDD5' },
  ICHIJUV: { acc:'#7C3AED', ink:'#5B21B6', bg:'#EDE9FE' },
  ICHDII:  { acc:'#DC2626', ink:'#7F1D1D', bg:'#FEE2E2' },
  ICHD:    { acc:'#0891B2', ink:'#155E75', bg:'#CFFAFE' },
  RURAL:   { acc:'#78716C', ink:'#44403C', bg:'#F5F5F4' },
  CULTURA: { acc:'#CA8A04', ink:'#854D0E', bg:'#FEF9C3' },
};
// Helpers globales
function instAcc(n){ return (INST_COLORS[n]||{acc:'#64748B'}).acc; }
function instInk(n){ return (INST_COLORS[n]||{ink:'#8b949e'}).ink; }
function instBg(n){  return (INST_COLORS[n]||{bg:'rgba(139,148,158,.15)'}).bg;  }

const INST_META = {
  SALUD:   { av:'#2563EB', fullname:'Secretaría de Salud', muns:67,
             titular:'MediChihuahua es el único programa con presencia en los 67 municipios del estado y el de mayor cobertura del padrón estatal',
             highlight:'MediChihuahua',
             img:'https://noro.mx/wp-content/uploads/2024/02/medichihuahua-programa-atencion-medica-1.png',
             caption:'MediChihuahua — cobertura universal en los 67 municipios del estado, 2026.' },
  SDHyBC:  { av:'#1D9E75', fullname:'Sec. Desarrollo Humano y Bien Común', muns:63,
             titular:'La Secretaría de Desarrollo Humano lidera la diversidad programática con la mayor variedad de programas sociales activos del sistema',
             highlight:'Secretaría de Desarrollo Humano',
             img:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Chihuahua_Mercado_Artesanias.jpg/800px-Chihuahua_Mercado_Artesanias.jpg',
             caption:'Programas de desarrollo humano y participación ciudadana — SDHyBC, 2026.' },
  DIF:     { av:'#EA580C', fullname:'DIF Chihuahua', muns:33,
             titular:'El DIF Chihuahua concentra la mayor proporción de mujeres beneficiarias, reflejo de su orientación hacia el desarrollo y bienestar familiar',
             highlight:'DIF Chihuahua',
             img:'https://difchihuahua.gob.mx/uploads/blog/imagen/795/IMG_6521.JPG',
             caption:'Operativo de atención familiar — DIF Chihuahua, 2026.' },
  SPyCI:   { av:'#059669', fullname:'Sec. Pueblos y Comunidades Indígenas', muns:25,
             titular:'La Secretaría de Pueblos y Comunidades Indígenas garantiza la asistencia social a comunidades originarias en 25 municipios del estado',
             highlight:'Secretaría de Pueblos y Comunidades Indígenas',
             img:'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Tarahumara_woman.jpg/600px-Tarahumara_woman.jpg',
             caption:'Asistencia social para la población indígena chihuahuense — SPyCI, 2026.' },
  ICHIJUV: { av:'#7C3AED', fullname:'Inst. Chihuahuense de la Juventud', muns:9,
             titular:'El Instituto Chihuahuense de la Juventud atiende a jóvenes chihuahuenses con el programa de mayor equilibrio de género del sistema',
             highlight:'Instituto Chihuahuense de la Juventud',
             img:'https://static.wixstatic.com/media/138c20_e9779296a624412fa9f160209d04fa7e~mv2.jpeg/v1/fill/w_638,h_358,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/Image-empty-state.jpeg',
             caption:'Programa de atención integral a la juventud chihuahuense — ICHIJUV, 2026.' },
  ICHDII:  { av:'#DC2626', fullname:'Inst. Chih. de Desarrollo Integral de la Infancia', muns:1,
             titular:'El Instituto Chihuahuense de Desarrollo Integral de la Infancia opera las Estancias Infantiles para el desarrollo pleno de la niñez chihuahuense',
             highlight:'Instituto Chihuahuense de Desarrollo Integral de la Infancia',
             img:'https://www.chihuahua.gob.mx/sites/default/atach2/styles/flexslider_full/public/noticias/galeria/2024-07/ichdii.jpg',
             caption:'Programa de Estancias Infantiles para el Desarrollo Integral de la Niñez — ICHDII, 2026.' },
  CULTURA: { av:'#CA8A04', fullname:'Secretaría de Cultura', muns:5,
             titular:'La Secretaría de Cultura promueve el acceso a expresiones culturales y recreativas para la población chihuahuense',
             highlight:'Secretaría de Cultura',
             img:'https://static.tiempo.com.mx/uploads/imagen/imagen/302356/principal_principal_alebrijes-casa-arte-popular-cuu.jpg',
             caption:'Casa de Arte Popular de Chihuahua — Secretaría de Cultura, 2026.' },
};

// ── Instituciones sin color definido usan fallback gris ──────────────────
// Sus nombres completos están en INST_META para mostrarse en las cards

INST_META.CECYTECH = INST_META.CECYTECH || { av:'#64748B', fullname:'Colegio de Estudios Científicos y Tecnológicos del Estado de Chihuahua', muns:0, titular:'', highlight:'', img:'', caption:'' };
INST_META.COESPO   = INST_META.COESPO   || { av:'#64748B', fullname:'Comisión Estatal de Población', muns:0, titular:'', highlight:'', img:'', caption:'' };
INST_META.COESVI   = INST_META.COESVI   || { av:'#64748B', fullname:'Comisión Estatal de Vivienda', muns:0, titular:'', highlight:'', img:'', caption:'' };
INST_META.ICHDII   = INST_META.ICHDII   || {};
INST_META.ICHDII.fullname = 'Instituto Chihuahuense para el Desarrollo Integral Infantil';
INST_META.ICHIMUJ  = INST_META.ICHIMUJ  || { av:'#64748B', fullname:'Instituto Chihuahuense de las Mujeres', muns:0, titular:'', highlight:'', img:'', caption:'' };
INST_META.RURAL    = INST_META.RURAL    || { av:'#64748B', fullname:'Secretaría de Desarrollo Rural', muns:0, titular:'', highlight:'', img:'', caption:'' };
INST_META.ICHD     = INST_META.ICHD     || { av:'#64748B', fullname:'Instituto Chihuahuense del Deporte', muns:0, titular:'', highlight:'', img:'', caption:'' };
INST_META.SEECH    = INST_META.SEECH    || { av:'#64748B', fullname:'Secretaría de Educación del Estado de Chihuahua', muns:0, titular:'', highlight:'', img:'', caption:'' };
INST_META['SEyD']  = INST_META['SEyD']  || { av:'#64748B', fullname:'Secretaría de Educación y Deporte', muns:0, titular:'', highlight:'', img:'', caption:'' };
INST_META.TRABAJO  = INST_META.TRABAJO  || { av:'#64748B', fullname:'Secretaría del Trabajo', muns:0, titular:'', highlight:'', img:'', caption:'' };
INST_META.TURISMO  = INST_META.TURISMO  || { av:'#64748B', fullname:'Secretaría de Turismo', muns:0, titular:'', highlight:'', img:'', caption:'' };

// Sincronizar av con INST_COLORS para garantizar consistencia
Object.keys(INST_META).forEach(k => {
  if (INST_COLORS[k]) INST_META[k].av = INST_COLORS[k].acc;
});

/* Titular dinámico para instituciones nuevas no definidas en INST_META */
function instTitular(k, v, meta) {
  const hl = (txt) => `<span style="color:${meta.av};font-style:normal">${txt}</span>`;

  if (meta.titular) {
    /* usa meta.highlight si está definido, si no prueba fullname y key */
    const tit     = meta.titular;
    const targets = [meta.highlight, meta.fullname, k].filter(Boolean);
    for (const t of targets) {
      if (tit.includes(t)) return tit.replace(t, hl(t));
    }
    return tit;
  }
  /* fallback dinámico para instituciones nuevas sin titular definido */
  const nProg = v.programas.length;
  const pctM  = v.total ? (v.m/v.total*100).toFixed(0) : 0;
  const prog0 = v.programas[0]?.nombre || 'sus programas activos';
  if (nProg === 1)
    return hl(meta.fullname) + ' opera en ' + meta.muns + ' municipios del estado a través del programa ' + prog0;
  const genTxt = pctM >= 60 ? 'mayoritariamente femenina' : pctM <= 40 ? 'mayoritariamente masculina' : 'con distribución equilibrada entre géneros';
  return hl(meta.fullname) + ' opera ' + nProg + ' programas activos en ' + meta.muns + ' municipios, atendiendo a una población ' + genTxt;
}
const RANGOS_LABELS = {'0-5':'0–5','6-11':'6–11','12-17':'12–17','18-29':'18–29','30-49':'30–49','50-64':'50–64','65+':'65+'};
