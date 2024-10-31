const express = require ('express');
const cors = require('cors');
const db = require('./src/config/db');  // Conexión a la BD

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Rutas de usuarios
const usuariosRoutes = require('./src/routes/usuarios');
app.use('/usuarios', usuariosRoutes);

// Rutas de tarjetas
const tarjetasRoutes = require('./src/routes/tarjetas');
app.use('/tarjetas', tarjetasRoutes);

app.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error conectando a la base de datos');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});