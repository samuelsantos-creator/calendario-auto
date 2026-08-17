"""
Servidor do Calendario Corporativo Progeral
Flask + SQLite — serve o index.html e a API de presets compartilhados.

Uso:
    python server.py              (porta 8080)
    python server.py --port 3000  (porta customizada)
"""

import os, sys, json, sqlite3, time, argparse
from flask import Flask, request, jsonify, send_from_directory, g

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH  = os.path.join(BASE_DIR, 'presets.db')

app = Flask(__name__)

# ─── Banco de Dados ──────────────────────────────────────────────

def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
        g.db.execute('PRAGMA journal_mode=WAL')
        g.db.execute('PRAGMA foreign_keys=ON')
    return g.db

@app.teardown_appcontext
def close_db(exc):
    db = g.pop('db', None)
    if db is not None:
        db.close()

def init_db():
    db = sqlite3.connect(DB_PATH)
    db.execute('''
        CREATE TABLE IF NOT EXISTS presets (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT NOT NULL,
            template    TEXT DEFAULT '',
            is_default  INTEGER DEFAULT 0,
            data        TEXT NOT NULL,
            created_at  TEXT DEFAULT (datetime('now')),
            updated_at  TEXT DEFAULT (datetime('now'))
        )
    ''')
    db.execute('CREATE UNIQUE INDEX IF NOT EXISTS idx_preset_name ON presets(name)')
    db.commit()
    db.close()

# ─── API: Presets Compartilhados ─────────────────────────────────

@app.route('/api/presets', methods=['GET'])
def list_presets():
    db = get_db()
    rows = db.execute('SELECT id, name, template, is_default, created_at, updated_at FROM presets ORDER BY is_default DESC, name ASC').fetchall()
    return jsonify([dict(r) for r in rows])

@app.route('/api/presets/<int:preset_id>', methods=['GET'])
def get_preset(preset_id):
    db = get_db()
    row = db.execute('SELECT * FROM presets WHERE id = ?', (preset_id,)).fetchone()
    if not row:
        return jsonify({'error': 'Preset nao encontrado'}), 404
    r = dict(row)
    r['data'] = json.loads(r['data'])
    return jsonify(r)

@app.route('/api/presets', methods=['POST'])
def save_preset():
    body = request.get_json(force=True)
    name = (body.get('name') or '').strip()
    if not name:
        return jsonify({'error': 'Nome obrigatorio'}), 400
    data = json.dumps(body.get('data', {}), ensure_ascii=False)
    template = body.get('template', '')
    is_default = 1 if body.get('is_default') else 0
    db = get_db()
    try:
        if is_default:
            db.execute('UPDATE presets SET is_default = 0 WHERE template = ? AND is_default = 1', (template,))
        db.execute(
            'INSERT INTO presets (name, template, is_default, data) VALUES (?, ?, ?, ?) '
            'ON CONFLICT(name) DO UPDATE SET data=excluded.data, template=excluded.template, '
            'is_default=excluded.is_default, updated_at=datetime("now")',
            (name, template, is_default, data)
        )
        db.commit()
        return jsonify({'ok': True, 'message': 'Preset salvo com sucesso!'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/presets/<int:preset_id>', methods=['DELETE'])
def delete_preset(preset_id):
    db = get_db()
    db.execute('DELETE FROM presets WHERE id = ?', (preset_id,))
    db.commit()
    return jsonify({'ok': True})

@app.route('/api/presets/<int:preset_id>/default', methods=['PUT'])
def set_default(preset_id):
    db = get_db()
    row = db.execute('SELECT template FROM presets WHERE id = ?', (preset_id,)).fetchone()
    if not row:
        return jsonify({'error': 'Preset nao encontrado'}), 404
    db.execute('UPDATE presets SET is_default = 0 WHERE template = ?', (row['template'],))
    db.execute('UPDATE presets SET is_default = 1 WHERE id = ?', (preset_id,))
    db.commit()
    return jsonify({'ok': True})

@app.route('/api/presets/defaults', methods=['GET'])
def get_defaults():
    db = get_db()
    rows = db.execute('SELECT * FROM presets WHERE is_default = 1').fetchall()
    result = {}
    for r in rows:
        result[r['template']] = json.loads(r['data'])
    return jsonify(result)

# ─── Arquivos Estáticos ──────────────────────────────────────────

@app.route('/')
def index():
    return send_from_directory(BASE_DIR, 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory(BASE_DIR, filename)

# ─── Main ────────────────────────────────────────────────────────

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Calendario Progeral Server')
    parser.add_argument('--port', type=int, default=8080)
    parser.add_argument('--host', default='0.0.0.0')
    args = parser.parse_args()

    init_db()
    print(f'=== Calendario Corporativo Progeral ===')
    print(f'Banco de dados: {DB_PATH}')
    print(f'Servidor: http://{args.host}:{args.port}')
    print(f'Pressione Ctrl+C para parar')
    app.run(host=args.host, port=args.port, debug=False)
