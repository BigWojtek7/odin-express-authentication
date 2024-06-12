const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  message: { type: Schema.Types.ObjectId, ref: 'Message'},
  member_status: { type: Boolean },
});

module.exports = mongoose.model('User', UserSchema);
