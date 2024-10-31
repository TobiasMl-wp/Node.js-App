const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Registro de usuario
router.post('/registrar', async (req, res) => {
  const { nombre, apellido, dni, correo, contraseña } = req.body;

  try {
    const resultado = await db.query(
      'INSERT INTO usuarios (nombre, apellido, dni, correo, contraseña) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nombre, apellido, dni, correo, contraseña]
    );
    res.status(201).json({ usuario: resultado.rows[0] });
  } catch (error) {
    console.error(error);

    // Manejo específico de errores de duplicado
    if (error.code === '23505') { // Código de error de PostgreSQL para violación de llave única
      return res.status(400).json({ error: 'El correo o DNI ya está registrado' });
    }

    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

/// Inicio de sesión
router.post('/iniciar-sesion', async (req, res) => {
  const { correo, contraseña } = req.body;

  try {
    const resultado = await db.query(
      'SELECT * FROM usuarios WHERE correo = $1 AND contraseña = $2',
      [correo, contraseña]
    );

    if (resultado.rows.length > 0) {
      // Si la autenticación es exitosa, devolvemos el usuario
      res.status(200).json({ usuario: resultado.rows[0] });
    } else {
      // Si no hay coincidencias, devolvemos un error claro
      res.status(400).json({ error: 'Correo o contraseña incorrectos' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// Obtener las tarjetas de un usuario
router.get('/:id_usuario/tarjetas', async (req, res) => {
  const { id_usuario } = req.params;

  try {
    const resultado = await db.query(
      'SELECT * FROM tarjetas WHERE id_usuario = $1',
      [id_usuario]
    );
    res.status(200).json({ tarjetas: resultado.rows });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener las tarjetas del usuario');
  }
});

module.exports = router;