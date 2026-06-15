import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';

export const getUserConversations = async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user.id,
    hiddenFor: { $ne: req.user.id },
  })
    .populate('participants', 'fullName email profilePicture')
    .sort({ updatedAt: -1 });

  const uniqueConversations = [];
  const seenParticipantPairs = new Set();

  for (const conversation of conversations) {
    const participantsKey =
      conversation.participantsKey || Conversation.getParticipantsKey(conversation.participants);

    if (seenParticipantPairs.has(participantsKey)) {
      continue;
    }

    seenParticipantPairs.add(participantsKey);
    uniqueConversations.push(conversation);
  }

  res.status(200).json({
    success: true,
    data: uniqueConversations,
  });
};

export const createConversation = async (req, res) => {
  try {
    const { participants } = req.body;

    if (!Array.isArray(participants) || participants.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'One-to-one conversations must include exactly two participants',
      });
    }

    const normalizedParticipants = Conversation.normalizeParticipants(participants);
    const participantsKey = Conversation.getParticipantsKey(normalizedParticipants);

    let conversation = await Conversation.findOne({
      participantsKey: { $exists: false },
      participants: { $all: normalizedParticipants },
    });

    if (conversation) {
      conversation.participants = normalizedParticipants;
      conversation.hiddenFor = (conversation.hiddenFor || []).filter(
        (userId) => userId.toString() !== req.user.id
      );
      await conversation.save();

      return res.status(200).json({
        success: true,
        data: conversation,
      });
    }

    conversation = await Conversation.findOneAndUpdate(
      { participantsKey },
      {
        $setOnInsert: {
          participants: normalizedParticipants,
          participantsKey,
          unreadCounts: normalizedParticipants.reduce((map, id) => {
            map[id] = 0;
            return map;
          }, {}),
        },
        $pull: { hiddenFor: req.user._id },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      }
    );

    const wasExisting = conversation.createdAt.getTime() !== conversation.updatedAt.getTime();

    res.status(wasExisting ? 200 : 201).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    if (error.code === 11000) {
      const participants = Conversation.normalizeParticipants(req.body.participants || []);
      const conversation = await Conversation.findOne({
        participantsKey: Conversation.getParticipantsKey(participants),
      });

      return res.status(200).json({
        success: true,
        data: conversation,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteConversationForUser = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    const isParticipant = conversation.participants.some(
      (participant) => participant.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this conversation',
      });
    }

    await Message.updateMany(
      {
        conversation: conversation._id,
        deletedFor: { $ne: req.user._id },
      },
      {
        $addToSet: { deletedFor: req.user._id },
      }
    );

    // conversation.hiddenFor = conversation.hiddenFor || [];
    // if (!conversation.hiddenFor.some((userId) => userId.toString() === req.user.id)) {
    //   conversation.hiddenFor.push(req.user._id);
    // }

    conversation.unreadCounts = conversation.unreadCounts || new Map();
    conversation.unreadCounts.set(req.user.id, 0);
    await conversation.save();

    res.status(200).json({
      success: true,
      data: {
        conversationId: conversation._id,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete conversation',
    });
  }
};
