const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

// Permitir requisições do front-end no Netlify
app.use(cors({
    origin: 'https://drricardomendesvet.netlify.app/' // Substitua pela URL do seu front-end no Netlify
}));
const app = express();
const port = process.env.PORT || 3000;

// Conectar ao banco de dados SQLite
const db = new sqlite3.Database('./database.db');

// Criar tabela de clientes se não existir
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS clientes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT,
            nomePaciente TEXT,
            email TEXT,
            telefone TEXT,
            observacoes TEXT
        )
    `);
});

app.use(cors());
app.use(express.json());

// Rota para listar todos os clientes
app.get('/clientes', (req, res) => {
    db.all('SELECT * FROM clientes', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Rota para cadastrar um novo cliente
app.post('/cadastrar', (req, res) => {
    const { nome, nomePaciente, email, telefone, observacoes } = req.body;
    const sql = `INSERT INTO clientes (nome, nomePaciente, email, telefone, observacoes) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [nome, nomePaciente, email, telefone, observacoes], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, nome, nomePaciente, email, telefone, observacoes });
    });
});

// Rota para editar um cliente
app.put('/editar/:id', (req, res) => {
    const { nome, nomePaciente, email, telefone, observacoes } = req.body;
    const sql = `UPDATE clientes SET nome = ?, nomePaciente = ?, email = ?, telefone = ?, observacoes = ? WHERE id = ?`;
    db.run(sql, [nome, nomePaciente, email, telefone, observacoes, req.params.id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: req.params.id, nome, nomePaciente, email, telefone, observacoes });
    });
});

// Rota para remover um cliente
app.delete('/remover/:id', (req, res) => {
    const sql = `DELETE FROM clientes WHERE id = ?`;
    db.run(sql, [req.params.id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Cliente removido com sucesso!' });
    });
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});