const { Router } = require('express');
const pokemonRouter = require('./pokemon')
const typeRouter = require('./type')
import {pool} from '../../index.js'
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');


const router = Router();

router.get('/db', async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM test_table');
      const results = { 'results': (result) ? result.rows : null};
      res.render('pages/db', results );
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })

router.use('/pokemons', pokemonRouter)
router.use('/types', typeRouter)

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);


module.exports = router;
