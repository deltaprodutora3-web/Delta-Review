const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "../database/contentflow.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Erro ao conectar com o banco:", err.message);
  } else {
    console.log("Banco de dados conectado com sucesso!");
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      nicho TEXT,
      instagram TEXT,
      conteudos_mes INTEGER DEFAULT 0,
      responsavel TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS conteudos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      cliente_id INTEGER,
      formato TEXT,
      plataforma TEXT,
      objetivo TEXT,
      responsavel TEXT,
      prioridade TEXT,
      status TEXT DEFAULT 'Ideia',
      data_publicacao DATE,
      descricao TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS ideias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER,
      titulo TEXT NOT NULL,
      tema TEXT,
      objetivo TEXT,
      formato TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    )
  `);

  console.log("Tabelas do ContentFlow verificadas com sucesso!");
});

module.exports = db;