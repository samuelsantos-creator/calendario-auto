import json
from pathlib import Path

BASE = Path(__file__).resolve().parent

def read(p):
    return (BASE / p).read_text(encoding='utf-8')

assets = json.loads(read('assets_b64.json'))
template = read('src/template.html')
css = read('src/styles.css')
app_js = read('src/js/app.js')
design_js = read('src/js/design.js')

libs = {
    '__LIB_HTML2CANVAS__': read('libs/html2canvas.min.js'),
    '__LIB_JSPDF__': read('libs/jspdf.umd.min.js'),
    '__LIB_JSZIP__': read('libs/jszip.min.js'),
}

repl = {
    '__CSS__': css,
    '__JS_APP__': app_js + '\n\n/* ===== MODO DESIGN (PINCEL) ===== */\n' + design_js,
    '__LOGO_PROGERAL__': assets['logo-progeral.png'],
    '__FLAG_BR__': assets['bandeira-brasil.png'],
    '__FLAG_CN__': assets['bandeira-china.png'],
    '__FLAG_MX__': assets['bandeira-mexico.png'],
    '__MARKER_BR__': assets['marcador-brasil.png'],
    '__MARKER_CN__': assets['marcador-china.png'],
    '__MARKER_MX__': assets['marcador-mexico.png'],
    '__PLANT_B1__': assets['planta-banner-1.jpg'],
    '__PLANT_B2__': assets['planta-banner-2.jpg'],
    '__PLANT_B3__': assets['planta-banner-3.jpg'],
}

missing = []
for key in libs:
    if libs[key].strip():
        template = template.replace(key, libs[key])
    else:
        missing.append(key)
missing += [k for k in repl if repl[k] == '']

if missing:
    raise SystemExit('ERRO: placeholders sem conteúdo: ' + ', '.join(missing))

for key, val in repl.items():
    template = template.replace(key, val)

for k in template.split('__'):
    if k.startswith('LIB_') or k.startswith('JS_') or k.startswith('CSS') or k.startswith('LOGO_') \
       or k.startswith('FLAG_') or k.startswith('MARKER_') or k.startswith('PLANT_'):
        raise SystemExit('ERRO: placeholder não substituído: __' + k + '__')

out = BASE / 'calendario_v3_template.html'
out.write_text(template, encoding='utf-8')
print(f'OK: {out.name} gerado com {len(template):,} bytes')

index = BASE / 'index.html'
index.write_text(template, encoding='utf-8')
print(f'OK: {index.name} gerado (cópia para deploy) com {len(template):,} bytes')
