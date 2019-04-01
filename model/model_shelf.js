const mongoose = require('mongoose');

const shelfSchema = new mongoose.Schema({
  book: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Book'
  },
  chapterNum: {
    type: Number,
    trim: true
  }
})
mongoose.model('Shelf',shelfSchema);