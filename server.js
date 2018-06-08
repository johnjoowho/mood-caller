'use strict'; 

const express = require('express'); 
const morgan = require('morgan'); 
const mongoose = require('mongoose'); 
mongoose.Promise = global.Promise; 

const { DATABASE_URL, PORT } = require('./config'); 
const { MoodEntry } = require('./models'); 

const app = express(); 

app.use(morgan('common')); 
app.use(express.json()); 

app.get('/posts', (req, res) => { 
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

app.get('/entries/:id', (req, res) => { 
  MoodEntry 
    .findById(req.params.id)
    .then(entry => res.json(entry.serialize())); 
    .catch(err => { 
      console.error(err); 
      res.status(500).json({ error: 'something went wrong' }); 
    }); 
}); 