'use strict' 

const mongoose = require('mongoose'); 
mongoose.Promise = global.Promise; 

const moodEntrySchema = mongoose.Schema({ 
  rating: String, 
  description: String, 
  timestamp: {type: Date, default: Date.now} 
}); 

moodEntrySchema.methods.serialize = function() { 
  return { 
    id: this._id, 
    rating: this.rating, 
    description: this.description, 
    created: this.created, 
  };
};



const MoodEntry = mongoose.model('MoodEntry', moodEntrySchema); 

module.exports = {MoodEntry}; 

