import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      required: [true, 'Conversation participants are required'],
      validate: {
        validator: (participants) => Array.isArray(participants) && participants.length === 2,
        message: 'One-to-one conversations must include exactly two participants',
      },
    },
    lastMessage: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
