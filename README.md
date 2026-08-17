# Calendario Corporativo - Progeral Global

Editor de calendarios corporativos com identidade visual Progeral. Aplicacao 100% client-side (HTML/CSS/JS), sem necessidade de backend.

## Modelos disponiveis

- **Original Progeral** - Replica da identidade visual: foto da planta, mini-calendario, data em destaque
- **Mesa Corporativa** - Painel lateral com dia em destaque + grade do mes
- **Classico Executivo** - Mes atual + mes anterior, paineis de feriados
- **Painel Unico** - Calendario centralizado, visual limpo
- **Trimestral** - Tres meses lado a lado para planejamento
- **Minimalista Premium** - Bordas arredondadas, grades leves

## Funcionalidades

- Feriados automaticos para 15 paises (via API Nager.at)
- Temas e cores personalizaveis
- Exportacao PNG, PDF e ZIP (12 meses)
- Modo Design: arrastar, redimensionar e estilizar elementos
- Persistencia via localStorage

## Estrutura do projeto

```
src/
  template.html      # Template HTML com placeholders
  styles.css         # Estilos
  js/app.js          # Logica principal
  js/design.js       # Modo design (pincel)
libs/
  html2canvas.min.js
  jspdf.umd.min.js
  jszip.min.js
assets/
  logo-progeral.png
  bandeiras/         # Bandeiras dos paises
  marcadores/        # Marcadores de feriados
  plantas/           # Banners da planta
build_assets.py      # Converte imagens para base64
build_html.py        # Monta index.html final
```

## Build

Requer Python 3.10+.

```bash
# 1. Gerar assets_b64.json (converte imagens para base64)
python build_assets.py

# 2. Gerar index.html (injeta CSS, JS e assets no template)
python build_html.py
```

O arquivo `index.html` gerado contem todo o aplicativo em um unico arquivo (~8MB).

## Deploy

Copie o arquivo `index.html` para qualquer servidor HTTP estatico:

- Nginx
- Apache
- IIS
- Node.js (`npx http-server`)
- Qualquer outro servidor de arquivos estaticos

Nao e necessario backend, banco de dados ou runtime adicional.
