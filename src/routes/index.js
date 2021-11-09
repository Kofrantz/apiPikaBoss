const { Router } = require('express');
const pokemonRouter = require('./pokemon')
const typeRouter = require('./type')
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');


const router = Router();

router.get('/', function(req, res){res.send('its Working!')})

/* router.use('/pokemons', pokemonRouter)
router.use('/types', typeRouter) */

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);


module.exports = router;
