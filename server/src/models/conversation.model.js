import mongoose from 'mongoose';

const getParticipantsKey = (participants) =>
  participants
    .map((participant) => participant.toString())
    .sort()
    .join(':');

const normalizeParticipants = (participants) =>
  participants.map((participant) => participant.toString()).sort();

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
    participantsKey: {
      type: String,
      required: true,
    },
    lastMessage: {
      type: String,
      default: '',
    },
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },
    hiddenFor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

conversationSchema.index(
  { participantsKey: 1 },
  {
    unique: true,
    partialFilterExpression: {
      participantsKey: { $type: 'string' },
    },
  }
);

conversationSchema.pre('validate', function setParticipantsKey(next) {
  if (Array.isArray(this.participants) && this.participants.length === 2) {
    const participants = normalizeParticipants(this.participants);
    this.participants = participants;
    this.participantsKey = getParticipantsKey(participants);
  }

  next();
});

conversationSchema.statics.getParticipantsKey = getParticipantsKey;
conversationSchema.statics.normalizeParticipants = normalizeParticipants;

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
