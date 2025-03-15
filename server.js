const express = require('express');
const sql = require('mssql');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de la base de datos
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true,  // Habilita la encriptación
        trustServerCertificate: true,  // Permite certificados autofirmados
        enableArithAbort: true
    }
};

// Endpoint para obtener todas las categorías
app.get('/categorias', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request().query("SELECT * FROM Categorias");
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Endpoint para obtener todos los productos
app.get('/productos', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request().query("SELECT * FROM Productos");
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Endpoint para obtener un producto por ID
app.get('/productos/:id_pro', async (req, res) => {
    try {
        const { id_pro } = req.params;
        let pool = await sql.connect(dbConfig);
        let result = await pool.request()
            .input('id_pro', sql.Int, id_pro)
            .query("SELECT * FROM Productos WHERE id_pro = @id_pro");
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Endpoint para crear un nuevo producto
app.post('/productos', async (req, res) => {
    try {
        const { nombres, precio, stock, url, id_cat } = req.body;
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('nombres', sql.NVarChar, nombres)  // Cambiado nombre a nombres
            .input('precio', sql.Float, precio)
            .input('stock', sql.Int, stock)
            .input('url', sql.NVarChar, url)
            .input('id_cat', sql.Int, id_cat)
            .query(`
                INSERT INTO Productos (nombres, precio, stock,  url, id_cat)
                VALUES (@nombres, @precio, @stock,  @url, @id_cat)
            `);
        res.status(201).send('Producto creado exitosamente');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Endpoint para actualizar un producto
app.put('/productos/:id_pro', async (req, res) => {  
    try {
        const { id_pro } = req.params;
        const { nombres, precio, stock, descripcion, url, id_cat } = req.body;
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id_pro', sql.Int, id_pro)
            .input('nombres', sql.NVarChar, nombres)  // Cambiado nombre a nombres
            .input('precio', sql.Float, precio)
            .input('stock', sql.Int, stock)
            .input('url', sql.NVarChar, url)
            .input('id_cat', sql.Int, id_cat)
            .query(`
                UPDATE Productos
                SET nombres = @nombres, precio = @precio, stock = @stock, url = @url, id_cat = @id_cat
                WHERE id_pro = @id_pro
            `);
        res.send('Producto actualizado exitosamente');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Endpoint para eliminar un producto
app.delete('/productos/:id_pro', async (req, res) => {  
    try {
        const { id_pro } = req.params;
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id_pro', sql.Int, id_pro)
            .query("DELETE FROM Productos WHERE id_pro = @id_pro");
        res.send('Producto eliminado exitosamente');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Endpoint para cambiar la categoría de un producto
app.put('/productos/cambiar-categoria/:id_pro', async (req, res) => {  
    try {
        const { id_pro } = req.params;
        const { id_cat } = req.body;  // Nueva categoría
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id_pro', sql.Int, id_pro)
            .input('id_cat', sql.Int, id_cat)
            .query("UPDATE Productos SET id_cat = @id_cat WHERE id_pro = @id_pro");
        res.send('Categoría del producto actualizada exitosamente');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Endpoint para agregar una nueva categoría
app.post('/categorias', async (req, res) => {
    try {
        const { Nom_cat } = req.body;
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('Nom_cat', sql.NVarChar, Nom_cat)
            .query(`
                INSERT INTO Categorias (Nom_cat)
                VALUES (@Nom_cat)
            `);
        res.status(201).send('Categoría creada exitosamente');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Endpoint para actualizar una categoría
app.put('/categorias/:id_cat', async (req, res) => {
    try {
        const { id_cat } = req.params;
        const { Nom_cat } = req.body;
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id_cat', sql.Int, id_cat)
            .input('Nom_cat', sql.NVarChar, Nom_cat)
            .query(`
                UPDATE Categorias
                SET Nom_cat = @Nom_cat
                WHERE id_cat = @id_cat
            `);
        res.send('Categoría actualizada exitosamente');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Endpoint para eliminar una categoría
app.delete('/categorias/:id_cat', async (req, res) => {
    try {
        const { id_cat } = req.params;
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input('id_cat', sql.Int, id_cat)
            .query("DELETE FROM Categorias WHERE id_cat = @id_cat");
        res.send('Categoría eliminada exitosamente');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Iniciar el servidor en el puerto 3000
app.listen(3000, () => console.log('API corriendo en el puerto 3000'));
