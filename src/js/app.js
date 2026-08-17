
const LOGO_PROGERAL = "__LOGO_PROGERAL__";

const FLAGS_B64 = {
  BR: "__FLAG_BR__",
  CN: "__FLAG_CN__",
  MX: "__FLAG_MX__"
};

const MARKERS_B64 = {
  BR: "__MARKER_BR__",
  CN: "__MARKER_CN__",
  MX: "__MARKER_MX__"
};

const PLANT_BANNERS = {
  b1: "__PLANT_B1__",
  b2: "__PLANT_B2__",
  b3: "__PLANT_B3__"
};

let currentPlantBanner = 'b1';
let currentSloganText = "Precisão que conecta.<br>Qualidade que move.";
let currentFooterIcon = "target";
let currentGridStyle = 'solid';
let customPlantImage = '';
let exportScale = 3;

const MESES_PT = ['JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO','JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO'];
const MESES_EN = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
const MESES_ES = ['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];
const MESES_PT_SLUG = ['janeiro','fevereiro','marco','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const DIAS_SEMANA_PT = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];

const DIAS_FULL = [
  ['Domingo','Sunday | Domingo'],['Segunda','Monday | Lunes'],['Terça','Tuesday | Martes'],
  ['Quarta','Wednesday | Miércoles'],['Quinta','Thursday | Jueves'],['Sexta','Friday | Viernes'],['Sábado','Saturday | Sábado']
];
const DIAS_ABR = [
  ['Dom','Sun | Dom'],['Seg','Mon | Lun'],['Ter','Tue | Mar'],['Qua','Wed | Mié'],
  ['Qui','Thu | Jue'],['Sex','Fri | Vie'],['Sáb','Sat | Sáb']
];
const DIAS_FULL_MON = [
  ['SEG','MON'],['TER','TUE'],['QUA','WED'],['QUI','THU'],['SEX','FRI'],['SAB','SAT'],['DOM','SUN']
];
const DIAS_MINI_MON = ['SEG','TER','QUA','QUI','SEX','SAB','DOM'];

const COUNTRY_NAMES = {
  BR:'Brasil', MX:'México', CN:'China', US:'Estados Unidos', PT:'Portugal', AR:'Argentina',
  GB:'Reino Unido', DE:'Alemanha', FR:'França', ES:'Espanha', IT:'Itália', CA:'Canadá',
  JP:'Japão', NL:'Países Baixos', AU:'Austrália'
};

function flagEmoji(code){
  return code.toUpperCase().replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

function getFlagImgHTML(code){
  if(FLAGS_B64[code]){
    return '<img class="flag-img" src="'+FLAGS_B64[code]+'" alt="'+code+'">';
  }
  return '<span class="flagemoji" style="font-size:18px;">'+flagEmoji(code)+'</span>';
}

function getMarkerImgHTML(code){
  if(code === 'MANUAL'){
    return '<span style="font-size:15px;line-height:1;color:#d4af37;">&#9733;</span>';
  }
  if(MARKERS_B64[code]){
    return '<img class="marker-img" src="'+MARKERS_B64[code]+'" alt="'+code+'">';
  }
  return '<span style="font-size:13px;line-height:1;">'+flagEmoji(code)+'</span>';
}

function getMiniMarkerImgHTML(code){
  if(code === 'MANUAL'){
    return '<span style="font-size:9px;line-height:1;color:#d4af37;">&#9733;</span>';
  }
  if(MARKERS_B64[code]){
    return '<img class="mini-marker-img" src="'+MARKERS_B64[code]+'" alt="'+code+'">';
  }
  return '<span style="font-size:8px;line-height:1;">'+flagEmoji(code)+'</span>';
}

function holidaysFor(key){
  const list = (holidaysMap[key] || []).slice();
  if(MANUAL_HOLIDAYS[key]) list.push({code:'MANUAL', name:'Feriado manual'});
  return list;
}

let currentTemplate = 'original';
let uid = 0;
let holidaysMap = {};
let MANUAL_HOLIDAYS = {};
let holidaysYearLoaded = null;
let selectedCountries = ['BR','MX','CN'];
let topImageSrc = '';
let bottomImageSrc = '';
let currentDateOutline = false;

/* FUNÇÕES DE TEMAS, CORES E FONTES */
function changeFontFamily(val){
  const r = document.documentElement.style;
  if(val === 'outfit'){
    r.setProperty('--font-title', "'Outfit', sans-serif");
    r.setProperty('--font-body', "'Outfit', sans-serif");
  } else if(val === 'montserrat'){
    r.setProperty('--font-title', "'Montserrat', sans-serif");
    r.setProperty('--font-body', "'Montserrat', sans-serif");
  } else if(val === 'roboto'){
    r.setProperty('--font-title', "'Roboto', sans-serif");
    r.setProperty('--font-body', "'Roboto', sans-serif");
  } else if(val === 'playfair'){
    r.setProperty('--font-title', "'Playfair Display', serif");
    r.setProperty('--font-body', "'Inter', sans-serif");
  } else if(val === 'mono'){
    r.setProperty('--font-title', "'IBM Plex Mono', monospace");
    r.setProperty('--font-body', "'IBM Plex Mono', monospace");
  } else {
    r.setProperty('--font-title', "'Fraunces', Georgia, serif");
    r.setProperty('--font-body', "'Inter', Arial, sans-serif");
  }
  saveState();
}

const THEMES = {
  navy: { p: '#071938', s: '#0B1F3F', w: '#F4F6FB' },
  safira: { p: '#002D62', s: '#0055A5', w: '#EBF3FA' },
  grafite: { p: '#1A212D', s: '#2E3A4E', w: '#EEF1F5' },
  esmeralda: { p: '#0A3326', s: '#12543F', w: '#E8F3EF' },
  bordo: { p: '#420D16', s: '#6B1D2F', w: '#F9EFEF' }
};

function changeTheme(val){
  const t = THEMES[val] || THEMES.navy;
  document.getElementById('primaryColorPicker').value = t.p;
  document.getElementById('secondaryColorPicker').value = t.s;
  document.getElementById('weekendColorPicker').value = t.w;
  updateCustomColors();
}

function updateCustomColors(){
  const p = document.getElementById('primaryColorPicker').value;
  const s = document.getElementById('secondaryColorPicker').value;
  const w = document.getElementById('weekendColorPicker').value;
  const r = document.documentElement.style;
  r.setProperty('--navy-deep', p);
  r.setProperty('--navy', s);
  r.setProperty('--weekend-bg', w);
  saveState();
}

function applySloganPreset(val){
  currentSloganText = val;
  const el = document.getElementById('footerText');
  if(el) el.innerHTML = val;
  saveState();
}

function changeFooterIcon(val){
  currentFooterIcon = val;
  saveState();
  const el = document.getElementById('footerIconBox');
  if(!el) return;
  if(val === 'star'){
    el.className = '';
    el.style.display = 'flex';
    el.innerHTML = '<span style="font-size:20px;color:var(--navy-deep);">&#9733;</span>';
  } else if(val === 'none'){
    el.style.display = 'none';
  } else {
    el.className = 'ico-target';
    el.style.display = 'flex';
    el.innerHTML = '<span></span>';
  }
}

function changePlantBanner(val){
  currentPlantBanner = val;
  const {y,m} = currentYM();
  refreshCurrentView(y, m);
  saveState();
}

function changeGridStyle(val){
  currentGridStyle = val;
  const {y,m} = currentYM();
  refreshCurrentView(y, m);
  saveState();
}
window.changeGridStyle = changeGridStyle;

function setDateOutline(on){
  currentDateOutline = !!on;
  const {y,m} = currentYM();
  refreshCurrentView(y, m);
  saveState();
}

function renderCountryChips(){
  const box = document.getElementById('countryChips');
  box.innerHTML = selectedCountries.map(code =>
    '<span style="display:inline-flex;align-items:center;gap:5px;background:#f2f0e8;border:1px solid var(--line);border-radius:20px;padding:4px 6px 4px 10px;font-size:12px;font-weight:600;color:var(--navy);">'
    + (FLAGS_B64[code] ? '<img src="'+FLAGS_B64[code]+'" style="width:18px;height:12px;border-radius:2px;object-fit:cover;">' : flagEmoji(code))
    + ' ' + (COUNTRY_NAMES[code]||code)
    + '<button onclick="removeCountryChip(&quot;' + code + '&quot;)" style="border:none;background:#e2ddce;color:#444;border-radius:50%;width:16px;height:16px;line-height:1;cursor:pointer;font-size:11px;">×</button></span>'
  ).join('');
}
function addCountryChip(code){
  if(!code || selectedCountries.includes(code)) return;
  selectedCountries.push(code);
  renderCountryChips();
  const {y,m} = currentYM();
  refreshCurrentView(y, m);
  saveState();
}
function removeCountryChip(code){
  selectedCountries = selectedCountries.filter(c => c !== code);
  renderCountryChips();
  const {y,m} = currentYM();
  refreshCurrentView(y, m);
  saveState();
}

function titleFor(year, m){
  return MESES_PT[m] + ' ' + year + ' | ' + MESES_EN[m] + ' ' + year + ' | ' + MESES_ES[m] + ' ' + year;
}

function shiftMonth(year, m, delta){
  let mm = m + delta, yy = year;
  if(mm < 0){ mm = 11; yy--; }
  if(mm > 11){ mm = 0; yy++; }
  return {y: yy, m: mm};
}

function buildWeeks(year, m){
  const firstDay = new Date(year, m, 1).getDay();
  const numDays = new Date(year, m+1, 0).getDate();
  const weeks = [];
  let week = new Array(7).fill(null);
  let col = firstDay;
  for(let d=1; d<=numDays; d++){
    week[col] = d;
    col++;
    if(col === 7){ weeks.push(week); week = new Array(7).fill(null); col = 0; }
  }
  if(week.some(x => x !== null)) weeks.push(week);
  return weeks;
}

function buildWeeksMon(year, m){
  const firstDay = (new Date(year, m, 1).getDay() + 6) % 7;
  const numDays = new Date(year, m+1, 0).getDate();
  const weeks = [];
  let week = new Array(7).fill(null);
  let col = firstDay;
  for(let d=1; d<=numDays; d++){
    week[col] = d;
    col++;
    if(col === 7){ weeks.push(week); week = new Array(7).fill(null); col = 0; }
  }
  if(week.some(x => x !== null)) weeks.push(week);
  return weeks;
}

function dateKey(year, m, d){
  return year+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
}

function theadHTML(dias){
  let h = '<tr><th class="week-h"><span class="l1">Semana</span><span class="l2">Week | Semana</span></th>';
  dias.forEach(d => { h += '<th><span class="l1">'+d[0]+'</span><span class="l2">'+d[1]+'</span></th>'; });
  h += '</tr>';
  return h;
}

function tbodyHTML(weeks, year, m){
  let h = '';
  weeks.forEach((week, i) => {
    h += '<tr>';
    h += '<td class="week-num" contenteditable="true">'+String(i+1).padStart(2,'0')+'</td>';
    week.forEach((d,ci) => {
      const wknd = (ci===0 || ci===6) ? ' weekend' : '';
      if(d===null){
        h += '<td class="day'+wknd+'" contenteditable="true"></td>';
      } else {
        const key = dateKey(year,m,d);
        const hs = holidaysFor(key);
        const isHoliday = hs.length > 0;
        const hcls = isHoliday ? ' holiday' : '';
        const title = isHoliday ? ' title="'+hs.map(h=>h.name).join(', ').replace(/"/g,'')+'"' : '';
        let markersHTML = '';
        if(isHoliday){
          markersHTML = '<span style="position:absolute;bottom:6px;right:8px;display:flex;gap:3px;align-items:center;">'
            + hs.map(h => getMarkerImgHTML(h.code)).join('') + '</span>';
        }
        h += '<td class="day'+wknd+hcls+'" data-date="'+key+'" contenteditable="true"'+title+'>'+d+markersHTML+'</td>';
      }
    });
    h += '</tr>';
  });
  return h;
}

function tableHTML(year, m, dias, bodyId){
  const weeks = buildWeeks(year, m);
  return '<table class="cal"><thead>'+theadHTML(dias)+'</thead><tbody id="'+bodyId+'">'+tbodyHTML(weeks, year, m)+'</tbody></table>'
    + '<div class="row-controls"><button class="btn small secondary" onclick="addRow(&quot;' + bodyId + '&quot;)">+ Semana</button>'
    + '<button class="btn small secondary" onclick="removeRow(&quot;' + bodyId + '&quot;)">− Semana</button></div>';
}

function holidaysListForMonth(year, m){
  const prefix = year+'-'+String(m+1).padStart(2,'0');
  const keys = new Set(Object.keys(holidaysMap).concat(Object.keys(MANUAL_HOLIDAYS)));
  return Array.from(keys)
    .filter(k => k.startsWith(prefix))
    .sort()
    .map(k => k.slice(8,10)+'/'+k.slice(5,7)+' — '+holidaysFor(k).map(h=>h.name).join(' / '));
}

function panelsHTML(year, m){
  const items = holidaysListForMonth(year, m);
  const holLines = () => {
    let out = '';
    for(let i=0;i<5;i++){
      out += '<div class="line" contenteditable="true">'+(items[i] || '')+'</div>';
    }
    return out;
  };
  const notesLines = () => '<div class="line" contenteditable="true"></div>'.repeat(5);
  return '<div class="panels">'
    + '<div class="panel"><h3>Feriados<small>Holidays | Feriados</small></h3>'+holLines()+'</div>'
    + '<div class="panel"><h3>Anotações<small>Notes | Anotaciones</small></h3>'+notesLines()+'</div>'
    + '</div>';
}

/* ---------- HERO PADRONIZADO (todos os modelos) ---------- */
function renderCalHero(year, m){
  const plantSrc = customPlantImage || topImageSrc || PLANT_BANNERS[currentPlantBanner] || PLANT_BANNERS.b1;
  let html = '<div class="cal-hero">';
  html += '<div class="cal-hero-photo"><img src="'+plantSrc+'" alt="Foto institucional Progeral"></div>';
  html += '<div class="cal-hero-logo"><img src="'+LOGO_PROGERAL+'" alt="Progeral"></div>';
  html += '<div class="cal-hero-label">';
  html += '<div class="hero-month">'+MESES_PT[m]+' '+year+'</div>';
  html += '<div class="hero-sub">'+MESES_EN[m]+' · '+MESES_ES[m]+'</div>';
  html += '<div class="hero-rule"></div>';
  html += '</div></div>';
  return html;
}

function renderClassicLike(year, m){
  const prev = shiftMonth(year, m, -1);
  uid++;
  const idMain = 'body-main-'+uid, idSec = 'body-sec-'+uid;
  let html = renderCalHero(year, m);
  html += '<div class="cal-wrap">';
  html += '<div class="cal-col"><div class="title-box"><span>'+titleFor(year,m)+'</span></div>'+tableHTML(year,m,DIAS_FULL,idMain)+'</div>';
  html += '<div class="cal-col small"><div class="title-box"><span>'+titleFor(prev.y,prev.m)+'</span></div>'+tableHTML(prev.y,prev.m,DIAS_ABR,idSec)+panelsHTML(year,m)+'</div>';
  html += '</div>';
  html += countriesFooterHTML();
  return html;
}

function renderCompact(year, m){
  uid++;
  const idMain = 'body-main-'+uid;
  let html = renderCalHero(year, m);
  html += '<div class="compact-wrap"><div class="cal-col">';
  html += '<div class="title-box"><span>'+titleFor(year,m)+'</span></div>'+tableHTML(year,m,DIAS_FULL,idMain);
  html += '</div></div>';
  html += countriesFooterHTML();
  return html;
}

function renderQuarterly(year, m){
  const prev = shiftMonth(year, m, -1);
  const next = shiftMonth(year, m, 1);
  uid++;
  const idPrev = 'body-p-'+uid, idCur = 'body-c-'+uid, idNext = 'body-n-'+uid;
  let html = renderCalHero(year, m);
  html += '<div class="cal-wrap triple">';
  html += '<div class="cal-col third"><div class="title-box"><span>'+titleFor(prev.y,prev.m)+'</span></div>'+tableHTML(prev.y,prev.m,DIAS_ABR,idPrev)+'</div>';
  html += '<div class="cal-col third"><div class="title-box"><span>'+titleFor(year,m)+'</span></div>'+tableHTML(year,m,DIAS_ABR,idCur)+'</div>';
  html += '<div class="cal-col third"><div class="title-box"><span>'+titleFor(next.y,next.m)+'</span></div>'+tableHTML(next.y,next.m,DIAS_ABR,idNext)+'</div>';
  html += '</div>';
  html += countriesFooterHTML();
  return html;
}

function renderDesk(year, m){
  uid++;
  const idMain = 'body-desk-'+uid;
  let html = renderCalHero(year, m);
  html += '<div class="desk-wrap">';
  html += '<div class="desk-hero">';
  html += '<div class="desk-right">'+tableHTML(year,m,DIAS_FULL,idMain)+'</div>';
  html += '</div>';
  html += panelsHTML(year, m);
  html += '</div>';
  html += countriesFooterHTML();
  return html;
}

/* ---------- RENDER ORIGINAL PROGERAL ---------- */
function markersForDateMini(year, m, d){
  const key = dateKey(year, m, d);
  const hs = holidaysFor(key);
  if(!hs.length) return '';
  return '<span class="mini-markers">' + hs.map(h => getMiniMarkerImgHTML(h.code)).join('') + '</span>';
}

function markersForDateMain(year, m, d){
  const key = dateKey(year, m, d);
  const hs = holidaysFor(key);
  if(!hs.length) return '';
  return '<div class="day-markers">' + hs.map(h => getMarkerImgHTML(h.code)).join('') + '</div>';
}

function renderOrigMiniCal(year, m){
  const weeks = buildWeeksMon(year, m);
  let h = '<div class="orig-mini-cal"><div class="mini-title">'+MESES_PT[m]+' <small>/ '+MESES_PT[m].charAt(0)+MESES_PT[m].slice(1).toLowerCase()+'</small></div>';
  h += '<table class="mini-cal"><thead><tr><th class="mini-week-h">SEM/WK</th>';
  DIAS_FULL_MON.forEach((d,i) => {
    const wcls = (i===5||i===6) ? ' weekend-h' : '';
    h += '<th class="'+wcls.trim()+'"><span class="l1">'+d[0]+'</span><span class="l2">'+d[1]+'</span></th>';
  });
  h += '</tr></thead><tbody>';
  weeks.forEach((week, wi) => {
    h += '<tr><td class="mini-week-num">'+String(wi+1).padStart(2,'0')+'</td>';
    week.forEach(d => {
      h += '<td>' + (d ? String(d).padStart(2,'0') : '') + (d ? markersForDateMini(year,m,d) : '') + '</td>';
    });
    h += '</tr>';
  });
  h += '</tbody></table></div>';
  return h;
}

function renderOrigGrid(year, m, idMain){
  const weeks = buildWeeksMon(year, m);
  let h = '<table class="orig-cal"><thead><tr><th>SEM/WK</th>';
  DIAS_FULL_MON.forEach((d,i) => {
    const wcls = (i===5||i===6) ? ' weekend-h' : '';
    h += '<th class="'+wcls+'">'+d[0]+'/'+d[1]+'</th>';
  });
  h += '</tr></thead><tbody id="'+idMain+'">';
  weeks.forEach((week,wi) => {
    h += '<tr><td class="orig-week-num" contenteditable="true">'+String(wi+1).padStart(2,'0')+'</td>';
    week.forEach((d,ci) => {
      const wknd = (ci===5||ci===6) ? ' weekend' : '';
      if(d===null){
        h += '<td class="orig-day'+wknd+'" contenteditable="true">-</td>';
      } else {
        h += '<td class="orig-day'+wknd+'" data-date="'+dateKey(year,m,d)+'" contenteditable="true">'+String(d).padStart(2,'0')+markersForDateMain(year,m,d)+'</td>';
      }
    });
    h += '</tr>';
  });
  h += '</tbody></table>';
  h += '<div class="row-controls orig"><button class="btn small secondary" onclick="addRow(&quot;' + idMain + '&quot;)">+ Semana</button>'
     + '<button class="btn small secondary" onclick="removeRow(&quot;' + idMain + '&quot;)">− Semana</button></div>';
  return h;
}

function countriesFooterHTML(){
  let iconHTML = '<div class="ico-target" id="footerIconBox"><span></span></div>';
  if(currentFooterIcon === 'star') iconHTML = '<div id="footerIconBox" style="display:flex;align-items:center;justify-content:center;width:38px;height:38px;font-size:22px;color:var(--navy-deep);">&#9733;</div>';
  else if(currentFooterIcon === 'none') iconHTML = '<div id="footerIconBox" style="display:none;"></div>';
  return '<div class="orig-footer"><div class="orig-footer-left">' + iconHTML
    + '<div class="txt" id="footerText" contenteditable="true">'+currentSloganText+'</div></div>'
    + '<div class="orig-footer-right">' + selectedCountries.map((c,i) =>
        (i>0 ? '<span class="sep"></span>' : '') + '<span class="chip">'+getFlagImgHTML(c)+' '+(COUNTRY_NAMES[c]||c).toUpperCase()+'</span>'
      ).join('') + '</div></div>';
}

function renderOriginal(year, m){
  uid++;
  const idMain = 'body-orig-'+uid;
  const next = shiftMonth(year, m, 1);
  const today = new Date();
  const useToday = (today.getFullYear()===year && today.getMonth()===m);
  const heroDay = useToday ? today.getDate() : 1;
  const plantSrc = customPlantImage || topImageSrc || PLANT_BANNERS[currentPlantBanner] || PLANT_BANNERS.b1;

  let html = '<div class="orig-hero">';
  html += '<div class="orig-photo-wrap"><img src="'+plantSrc+'" alt="Foto institucional fábrica Progeral"></div>';
  html += '<div class="orig-logo-box"><img src="'+LOGO_PROGERAL+'" alt="Progeral Clamp Developers"></div>';
  html += '<div class="orig-title-block"><div class="bigdate'+(currentDateOutline?' outlined':'')+'" contenteditable="true">'+String(heroDay).padStart(2,'0')+' '+MESES_PT[m]+'</div>';
  html += '<div class="submonth'+(currentDateOutline?' outlined':'')+'" contenteditable="true">'+MESES_EN[m].charAt(0)+MESES_EN[m].slice(1).toLowerCase()+'</div><div class="rule"></div></div>';
  html += renderOrigMiniCal(next.y, next.m);
  html += '</div>';
  html += '<div class="orig-grid-wrap">'+renderOrigGrid(year,m,idMain)+'</div>';
  html += countriesFooterHTML();
  return html;
}

function renderInto(cap, body, topB, botB, templateId, year, m){
  cap.setAttribute('data-grid-style', currentGridStyle);
  topB.style.display = 'none';
  botB.style.display = 'none';
  if(templateId === 'original'){
    body.innerHTML = renderOriginal(year, m);
  } else if(templateId === 'classic' || templateId === 'minimal'){
    body.innerHTML = renderClassicLike(year, m);
  } else if(templateId === 'compact'){
    body.innerHTML = renderCompact(year, m);
  } else if(templateId === 'quarterly'){
    body.innerHTML = renderQuarterly(year, m);
  } else if(templateId === 'desk'){
    body.innerHTML = renderDesk(year, m);
  }
  if(typeof applyDesignOverrides === 'function') applyDesignOverrides(cap);
}

function renderTemplate(templateId, year, m){
  currentTemplate = templateId;
  document.getElementById('calendar-capture').setAttribute('data-template', templateId);
  renderInto(document.getElementById('calendar-capture'), document.getElementById('calendarBody'), document.getElementById('topBanner'), document.getElementById('bottomBanner'), templateId, year, m);
}

/* ---------- VISÃO ANUAL (12 meses editáveis) ---------- */
function renderYear(year){
  const blocks = document.getElementById('yearBlocks');
  blocks.innerHTML = '';
  for(let m=0;m<12;m++){
    const block = document.createElement('div');
    block.className = 'year-block';
    block.innerHTML = '<div class="year-caption">'+MESES_PT[m]+' '+year+'</div>'
      + '<div class="year-cap"><img class="banner-img" alt="Topo" style="display:none;">'
      + '<div class="year-body"></div>'
      + '<img class="banner-img bottom" alt="Rodapé" style="display:none;"></div>';
    blocks.appendChild(block);
    const cap = block.querySelector('.year-cap');
    renderInto(cap, block.querySelector('.year-body'), block.querySelector('.year-cap img'), block.querySelector('.year-cap img.bottom'), currentTemplate, year, m);
  }
  document.getElementById('yearView').classList.remove('hidden');
  document.getElementById('calendar-capture').classList.add('hidden');
  if(document.body.classList.contains('design-mode')) deselect();
}

function applyScope(){
  const scope = document.getElementById('exportScope').value;
  const {y, m} = currentYM();
  if(scope === 'year'){
    renderYear(y);
  } else {
    document.getElementById('yearView').classList.add('hidden');
    document.getElementById('calendar-capture').classList.remove('hidden');
    renderTemplate(currentTemplate, y, m);
  }
  saveState();
}

function refreshCurrentView(y, m){
  if(document.getElementById('exportScope').value === 'year'){
    renderYear(y);
  } else {
    renderTemplate(currentTemplate, y, m);
  }
}

function toggleToolbar(){
  const cards = document.getElementById('tbCards');
  const closed = cards.classList.toggle('collapsed');
  const btn = document.getElementById('tbToggle');
  btn.textContent = closed ? '⌃' : '⌄';
  btn.title = closed ? 'Expandir editor' : 'Recolher editor';
  try{ localStorage.setItem('calendarioProgeralCollapsed', closed ? '1' : '0'); }catch(e){}
}

function shiftPicker(delta){
  const {y, m} = currentYM();
  const nm = shiftMonth(y, m, delta);
  document.getElementById('monthPicker').value = nm.y+'-'+String(nm.m+1).padStart(2,'0');
  applyMonth();
}
window.shiftPicker = shiftPicker;

function setExportScale(v){
  exportScale = parseInt(v, 10);
  saveState();
}
window.setExportScale = setExportScale;

function printCalendar(){
  const cap = document.getElementById('calendar-capture');
  if(cap.classList.contains('hidden')){
    cap.classList.remove('hidden');
    document.getElementById('yearView').classList.add('hidden');
    renderTemplate(currentTemplate, currentYM().y, currentYM().m);
  }
  if(typeof toggleDesignMode === 'function' && document.body.classList.contains('design-mode')) toggleDesignMode();
  const savedZoom = cap.style.zoom;
  cap.style.zoom = '';
  const controls = [];
  cap.querySelectorAll('.row-controls').forEach(c => { if(c.style.display!=='none'){ controls.push(c); c.style.display='none'; } });
  setTimeout(() => {
    window.print();
    setTimeout(() => {
      controls.forEach(c => { c.style.display = ''; });
      cap.style.zoom = savedZoom;
    }, 300);
  }, 150);
}
window.printCalendar = printCalendar;

function resetAllSettings(){
  if(!confirm('Apagar todas as configurações salvas (design, tema, imagens e modelo) e recarregar?')) return;
  try{ localStorage.removeItem(STORAGE_KEY); }catch(e){}
  try{ localStorage.removeItem('calendarioProgeralDesignV3'); }catch(e){}
  try{ localStorage.removeItem('calendarioProgeralPresetsV3'); }catch(e){}
  location.reload();
}
window.resetAllSettings = resetAllSettings;

document.addEventListener('keydown', e => {
  if(e.key === 'Escape') document.getElementById('templateModal').classList.add('hidden');
});

function addRow(bodyId){
  const tbody = document.getElementById(bodyId);
  if(!tbody) return;
  const tr = document.createElement('tr');
  let html = '<td class="week-num" contenteditable="true">'+String(tbody.rows.length+1).padStart(2,'0')+'</td>';
  for(let i=0;i<7;i++){
    const wknd = (i===0 || i===6) ? ' weekend' : '';
    html += '<td class="day'+wknd+'" contenteditable="true"></td>';
  }
  tr.innerHTML = html;
  tbody.appendChild(tr);
}
function removeRow(bodyId){
  const tbody = document.getElementById(bodyId);
  if(tbody && tbody.rows.length > 1) tbody.deleteRow(tbody.rows.length - 1);
}

function chooseTemplate(id){
  document.getElementById('templateModal').classList.add('hidden');
  const {y, m} = currentYM();
  currentTemplate = id;
  refreshCurrentView(y, m);
  fetchHolidays();
  saveState();
  if(typeof updateDefaultLabel === 'function') updateDefaultLabel();
  if(typeof applyDefaultForTemplate === 'function') applyDefaultForTemplate(id);
}
renderCountryChips();
function openModal(){ document.getElementById('templateModal').classList.remove('hidden'); }

function applyMonth(){
  const val = document.getElementById('monthPicker').value;
  if(!val) return;
  const [y,mm] = val.split('-').map(Number);
  refreshCurrentView(y, mm-1);
  if(holidaysYearLoaded !== y){
    fetchHolidays();
  }
  saveState();
}

function currentYM(){
  const val = document.getElementById('monthPicker').value;
  if(!val){
    const now = new Date();
    return {y: now.getFullYear(), m: now.getMonth()};
  }
  const [y,mm] = val.split('-').map(Number);
  return {y, m: mm-1};
}

document.getElementById('topUpload').addEventListener('change', e => {
  const f = e.target.files[0];
  if(!f) return;
  const reader = new FileReader();
  reader.onload = ev => {
    topImageSrc = ev.target.result;
    document.getElementById('topBanner').src = topImageSrc;
    const {y,m} = currentYM();
    refreshCurrentView(y, m);
    saveState();
  };
  reader.readAsDataURL(f);
});

document.getElementById('bottomUpload').addEventListener('change', e => {
  const f = e.target.files[0];
  if(!f) return;
  const reader = new FileReader();
  reader.onload = ev => {
    bottomImageSrc = ev.target.result;
    document.getElementById('bottomBanner').src = bottomImageSrc;
    const {y,m} = currentYM();
    refreshCurrentView(y, m);
    saveState();
  };
  reader.readAsDataURL(f);
});

document.getElementById('plantUpload').addEventListener('change', e => {
  const f = e.target.files[0];
  if(!f) return;
  const reader = new FileReader();
  reader.onload = ev => {
    customPlantImage = ev.target.result;
    const {y,m} = currentYM();
    refreshCurrentView(y, m);
    saveState();
  };
  reader.readAsDataURL(f);
});
function toggleManualHoliday(key){
  if(MANUAL_HOLIDAYS[key]) delete MANUAL_HOLIDAYS[key];
  else MANUAL_HOLIDAYS[key] = true;
}

document.addEventListener('contextmenu', e => {
  const cell = e.target && e.target.closest ? e.target.closest('.day[data-date], .orig-day[data-date]') : null;
  if(!cell) return;
  e.preventDefault();
  const key = cell.dataset.date;
  toggleManualHoliday(key);
  const cap = cell.closest('.year-cap');
  if(cap){
    const blocks = document.querySelectorAll('#yearView .year-block');
    let mi = 0;
    blocks.forEach((b,i) => { if(b.contains(cap)) mi = i; });
    renderInto(cap, cap.querySelector('.year-body'), cap.querySelector('img'), cap.querySelector('img.bottom'), currentTemplate, getSelectedYearMonth().y, mi);
  } else {
    const {y,m} = getSelectedYearMonth();
    refreshCurrentView(y, m);
  }
  saveState();
});

function resetImages(){
  topImageSrc = '';
  bottomImageSrc = '';
  customPlantImage = '';
  document.getElementById('topBanner').src = '';
  document.getElementById('bottomBanner').src = '';
  const {y,m} = currentYM();
  refreshCurrentView(y, m);
  saveState();
}
async function fetchHolidays(){
  const val = document.getElementById('monthPicker').value;
  const [y] = val ? val.split('-').map(Number) : [new Date().getFullYear()];
  if(selectedCountries.length===0){
    holidaysMap = {};
    holidaysYearLoaded = y;
    refreshCurrentView(y, currentYM().m);
    return;
  }
  setStatus('Buscando feriados de '+selectedCountries.join(', ')+'...');
  try{
    const years = [y-1, y, y+1];
    const jobs = [];
    selectedCountries.forEach(code => {
      years.forEach(yy => {
        jobs.push(
          fetch('https://date.nager.at/api/v3/PublicHolidays/'+yy+'/'+code)
            .then(r => r.ok ? r.json() : [])
            .then(list => list.map(h => ({...h, _code: code})))
            .catch(() => [])
        );
      });
    });
    const results = await Promise.all(jobs);
    const nowVal = document.getElementById('monthPicker').value;
    const [nowY] = nowVal ? nowVal.split('-').map(Number) : [y];
    if(nowY === y){
      holidaysMap = {};
      results.flat().forEach(h => {
        if(!holidaysMap[h.date]) holidaysMap[h.date] = [];
        holidaysMap[h.date].push({code: h._code, name: h.localName || h.name});
      });
      holidaysYearLoaded = y;
      const {m} = currentYM();
      refreshCurrentView(y, m);
      setStatus('Feriados carregados.');
      setTimeout(()=>setStatus(''), 2500);
    }
  }catch(err){
    holidaysYearLoaded = y;
    const {m} = currentYM();
    refreshCurrentView(y, m);
    setStatus('Não foi possível buscar feriados (rede indisponível).');
    setTimeout(()=>setStatus(''), 3500);
  }
}

async function captureCanvas(el){
  const target = el || document.getElementById('calendar-capture');
  const savedZoom = target.style.zoom;
  target.style.zoom = '';
  const controls = [];
  target.querySelectorAll('.row-controls').forEach(c => {
    if(c.style.display !== 'none'){ controls.push(c); c.style.display = 'none'; }
  });
  try{
    return await html2canvas(target, {scale:exportScale, backgroundColor:'#ffffff', useCORS:true});
  } finally {
    controls.forEach(c => { c.style.display = ''; });
    target.style.zoom = savedZoom;
  }
}

function setStatus(msg){ document.getElementById('exportStatus').textContent = msg; }
function setButtonsDisabled(v){
  document.getElementById('btnPng').disabled = v;
  document.getElementById('btnPdf').disabled = v;
}

async function exportPNG(){
  const scope = document.getElementById('exportScope').value;
  if(scope === 'month'){
    setStatus('Gerando PNG...');
    const canvas = await captureCanvas();
    const link = document.createElement('a');
    const {y, m} = currentYM();
    link.download = 'calendario-'+MESES_PT_SLUG[m]+'-'+y+'.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    setStatus('');
  } else {
    await exportYearZip();
  }
}

async function exportPDF(){
  const scope = document.getElementById('exportScope').value;
  if(scope === 'month'){
    setStatus('Gerando PDF...');
    const canvas = await captureCanvas();
    const imgData = canvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({orientation: canvas.width > canvas.height ? 'landscape' : 'portrait', unit:'px', format:[canvas.width, canvas.height]});
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    const {y, m} = currentYM();
    pdf.save('calendario-'+MESES_PT_SLUG[m]+'-'+y+'.pdf');
    setStatus('');
  } else {
    await exportYearPDF();
  }
}

function getSelectedYearMonth(){
  const val = document.getElementById('monthPicker').value;
  if(!val){
    const now = new Date();
    return {y: now.getFullYear(), m: now.getMonth()};
  }
  const [y,mm] = val.split('-').map(Number);
  return {y, m: mm-1};
}

function yearCaps(){
  const scope = document.getElementById('exportScope').value;
  const {y} = getSelectedYearMonth();
  if(scope !== 'year' || document.getElementById('yearView').classList.contains('hidden')){
    renderYear(y);
  }
  return Array.prototype.slice.call(document.querySelectorAll('#yearView .year-cap'));
}

async function exportYearPDF(){
  setButtonsDisabled(true);
  const {y: origY} = getSelectedYearMonth();
  const caps = yearCaps();
  let pdf = null;
  for(let i=0;i<caps.length;i++){
    setStatus('Gerando PDF do ano: mês '+(i+1)+' de 12...');
    await new Promise(r => setTimeout(r, 60));
    const canvas = await captureCanvas(caps[i]);
    const imgData = canvas.toDataURL('image/png');
    if(i===0){
      pdf = new window.jspdf.jsPDF({orientation:'landscape', unit:'px', format:[canvas.width, canvas.height]});
    } else {
      pdf.addPage([canvas.width, canvas.height], 'landscape');
    }
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
  }
  pdf.save('calendario-progeral-'+origY+'.pdf');
  setStatus('');
  setButtonsDisabled(false);
}

async function exportYearZip(){
  setButtonsDisabled(true);
  const {y: origY} = getSelectedYearMonth();
  const caps = yearCaps();
  const zip = new JSZip();
  for(let i=0;i<caps.length;i++){
    setStatus('Gerando PNG do ano: mês '+(i+1)+' de 12...');
    await new Promise(r => setTimeout(r, 60));
    const canvas = await captureCanvas(caps[i]);
    const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
    zip.file(String(i+1).padStart(2,'0')+'-'+MESES_PT_SLUG[i]+'-'+origY+'.png', blob);
  }
  setStatus('Compactando arquivo .zip...');
  const content = await zip.generateAsync({type:'blob'});
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url; a.download = 'calendario-progeral-'+origY+'.zip'; a.click();
  URL.revokeObjectURL(url);
  setStatus('');
  setButtonsDisabled(false);
}

/* ---------- MODAL DE EXPORTAÇÃO ---------- */
const PAPER_SIZES = [
  { id:'calendario-mesa', name:'Calendário Mesa', w:297, h:210, desc:'Formato paisagem largo (ideal para mesa)' },
  { id:'carta',          name:'Carta (Letter)',   w:279, h:216, desc:'8.5 × 11 polegadas' },
  { id:'oficio',         name:'Ofício',           w:330, h:216, desc:'8.5 × 13 polegadas' },
  { id:'a4',             name:'A4',               w:210, h:297, desc:'210 × 297 mm' },
  { id:'1-2',            name:'1:2 (Metade)',     w:148, h:210, desc:'Metade do A4 — meio calendário' },
  { id:'personalizado',  name:'Personalizado',    w:0,   h:0,   desc:'Definir largura e altura manualmente' }
];

let exportModalType = 'png';
let exportSelectedSize = 'calendario-mesa';
let exportOrient = 'landscape';

function openExportModal(type){
  exportModalType = type;
  exportSelectedSize = 'calendario-mesa';
  exportOrient = 'landscape';
  document.getElementById('exportModalTitle').textContent = type === 'png' ? 'Exportar PNG' : 'Exportar PDF';
  renderExportSizes();
  updateExportPreview();
  document.getElementById('orientLandscape').classList.add('active');
  document.getElementById('orientPortrait').classList.remove('active');
  document.getElementById('exportModal').classList.remove('hidden');
}
window.openExportModal = openExportModal;

function closeExportModal(){
  document.getElementById('exportModal').classList.add('hidden');
}
window.closeExportModal = closeExportModal;

function renderExportSizes(){
  const box = document.getElementById('exportSizes');
  box.innerHTML = PAPER_SIZES.map(s =>
    '<div class="export-size-btn'+(s.id===exportSelectedSize?' selected':'')+'" onclick="selectExportSize(\''+s.id+'\')">'
    + '<span class="size-name">'+s.name+'</span>'
    + '<span class="size-dim">'+(s.id==='personalizado' ? 'Largura × Altura' : s.w+' × '+s.h+' mm')+'</span>'
    + '<span class="size-desc">'+s.desc+'</span>'
    + '</div>'
  ).join('');
}
window.renderExportSizes = renderExportSizes;

function selectExportSize(id){
  exportSelectedSize = id;
  renderExportSizes();
  updateExportPreview();
}
window.selectExportSize = selectExportSize;

function setExportOrient(o){
  exportOrient = o;
  document.getElementById('orientLandscape').classList.toggle('active', o==='landscape');
  document.getElementById('orientPortrait').classList.toggle('active', o==='portrait');
  updateExportPreview();
}
window.setExportOrient = setExportOrient;

function updateExportPreview(){
  const s = PAPER_SIZES.find(x => x.id === exportSelectedSize);
  if(!s) return;
  const box = document.getElementById('exportPreviewPage');
  const info = document.getElementById('exportPreviewInfo');
  let pw, ph;
  if(exportSelectedSize === 'personalizado'){
    pw = 200; ph = 150;
    info.textContent = 'Defina o tamanho no próximo passo';
  } else {
    pw = s.w; ph = s.h;
    if(exportOrient === 'landscape' && ph > pw){ const t=pw; pw=ph; ph=t; }
    if(exportOrient === 'portrait' && pw > ph){ const t=pw; pw=ph; ph=t; }
    info.textContent = pw+' × '+ph+' mm'+(exportOrient==='landscape'?' (paisagem)':' (retrato)');
  }
  const maxBox = 180;
  const scale = Math.min(maxBox / pw, maxBox / ph);
  box.style.width = Math.round(pw * scale) + 'px';
  box.style.height = Math.round(ph * scale) + 'px';
}
window.updateExportPreview = updateExportPreview;

function mmToPixels(mm, dpi){
  return Math.round((mm / 25.4) * dpi);
}

async function confirmExport(){
  const scope = document.getElementById('exportScope').value;
  if(scope === 'year'){
    closeExportModal();
    if(exportModalType === 'png') await exportYearZip();
    else await exportYearPDF();
    return;
  }

  const s = PAPER_SIZES.find(x => x.id === exportSelectedSize);
  if(!s) return;

  let targetW, targetH;
  if(exportSelectedSize === 'personalizado'){
    const w = prompt('Largura em mm:', '297');
    const h = prompt('Altura em mm:', '210');
    if(!w || !h) return;
    targetW = parseFloat(w);
    targetH = parseFloat(h);
  } else {
    targetW = s.w; targetH = s.h;
    if(exportOrient === 'landscape' && targetH > targetW){ const t=targetW; targetW=targetH; targetH=t; }
    if(exportOrient === 'portrait' && targetW > targetH){ const t=targetW; targetW=targetH; targetH=t; }
  }

  closeExportModal();

  const dpi = 300;
  const pdfW = mmToPixels(targetW, dpi);
  const pdfH = mmToPixels(targetH, dpi);

  if(exportModalType === 'png'){
    await exportPNGResized(pdfW, pdfH, targetW, targetH);
  } else {
    await exportPDFResized(pdfW, pdfH, targetW, targetH);
  }
}
window.confirmExport = confirmExport;

async function exportPNGResized(targetPxW, targetPxH, mmW, mmH){
  setStatus('Gerando PNG ('+mmW+'×'+mmH+'mm)...');
  const cap = document.getElementById('calendar-capture');
  const savedZoom = cap.style.zoom;
  cap.style.zoom = '';
  const controls = [];
  cap.querySelectorAll('.row-controls').forEach(c => { if(c.style.display!=='none'){ controls.push(c); c.style.display='none'; } });
  try{
    const canvas = await html2canvas(cap, {scale:exportScale, backgroundColor:'#ffffff', useCORS:true});
    const out = document.createElement('canvas');
    out.width = targetPxW;
    out.height = targetPxH;
    const ctx = out.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetPxW, targetPxH);
    const ratio = Math.min(targetPxW / canvas.width, targetPxH / canvas.height);
    const dw = canvas.width * ratio;
    const dh = canvas.height * ratio;
    const dx = (targetPxW - dw) / 2;
    const dy = (targetPxH - dh) / 2;
    ctx.drawImage(canvas, dx, dy, dw, dh);
    const link = document.createElement('a');
    const {y, m} = currentYM();
    link.download = 'calendario-'+MESES_PT_SLUG[m]+'-'+y+'-'+mmW+'x'+mmH+'mm.png';
    link.href = out.toDataURL('image/png');
    link.click();
  } finally {
    controls.forEach(c => { c.style.display = ''; });
    cap.style.zoom = savedZoom;
    setStatus('');
  }
}

async function exportPDFResized(targetPxW, targetPxH, mmW, mmH){
  setStatus('Gerando PDF ('+mmW+'×'+mmH+'mm)...');
  const cap = document.getElementById('calendar-capture');
  const savedZoom = cap.style.zoom;
  cap.style.zoom = '';
  const controls = [];
  cap.querySelectorAll('.row-controls').forEach(c => { if(c.style.display!=='none'){ controls.push(c); c.style.display='none'; } });
  try{
    const canvas = await html2canvas(cap, {scale:exportScale, backgroundColor:'#ffffff', useCORS:true});
    const out = document.createElement('canvas');
    out.width = targetPxW;
    out.height = targetPxH;
    const ctx = out.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetPxW, targetPxH);
    const ratio = Math.min(targetPxW / canvas.width, targetPxH / canvas.height);
    const dw = canvas.width * ratio;
    const dh = canvas.height * ratio;
    const dx = (targetPxW - dw) / 2;
    const dy = (targetPxH - dh) / 2;
    ctx.drawImage(canvas, dx, dy, dw, dh);
    const imgData = out.toDataURL('image/png');
    const { jsPDF } = window.jspdf;
    const orient = targetPxW > targetPxH ? 'landscape' : 'portrait';
    const pdf = new jsPDF({orientation:orient, unit:'mm', format:[mmW, mmH]});
    pdf.addImage(imgData, 'PNG', 0, 0, mmW, mmH);
    const {y, m} = currentYM();
    pdf.save('calendario-'+MESES_PT_SLUG[m]+'-'+y+'-'+mmW+'x'+mmH+'mm.pdf');
  } finally {
    controls.forEach(c => { c.style.display = ''; });
    cap.style.zoom = savedZoom;
    setStatus('');
  }
}

/* ---------- PERSISTÊNCIA (localStorage) ---------- */
const STORAGE_KEY = 'calendarioProgeralV3';

function saveState(){
  const base = () => ({
    month: document.getElementById('monthPicker').value,
    template: currentTemplate,
    plantBanner: currentPlantBanner,
    font: document.getElementById('fontSelect').value,
    theme: document.getElementById('themeSelect').value,
    colors: {
      p: document.getElementById('primaryColorPicker').value,
      s: document.getElementById('secondaryColorPicker').value,
      w: document.getElementById('weekendColorPicker').value
    },
    slogan: currentSloganText,
    icon: currentFooterIcon,
    outline: currentDateOutline,
    gridStyle: currentGridStyle,
    exportScale: exportScale,
    countries: selectedCountries,
    manualHolidays: Object.keys(MANUAL_HOLIDAYS)
  });
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.assign(base(), {top: topImageSrc||'', bottom: bottomImageSrc||'', plant: customPlantImage||''})));
  }catch(e){
    try{
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.assign(base(), {top:'', bottom:'', plant:''})));
    }catch(e2){}
  }
}

