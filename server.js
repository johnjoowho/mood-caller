'use strict'; 

const express = require('express'); 
const morgan = require('morgan'); 
const mongoose = require('mongoose'); 
const passport = require('passport'); 

//use different routers for user usage and authentication
const { router: usersRouter } = require('./users'); 
const { router: authRouter, localStrategy, jwtStrategy } = require('./auth'); 
const { router: entriesRouter } = require('./entries'); 

const { DATABASE_URL, PORT } = require('./config'); 

const app = express(); 

//logging
app.use(morgan('common')); 

//apply json to entire express app 
app.use(express.json()); 

//user can access public resource
app.use(express.static('public'));

//CORS cross-origin resource sharing
app.use(function(req, res, next) { 
  res.hearder('Access-Control-Allow-Origin', '*'); 
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); 
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE'); 
  if (req.method=='OPTIONS') { 
    return res.send(204);
  }
  next(); 
}); 

passport.use(localStrategy); 
passport.use(jwtStrategy); 

app.use('/api/users/', usersRouter); 
app.use('/api/auth', authRouter); 
app.use('/api/entries', entriesRouter); 

const jwtAuth = passport.authenticate('jwt', { session: false }); 

app.use('*', (req, res) => {
  return res.status(404).json({ message: 'Not Found' });
});

// Referenced by both runServer and closeServer. closeServer
// assumes runServer has run and set `server` to a server object
let server;

function runServer() {
  return new Promise((resolve, reject) => {
    mongoose.connect(DATABASE_URL, { useMongoClient: true }, err => {
      if (err) {
        return reject(err);
      }
      server = app
        .listen(PORT, () => {
          console.log(`Your app is listening on port ${PORT}`);
          resolve();
        })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };







