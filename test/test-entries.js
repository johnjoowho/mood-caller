'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
const { User } = require('../users');
// this makes the should syntax available throughout
// this module
const should = chai.should();

let user = null; 

const { MoodEntry } = require('../entries');
const { closeServer, runServer, app } = require('../server'); 
const { TEST_DATABASE_URL } = require('../config'); 

chai.use(chaiHttp); 

function tearDownDb() {
  return new Promise((resolve, reject) => {
    console.warn('Deleting database');
    mongoose.connection.dropDatabase()
      .then(result => resolve(result))
      .catch(err => reject(err));
  });
}

function seedMoodEntryData() {
  console.info('seeding mood  data');
  const seedData = [];
  for (let i = 1; i <= 10; i++) {
    seedData.push({
      rating: faker.random.number({min: 1, max: 7}), 
      description: faker.lorem.sentence(),
      username: 'Silly'
    });
  }
  // this will return a promise
  return MoodEntry.insertMany(seedData);
}

describe('mood entries API resource', function () {

  before(function () {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function () {
    const username = 'Silly'
    const password = 'passwordpassword'

    return User.hashPassword(password)
      .then((hashedPassword) => {
        return User.create({ username, password : hashedPassword })  
      })  
      
      
      .then((user) => {
        return chai.request(app)
          .post('/api/auth/login')
          .send({username, password})})
      .then(res => {
        user = res.body.authToken;
        return seedMoodEntryData()
      })     
  });

  afterEach(function () {
    // tear down database so we ensure no state from this test
    // effects any coming after.
    return tearDownDb();
  });

  after(function () {
    return closeServer();
  });

  // note the use of nested `describe` blocks.
  // this allows us to make clearer, more discrete tests that focus
  // on proving something small
  describe('GET endpoint', function () {

    it('should return all existing entries', function () {
      // strategy:
      //    1. get back all posts returned by by GET request to `/entries`
      //    2. prove res has right status, data type
      //    3. prove the number of posts we got back is equal to number
      //       in db.
      let res;
      return chai.request(app)
        .get('/api/entries')
        .set('authorization', `Bearer ${user}`)
        .then(_res => {
          res = _res;
          res.should.have.status(200);
          // otherwise our db seeding didn't work
          res.body.should.have.lengthOf.at.least(1);

          return MoodEntry.count();
        })
        .then(count => {
          // the number of returned posts should be same
          // as number of posts in DB
          res.body.should.have.lengthOf(count);
        });
    });

    it('should return posts with right fields', function () {
      // Strategy: Get back all posts, and ensure they have expected keys

      let resEntry;
      return chai.request(app)
        .get('/api/entries')
        .set('authorization', `Bearer ${user}`)
        .then(function (res) {

          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('array');
          res.body.should.have.lengthOf.at.least(1);

          res.body.forEach(function (entry) {
            entry.should.be.a('object');
            entry.should.include.keys('rating', 'description', 'id', 'created', 'updated', 'username');
          });
          // just check one of the posts that its values match with those in db
          // and we'll assume it's true for rest
          resEntry = res.body[0];
          return MoodEntry.findById(resEntry.id);
        })
        .then(post => {
          resEntry.rating.should.equal(post.rating);
          resEntry.description.should.equal(post.description);
          resEntry.created.should.equal(post.createdAt.toJSON());
        });
    });
  });

  describe('POST endpoint', function () {
    // strategy: make a POST request with data,
    // then prove that the post we get back has
    // right keys, and that `id` is there (which means
    // the data was inserted into db)
    it('should add a new mood entry', function () {

      const newEntry = {
        rating: faker.random.number({min: 1, max: 7}), 
        description: faker.lorem.sentence(),
        username: 'bobby', 
      };

      return chai.request(app)
        .post('/api/entries')
        .set('authorization', `Bearer ${user}`)
        .send(newEntry)
        .then(function (res) {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.include.keys(
            'rating', 'description', 'created', 'updated', 'id');
          res.body.rating.should.equal(newEntry.rating);
          // cause Mongo should have created id on insertion
          res.body.id.should.not.be.null;
          res.body.description.should.equal(
            `${newEntry.description}`);
          return MoodEntry.findById(res.body.id);
        })
        .then(function (post) {
          post.rating.should.equal(newEntry.rating);
          post.description.should.equal(newEntry.description);
        });
    });
  });

  describe('PUT endpoint', function () {

    // strategy:
    //  1. Get an existing post from db
    //  2. Make a PUT request to update that post
    //  4. Prove post in db is correctly updated
    it('should update fields you send over', function () {
      const updateData = {
        rating: 6, 
        description: 'I just worked out!', 
      };

      return MoodEntry
        .findOne()
        .then(post => {
          updateData.id = post.id;

          return chai.request(app)
            .put(`/api/entries/${post.id}`)
            .set('authorization', `Bearer ${user}`)
            .send(updateData);
        })
        .then(res => {
          res.should.have.status(204);
          return MoodEntry.findById(updateData.id);
        })
        .then(post => {
          post.rating.should.equal(updateData.rating);
          post.description.should.equal(updateData.description);
        });
    });
  });

  describe('DELETE endpoint', function () {
    // strategy:
    //  1. get a post
    //  2. make a DELETE request for that post's id
    //  3. assert that response has right status code
    //  4. prove that post with the id doesn't exist in db anymore
    it('should delete a post by id', function () {

      let post;

      return MoodEntry
        .findOne()
        .then(_post => {
          post = _post;
          return chai.request(app).delete(`/api/entries/${post.id}`)
          .set('authorization', `Bearer ${user}`)
        })
        .then(res => {
          res.should.have.status(204);
          return MoodEntry.findById(post.id);
        })
        .then(_post => {
          // when a variable's value is null, chaining `should`
          // doesn't work. so `_post.should.be.null` would raise
          // an error. `should.be.null(_post)` is how we can
          // make assertions about a null value.
          should.not.exist(_post);
        });
    });
  });
});