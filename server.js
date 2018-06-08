'use strict'; 

const express = require('express'); 
const morgan = require('morgan'); 
const mongoose = require('mongoose'); 
mongoose.Promise = global.Promise; 

const { DATABASE_URL, PORT } = require('./config'); 
const { }