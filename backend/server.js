const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 3000;

// Conectar ao banco de dados SQLite
const db = new sqlite3.Database('./database.db');

// Criar tabela de pacientes (se não existir)
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS clients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            patientName TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            observations TEXT
        )
    `);
});

// Middleware
app.use(cors());
app.use(express.json());

// Rotas da API

// Listar todos os pacientes (com busca opcional)
app.get('/api/clients', (req, res) => {
    const searchQuery = req.query.search || '';
    const query = `
        SELECT * FROM clients
        WHERE name LIKE ? OR patientName LIKE ? OR email LIKE ? OR phone LIKE ?
    `;
    const searchParam = `%${searchQuery}%`;

    db.all(query, [searchParam, searchParam, searchParam, searchParam], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Adicionar um novo paciente
app.post('/api/clients', (req, res) => {
    const { name, patientName, email, phone, observations } = req.body;
    const query = `
        INSERT INTO clients (name, patientName, email, phone, observations)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.run(query, [name, patientName, email, phone, observations], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID });
    });
});

// Atualizar um paciente
app.put('/api/clients/:id', (req, res) => {
    const { name, patientName, email, phone, observations } = req.body;
    const query = `
        UPDATE clients
        SET name = ?, patientName = ?, email = ?, phone = ?, observations = ?
        WHERE id = ?
    `;

    db.run(query, [name, patientName, email, phone, observations, req.params.id], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true });
    });
});

// Remover um paciente
app.delete('/api/clients/:id', (req, res) => {
    const query = 'DELETE FROM clients WHERE id = ?';

    db.run(query, [req.params.id], (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true });
    });
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});