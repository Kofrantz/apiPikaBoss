const { default: axios } = require('axios');
const {Types} = require('../db')

const router = require('express').Router();

router.get('/', async (req, res, next) => {
    let types = await Types.findAll({attributes: ['name']})
    if(!types.length) {
        const apitypes = await axios.get('https://pokeapi.co/api/v2/type')
        Promise.all(apitypes.data.results.map(async t => {
            await Types.create({name: t.name})
            return t.name
        }))
        .then(r => {
            return res.status(200).send(r)
        })
    } else {
        const namesTypes = types.map(t => t.name)
        return res.status(200).send(namesTypes)
    }
})

module.exports = router