const { Router } = require('express');
const pokemonRouter = require('./pokemon')
const typeRouter = require('./type')
import {pool} from '../../index.js'
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');


const router = Router();

router.use('/pokemons', pokemonRouter)
router.use('/types', typeRouter)

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);


module.exports = router;
