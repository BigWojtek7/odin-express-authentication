const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: Date },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
});

MessageSchema.virtual('url').get(function () {
  return `${this._id}`;
});

module.exports = mongoose.model('Message', MessageSchema);


