# Calendario Corporativo - Progeral Global

Editor de calendarios corporativos com identidade visual Progeral.

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
- **Presets compartilhados** via servidor (SQLite)
- Persistencia local (localStorage) como fallback

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
server.py            # Backend Flask + SQLite (API de presets)
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

### Opcao 1: Servidor com API (recomendado)

Para presets compartilhados entre usuarios, rode o servidor Flask:

```bash
pip install flask
python server.py              # porta 8080
python server.py --port 3000  # porta customizada
```

O servidor:
- Serve o `index.html` como pagina principal
- Expoe a API REST de presets (`/api/presets`)
- Cria automaticamente o banco `presets.db` (SQLite)
- Qualquer pessoa que acesse o servidor pode salvar/carregar presets compartilhados

### Opcao 2: Arquivo estatico (sem API)

Copie o `index.html` para qualquer servidor HTTP estatico (Nginx, Apache, IIS, etc).
Os presets serao salvos apenas no navegador do usuario (localStorage).

## API de Presets

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/api/presets` | Listar todos os presets |
| GET | `/api/presets/:id` | Buscar preset por ID |
| POST | `/api/presets` | Salvar preset (upsert por nome) |
| DELETE | `/api/presets/:id` | Excluir preset |
| PUT | `/api/presets/:id/default` | Marcar como padrao do template |
| GET | `/api/presets/defaults` | Buscar todos os pads default |

### Exemplo de uso da API

```bash
# Salvar um preset
curl -X POST http://localhost:8080/api/presets \
  -H "Content-Type: application/json" \
  -d '{"name":"Meu Modelo","template":"original","data":{...}}'

# Listar presets
curl http://localhost:8080/api/presets
```
