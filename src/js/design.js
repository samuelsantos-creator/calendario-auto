(function(){
  const DESIGN_KEY = 'calendarioProgeralDesignV3';
  const PRESETS_KEY = 'calendarioProgeralPresetsV3';
  const HANDLES = ['nw','n','ne','e','se','s','sw','w'];

  let designState = {general:{}, elements:{}};
  let designPresets = {};
  let dpSelectedEl = null;
  let dpSelectedKey = null;
  let dpDrag = null;
  let dpResize = null;
  let dpEventsBound = false;
  let dpSaveTimer = null;
  let dpHoverTimer = null;

  try{
    designState = JSON.parse(localStorage.getItem(DESIGN_KEY)) || {general:{}, elements:{}};
    designPresets = JSON.parse(localStorage.getItem(PRESETS_KEY)) || {};
  }catch(e){ designState = {general:{}, elements:{}}; designPresets = {}; }

  function saveDesign(){
    clearTimeout(dpSaveTimer);
    dpSaveTimer = setTimeout(() => {
      try{
        localStorage.setItem(DESIGN_KEY, JSON.stringify(designState));
      }catch(e){}
    }, 250);
  }
  function saveDesignPresets(){
    try{ localStorage.setItem(PRESETS_KEY, JSON.stringify(designPresets)); }catch(e){}
  }
  function debounceSaveDesign(){ saveDesign(); }

  function getOverrides(key){
    if(!key) return {};
    if(!designState.elements[key]) designState.elements[key] = {};
    return designState.elements[key];
  }
  function nodeSelector(node){
    let tag = node.tagName.toLowerCase();
    let sel = tag;
    if(node.id) sel += '#'+node.id;
    if(typeof node.className === 'string' && node.className.trim()){
      const cls = node.className.trim().split(/\s+/).filter(c => /^[a-zA-Z0-9_-]+$/.test(c)).slice(0,3);
      if(cls.length) sel += '.'+cls.join('.');
    }
    let idx = 1;
    let sib = node.previousElementSibling;
    while(sib){ if(sib.tagName === node.tagName) idx++; sib = sib.previousElementSibling; }
    return sel+':nth-of-type('+idx+')';
  }
  function elementKeyFor(el){
    const cap = document.getElementById('calendar-capture');
    if(!cap || !cap.contains(el)) return null;
    const m = el.closest && el.closest('.mini-markers');
    const d = el.closest && el.closest('.day-markers');
    if(m) return '#calendar-capture .mini-markers';
    if(d) return '#calendar-capture .day-markers';
    const parts = [];
    let node = el;
    while(node && node !== cap){
      parts.unshift(nodeSelector(node));
      node = node.parentElement;
    }
    if(node !== cap) return null;
    return '#calendar-capture '+parts.join(' > ');
  }
  function getEls(key){
    try{ return Array.prototype.slice.call(document.querySelectorAll(key)); }
    catch(e){ return []; }
  }

  /* ---------------- aplicar overrides (chamado pelo app.js após cada render) ---------------- */
  function applyGeneralOverrides(root){
    const g = designState.general || {};
    const cap = root || document.getElementById('calendar-capture');
    if(!cap) return;
    if(g.canvasWidth && !g.canvasAuto){
      cap.style.width = g.canvasWidth+'px';
      cap.style.maxWidth = 'none';
    } else {
      cap.style.width = '';
      cap.style.maxWidth = '';
    }
    cap.style.margin = g.canvasAlign === 'center' ? '0 auto' : g.canvasAlign === 'right' ? '0 0 0 auto' : '';
    Array.prototype.forEach.call(cap.querySelectorAll('.cal-wrap, .compact-wrap'), w => {
      if(g.gap != null) w.style.gap = g.gap+'px';
      if(g.pad != null) w.style.padding = g.pad+'px';
    });
    if(g.zoom && g.zoom !== 100) cap.style.zoom = g.zoom+'%';
    else cap.style.zoom = '';
  }

  function applyElementCss(el, o){
    if(!el || !o) return;
    const st = el.style;
    const hasT = (o.tx && o.tx !== 0) || (o.ty && o.ty !== 0) || (o.rotate && o.rotate !== 0);
    if(hasT){
      st.transform = '';
      if(o.rotate) st.transform += 'rotate('+o.rotate+'deg) ';
      st.transform += 'translate('+(o.tx||0)+'px,'+(o.ty||0)+'px)';
    } else {
      st.transform = '';
    }
    st.width  = o.width  ? o.width+'px'  : '';
    st.height = o.height ? o.height+'px' : '';
    if(o.border){
      const b = o.border;
      if(b.style === 'none'){
        st.borderWidth = '0';
        st.borderStyle = 'none';
      } else {
        const sides = b.sides || {top:true,right:true,bottom:true,left:true};
        const w = b.width || 0;
        st.borderTopWidth    = sides.top    ? w+'px' : '0';
        st.borderRightWidth  = sides.right  ? w+'px' : '0';
        st.borderBottomWidth = sides.bottom ? w+'px' : '0';
        st.borderLeftWidth   = sides.left   ? w+'px' : '0';
        st.borderStyle = b.style;
        st.borderColor = b.color || '';
      }
      st.borderRadius = b.radius ? b.radius+'px' : '';
    } else {
      st.borderWidth=''; st.borderStyle=''; st.borderColor=''; st.borderRadius='';
    }
    if(o.bgOn && o.bg){
      st.background = o.bg;
      st.backgroundImage = 'none';
    } else if(o.bgOn === false){
      st.background = '';
      st.backgroundImage = '';
    }
    st.color = o.textColor || '';
    st.fontSize = o.fontSize ? o.fontSize+'px' : '';
    st.fontWeight = o.fontWeight || '';
    if(o.align === 'center'){ st.marginLeft='auto'; st.marginRight='auto'; }
    else if(o.align === 'right'){ st.marginLeft='auto'; st.marginRight=''; }
    else if(o.align === 'left'){ st.marginLeft=''; st.marginRight='auto'; }
    if(o.shadow != null){
      if(o.shadow > 0){
        st.boxShadow = '0 '+Math.round(o.shadow*0.7)+'px '+(o.shadow*2)+'px rgba(0,0,0,'+Math.min(0.5, o.shadow/70+0.06).toFixed(2)+')';
      } else st.boxShadow = '';
    }
    if(o.z){
      st.position = 'relative';
      st.zIndex = o.z;
    } else {
      if(!el.style.position || el.style.position === 'relative'){
        st.position = '';
        st.zIndex = '';
      }
    }
    if(o.width || o.height){
      Array.from(el.tagName === 'IMG' ? [el] : el.querySelectorAll('img')).forEach(img => {
        const cs = window.getComputedStyle(img);
        const mw = parseFloat(cs.maxWidth);
        const mh = parseFloat(cs.maxHeight);
        if(isNaN(mw) && isNaN(mh)) return;
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100%';
        img.style.width = 'auto';
        img.style.height = 'auto';
        img.style.objectFit = 'contain';
      });
    }
  }

  function applyDesignOverrides(scope){
    const root = scope || document.getElementById('calendar-capture');
    if(!root) return;
    applyGeneralOverrides(root);
    const els = designState.elements || {};
    const isYearCap = root !== document.getElementById('calendar-capture');
    Object.keys(els).forEach(key => {
      let sel = key.replace('#calendar-capture', ':scope');
      if(isYearCap){
        sel = sel
          .replace('img#topBanner', 'img.banner-img')
          .replace('div#calendarBody', 'div.year-body')
          .replace('img#bottomBanner', 'img.banner-img.bottom');
      }
      let matches;
      try{ matches = root.querySelectorAll(sel); }catch(e){ return; }
      Array.prototype.forEach.call(matches, el => applyElementCss(el, els[key]));
    });
    if(!scope && document.body.classList.contains('design-mode')){
      if(dpSelectedEl && !document.body.contains(dpSelectedEl)){
        const fresh = dpSelectedKey ? getEls(dpSelectedKey)[0] : null;
        if(fresh) dpSelectedEl = fresh;
        else deselect();
      }
      updateSelectionBox();
    }
  }
  window.applyDesignOverrides = applyDesignOverrides;

  /* ---------------- toggle do modo ---------------- */
  function clampTo(v, min, max){ return Math.max(min, Math.min(v, max)); }

  function positionPanelNearBall(){
    const ball = document.getElementById('dpBall');
    const panel = document.getElementById('designPanel');
    if(!ball || !panel) return;
    const r = ball.getBoundingClientRect();
    const W = Math.min(340, window.innerWidth - 16);
    const H = panel.offsetHeight || 420;
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
    const cL = v => clampTo(v, 8, window.innerWidth - W - 8);
    const cT = v => clampTo(v, 8, window.innerHeight - H - 8);
    const opts = [
      { left: r.left - W - 12, top: cT(r.top + r.height/2 - H/2) },
      { left: r.right + 12,    top: cT(r.top + r.height/2 - H/2) },
      { left: cL(r.left + r.width/2 - W/2), top: r.top - H - 12 },
      { left: cL(r.left + r.width/2 - W/2), top: r.bottom + 12 }
    ];
    for(const o of opts){
      if(o.left >= 8 && o.left + W <= window.innerWidth - 8 &&
         o.top >= 8 && o.top + H <= window.innerHeight - 8){
        panel.style.left = o.left+'px';
        panel.style.top = o.top+'px';
        return;
      }
    }
    panel.style.left = cL(r.left - W - 12)+'px';
    panel.style.top = cT(r.top + r.height/2 - H/2)+'px';
  }

  function toggleDesignMode(){
    const on = !document.body.classList.contains('design-mode');
    document.body.classList.toggle('design-mode', on);
    document.getElementById('designOverlay').classList.toggle('hidden', !on);
    const panel = document.getElementById('designPanel');
    panel.classList.remove('minimized');
    if(on){
      bindDesignEvents();
      applyDesignOverrides();
      positionPanelNearBall();
      const tip = document.getElementById('dpTip');
      tip.classList.remove('hidden');
      clearTimeout(dpHoverTimer);
      dpHoverTimer = setTimeout(() => tip.classList.add('hidden'), 4200);
    } else {
      deselect();
      document.getElementById('designHover').classList.add('hidden');
    }
  }
  window.toggleDesignMode = toggleDesignMode;

  function toggleDesignPanel(){
    const p = document.getElementById('designPanel');
    const on = p.classList.toggle('minimized');
    if(on) deselect();
    else positionPanelNearBall();
  }
  window.toggleDesignPanel = toggleDesignPanel;

  function onBallClick(){
    if(ballDragged) return;
    if(document.body.classList.contains('design-mode')) toggleDesignPanel();
    else toggleDesignMode();
  }
  window.onBallClick = onBallClick;

  let ballDragged = false;
  function setupBall(){
    const ball = document.getElementById('dpBall');
    if(!ball || ball.dataset.drag) return;
    ball.dataset.drag = '1';
    let dragging = false, moved = false, sx = 0, sy = 0, ox = 0, oy = 0;
    ball.addEventListener('mousedown', e => {
      dragging = true; moved = false;
      sx = e.clientX; sy = e.clientY;
      const r = ball.getBoundingClientRect();
      ox = r.left; oy = r.top;
      e.preventDefault();
    });
    window.addEventListener('mousemove', e => {
      if(!dragging) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if(!moved && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) moved = true;
      if(moved){
        const nx = Math.max(6, Math.min(window.innerWidth - 72, ox + dx));
        const ny = Math.max(6, Math.min(window.innerHeight - 72, oy + dy));
        ball.style.left = nx+'px';
        ball.style.top = ny+'px';
        ball.style.right = 'auto';
        ball.style.bottom = 'auto';
        if(document.body.classList.contains('design-mode')){
          const p = document.getElementById('designPanel');
          if(p && !p.classList.contains('minimized')) positionPanelNearBall();
        }
      }
    });
    window.addEventListener('mouseup', () => {
      if(dragging && moved) ballDragged = true;
      dragging = false;
    });
    ball.addEventListener('click', () => {
      ballDragged = false;
    });
  }
  window.setupBall = setupBall;
  window.deselect = deselect;

  function deselect(){
    dpSelectedEl = null;
    dpSelectedKey = null;
    document.getElementById('designSelection').classList.add('hidden');
    document.getElementById('dpEmpty').style.display = '';
    document.getElementById('dpFields').style.display = 'none';
  }

  function setDesignTab(tab){
    document.querySelectorAll('.dp-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    document.querySelectorAll('.dp-page').forEach(p => p.classList.add('hidden'));
    document.getElementById('dpPage-'+tab).classList.remove('hidden');
  }
  window.setDesignTab = setDesignTab;

  /* ---------------- seleção / hover ---------------- */
  function friendlyName(el){
    const cls = (typeof el.className === 'string' && el.className) || '';
    if(cls.includes('mini-markers')) return 'Marcadores (mini-calendário)';
    if(cls.includes('day-markers')) return 'Marcadores (grade do mês)';
    if(cls.includes('orig-mini-cal')) return 'Mini-calendário (próximo mês)';
    if(cls.includes('orig-logo-box')) return 'Logotipo';
    if(cls.includes('orig-title-block')) return 'Bloco da data';
    if(cls.includes('bigdate')) return 'Data em destaque';
    if(cls.includes('orig-grid-wrap')) return 'Grade do mês';
    if(cls.includes('orig-footer')) return 'Rodapé';
    if(cls.includes('title-box')) return 'Título do mês';
    if(cls.includes('cal-col')) return 'Coluna do calendário';
    if(cls.includes('cal-panel')) return 'Painel (feriados)';
    if(cls.includes('cal') && el.tagName === 'TABLE') return 'Tabela do calendário';
    if(cls.includes('panel') || cls.includes('notes')) return 'Painel de anotações';
    if(cls.includes('week-num')) return 'Número da semana';
    if(el.tagName === 'TD' && cls.includes('day')) return 'Dia (célula)';
    if(cls.includes('banner-img')) return 'Banner (imagem)';
    if(el.tagName === 'TABLE') return 'Tabela';
    const first = (cls.trim().split(/\s+/)[0] || '').replace(/[^a-zA-Z0-9_-]/g,'');
    return el.tagName.toLowerCase() + (first ? ' — .'+first : '');
  }

  function showBox(box, el){
    if(!el){ box.classList.add('hidden'); return; }
    const r = el.getBoundingClientRect();
    box.style.left = r.left+'px';
    box.style.top = r.top+'px';
    box.style.width = r.width+'px';
    box.style.height = r.height+'px';
    box.classList.remove('hidden');
  }
  function updateSelectionBox(){
    showBox(document.getElementById('designSelection'), dpSelectedEl);
  }
  function ensureHandles(){
    const box = document.getElementById('designSelection');
    if(box.querySelector('.design-handle')) return;
    HANDLES.forEach(h => {
      const d = document.createElement('div');
      d.className = 'design-handle '+h;
      d.dataset.h = h;
      d.addEventListener('mousedown', onHandleDown);
      box.appendChild(d);
    });
  }
  function selectElement(el){
    dpSelectedEl = el;
    dpSelectedKey = elementKeyFor(el);
    ensureHandles();
    updateSelectionBox();
    document.getElementById('designHover').classList.add('hidden');
    syncPanel();
    renderBreadcrumb();
  }
  window.selectElement = selectElement;

  let dpPath = [];
  function renderBreadcrumb(){
    const bc = document.getElementById('dpBreadcrumb');
    if(!bc) return;
    if(!dpSelectedEl){ bc.innerHTML = ''; return; }
    const parts = [];
    let node = dpSelectedEl;
    const cap = document.getElementById('calendar-capture');
    while(node && node !== cap.parentElement){
      const cls = (typeof node.className === 'string' && node.className.trim()) ? node.className.trim().split(/\s+/)[0] : '';
      const label = node.id ? '#'+node.id : (cls || node.tagName.toLowerCase());
      parts.unshift({ label, node });
      if(node === cap) break;
      node = node.parentElement;
    }
    dpPath = parts.map(p => p.node);
    bc.innerHTML = parts.map((p,i) =>
      '<button class="bc-btn'+(i===parts.length-1?' bc-cur':'')+'" onclick="designGoTo('+i+')">'+p.label+'</button>'
    ).join('<span class="bc-sep">›</span>');
  }
  function designGoTo(i){
    if(dpPath[i]) selectElement(dpPath[i]);
  }
  window.designGoTo = designGoTo;

  function dpSelectParent(){
    if(!dpSelectedEl || !dpSelectedEl.parentElement) return;
    selectElement(dpSelectedEl.parentElement);
  }
  window.dpSelectParent = dpSelectParent;

  function dpSelectTable(){
    const el = document.querySelector('#calendarBody table.cal, #calendarBody table.orig-cal');
    if(el) selectElement(el);
  }
  window.dpSelectTable = dpSelectTable;

  function onCapMouseOver(e){
    if(!document.body.classList.contains('design-mode')) return;
    if(dpDrag || dpResize) return;
    const el = e.target.closest('#calendar-capture *');
    if(!el || el === dpSelectedEl){ document.getElementById('designHover').classList.add('hidden'); return; }
    showBox(document.getElementById('designHover'), el);
  }
  function onCapMouseDown(e){
    if(!document.body.classList.contains('design-mode')) return;
    if(e.button !== 0) return;
    let el = e.target.closest('#calendar-capture *');
    if(!el) return;
    const marker = e.target.closest('.mini-markers, .day-markers');
    if(marker) el = marker;
    e.preventDefault();
    selectElement(el);
    dpDrag = {
      el: el, key: dpSelectedKey,
      startX: e.clientX, startY: e.clientY,
      origTx: (getOverrides(dpSelectedKey).tx||0),
      origTy: (getOverrides(dpSelectedKey).ty||0)
    };
  }
  function onHandleDown(e){
    e.preventDefault();
    e.stopPropagation();
    if(!dpSelectedEl) return;
    dpResize = {
      el: dpSelectedEl, key: dpSelectedKey, handle: e.target.dataset.h,
      startX: e.clientX, startY: e.clientY,
      origW: dpSelectedEl.offsetWidth || 100, origH: dpSelectedEl.offsetHeight || 40,
      origTx: (getOverrides(dpSelectedKey).tx||0), origTy: (getOverrides(dpSelectedKey).ty||0)
    };
  }
  function onMouseMove(e){
    if(!document.body.classList.contains('design-mode')) return;
    if(dpResize){
      const dx = e.clientX - dpResize.startX;
      const dy = e.clientY - dpResize.startY;
      const o = getOverrides(dpResize.key);
      const H = dpResize.handle;
      let w = dpResize.origW, h = dpResize.origH, tx = dpResize.origTx, ty = dpResize.origTy;
      if(H.indexOf('e') !== -1) w = dpResize.origW + dx;
      if(H.indexOf('s') !== -1) h = dpResize.origH + dy;
      if(H.indexOf('w') !== -1){ w = dpResize.origW - dx; tx = dpResize.origTx + dx; }
      if(H.indexOf('n') !== -1){ h = dpResize.origH - dy; ty = dpResize.origTy + dy; }
      if(H.indexOf('e') !== -1 || H.indexOf('w') !== -1) o.width = Math.max(20, Math.round(w));
      if(H.indexOf('s') !== -1 || H.indexOf('n') !== -1) o.height = Math.max(20, Math.round(h));
      if(tx !== dpResize.origTx) o.tx = Math.round(tx);
      if(ty !== dpResize.origTy) o.ty = Math.round(ty);
      applyElementCss(dpSelectedEl, o);
      syncPanel(); updateSelectionBox(); saveDesign();
      return;
    }
    if(dpDrag){
      const dx = e.clientX - dpDrag.startX;
      const dy = e.clientY - dpDrag.startY;
      const o = getOverrides(dpDrag.key);
      o.tx = Math.round(dpDrag.origTx + dx);
      o.ty = Math.round(dpDrag.origTy + dy);
      applyElementCss(dpSelectedEl, o);
      syncPanel(); updateSelectionBox(); saveDesign();
    }
  }
  function onMouseUp(){
    if(dpDrag || dpResize){
      saveDesign();
      dpDrag = null;
      dpResize = null;
    }
  }
  function onKeyDown(e){
    if(e.key === 'Escape' && document.body.classList.contains('design-mode')) toggleDesignMode();
  }
  function onScrollUpdate(){ updateSelectionBox(); }

  function bindDesignEvents(){
    if(dpEventsBound) return;
    dpEventsBound = true;
    const cap = document.getElementById('calendar-capture');
    cap.addEventListener('mouseover', onCapMouseOver);
    cap.addEventListener('mousedown', onCapMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', onScrollUpdate, true);
    window.addEventListener('resize', onScrollUpdate);
  }

  /* ---------------- painel: sincronizar valores ---------------- */
  function elv(id){ return document.getElementById(id); }

  function syncPanel(){
    const o = dpSelectedKey ? (designState.elements[dpSelectedKey] || {}) : {};
    elv('dpSelName').textContent = dpSelectedEl ? friendlyName(dpSelectedEl) : '';
    elv('dpEmpty').style.display = dpSelectedEl ? 'none' : '';
    elv('dpFields').style.display = dpSelectedEl ? '' : 'none';
    if(!dpSelectedEl) return;
    const b = o.border || {};
    elv('dpX').value = o.tx || 0; elv('dpXv').textContent = o.tx || 0;
    elv('dpY').value = o.ty || 0; elv('dpYv').textContent = o.ty || 0;
    elv('dpW').value = o.width || dpSelectedEl.offsetWidth; elv('dpWv').textContent = o.width || dpSelectedEl.offsetWidth;
    elv('dpH').value = o.height || dpSelectedEl.offsetHeight; elv('dpHv').textContent = o.height || dpSelectedEl.offsetHeight;
    elv('dpKeepRatio').checked = o.keepRatio !== false;
    elv('dpBorderStyle').value = b.style || '';
    elv('dpBorderW').value = b.width || 0; elv('dpBorderWv').textContent = b.width || 0;
    elv('dpBorderColor').value = b.color || '#0B1F3F';
    elv('dpRadius').value = b.radius || 0; elv('dpRadiusv').textContent = b.radius || 0;
    document.querySelectorAll('#dpSides input').forEach(inp => {
      const s = b.sides ? (b.sides[inp.dataset.side] !== false) : true;
      inp.checked = s;
    });
    elv('dpBg').value = o.bg || '#ffffff';
    elv('dpBgOn').checked = !!o.bgOn;
    elv('dpTextColor').value = o.textColor || '#171B24';
    elv('dpFontSize').value = o.fontSize || dpSelectedEl.offsetHeight * 0.14; elv('dpFontSizev').textContent = o.fontSize || '';
    elv('dpFontWeight').value = o.fontWeight || '';
    elv('dpRotate').value = o.rotate || 0; elv('dpRotatev').textContent = o.rotate || 0;
    elv('dpShadow').value = o.shadow || 0; elv('dpShadowv').textContent = o.shadow || 0;
    syncGeneralPanel();
  }

  function syncGeneralPanel(){
    const g = designState.general || {};
    const cap = document.getElementById('calendar-capture');
    elv('dpCanvasW').value = g.canvasWidth || (cap ? cap.offsetWidth : 1080);
    elv('dpCanvasWv').textContent = elv('dpCanvasW').value;
    elv('dpCanvasAuto').checked = !!g.canvasAuto;
    elv('dpGap').value = g.gap != null ? g.gap : 22; elv('dpGapv').textContent = elv('dpGap').value;
    elv('dpPad').value = g.pad != null ? g.pad : 26; elv('dpPadv').textContent = elv('dpPad').value;
    elv('dpZoom').value = g.zoom || 100; elv('dpZoomv').textContent = (g.zoom || 100)+'%';
  }

  /* ---------------- controles do painel ---------------- */
  function dpPos(axis, v){
    const o = getOverrides(dpSelectedKey);
    const field = axis === 'x' ? 'tx' : 'ty';
    o[field] = parseInt(v, 10);
    applyElementCss(dpSelectedEl, o);
    elv('dp'+axis.toUpperCase()+'v').textContent = v;
    updateSelectionBox(); saveDesign();
  }
  window.dpPos = dpPos;

  function dpSize(prop, v){
    const o = getOverrides(dpSelectedKey);
    v = parseInt(v, 10);
    if(prop === 'width'){
      if(o.keepRatio !== false && o.height){
        const ratio = o.height / o.width;
        o.height = Math.max(20, Math.round(v * ratio));
        elv('dpH').value = o.height; elv('dpHv').textContent = o.height;
      }
      o.width = v;
    } else {
      if(o.keepRatio !== false && o.width){
        const ratio = o.width / o.height;
        o.width = Math.max(20, Math.round(v * ratio));
        elv('dpW').value = o.width; elv('dpWv').textContent = o.width;
      }
      o.height = v;
    }
    applyElementCss(dpSelectedEl, o);
    elv(prop === 'width' ? 'dpWv' : 'dpHv').textContent = v;
    updateSelectionBox(); saveDesign();
  }
  window.dpSize = dpSize;

  function dpAlign(align){
    const o = getOverrides(dpSelectedKey);
    o.align = align;
    applyElementCss(dpSelectedEl, o);
    saveDesign();
  }
  window.dpAlign = dpAlign;

  function dpBorderStyle(style){
    const o = getOverrides(dpSelectedKey);
    if(!o.border) o.border = {};
    o.border.style = style;
    applyElementCss(dpSelectedEl, o); saveDesign();
  }
  window.dpBorderStyle = dpBorderStyle;

  function dpBorderW(v){
    const o = getOverrides(dpSelectedKey);
    if(!o.border) o.border = {};
    o.border.width = parseInt(v, 10);
    if(o.border.width > 0 && !o.border.style) o.border.style = 'solid';
    if(!o.border.sides) o.border.sides = {top:true,right:true,bottom:true,left:true};
    applyElementCss(dpSelectedEl, o);
    elv('dpBorderWv').textContent = v;
    elv('dpBorderStyle').value = o.border.style || '';
    saveDesign();
  }
  window.dpBorderW = dpBorderW;

  function dpBorderColor(v){
    const o = getOverrides(dpSelectedKey);
    if(!o.border) o.border = {};
    o.border.color = v;
    applyElementCss(dpSelectedEl, o); saveDesign();
  }
  window.dpBorderColor = dpBorderColor;

  function dpRadius(v){
    const o = getOverrides(dpSelectedKey);
    if(!o.border) o.border = {};
    o.border.radius = parseInt(v, 10);
    applyElementCss(dpSelectedEl, o);
    elv('dpRadiusv').textContent = v;
    saveDesign();
  }
  window.dpRadius = dpRadius;

  function dpBg(v){
    const o = getOverrides(dpSelectedKey);
    o.bg = v;
    if(!o.bgOn) o.bgOn = true;
    elv('dpBgOn').checked = true;
    applyElementCss(dpSelectedEl, o); saveDesign();
  }
  window.dpBg = dpBg;

  function dpBgToggle(on){
    const o = getOverrides(dpSelectedKey);
    o.bgOn = on;
    applyElementCss(dpSelectedEl, o); saveDesign();
  }
  window.dpBgToggle = dpBgToggle;

  function dpTextColor(v){
    const o = getOverrides(dpSelectedKey);
    o.textColor = v;
    applyElementCss(dpSelectedEl, o); saveDesign();
  }
  window.dpTextColor = dpTextColor;

  function dpFontSize(v){
    const o = getOverrides(dpSelectedKey);
    o.fontSize = parseInt(v, 10);
    applyElementCss(dpSelectedEl, o);
    elv('dpFontSizev').textContent = v;
    saveDesign();
  }
  window.dpFontSize = dpFontSize;

  function dpFontWeight(v){
    const o = getOverrides(dpSelectedKey);
    o.fontWeight = v;
    applyElementCss(dpSelectedEl, o); saveDesign();
  }
  window.dpFontWeight = dpFontWeight;

  function dpRotate(v){
    const o = getOverrides(dpSelectedKey);
    o.rotate = parseInt(v, 10);
    applyElementCss(dpSelectedEl, o);
    elv('dpRotatev').textContent = v;
    saveDesign();
  }
  window.dpRotate = dpRotate;

  function dpShadow(v){
    const o = getOverrides(dpSelectedKey);
    o.shadow = parseInt(v, 10);
    applyElementCss(dpSelectedEl, o);
    elv('dpShadowv').textContent = v;
    saveDesign();
  }
  window.dpShadow = dpShadow;

  function dpLayer(dir){
    const o = getOverrides(dpSelectedKey);
    o.z = (o.z || 1) + dir;
    applyElementCss(dpSelectedEl, o); saveDesign();
  }
  window.dpLayer = dpLayer;

  function dpBorderQuick(style){
    const o = getOverrides(dpSelectedKey);
    if(!o.border) o.border = {};
    o.border.style = style;
    if(style === 'solid' && !o.border.width) o.border.width = 2;
    if(style === 'none') o.border.width = 0;
    if(!o.border.sides) o.border.sides = {top:true,right:true,bottom:true,left:true};
    applyElementCss(dpSelectedEl, o);
    syncPanel(); saveDesign();
  }
  window.dpBorderQuick = dpBorderQuick;

  function dpResetElement(){
    if(!dpSelectedKey) return;
    delete designState.elements[dpSelectedKey];
    applyElementCss(dpSelectedEl, {});
    applyDesignOverrides();
    syncPanel(); updateSelectionBox(); saveDesign();
  }
  window.dpResetElement = dpResetElement;

  /* ---------------- layout geral ---------------- */
  function dpCanvasW(v){
    const g = designState.general;
    g.canvasWidth = parseInt(v, 10);
    g.canvasAuto = false;
    elv('dpCanvasAuto').checked = false;
    elv('dpCanvasWv').textContent = v;
    applyGeneralOverrides(); saveDesign();
  }
  window.dpCanvasW = dpCanvasW;

  function dpCanvasAuto(on){
    const g = designState.general;
    g.canvasAuto = on;
    if(on) delete g.canvasWidth;
    applyGeneralOverrides(); syncGeneralPanel(); saveDesign();
  }
  window.dpCanvasAuto = dpCanvasAuto;

  function dpCanvasAlign(align){
    designState.general.canvasAlign = align;
    applyGeneralOverrides(); saveDesign();
  }
  window.dpCanvasAlign = dpCanvasAlign;

  function dpGap(v){
    designState.general.gap = parseInt(v, 10);
    elv('dpGapv').textContent = v;
    applyGeneralOverrides(); saveDesign();
  }
  window.dpGap = dpGap;

  function dpPad(v){
    designState.general.pad = parseInt(v, 10);
    elv('dpPadv').textContent = v;
    applyGeneralOverrides(); saveDesign();
  }
  window.dpPad = dpPad;

  function dpZoomSet(v){
    designState.general.zoom = parseInt(v, 10);
    elv('dpZoomv').textContent = v+'%';
    applyGeneralOverrides(); saveDesign();
  }
  window.dpZoomSet = dpZoomSet;

  function dpResetAll(){
    designState = {general:{}, elements:{}};
    applyDesignOverrides();
    syncPanel();
    saveDesign();
  }
  window.dpResetAll = dpResetAll;

  /* ---------------- presets / modelos salvos ---------------- */
  function collectCurrentState(){
    const ym = currentYM();
    return {
      savedAt: Date.now(),
      template: currentTemplate,
      month: document.getElementById('monthPicker').value,
      font: document.getElementById('fontSelect').value,
      theme: document.getElementById('themeSelect').value,
      slogan: typeof currentSloganText !== 'undefined' ? currentSloganText : '',
      icon: typeof currentFooterIcon !== 'undefined' ? currentFooterIcon : '',
      outline: typeof currentDateOutline !== 'undefined' ? currentDateOutline : false,
      plantBanner: typeof currentPlantBanner !== 'undefined' ? currentPlantBanner : 'none',
      gridStyle: typeof currentGridStyle !== 'undefined' ? currentGridStyle : 'solid',
      countries: typeof selectedCountries !== 'undefined' ? selectedCountries.slice() : [],
      general: JSON.parse(JSON.stringify(designState.general)),
      elements: JSON.parse(JSON.stringify(designState.elements))
    };
  }

  function dpSavePreset(){
    const name = elv('dpPresetName').value.trim();
    if(!name){ elv('dpPresetName').focus(); return; }
    designPresets[name] = collectCurrentState();
    saveDesignPresets();
    renderPresetList();
    elv('dpPresetName').value = '';
  }
  window.dpSavePreset = dpSavePreset;

  function dpApplyPreset(name){
    const snap = designPresets[name];
    if(!snap) return;
    applySnapshot(snap);
  }
  window.dpApplyPreset = dpApplyPreset;

  function dpCopyPreset(name){
    const snap = designPresets[name];
    if(!snap) return;
    const copyName = name + ' (cópia)';
    designPresets[copyName] = JSON.parse(JSON.stringify(snap));
    designPresets[copyName].savedAt = Date.now();
    saveDesignPresets();
    renderPresetList();
  }
  window.dpCopyPreset = dpCopyPreset;

  function dpDeletePreset(name){
    if(!confirm('Excluir o modelo "'+name+'"?')) return;
    delete designPresets[name];
    saveDesignPresets();
    renderPresetList();
  }
  window.dpDeletePreset = dpDeletePreset;

  /* -------- salvar como padrão do template -------- */
  const DEFAULT_KEY = 'cal_default_by_template';
  function getDefaultsMap(){
    try { return JSON.parse(localStorage.getItem(DEFAULT_KEY) || '{}'); } catch(e){ return {}; }
  }
  function dpSaveAsDefault(){
    const snap = collectCurrentState();
    const tpl = currentTemplate || 'classic';
    const map = getDefaultsMap();
    map[tpl] = snap;
    localStorage.setItem(DEFAULT_KEY, JSON.stringify(map));
    updateDefaultLabel();
    alert('Design salvo como padrão para o template "'+templateDisplayName(tpl)+'"!');
  }
  window.dpSaveAsDefault = dpSaveAsDefault;

  function dpClearDefault(){
    const tpl = currentTemplate || 'classic';
    const map = getDefaultsMap();
    delete map[tpl];
    localStorage.setItem(DEFAULT_KEY, JSON.stringify(map));
    updateDefaultLabel();
    alert('Padrão removido para o template "'+templateDisplayName(tpl)+'".');
  }
  window.dpClearDefault = dpClearDefault;

  function applyDefaultForTemplate(tpl){
    const map = getDefaultsMap();
    const snap = map[tpl];
    if(snap) applySnapshot(snap);
  }
  window.applyDefaultForTemplate = applyDefaultForTemplate;

  function templateDisplayName(tpl){
    const map = { classic:'Clássico Executivo', compact:'Mesa Corporativa', quarterly:'Trimestral', desk:'Painel Único', minimal:'Minimalista', original:'Original Progeral' };
    return map[tpl] || tpl;
  }

  function updateDefaultLabel(){
    const el = elv('dpCurrentTemplateName');
    if(!el) return;
    const tpl = currentTemplate || 'classic';
    const map = getDefaultsMap();
    const has = !!map[tpl];
    el.textContent = templateDisplayName(tpl) + (has ? ' (padrão salvo ✓)' : '');
  }
  window.updateDefaultLabel = updateDefaultLabel;

  function renderPresetList(){
    const box = elv('dpPresetList');
    const names = Object.keys(designPresets);
    if(!names.length){
      box.innerHTML = '<p class="thint" style="color:#8a8f9c;font-size:12px;margin:4px 0;">Nenhum modelo salvo ainda.</p>';
      return;
    }
    box.innerHTML = '';
    names.forEach(name => {
      const item = document.createElement('div');
      item.className = 'dp-preset-item';
      item.style.cssText = 'flex-wrap:wrap;';
      const label = document.createElement('div');
      label.className = 'name';
      label.textContent = name;
      const n = Object.keys(designPresets[name].elements || {}).length;
      const sub = document.createElement('div');
      sub.style.cssText = 'font-size:10px;color:#8a8f9c;font-weight:400;width:100%;';
      sub.textContent = n > 0 ? n+' elementos personalizados' : 'sem personalização';
      label.appendChild(sub);
      const btns = document.createElement('div');
      btns.style.cssText = 'display:flex;gap:4px;flex-wrap:wrap;';
      const b1 = document.createElement('button');
      b1.className = 'btn small gold';
      b1.textContent = 'Aplicar';
      b1.onclick = () => dpApplyPreset(name);
      const bCopy = document.createElement('button');
      bCopy.className = 'btn small secondary';
      bCopy.textContent = 'Copiar';
      bCopy.title = 'Cria uma cópia deste modelo';
      bCopy.onclick = () => dpCopyPreset(name);
      const b2 = document.createElement('button');
      b2.className = 'btn small secondary';
      b2.style.color = '#e74c3c';
      b2.textContent = 'Excluir';
      b2.onclick = () => dpDeletePreset(name);
      btns.appendChild(b1);
      btns.appendChild(bCopy);
      btns.appendChild(b2);
      item.appendChild(label);
      item.appendChild(btns);
      box.appendChild(item);
    });
  }
  window.renderPresetList = renderPresetList;
  window.designTestKey = () => dpSelectedKey;
  window.designPresets = () => designPresets;
  window.designTestExport = () => ({ version: 1, current: collectCurrentState() });

  /* ---------------- exportar / importar design JSON ---------------- */
  function download(filename, text){
    const blob = new Blob([text], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 800);
  }
  function dpExportJson(){
    const data = {
      app: 'calendario-progeral',
      version: 1,
      exportedAt: new Date().toISOString(),
      current: collectCurrentState(),
      presets: JSON.parse(JSON.stringify(designPresets))
    };
    download('design-progeral-'+Date.now()+'.json', JSON.stringify(data, null, 2));
  }
  window.dpExportJson = dpExportJson;

  function dpImportFile(input){
    const file = input.files && input.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try{
        const data = JSON.parse(reader.result);
        if(data.current && data.current.elements) designState = {general: data.current.general || {}, elements: data.current.elements};
        if(data.current) applySnapshot(data.current);
        if(data.presets && typeof data.presets === 'object'){
          Object.assign(designPresets, data.presets);
          saveDesignPresets();
          renderPresetList();
        }
        alert('Design importado com sucesso!');
      }catch(err){
        alert('Arquivo inválido: '+err.message);
      }
    };
    reader.readAsText(file);
    input.value = '';
  }
  window.dpImportFile = dpImportFile;

  function applySnapshot(snap){
    if(snap.month) elv('monthPicker').value = snap.month;
    if(snap.font && typeof changeFontFamily === 'function') changeFontFamily(snap.font);
    if(snap.theme && typeof changeTheme === 'function') changeTheme(snap.theme);
    if(typeof currentSloganText !== 'undefined') currentSloganText = snap.slogan || '';
    if(typeof currentFooterIcon !== 'undefined') currentFooterIcon = snap.icon || '';
    if(typeof currentDateOutline !== 'undefined') currentDateOutline = !!snap.outline;
    if(typeof currentPlantBanner !== 'undefined') currentPlantBanner = snap.plantBanner || 'none';
    if(typeof currentGridStyle !== 'undefined'){ currentGridStyle = snap.gridStyle || 'solid'; }
    if(typeof selectedCountries !== 'undefined' && snap.countries){
      selectedCountries = snap.countries.slice();
      if(typeof renderCountryChips === 'function') renderCountryChips();
      
    }
    const gsSel = document.getElementById('gridStyleSelect');
    if(gsSel) gsSel.value = currentGridStyle;
    designState.general = snap.general || {general:{}};
    designState.elements = snap.elements || {};
    const ym = currentYM();
    refreshCurrentView(ym.y, ym.m);
    syncPanel();
    saveDesign();
  }

  /* ---------------- inicialização ---------------- */
  function initDesign(){
    document.getElementById('dpImportFile').addEventListener('change', function(){ dpImportFile(this); });
    renderPresetList();
    syncGeneralPanel();
    applyDesignOverrides();
    setupBall();
    updateDefaultLabel();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initDesign);
  } else {
    initDesign();
  }
})();

