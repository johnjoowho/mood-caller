

const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport'); 
const {MoodEntry} = require('./models');

const router = express.Router();

const jwtAuth = passport.authenticate('jwt', { session: false }); 

router.use(bodyParser.json()); 

router.get('/', jwtAuth, (req, res) => { 
  MoodEntry 
    .find()
    .then(entries => { 
      res.json(entries.map(entry => entry.serialize())); 
    })
    .catch(err =>  {
      console.error(err); 
      res.status(500).json({ error: 'something went wrong' }); 
    }); 
}); 

router.get('/:id', jwtAuth, (req, res) => { 
  MoodEntry 
    .findById(req.params.id)
    .then(entry => res.json(entry.serialize()))
    .catch(err => { 
      console.error(err); 
      res.status(500).json({ error: 'something went wrong' }); 
    }); 
}); 

router.post('/', jwtAuth, (req, res) => {
  const requiredFields = ['rating', 'description']; 
  console.dir(req.body); 
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing '${field}' in request body`
      console.error(message); 
      return res.status(400).send(message);
    }
  }

  MoodEntry 
    .create({
      rating: req.body.rating, 
      description: req.body.description}) 
    .then(
      moodentry => res.status(201).json(moodentry.serialize()))
    .catch(err => {
      console.error(err); 
      res.status(500).json({message: 'Internal server error'});
    });
});

router.put('/:id', jwtAuth, (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = (
      `Request path id (${req.params.id}) and request body id ` + 
      `(${req.body.id}) must match`
    );
    console.error(message); 
    //return to break out of function
    return res.status(400).json({message: message});
  }

  const toUpdate = {}; 
  const updateableFields = ['rating', 'description']; 

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  MoodEntry 
    .findByIdAndUpdate(req.params.id, {$set: toUpdate})
    .then(moodentry => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

router.delete('/:id', jwtAuth, (req, res) => {
  MoodEntry
    .findByIdAndRemove(req.params.id)
    .then(() => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

module.exports = {router}; 