const axios = require('axios')
const router = require('express').Router();
const {Pokemons, Types} = require('../db');

router.get('/', async (req, res) => {
    const {name, packs} = req.query
    if(name){
        const dataApi = axios.get(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`).catch(r => r.status)
        const dataDb = Pokemons.findOne({where: {name: name}, include: Types}).catch(r => console.log(r))
        Promise.all([dataApi, dataDb])
        .then(r => {
            const [pokeApi, pokeDb] = r
            if(!pokeApi && !pokeDb) return res.status(404).json({error: `No se encontro ${name}` })
           
            const data = pokeApi ? pokeApi.data : pokeDb
            res.json(cleanPokeInfo(data))
        })
        .catch(err => {
            res.send(err.message)
        })
    }else{
        const pokeNamesApi = axios.get(`https://pokeapi.co/api/v2/pokemon?offset=${(packs-1)*40}&limit=40`)
        const pokeNamesDB = Pokemons.findAll({include: {model: Types}})
        let pokeDataApi, pokeDataDB;
        //const page1 = await axios.get('https://pokeapi.co/api/v2/pokemon')
        //const page2 = await axios.get(page1.data.next)
        //const pokeNamesApi = page1.data.results.concat(page2.data.results)
        Promise.all([pokeNamesApi, pokeNamesDB])
        .then(async ([api, db]) => {
            if(!api && !db) return res.status(404).json({error: `No se encontraron Pokemons` })
            pokeDataDB = db?.map(p => p.dataValues)
            const detailsPromise = api.data?.results.map(async p => await axios.get(p.url))
            return Promise.all(detailsPromise)
        })
        .then((r) => {
            pokeDataApi = r?.map(p => p.data)
            return res.status(200).json(pokeDataApi.concat(packs>1 ? [] : pokeDataDB).map(p => cleanPokeInfo(p)))
        })
        .catch((err) => {
            res.send(err.message)
        })
    }
})

router.get('/:id', async (req, res) => {
    const {id} = req.params

    if(typeof id === 'string' && id.length > 8){
        const dbId = await Pokemons.findByPk(id, {include: Types})
        .catch(err => res.status(404).json({error: `No se encontro el pokemon con id ${id}`}))
        if(dbId) return res.json(cleanPokeInfo(dbId)); 
    }else{
        const {data} = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`)
        .catch(err => res.status(404).json({error: `No se encontro el pokemon con id ${id}`}))
        if(data) return res.json(cleanPokeInfo(data));
    }
    return res.status(404).json({error: 'no se encontro ningun pokemon existente o creado que contenga esa id'})
})

router.post('/', async (req, res) => {
    const exist = await Pokemons.findOne({where: {name: req.body?.name.toLowerCase()}})
    if(exist) return res.status(200).json({error: 'ya existe un pokemon con ese nombre'})
    
    try{
        let newPoke = await Pokemons.create({...req.body, name: req.body.name.toLowerCase()})
        console.log()
        Promise.all(req.body.types.map(t => Types.findOne({where: {name: t}})))
        .then((data) => {
            newPoke.addTypes(data)
            let resPoke = newPoke.dataValues
            delete resPoke.createdAt
            delete resPoke.updatedAt
            resPoke.types = data.map(p => p.dataValues.name)
            resPoke.origin = 'My'
            return res.status(200).json(resPoke)
        })
    }catch(err){
        return res.status(200).json({error: 'No pudo crearse tu pokemon'})
    }
})

router.delete('/:id', async (req, res) => {
    const {id} = req.params
    try{
        const dbId = await Pokemons.findByPk(id, {include: Types})
        if(dbId)  await Pokemons.destroy({where: {id: dbId.id}})
        await Pokemons.destroy({where: {id: id}})
        console.log(dbId)
        return res.send(dbId)
    }catch(err){
        return res.status(400).json({Error: 'No se pudo eliminar'})
    }
})

function cleanPokeInfo(p){
    const stats = p.stats?.map(s => {return{name: s.stat.name, val: s.base_stat}})
    return{
        id: p.id,
        name: p.name,
        image: p.image || p.sprites?.other?.['official-artwork'].front_default,
        types: p.Types?.map(p => p.name) || p.types?.map(p => p.type.name),
        hp: p.hp || stats?.find(s => s.name === 'hp').val,
        attack: p.attack || stats?.find(s => s.name === 'attack').val,
        defense: p.defense || stats?.find(s => s.name === 'defense').val,
        speed: p.speed || stats?.find(s => s.name === 'speed').val,
        weight: p.weight,
        height: p.height,
        origin: !stats ? 'My' : 'Original'
    }
}

module.exports = router