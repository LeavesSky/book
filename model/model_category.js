const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  cateName: {
    type: String,
    trim: true,
    unique: true
  },
  book: [{
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Book'
  }]
});

mongoose.model('Category', categorySchema);