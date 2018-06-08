const express = require('express');
const bodyParser = require('body-parser');

const {MoodEntry} = require('./models');

const router = express.Router();

const jsonParser = bodyParser.json();


router.get('/', (req, res) => { 
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

router.get('/:id', (req, res) => { 
  MoodEntry 
    .findById(req.params.id)
    .then(entry => res.json(entry.serialize()))
    .catch(err => { 
      console.error(err); 
      res.status(500).json({ error: 'something went wrong' }); 
    }); 
}); 

module.exports = {router}; 