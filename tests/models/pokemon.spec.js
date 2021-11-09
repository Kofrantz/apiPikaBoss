const { Pokemons, Types, conn } = require('../../src/db.js');
const { expect } = require('chai');

describe('Pokemons model: Validators', () => {
  before(() => conn.authenticate()
    .catch((err) => {
      console.error('Unable to connect to the database:', err);
    }));
  describe('Pokemon table', () => {
    beforeEach(() => Pokemons.sync({ force: true }));
    describe('tests:', () => {
      it('should throw an error if name is null', (done) => {
        Pokemons.create({})
          .then(() => done(new Error('It requires a valid name')))
          .catch(() => done());
      });
      it('should work when its a valid name', async () => {
        await Pokemons.create({name: 'pikachu'})
        const r = await Pokemons.findOne({where: {name: 'pikachu'}})
        expect(r.dataValues.name).to.equal('pikachu')
      });
      it('should create an id', async () => {
        await Pokemons.create({name: 'pikachu'})
        const r = await Pokemons.findOne({where: {name: 'pikachu'}})
        expect(r.dataValues).to.have.own.property('id')
        expect(r.dataValues.id).to.not.equal('')
      });
    });
  });
});
