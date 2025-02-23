const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const port = 3000;

// Conectar ao banco de dados SQLite
const db = new sqlite3.Database('./database.db');

// Criar tabela de clientes (se não existir)
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS clientes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            nomePaciente TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            telefone TEXT NOT NULL,
            observacoes TEXT
        )
    `);
});

// Middleware para processar JSON e permitir CORS
app.use(express.json());
app.use(cors());

// Rota para cadastrar cliente
app.post('/cadastrar', (req, res) => {
    const { nome, nomePaciente, email, telefone, observacoes } = req.body;

    const sql = `INSERT INTO clientes (nome, nomePaciente, email, telefone, observacoes) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [nome, nomePaciente, email, telefone, observacoes], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ 
            id: this.lastID, 
            nome, 
            nomePaciente, 
            email, 
            telefone, 
            observacoes 
        });
    });
});

// Rota para listar clientes
app.get('/clientes', (req, res) => {
    const sql = `SELECT * FROM clientes`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Rota para editar cliente
app.put('/editar/:id', (req, res) => {
    const { nome, nomePaciente, email, telefone, observacoes } = req.body;
    const { id } = req.params;

    const sql = `UPDATE clientes SET nome = ?, nomePaciente = ?, email = ?, telefone = ?, observacoes = ? WHERE id = ?`;
    db.run(sql, [nome, nomePaciente, email, telefone, observacoes, id], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ 
            id, 
            nome, 
            nomePaciente, 
            email, 
            telefone, 
            observacoes 
        });
    });
});

// Rota para remover cliente
app.delete('/remover/:id', (req, res) => {
    const { id } = req.params;

    const sql = `DELETE FROM clientes WHERE id = ?`;
    db.run(sql, [id], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ message: 'Cliente removido com sucesso!' });
    });
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});