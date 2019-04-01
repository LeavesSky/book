const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    trim: true,
    unique: true //唯一
  },
  password: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true,
    unique: true
  },
  email: {
    type: String,
    trim: true,
    unique: true
  },
  shelves: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Shelf'
  }
});
mongoose.model("User", userSchema);