function loadState(){
  let st = null;
  try{ st = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); }catch(e){ return; }
  if(!st) return;
  const setVal = (id, v) => { const el = document.getElementById(id); if(el && v) el.value = v; };
  setVal('monthPicker', st.month);
  setVal('fontSelect', st.font);
  setVal('themeSelect', st.theme);
  setVal('primaryColorPicker', st.colors && st.colors.p);
  setVal('secondaryColorPicker', st.colors && st.colors.s);
  setVal('weekendColorPicker', st.colors && st.colors.w);
  setVal('plantBannerSelect', st.plantBanner);
  if(st.plantBanner) currentPlantBanner = st.plantBanner;
  if(st.gridStyle){ currentGridStyle = st.gridStyle; setVal('gridStyleSelect', st.gridStyle); }
  if(st.exportScale){ exportScale = st.exportScale; setVal('exportScaleSelect', st.exportScale); }
  if(st.plant) customPlantImage = st.plant;
  if(st.font) changeFontFamily(st.font);
  if(st.colors && (st.colors.p || st.colors.s || st.colors.w)) updateCustomColors();
  if(st.slogan) currentSloganText = st.slogan;
  if(st.icon) currentFooterIcon = st.icon;
  if(st.outline !== undefined){
    currentDateOutline = !!st.outline;
    const ot = document.getElementById('outlineToggle');
    if(ot) ot.checked = currentDateOutline;
  }
  if(st.template && ['original','desk','classic','compact','quarterly','minimal'].indexOf(st.template) !== -1) currentTemplate = st.template;
  if(st.countries && st.countries.length) selectedCountries = st.countries;
  MANUAL_HOLIDAYS = {};
  if(st.manualHolidays && st.manualHolidays.length) st.manualHolidays.forEach(k => { MANUAL_HOLIDAYS[k] = true; });
  if(st.top) topImageSrc = st.top;
  if(st.bottom) bottomImageSrc = st.bottom;
  renderCountryChips();
}

// Inicialização
function initApp(){
  loadState();
  try{ if(localStorage.getItem('calendarioProgeralCollapsed') === '1') toggleToolbar(); }catch(e){}
  const now = new Date();
  const picker = document.getElementById('monthPicker');
  if(!picker.value){
    picker.value = now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0');
  }
  const fontSel = document.getElementById('fontSelect').value;
  if(fontSel) changeFontFamily(fontSel);
  const topB = document.getElementById('topBanner');
  const botB = document.getElementById('bottomBanner');
  if(topImageSrc) topB.src = topImageSrc;
  if(bottomImageSrc) botB.src = bottomImageSrc;
  const {y, m} = currentYM();
  renderTemplate(currentTemplate, y, m);
  fetchHolidays();
}
initApp();

