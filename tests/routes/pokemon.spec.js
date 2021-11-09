/* eslint-disable import/no-extraneous-dependencies */
const { expect } = require('chai');
const axios = require('axios')
//const session = require('supertest-session');
const request = require('supertest');
const app = require('../../src/app.js');
const { Pokemons, Types, conn } = require('../../src/db.js');

const agent = request(app);
const pokemon = {
  name: 'Pikachu',
};
const types = ["normal","fighting","flying","poison","ground","rock","bug","ghost","steel","fire","water","grass","electric","psychic","ice","dragon","dark","fairy","unknown","shadow"]
const newPoke = {
  "name": "VelociFrankichard",
  "hp": 60,
  "attack": 120,
  "defense": 50,
  "height": 170,
  "weight": 150,
  "speed": 250,
  "types": ["poison", "bug"]
}

describe('Pokemon routes', () => {
  before(() => conn.authenticate()
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  }));
  beforeEach(() => Pokemons.sync({ force: true })
  .then(r => {
    //axios.get('http://localhost:3001/types')
  })
  .then(() => Pokemons.create(pokemon)));
  describe('GET /pokemons', () => {
    it('should get 200', () => {agent.get('/pokemons').expect(200)});
    it('should get pokemons', async() => {
      const r = await agent.get('/pokemons')
      expect(r.body).to.not.equal([])
    });
    it('should get pokemons by name', async() => {
      const r = await agent.get('/pokemons?name=pikachu')
      expect(r.body.name).to.equal('pikachu')
    });
    it('should post pokemons', async() => {
      const r = await agent.post('/pokemons').send(newPoke)
      expect(r.body).to.have.own.property('id')
      expect(r.body).to.have.own.property('image')
      expect(r.body.name).to.equal(newPoke.name.toLowerCase())
    });
  });
});

describe('Types routes', () => {
  before(() => conn.authenticate()
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  }));
  beforeEach(() => Types.sync({ force: true }));
  describe('GET /types', () => {
    it('should get 200', () => {agent.get('/types').expect(200)});
    it('should get all types', async() => {
      const r = await agent.get('/types')
      expect(r.body).to.eql(types)
    });
  });
});
