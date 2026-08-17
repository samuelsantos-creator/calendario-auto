import json

with open('assets_b64.json', 'r', encoding='utf-8') as f:
    assets = json.load(f)

html_template = '''<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Calendário Corporativo — Progeral Global</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,600;0,700;0,800;0,900;1,400;1,600;1,700&family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500;600&family=Outfit:wght@400;600;700;800&family=Montserrat:wght@400;600;700;800&family=Roboto:wght@400;500;700&family=Playfair+Display:ital,wght@0,600;0,800;1,600&display=swap" rel="stylesheet">
<script>/* html2canvas 1.4.1 (embutido localmente) */
__LIB_HTML2CANVAS__</script>
<script>/* jsPDF 2.5.1 (embutido localmente) */
__LIB_JSPDF__</script>
<script>/* JSZip 3.10.1 (embutido localmente) */
__LIB_JSZIP__</script>
<style>
  :root{
    --navy:#0B1F3F;
    --navy-deep:#071938;
    --gold:#C9A227;
    --gold-soft:#E4C874;
    --cream:#F7F5F0;
    --ink:#171B24;
    --steel:#5B6478;
    --line:#E3DED2;
    --burgundy:#7A2338;
    --white:#ffffff;
    --weekend-bg:#f4f6fb;
    --font-title:'Fraunces', Georgia, serif;
    --font-body:'Inter', Arial, Helvetica, sans-serif;
  }
  *{box-sizing:border-box;}
  body{
    margin:0;
    font-family:var(--font-body);
    background:
      radial-gradient(circle at 10% 0%, #12294f 0%, transparent 45%),
      linear-gradient(180deg, var(--navy-deep) 0%, #0d213f 340px, #e9e6de 340px, #e9e6de 100%);
    background-attachment:fixed;
    padding:28px;
    color:var(--ink);
  }
  h1,h2,h3{ font-family:var(--font-title); }

  /* ---------- MODAL ---------- */
  .modal-overlay{
    position:fixed; inset:0; background:rgba(4,10,24,0.72);
    display:flex; align-items:center; justify-content:center;
    z-index:1000; padding:24px; backdrop-filter:blur(2px);
  }
  .modal-overlay.hidden{display:none;}
  .modal{
    background:#fff; border-radius:18px; max-width:1040px; width:100%;
    max-height:92vh; overflow-y:auto; padding:32px 34px;
    box-shadow:0 30px 70px rgba(0,0,0,0.45);
    border-top:5px solid var(--gold);
  }
  .modal .eyebrow{ font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:2.5px; color:var(--gold); text-transform:uppercase; font-weight:600; margin-bottom:6px;}
  .modal h2{ margin:0 0 6px 0; color:var(--navy); font-size:26px; font-weight:700;}
  .modal > p{ margin:0 0 22px 0; color:#666; font-size:13.5px; max-width:620px; line-height:1.5;}
  .template-grid{
    display:grid; grid-template-columns:repeat(3,1fr); gap:16px;
  }
  .template-card{
    border:1.5px solid var(--line); border-radius:14px; padding:13px;
    display:flex; flex-direction:column; gap:8px; transition:box-shadow .15s, transform .15s;
  }
  .template-card:hover{ box-shadow:0 10px 24px rgba(11,31,63,0.12); transform:translateY(-2px); }
  .template-card h3{ margin:0; font-size:14.5px; color:var(--navy); font-weight:700;}
  .template-card p{ margin:0; font-size:11.5px; color:#666; line-height:1.4; min-height:48px;}
  .thumb{
    width:100%; aspect-ratio:16/11; background:var(--cream); border:1px solid var(--line);
    border-radius:8px; overflow:hidden; display:flex; flex-direction:column; padding:6px; gap:4px;
  }
  .thumb .band{ height:18%; background:var(--navy); border-radius:3px; flex-shrink:0; position:relative;}
  .thumb .band::after{ content:''; position:absolute; left:0; right:0; bottom:0; height:2px; background:var(--gold);}
  .thumb .band.foot{ background:var(--navy-deep); }
  .thumb .mid{ flex:1; display:flex; gap:4px; min-height:0; }
  .thumb .block{ background:#fff; border:1px solid var(--line); border-radius:4px; flex:1; display:flex; flex-direction:column; gap:3px; padding:3px;}
  .thumb .sub{ background:var(--cream); border:1px solid var(--line); border-radius:3px; flex:1;}
  .thumb .sub.gold{ background:var(--gold-soft); border-color:var(--gold);}
  .thumb.round .band{ border-radius:8px; }
  .thumb.round .block{ border-radius:10px; }
  .thumb.round .sub{ border-radius:6px; }
  .thumb .dots{ display:flex; gap:3px; justify-content:center; padding:2px 0;}
  .thumb .dots span{ width:4px; height:4px; border-radius:50%; background:var(--gold);}
  .thumb .hero-num{ font-family:var(--font-title); font-weight:800; font-size:22px; color:var(--navy); text-align:center;}
  .template-card button{
    margin-top:auto; background:var(--navy); color:#fff; border:none;
    padding:10px; border-radius:8px; font-weight:700; font-size:12.5px; cursor:pointer;
    letter-spacing:.3px;
  }
  .template-card button:hover{ background:var(--navy-deep); }
  .template-card.featured{ border-color:var(--gold); background:linear-gradient(180deg,#fffdf7,#fff); }
  .badge-new{ display:inline-block; background:var(--gold); color:var(--navy-deep); font-size:9.5px; font-weight:800; letter-spacing:.5px; padding:2px 7px; border-radius:20px; margin-left:6px; vertical-align:middle;}

  /* ---------- TOOLBAR ---------- */
  .toolbar{
    max-width:1536px; margin:0 auto 18px auto; background:#fff;
    border:1px solid var(--line); border-radius:16px; padding:18px 20px 20px;
    box-shadow:0 10px 30px rgba(0,0,0,0.18);
    border-top:3px solid var(--gold);
  }
  .toolbar-head{ display:flex; align-items:center; gap:14px; margin-bottom:16px; padding-bottom:14px; border-bottom:1px dashed var(--line); flex-wrap:wrap; }
  .toolbar-head h1{ font-size:17px; color:var(--navy); margin:0; font-weight:800; font-family:var(--font-title); }
  .toolbar-head .tb-sub{ display:block; font-size:10.5px; color:#8a8f9c; font-weight:600; letter-spacing:.8px; margin-top:2px; text-transform:uppercase; }
  .toolbar-head > button{ margin-left:auto; }
  .toolbar-cards{ display:grid; grid-template-columns:repeat(auto-fit,minmax(300px,1fr)); gap:12px; }
  .tcard{ border:1px solid var(--line); border-radius:13px; padding:12px 14px; background:linear-gradient(180deg,#fff,var(--cream)); }
  .tcard h2{
    font-size:10.5px; letter-spacing:1.4px; text-transform:uppercase; color:var(--gold);
    font-weight:800; margin:0 0 10px 0; font-family:var(--font-body);
    display:flex; align-items:center; gap:7px;
  }
  .tcard h2::before{ content:''; width:8px; height:8px; border-radius:3px; background:var(--gold); box-shadow:0 0 0 3px rgba(201,162,39,0.18); flex-shrink:0; }
  .trow{ display:flex; flex-wrap:wrap; gap:10px; align-items:center; }
  .tcard label{ font-size:12px; color:#555; display:flex; align-items:center; gap:6px; font-weight:500; flex-wrap:wrap; }
  .tcard label.tblk{ flex-direction:column; align-items:flex-start; gap:3px; font-size:10px; text-transform:uppercase; letter-spacing:.6px; color:#8a8f9c; font-weight:700; }
  .tcard .thint{ font-size:11px; color:#8a8f9c; margin:8px 0 0 0; line-height:1.45; }
  .toolbar input[type=month], .toolbar select, .toolbar input[type=color]{
    font-size:12.5px; padding:6px 8px; border:1px solid var(--line); border-radius:7px; font-family:inherit; cursor:pointer;
  }
  .toolbar input[type=color]{ width:34px; height:32px; padding:2px; border-radius:6px; }
  .toolbar input[type=checkbox]{ accent-color:var(--gold); width:15px; height:15px; cursor:pointer; }
  label.chk{ cursor:pointer; }
  #exportStatus{ font-size:12px; color:#777; }
  .btn{
    background:var(--navy); color:#fff; border:none; padding:9px 17px;
    border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; letter-spacing:.2px;
  }
  .btn:hover{ background:var(--navy-deep); }
  .btn.gold{ background:var(--gold); color:var(--navy-deep); }
  .btn.gold:hover{ background:var(--gold-soft); }
  .btn.secondary{ background:#fff; color:var(--navy); border:1.5px solid var(--navy); }
  .btn.small{ padding:6px 12px; font-size:12px; border-radius:6px; }
  .btn:disabled{ opacity:.5; cursor:not-allowed; }
  .file-btn{
    background:#fff; color:var(--navy); border:1.5px solid var(--line);
    padding:6px 12px; border-radius:6px; font-size:12px; cursor:pointer; font-weight:600;
  }
  .file-btn:hover{ border-color:var(--navy); }
  .divider{ width:1px; height:22px; background:var(--line); }

  /* ---------- CALENDAR CAPTURE ---------- */
  #calendar-capture{
    max-width:1536px; margin:0 auto; background:#ffffff; overflow:hidden;
    box-shadow:0 25px 60px rgba(0,0,0,0.35); border-radius:8px;
  }
  .banner-img{ width:100%; display:block; }
  .cal-wrap{ display:flex; gap:22px; padding:26px 28px 22px 28px; align-items:flex-start; }
  .cal-wrap.triple{ gap:16px; padding:24px; }
  .cal-col{ flex:1 1 0; min-width:0; }
  .cal-col.small{ flex:0 0 40%; }
  .cal-col.third{ flex:1 1 0; }

  .title-box{
    border:1.5px solid var(--line); border-radius:10px; padding:10px 12px;
    text-align:center; margin-bottom:13px; background:linear-gradient(180deg,#fff,var(--cream));
    position:relative;
  }
  .title-box span{ font-family:var(--font-title); font-weight:700; font-size:19px; color:var(--navy); letter-spacing:.3px; }
  .cal-col.small .title-box span, .cal-col.third .title-box span{ font-size:14px; }

  table.cal{ width:100%; border-collapse:collapse; table-layout:fixed; border:1px solid var(--line); }
  table.cal th, table.cal td{ border:1px solid var(--line); text-align:center; padding:0; }
  table.cal thead th{ background:var(--navy); color:#fff; padding:8px 3px; line-height:1.25; }
  table.cal thead th .l1{ display:block; font-size:12.5px; font-weight:700; text-transform:uppercase; }
  table.cal thead th .l2{ display:block; font-size:8.5px; font-weight:400; opacity:.8; text-transform:uppercase; }
  .cal-col.small table.cal thead th .l1, .cal-col.third table.cal thead th .l1{ font-size:10.5px; }
  .cal-col.small table.cal thead th .l2, .cal-col.third table.cal thead th .l2{ font-size:7px; }

  th.week-h{ width:58px; }
  .cal-col.small th.week-h, .cal-col.third th.week-h{ width:42px; }

  td.week-num{
    background:var(--cream); color:var(--navy); font-family:'IBM Plex Mono',monospace; font-weight:600; font-size:14px;
    vertical-align:middle; outline:none; height:62px;
  }
  .cal-col.small td.week-num, .cal-col.third td.week-num{ font-size:11px; height:44px; }

  td.day{ font-size:20px; font-weight:500; color:var(--ink); vertical-align:middle; outline:none; height:62px; position:relative;}
  .cal-col.small td.day, .cal-col.third td.day{ font-size:14px; height:44px; }
  td.day.weekend{ color:var(--burgundy); font-weight:800; background:var(--weekend-bg); }
  td.day.holiday{ background:#fbf3df; }
  td.day.holiday::after{
    content:''; position:absolute; bottom:6px; left:50%; transform:translateX(-50%);
    width:5px; height:5px; border-radius:50%; background:var(--gold);
  }
  td.day[contenteditable]:focus, td.week-num[contenteditable]:focus{ background:#eef2fb; }

  .row-controls{ display:flex; gap:6px; margin-top:8px; justify-content:flex-end; }

  .panels{ display:flex; gap:16px; margin-top:15px; }
  .panel{ flex:1; border:1px solid var(--line); border-radius:9px; padding:11px 13px; background:linear-gradient(180deg,#fff,var(--cream)); }
  .panel h3{ font-size:11px; color:var(--navy); margin:0; text-transform:uppercase; font-weight:800; letter-spacing:.4px; font-family:var(--font-body);}
  .panel h3 small{ font-size:8px; font-weight:500; color:#8a8f9c; display:block; text-transform:uppercase; margin-top:1px;}
  .panel .line{ border-bottom:1px dotted #c7bfa4; height:19px; margin-top:8px; font-size:11.5px; color:var(--navy); outline:none; }

  .compact-wrap{ padding:38px; display:flex; justify-content:center; }
  .compact-wrap .cal-col{ max-width:940px; }
  .compact-wrap .title-box{ padding:16px; }
  .compact-wrap .title-box span{ font-size:26px; }
  .compact-wrap td.day{ font-size:27px; height:80px; }
  .compact-wrap td.week-num{ font-size:16px; height:80px; }

  /* ---------- MINIMAL SKIN ---------- */
  [data-template="minimal"] #calendar-capture{ border-radius:30px; }
  [data-template="minimal"] .cal-wrap{ padding:36px; gap:30px; }
  [data-template="minimal"] table.cal, [data-template="minimal"] table.cal th, [data-template="minimal"] table.cal td{ border:none; }
  [data-template="minimal"] table.cal tbody tr td{ border-bottom:1px solid #eee9dc; }
  [data-template="minimal"] table.cal thead th{ background:transparent; color:var(--navy); border-bottom:2px solid var(--gold); }
  [data-template="minimal"] table.cal thead th .l2{ color:#9aa0ad; }
  [data-template="minimal"] td.week-num{ background:var(--navy); color:#fff; border-radius:14px; }
  [data-template="minimal"] .title-box{ border-radius:999px; border-color:var(--navy); background:var(--cream); }
  [data-template="minimal"] .panel{ border-radius:16px; border-color:#eee9dc; background:#fbfaf6; }

  /* ---------- DESK CARD (Mesa Corporativa) ---------- */
  [data-template="desk"] #calendar-capture{ background:linear-gradient(180deg,#fff,#faf9f6); }
  .desk-wrap{ padding:0; }
  .desk-spiral{ display:flex; justify-content:center; gap:22px; padding:10px 0 4px; background:var(--navy-deep); }
  .desk-spiral span{ width:11px; height:11px; border-radius:50%; background:var(--cream); box-shadow:inset 0 2px 3px rgba(0,0,0,.35);}
  .desk-hero{ display:flex; gap:0; }
  .desk-left{
    flex:0 0 300px; background:linear-gradient(160deg,var(--navy) 0%, var(--navy-deep) 100%);
    color:#fff; padding:34px 28px; display:flex; flex-direction:column; justify-content:center; gap:6px;
    position:relative; overflow:hidden;
  }
  .desk-left::before{
    content:''; position:absolute; right:-40px; top:-40px; width:160px; height:160px; border-radius:50%;
    background:radial-gradient(circle, rgba(201,162,39,0.25), transparent 70%);
  }
  .desk-left .eyebrow{ font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:3px; color:var(--gold-soft); text-transform:uppercase; }
  .desk-left .bignum{ font-family:var(--font-title); font-size:96px; font-weight:800; line-height:.95; margin:6px 0 0 0;}
  .desk-left .weekday{ font-size:15px; color:#cdd6ec; font-weight:600; }
  .desk-left .monthyear{ font-size:13.5px; color:var(--gold-soft); letter-spacing:1px; text-transform:uppercase; margin-top:10px; font-weight:700;}
  .desk-right{ flex:1; padding:26px 28px; min-width:0; }
  .desk-right .title-box{ display:none; }
  .desk-right table.cal thead th{ background:var(--cream); color:var(--navy); border-bottom:2px solid var(--gold); }
  .desk-right table.cal thead th .l2{ color:#9aa0ad; }
  .desk-right td.week-num{ background:#fff; }

  /* ---------- ORIGINAL PROGERAL (Réplica Oficial Exata) ---------- */
  .orig-hero {
    position: relative;
    width: 100%;
    height: 320px;
    overflow: hidden;
    background: var(--navy-deep);
  }
  .orig-photo-wrap {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
  .orig-photo-wrap img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
  }
  .orig-logo-box {
    position: absolute;
    top: 0;
    left: 0;
    width: 285px;
    height: 140px;
    background: var(--navy-deep);
    border-radius: 0 0 42px 0;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px 24px;
    box-shadow: 4px 4px 18px rgba(0,0,0,0.22);
  }
  .orig-logo-box img {
    max-width: 220px;
    max-height: 90px;
    width: auto;
    height: auto;
    object-fit: contain;
    display: block;
  }

  .orig-title-block {
    position: absolute;
    left: 34px;
    bottom: 22px;
    z-index: 3;
    pointer-events: auto;
  }
  .orig-title-block .bigdate {
    font-family: var(--font-title);
    font-weight: 800;
    font-size: 42px;
    color: var(--navy-deep);
    line-height: 1;
    letter-spacing: -0.5px;
    outline: none;
    text-shadow: 0 1px 2px rgba(255,255,255,0.7);
  }
  .orig-title-block .submonth {
    font-family: var(--font-title);
    font-style: italic;
    font-size: 20px;
    color: #7b889b;
    margin-top: 2px;
    outline: none;
  }
  .orig-title-block .rule {
    width: 220px;
    height: 3.5px;
    background: linear-gradient(90deg, var(--navy-deep), #8fa5d6);
    margin-top: 8px;
    border-radius: 2px;
  }

  /* Contorno (outline) na data em destaque — legível sobre qualquer fundo */
  .orig-title-block .bigdate.outlined,
  .orig-title-block .submonth.outlined{
    -webkit-text-stroke: 1.3px #ffffff;
    -webkit-text-fill-color: var(--navy-deep);
    paint-order: stroke fill;
    text-shadow: 0 0 6px rgba(255,255,255,0.85), 0 0 12px rgba(255,255,255,0.6), 0 2px 5px rgba(0,0,0,0.3);
  }

  /* MINI-CALENDÁRIO AMPLIADO (Próximo Mês) */
  .orig-mini-cal {
    position: absolute;
    right: 32px;
    top: 18px;
    width: 462px;
    z-index: 4;
    background: #ffffff;
    border: 1.5px solid var(--navy-deep);
    border-radius: 16px;
    padding: 14px 18px 16px;
    box-shadow: 0 10px 26px rgba(7,25,56,0.18);
  }
  .orig-mini-cal .mini-title {
    font-family: var(--font-title);
    font-weight: 800;
    font-size: 21px;
    color: var(--navy-deep);
    margin-bottom: 10px;
    line-height: 1.2;
  }
  .orig-mini-cal .mini-title small {
    font-family: var(--font-body);
    font-weight: 400;
    font-size: 14px;
    color: #7f8798;
  }
  table.mini-cal {
    width: 100%;
    border-collapse: collapse;
  }
  table.mini-cal th {
    font-size: 9.5px;
    color: var(--navy-deep);
    font-weight: 700;
    padding: 2px 0 4px;
    text-transform: uppercase;
    text-align: center;
    line-height: 1.15;
  }
  table.mini-cal th .l1{ display:block; }
  table.mini-cal th .l2{ display:block; font-size:7.5px; font-weight:400; opacity:.7; }
  table.mini-cal td {
    font-size: 14px;
    color: var(--navy-deep);
    font-weight: 600;
    text-align: center;
    padding: 4px 0;
    position: relative;
    height: 28px;
  }
  table.mini-cal td .mini-markers {
    position: absolute;
    left: 50%;
    bottom: 0px;
    transform: translateX(-50%);
    display: flex;
    gap: 1px;
    align-items: center;
    white-space: nowrap;
  }

  .orig-grid-wrap {
    padding: 22px 32px 0 32px;
    background: #ffffff;
  }
  table.orig-cal {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    border: 1.5px solid var(--navy-deep);
    border-radius: 14px;
    overflow: hidden;
  }
  table.orig-cal thead th {
    background: var(--navy);
    color: #ffffff;
    font-size: 13px;
    font-weight: 700;
    padding: 12px 4px;
    letter-spacing: 0.3px;
    text-align: center;
  }
  table.orig-cal thead th.weekend-h {
    background: var(--navy-deep);
  }
  table.orig-cal thead th:first-child {
    width: 72px;
    background: var(--navy-deep);
  }
  table.orig-cal td {
    border-top: 1px solid #e6e9f0;
    border-left: 1px solid #e6e9f0;
    text-align: left;
    vertical-align: top;
    height: 76px;
    padding: 8px 10px;
    position: relative;
  }
  table.orig-cal td:first-child {
    border-left: none;
  }
  table.orig-cal tbody tr:first-child td {
    border-top: none;
  }
  td.orig-week-num {
    background: var(--navy-deep);
    color: #ffffff;
    text-align: center !important;
    font-family: var(--font-title);
    font-weight: 800;
    font-size: 25px;
    vertical-align: middle !important;
    padding: 0 !important;
    border-bottom: 1px solid rgba(255,255,255,0.18);
  }
  table.orig-cal tbody tr:last-child td.orig-week-num {
    border-bottom: none;
  }
  td.orig-day {
    font-family: var(--font-body);
    font-weight: 700;
    font-size: 17px;
    color: var(--navy-deep);
    outline: none;
  }
  td.orig-day.weekend {
    background: var(--weekend-bg);
  }
  td.orig-day .day-markers {
    position: absolute;
    bottom: 6px;
    right: 8px;
    display: flex;
    gap: 3px;
    align-items: center;
  }
  /* Tamanhos proporcionais de marcadores e bandeiras (todas os modelos) */
  .marker-img {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: 0 1px 3px rgba(0,0,0,0.25);
  }
  .flag-img {
    width: 24px;
    height: 16px;
    border-radius: 2px;
    object-fit: cover;
    box-shadow: 0 1px 2px rgba(0,0,0,0.15);
  }
  .mini-marker-img {
    width: 11px;
    height: 11px;
    border-radius: 50%;
    object-fit: cover;
  }

  /* RODAPÉ EDITÁVEL & FLEXÍVEL */
  .orig-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 34px 24px;
    background: #ffffff;
    flex-wrap: wrap;
    gap: 14px;
  }
  .orig-footer-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .orig-footer-left .ico-target {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: 2px solid var(--navy-deep);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    flex-shrink: 0;
  }
  .orig-footer-left .ico-target::before, .orig-footer-left .ico-target::after {
    content: ''; position: absolute; background: var(--navy-deep);
  }
  .orig-footer-left .ico-target::before { width: 100%; height: 1.5px; }
  .orig-footer-left .ico-target::after { width: 1.5px; height: 100%; }
  .orig-footer-left .ico-target span {
    width: 12px; height: 12px; border-radius: 50%; background: var(--navy-deep); z-index: 2;
  }
  .orig-footer-left .txt {
    font-family: var(--font-title);
    font-weight: 600;
    font-size: 15px;
    color: var(--navy-deep);
    line-height: 1.25;
    outline: none;
  }
  .orig-footer-right {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
  .orig-footer-right .chip {
    display: flex;
    align-items: center;
    gap: 7px;
    font-weight: 700;
    font-size: 13px;
    color: var(--navy-deep);
  }
  .orig-footer-right .sep {
    width: 1px;
    height: 18px;
    background: #d7dbe4;
  }

  @media print{
    body{ background:#fff; padding:0; }
    .toolbar, .modal-overlay{ display:none; }
    #calendar-capture{ box-shadow:none; border-radius:0; }
  }
  @media (max-width:900px){
    .template-grid{ grid-template-columns:repeat(2,1fr); }
    .desk-hero{ flex-direction:column; }
    .desk-left{ flex:none; }
  }
</style>
</head>
<body>

  <div class="modal-overlay" id="templateModal">
    <div class="modal">
      <div class="eyebrow">Progeral Global · Coleção 2026</div>
      <h2>Escolha o modelo do seu calendário</h2>
      <p>Layouts pensados para calendários de mesa e impressos corporativos. Escolha o modelo e edite tudo facilmente.</p>
      <div class="template-grid">

        <div class="template-card featured">
          <div class="thumb">
            <div class="mid" style="flex-direction:row; gap:3px;">
              <div class="block" style="flex:.85; background:var(--navy); border-radius:6px 0 6px 0;"></div>
              <div class="block" style="flex:1.3; background:#cfd6e4; border-radius:4px; position:relative;">
                <div class="sub" style="position:absolute; right:2px; top:2px; width:46%; height:70%; background:#fff; border:1px solid var(--navy); border-radius:5px;"></div>
              </div>
            </div>
            <div class="mid"><div class="block"><div class="sub"></div></div></div>
          </div>
          <h3>Original Progeral <span class="badge-new">Exclusivo</span></h3>
          <p>Réplica exata da identidade Progeral: foto da planta, mini-calendário do próximo mês, data em destaque e bandeiras/marcadores institucionais.</p>
          <button onclick="chooseTemplate('original')">Usar este modelo</button>
        </div>

        <div class="template-card">
          <div class="thumb">
            <div class="dots"><span></span><span></span><span></span><span></span><span></span></div>
            <div class="mid" style="flex-direction:row;">
              <div class="block" style="flex:.9; background:var(--navy); border-radius:6px; padding:6px; justify-content:center;">
                <div class="hero-num" style="color:#fff; font-size:30px;">14</div>
              </div>
              <div class="block"><div class="sub"></div></div>
            </div>
          </div>
          <h3>Mesa Corporativa <span class="badge-new">Novo</span></h3>
          <p>Estilo calendário de mesa: painel lateral com o dia em destaque + grade do mês.</p>
          <button onclick="chooseTemplate('desk')">Usar este modelo</button>
        </div>

        <div class="template-card">
          <div class="thumb">
            <div class="band"></div>
            <div class="mid">
              <div class="block" style="flex:1.5"><div class="sub"></div></div>
              <div class="block"><div class="sub"></div><div class="sub gold" style="flex:.4"></div><div class="sub" style="flex:.4"></div></div>
            </div>
            <div class="band foot"></div>
          </div>
          <h3>Clássico Executivo</h3>
          <p>Mês atual em destaque + mês anterior como referência, com painéis de feriados e anotações.</p>
          <button onclick="chooseTemplate('classic')">Usar este modelo</button>
        </div>

        <div class="template-card">
          <div class="thumb">
            <div class="band"></div>
            <div class="mid"><div class="block"><div class="sub gold"></div></div></div>
            <div class="band foot"></div>
          </div>
          <h3>Painel Único</h3>
          <p>Apenas o calendário do mês, maior e centralizado — visual limpo, tipografia grande.</p>
          <button onclick="chooseTemplate('compact')">Usar este modelo</button>
        </div>

        <div class="template-card">
          <div class="thumb">
            <div class="band"></div>
            <div class="mid">
              <div class="block"><div class="sub"></div></div>
              <div class="block"><div class="sub gold"></div></div>
              <div class="block"><div class="sub"></div></div>
            </div>
            <div class="band foot"></div>
          </div>
          <h3>Trimestral / Planejamento</h3>
          <p>Três calendários lado a lado: mês anterior, atual e próximo. Ideal para planejamento executivo.</p>
          <button onclick="chooseTemplate('quarterly')">Usar este modelo</button>
        </div>

        <div class="template-card">
          <div class="thumb round">
            <div class="band"></div>
            <div class="mid">
              <div class="block" style="flex:1.5"><div class="sub"></div></div>
              <div class="block"><div class="sub"></div><div class="sub gold" style="flex:.4"></div><div class="sub" style="flex:.4"></div></div>
            </div>
            <div class="band foot"></div>
          </div>
          <h3>Minimalista Premium</h3>
          <p>Mesma estrutura do Clássico, com bordas arredondadas e grades leves.</p>
          <button onclick="chooseTemplate('minimal')">Usar este modelo</button>
        </div>

      </div>
    </div>
  </div>

  <div class="toolbar">
    <div class="toolbar-head">
      <div>
        <h1>Editor de Calendário</h1>
        <span class="tb-sub">Progeral Global · Coleção 2026</span>
      </div>
      <button class="btn secondary small" onclick="openModal()">⇄ Trocar modelo</button>
    </div>

    <div class="toolbar-cards">

      <div class="tcard">
        <h2>Mês / Período</h2>
        <div class="trow">
          <label>Mês/ano <input type="month" id="monthPicker" onchange="applyMonth()"></label>
          <button class="btn small" onclick="applyMonth()">Aplicar</button>
          <label class="tblk">Escopo de exportação
            <select id="exportScope"><option value="month">Mês atual</option><option value="year">Ano completo (12 meses)</option></select>
          </label>
        </div>
      </div>

      <div class="tcard">
        <h2>Identidade Visual</h2>
        <div class="trow">
          <label>Banner da planta
            <select id="plantBannerSelect" onchange="changePlantBanner(this.value)">
              <option value="b1">Opção 1 — Fachada Principal</option>
              <option value="b2">Opção 2 — Entrada & Prédio</option>
              <option value="b3">Opção 3 — Visão Panorâmica</option>
            </select>
          </label>
          <label>Fonte
            <select id="fontSelect" onchange="changeFontFamily(this.value)">
              <option value="default">Fraunces + Inter (Corporativo)</option>
              <option value="outfit">Outfit (Moderno & Elegante)</option>
              <option value="montserrat">Montserrat (Geométrico)</option>
              <option value="roboto">Roboto (Clean)</option>
              <option value="playfair">Playfair Display (Editorial)</option>
              <option value="mono">IBM Plex Mono (Industrial)</option>
            </select>
          </label>
          <label>Slogan
            <select id="sloganSelect" onchange="applySloganPreset(this.value)">
              <option value="Precisão que conecta.<br>Qualidade que move.">Precisão que conecta. Qualidade que move.</option>
              <option value="Qualidade e inovação<br>em sistemas de fixação.">Qualidade e inovação em fixação.</option>
              <option value="Engenharia de precisão<br>para soluções globais.">Engenharia de precisão para soluções globais.</option>
              <option value="Progeral — Conectando<br>tecnologia e excelência.">Progeral — Tecnologia e excelência.</option>
            </select>
          </label>
          <label>Ícone
            <select id="iconSelect" onchange="changeFooterIcon(this.value)">
              <option value="target">Mira / Alvo</option>
              <option value="star">Estrela</option>
              <option value="none">Sem ícone</option>
            </select>
          </label>
        </div>
      </div>

      <div class="tcard">
        <h2>Tema & Cores</h2>
        <div class="trow">
          <label>Tema
            <select id="themeSelect" onchange="changeTheme(this.value)">
              <option value="navy">Progeral Navy (Padrão)</option>
              <option value="safira">Azul Safira & Prata</option>
              <option value="grafite">Grafite Industrial</option>
              <option value="esmeralda">Verde Esmeralda</option>
              <option value="bordo">Bordô Executive</option>
            </select>
          </label>
          <label>Principal <input type="color" id="primaryColorPicker" value="#071938" onchange="updateCustomColors()"></label>
          <label>Secundária <input type="color" id="secondaryColorPicker" value="#0B1F3F" onchange="updateCustomColors()"></label>
          <label>Fim de semana <input type="color" id="weekendColorPicker" value="#F4F6FB" onchange="updateCustomColors()"></label>
        </div>
      </div>

      <div class="tcard">
        <h2>Imagens</h2>
        <div class="trow">
          <label class="file-btn">Trocar topo<input type="file" accept="image/*" id="topUpload" hidden></label>
          <label class="file-btn">Trocar rodapé<input type="file" accept="image/*" id="bottomUpload" hidden></label>
          <button class="btn small secondary" onclick="resetImages()">Padrão Progeral</button>
        </div>
        <p class="thint">Banners de topo/rodapé aparecem nos modelos Clássico, Painel Único, Trimestral e Mesa.</p>
      </div>

      <div class="tcard">
        <h2>Países & Feriados</h2>
        <div class="trow">
          <div id="countryChips"></div>
          <select id="countryAdd" onchange="addCountryChip(this.value); this.value='';">
            <option value="">+ adicionar país</option>
            <option value="BR">🇧🇷 Brasil</option>
            <option value="MX">🇲🇽 México</option>
            <option value="CN">🇨🇳 China</option>
            <option value="US">🇺🇸 Estados Unidos</option>
            <option value="PT">🇵🇹 Portugal</option>
            <option value="AR">🇦🇷 Argentina</option>
            <option value="GB">🇬🇧 Reino Unido</option>
            <option value="DE">🇩🇪 Alemanha</option>
            <option value="FR">🇫🇷 França</option>
            <option value="ES">🇪🇸 Espanha</option>
            <option value="IT">🇮🇹 Itália</option>
            <option value="CA">🇨🇦 Canadá</option>
            <option value="JP">🇯🇵 Japão</option>
            <option value="NL">🇳🇱 Países Baixos</option>
            <option value="AU">🇦🇺 Austrália</option>
          </select>
          <button class="btn small gold" onclick="fetchHolidays()">Buscar feriados</button>
        </div>
      </div>

      <div class="tcard">
        <h2>Data em destaque</h2>
        <div class="trow">
          <label class="chk"><input type="checkbox" id="outlineToggle" onchange="setDateOutline(this.checked)"> Contorno (outline) na data</label>
        </div>
      </div>

      <div class="tcard">
        <h2>Exportar</h2>
        <div class="trow">
          <button class="btn" onclick="exportPNG()" id="btnPng">Baixar PNG</button>
          <button class="btn secondary" onclick="exportPDF()" id="btnPdf">Baixar PDF</button>
          <span id="exportStatus"></span>
        </div>
      </div>

    </div>
  </div>

  <div id="calendar-capture" data-template="original">
    <img class="banner-img" id="topBanner" src="" alt="Topo" style="display:none;">
    <div id="calendarBody"></div>
    <img class="banner-img bottom" id="bottomBanner" src="" alt="Rodapé" style="display:none;">
  </div>

<script>
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
  if(MARKERS_B64[code]){
    return '<img class="marker-img" src="'+MARKERS_B64[code]+'" alt="'+code+'">';
  }
  return '<span style="font-size:13px;line-height:1;">'+flagEmoji(code)+'</span>';
}

function getMiniMarkerImgHTML(code){
  if(MARKERS_B64[code]){
    return '<img class="mini-marker-img" src="'+MARKERS_B64[code]+'" alt="'+code+'">';
  }
  return '<span style="font-size:8px;line-height:1;">'+flagEmoji(code)+'</span>';
}

let currentTemplate = 'original';
let uid = 0;
let holidaysMap = {};
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
  renderTemplate(currentTemplate, y, m);
  saveState();
}

function setDateOutline(on){
  currentDateOutline = !!on;
  const {y,m} = currentYM();
  renderTemplate(currentTemplate, y, m);
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
  renderTemplate(currentTemplate, y, m);
  saveState();
}
function removeCountryChip(code){
  selectedCountries = selectedCountries.filter(c => c !== code);
  renderCountryChips();
  const {y,m} = currentYM();
  renderTemplate(currentTemplate, y, m);
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
        const hs = holidaysMap[key] || [];
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
  return Object.keys(holidaysMap)
    .filter(k => k.startsWith(prefix))
    .sort()
    .map(k => k.slice(8,10)+'/'+k.slice(5,7)+' — '+holidaysMap[k].map(h=>h.name).join(' / '));
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

function renderClassicLike(year, m){
  const prev = shiftMonth(year, m, -1);
  uid++;
  const idMain = 'body-main-'+uid, idSec = 'body-sec-'+uid;
  let html = '<div class="cal-wrap">';
  html += '<div class="cal-col"><div class="title-box"><span>'+titleFor(year,m)+'</span></div>'+tableHTML(year,m,DIAS_FULL,idMain)+'</div>';
  html += '<div class="cal-col small"><div class="title-box"><span>'+titleFor(prev.y,prev.m)+'</span></div>'+tableHTML(prev.y,prev.m,DIAS_ABR,idSec)+panelsHTML(year,m)+'</div>';
  html += '</div>';
  html += countriesFooterHTML();
  return html;
}

function renderCompact(year, m){
  uid++;
  const idMain = 'body-main-'+uid;
  let html = '<div class="compact-wrap"><div class="cal-col">';
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
  let html = '<div class="cal-wrap triple">';
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
  const today = new Date();
  const useToday = (today.getFullYear()===year && today.getMonth()===m);
  const heroDay = useToday ? today.getDate() : 1;
  const weekdayName = DIAS_SEMANA_PT[new Date(year,m,heroDay).getDay()];
  let html = '<div class="desk-wrap">';
  html += '<div class="desk-spiral">'+'<span></span>'.repeat(14)+'</div>';
  html += '<div class="desk-hero">';
  html += '<div class="desk-left">';
  html += '<div class="eyebrow">Progeral Global</div>';
  html += '<div class="bignum">'+String(heroDay).padStart(2,'0')+'</div>';
  html += '<div class="weekday">'+weekdayName+'</div>';
  html += '<div class="monthyear">'+MESES_PT[m]+' '+year+'</div>';
  html += '</div>';
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
  const hs = holidaysMap[key] || [];
  if(!hs.length) return '';
  return '<span class="mini-markers">' + hs.map(h => getMiniMarkerImgHTML(h.code)).join('') + '</span>';
}

function markersForDateMain(year, m, d){
  const key = dateKey(year, m, d);
  const hs = holidaysMap[key] || [];
  if(!hs.length) return '';
  return '<div class="day-markers">' + hs.map(h => getMarkerImgHTML(h.code)).join('') + '</div>';
}

function renderOrigMiniCal(year, m){
  const weeks = buildWeeksMon(year, m);
  let h = '<div class="orig-mini-cal"><div class="mini-title">'+MESES_PT[m]+' <small>/ '+MESES_PT[m].charAt(0)+MESES_PT[m].slice(1).toLowerCase()+'</small></div>';
  h += '<table class="mini-cal"><thead><tr>' + DIAS_FULL_MON.map(d=>'<th><span class="l1">'+d[0]+'</span><span class="l2">'+d[1]+'</span></th>').join('') + '</tr></thead><tbody>';
  weeks.forEach(week => {
    h += '<tr>';
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
  const plantSrc = topImageSrc || PLANT_BANNERS[currentPlantBanner] || PLANT_BANNERS.b1;

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

function renderTemplate(templateId, year, m){
  currentTemplate = templateId;
  document.getElementById('calendar-capture').setAttribute('data-template', templateId);
  const body = document.getElementById('calendarBody');
  const topB = document.getElementById('topBanner');
  const botB = document.getElementById('bottomBanner');

  if(templateId === 'original'){
    topB.style.display = 'none';
    botB.style.display = 'none';
    body.innerHTML = renderOriginal(year, m);
  } else {
    topB.style.display = topImageSrc ? 'block' : 'none';
    botB.style.display = bottomImageSrc ? 'block' : 'none';
    if(templateId === 'classic' || templateId === 'minimal'){
      body.innerHTML = renderClassicLike(year, m);
    } else if(templateId === 'compact'){
      body.innerHTML = renderCompact(year, m);
    } else if(templateId === 'quarterly'){
      body.innerHTML = renderQuarterly(year, m);
    } else if(templateId === 'desk'){
      body.innerHTML = renderDesk(year, m);
    }
  }
}

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
  renderTemplate(id, y, m);
  fetchHolidays();
  saveState();
}
renderCountryChips();
function openModal(){ document.getElementById('templateModal').classList.remove('hidden'); }

function applyMonth(){
  const val = document.getElementById('monthPicker').value;
  if(!val) return;
  const [y,mm] = val.split('-').map(Number);
  renderTemplate(currentTemplate, y, mm-1);
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
    renderTemplate(currentTemplate, y, m);
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
    renderTemplate(currentTemplate, y, m);
    saveState();
  };
  reader.readAsDataURL(f);
});
function resetImages(){
  topImageSrc = '';
  bottomImageSrc = '';
  document.getElementById('topBanner').src = '';
  document.getElementById('bottomBanner').src = '';
  const {y,m} = currentYM();
  renderTemplate(currentTemplate, y, m);
  saveState();
}
async function fetchHolidays(){
  const val = document.getElementById('monthPicker').value;
  const [y] = val ? val.split('-').map(Number) : [new Date().getFullYear()];
  if(selectedCountries.length===0){
    holidaysMap = {};
    holidaysYearLoaded = y;
    renderTemplate(currentTemplate, y, currentYM().m);
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
      renderTemplate(currentTemplate, y, m);
      setStatus('Feriados carregados.');
      setTimeout(()=>setStatus(''), 2500);
    }
  }catch(err){
    holidaysYearLoaded = y;
    const {m} = currentYM();
    renderTemplate(currentTemplate, y, m);
    setStatus('Não foi possível buscar feriados (rede indisponível).');
    setTimeout(()=>setStatus(''), 3500);
  }
}

async function captureCanvas(){
  const el = document.getElementById('calendar-capture');
  return await html2canvas(el, {scale:3, backgroundColor:'#ffffff', useCORS:true});
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
    link.download = 'calendario-progeral.png';
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
    pdf.save('calendario-progeral.pdf');
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

async function exportYearPDF(){
  setButtonsDisabled(true);
  const {y: origY, m: origM} = getSelectedYearMonth();
  let pdf = null;
  for(let m=0;m<12;m++){
    setStatus('Gerando PDF do ano: mês '+(m+1)+' de 12...');
    renderTemplate(currentTemplate, origY, m);
    await new Promise(r => setTimeout(r, 60));
    const canvas = await captureCanvas();
    const imgData = canvas.toDataURL('image/png');
    if(m===0){
      pdf = new window.jspdf.jsPDF({orientation:'landscape', unit:'px', format:[canvas.width, canvas.height]});
    } else {
      pdf.addPage([canvas.width, canvas.height], 'landscape');
    }
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
  }
  pdf.save('calendario-progeral-'+origY+'.pdf');
  renderTemplate(currentTemplate, origY, origM);
  setStatus('');
  setButtonsDisabled(false);
}

async function exportYearZip(){
  setButtonsDisabled(true);
  const {y: origY, m: origM} = getSelectedYearMonth();
  const zip = new JSZip();
  for(let m=0;m<12;m++){
    setStatus('Gerando PNG do ano: mês '+(m+1)+' de 12...');
    renderTemplate(currentTemplate, origY, m);
    await new Promise(r => setTimeout(r, 60));
    const canvas = await captureCanvas();
    const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
    zip.file(String(m+1).padStart(2,'0')+'-'+MESES_PT_SLUG[m]+'-'+origY+'.png', blob);
  }
  setStatus('Compactando arquivo .zip...');
  const content = await zip.generateAsync({type:'blob'});
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url; a.download = 'calendario-progeral-'+origY+'.zip'; a.click();
  URL.revokeObjectURL(url);
  renderTemplate(currentTemplate, origY, origM);
  setStatus('');
  setButtonsDisabled(false);
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
    countries: selectedCountries
  });
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.assign(base(), {top: topImageSrc||'', bottom: bottomImageSrc||''})));
  }catch(e){
    try{
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.assign(base(), {top:'', bottom:''})));
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
  if(st.top) topImageSrc = st.top;
  if(st.bottom) bottomImageSrc = st.bottom;
  renderCountryChips();
}

// Inicialização
function initApp(){
  loadState();
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
</script>

</body>
</html>
'''

