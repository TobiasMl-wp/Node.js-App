const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Agregar una nueva tarjeta
router.post('/agregar', async (req, res) => {
  const { numero_tarjeta, saldo_inicial, id_usuario } = req.body;

  try {
    const resultado = await db.query(
      'INSERT INTO tarjetas (numero_tarjeta, saldo, id_usuario) VALUES ($1, $2, $3) RETURNING *',
      [numero_tarjeta, saldo_inicial, id_usuario]
    );
    res.status(201).json({ tarjeta: resultado.rows[0] });
  } catch (error) {
    console.error(error);
    
    // Manejo de tarjetas duplicadas (número de tarjeta único)
    if (error.code === '23505') {  // Código de error para violación de llave única
      return res.status(400).json({ error: 'La tarjeta ya está registrada' });
    }

    res.status(500).json({ error: 'Error al agregar tarjeta' });
  }
});

// Recargar tarjeta
router.post('/recargar', async (req, res) => {
  const { numero_tarjeta, monto_recarga, metodo_pago } = req.body;

  try {
    const tarjetaResult = await db.query(
      'SELECT id FROM tarjetas WHERE numero_tarjeta = $1',
      [numero_tarjeta]
    );

    if (tarjetaResult.rows.length === 0) {
      return res.status(404).send('Tarjeta no encontrada');
    }

    const id_tarjeta = tarjetaResult.rows[0].id;

    // Insertar la recarga en la tabla de recargas
    const recargaResult = await db.query(
      'INSERT INTO recargas (monto, id_tarjeta, metodo_pago) VALUES ($1, $2, $3) RETURNING *',
      [monto_recarga, id_tarjeta, metodo_pago]
    );

    // Actualizar el saldo de la tarjeta
    const saldoResult = await db.query(
      'UPDATE tarjetas SET saldo = saldo + $1 WHERE id = $2 RETURNING *',
      [monto_recarga, id_tarjeta]
    );

    res.status(200).json({ tarjeta_actualizada: saldoResult.rows[0], recarga: recargaResult.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al recargar la tarjeta');
  }
});


// Obtener el historial de recargas de una tarjeta
router.get('/:id_tarjeta/recargas', async (req, res) => {
  const { id_tarjeta } = req.params;

  try {
    const resultado = await db.query(
      'SELECT * FROM recargas WHERE id_tarjeta = $1 ORDER BY fecha DESC',
      [id_tarjeta]
    );
    res.status(200).json({ recargas: resultado.rows });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener el historial de recargas');
  }
});

module.exports = router;
