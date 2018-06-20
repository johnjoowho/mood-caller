const mongoose = require('mongoose'); 
mongoose.Promise = global.Promise; 

const moodEntrySchema = mongoose.Schema({ 
  rating: String, 
  description: String, 
  username: String 
}); 

moodEntrySchema.methods.serialize = function() { 
  return { 
    id: this._id, 
    rating: this.rating, 
    description: this.description, 
    created: this.createdAt, 
    updated: this.updatedAt,
    username: this.username
  };
};



const MoodEntry = mongoose.model('MoodEntry', moodEntrySchema); 

module.exports = {MoodEntry}; 