# Perform exact string replacements
import os

ASSET_PLACEHOLDERS = {
    '__LOGO_PROGERAL__': 'logo-progeral.png',
    '__FLAG_BR__': 'bandeira-brasil.png',
    '__FLAG_CN__': 'bandeira-china.png',
    '__FLAG_MX__': 'bandeira-mexico.png',
    '__MARKER_BR__': 'marcador-brasil.png',
    '__MARKER_CN__': 'marcador-china.png',
    '__MARKER_MX__': 'marcador-mexico.png',
    '__PLANT_B1__': 'planta-banner-1.jpg',
    '__PLANT_B2__': 'planta-banner-2.jpg',
    '__PLANT_B3__': 'planta-banner-3.jpg',
}

LIB_PLACEHOLDERS = {
    '__LIB_HTML2CANVAS__': 'libs/html2canvas.min.js',
    '__LIB_JSPDF__': 'libs/jspdf.umd.min.js',
    '__LIB_JSZIP__': 'libs/jszip.min.js',
}

def read_lib(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    return content.replace('</script', '<\\/script')

missing_assets = [key for key in ASSET_PLACEHOLDERS.values() if key not in assets]
if missing_assets:
    raise SystemExit('ERRO: chaves ausentes em assets_b64.json: ' + ', '.join(missing_assets))

all_placeholders = list(ASSET_PLACEHOLDERS) + list(LIB_PLACEHOLDERS)
missing_placeholders = [p for p in all_placeholders if p not in html_template]
if missing_placeholders:
    raise SystemExit('ERRO: placeholder nao encontrado no template: ' + ', '.join(missing_placeholders))

html_output = html_template
for placeholder, asset_key in ASSET_PLACEHOLDERS.items():
    html_output = html_output.replace(placeholder, assets[asset_key])
for placeholder, lib_path in LIB_PLACEHOLDERS.items():
    html_output = html_output.replace(placeholder, read_lib(lib_path))

leftover = [p for p in all_placeholders if p in html_output]
if leftover:
    raise SystemExit('ERRO: placeholders nao substituidos: ' + ', '.join(leftover))

with open('calendario_v3_template.html', 'w', encoding='utf-8') as f:
    f.write(html_output)

print('calendario_v3_template.html compilado com sucesso!')
print('Tamanho: {:.1f} KB'.format(os.path.getsize('calendario_v3_template.html') / 1024))
