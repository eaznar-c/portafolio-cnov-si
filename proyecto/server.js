const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./quiz.db");

// Crear tablas
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS resultados (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT,
            puntaje INTEGER,
            fecha DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
});

// Guardar resultado
app.post("/guardar", (req, res) => {
    const { nombre, puntaje } = req.body;

    db.run(
        "INSERT INTO resultados (nombre, puntaje) VALUES (?, ?)",
        [nombre, puntaje],
        function (err) {
            if (err) return res.status(500).send(err);
            res.send({ mensaje: "Guardado correctamente" });
        }
    );
});

// Obtener ranking
app.get("/ranking", (req, res) => {
    db.all(
        "SELECT * FROM resultados ORDER BY puntaje DESC, fecha ASC LIMIT 10",
        [],
        (err, rows) => {
            if (err) return res.status(500).send(err);
            res.json(rows);
        }
    );
});

// Estadísticas
app.get("/stats", (req, res) => {
    db.get(
        `SELECT 
            AVG(puntaje) as promedio,
            MAX(puntaje) as maximo,
            COUNT(*) as intentos
        FROM resultados`,
        [],
        (err, row) => {
            if (err) return res.status(500).send(err);
            res.json(row);
        }
    );
});

app.listen(3000, () => console.log("Servidor en http://localhost:3000"));