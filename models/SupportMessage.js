const mongoose = require('mongoose');

const supportMessageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String },
    image: [{ type: String }],
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);


module.exports = mongoose.model('SupportMessage', supportMessageSchema);
