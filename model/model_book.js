const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  b_name: {
    type: String,
    trim: true,
    required: true
  },
  b_wordNum: {
    type: Number,
    trim: true
  },
  b_auth: {
    type: String,
    trim: true
  },
  b_img: {
    type: String,
    trim: true
  },
  b_desc: {
    type: String,
    trim: true
  },
  b_cTime: {
    type: Date
  },
  b_uTime: {
    type: Date
  },
  b_chapterList: [{
    c_num: {
      type: Number
    },
    c_title: {
      type: String
    },
    c_path: {
      type: String
    }
  }],
  b_cha_li_all:{
    type:Number
  },
  b_path:{type: String},
  category: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Category"
  },
  b_state:{type:Number}
});

mongoose.model("Book", bookSchema);