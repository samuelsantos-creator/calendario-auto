import base64
import json
import os

ASSETS = {
    'logo-progeral.png': 'assets/logo-progeral.png',
    'bandeira-brasil.png': 'assets/bandeiras/bandeira-brasil.png',
    'bandeira-china.png': 'assets/bandeiras/bandeira-china.png',
    'bandeira-mexico.png': 'assets/bandeiras/bandeira-mexico.png',
    'marcador-brasil.png': 'assets/marcadores/marcador-brasil.png',
    'marcador-china.png': 'assets/marcadores/marcador-china.png',
    'marcador-mexico.png': 'assets/marcadores/marcador-mexico.png',
    'planta-banner-1.jpg': 'assets/plantas/planta-banner-1.jpg',
    'planta-banner-2.jpg': 'assets/plantas/planta-banner-2.jpg',
    'planta-banner-3.jpg': 'assets/plantas/planta-banner-3.jpg',
}


def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    assets = {}
    missing = []

    for name, rel_path in ASSETS.items():
        path = os.path.join(base_dir, rel_path)
        if not os.path.exists(path):
            missing.append(rel_path)
            continue
        with open(path, 'rb') as f:
            assets[name] = 'data:image/' + (name.rsplit('.', 1)[1] or 'png') + ';base64,' + base64.b64encode(f.read()).decode('ascii')

    if missing:
        raise SystemExit('ERRO: arquivos de imagem nao encontrados: ' + ', '.join(missing))

    out = os.path.join(base_dir, 'assets_b64.json')
    with open(out, 'w', encoding='utf-8') as f:
        json.dump(assets, f, ensure_ascii=False)

    total_mb = sum(len(v) for v in assets.values()) / 1024 / 1024
    print('assets_b64.json gerado com {} imagens ({:.1f} MB).'.format(len(assets), total_mb))


if __name__ == '__main__':
    main()
