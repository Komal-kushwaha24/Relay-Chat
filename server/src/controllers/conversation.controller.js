import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';

export const getUserConversations = async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user.id,
    hiddenFor: { $ne: req.user.id },
  })
    .populate('participants', 'fullName email profilePicture')
    .sort({ updatedAt: -1 });

  res.status(200).json({
    success: true,
    data: conversations,
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

    // Check if conversation already exists between these two participants
    const existingConversation = await Conversation.findOne({
      participants: { $all: participants },
    });

    if (existingConversation) {
      existingConversation.hiddenFor = (existingConversation.hiddenFor || []).filter(
        (userId) => userId.toString() !== req.user.id
      );
      await existingConversation.save();

      return res.status(200).json({
        success: true,
        data: existingConversation,
      });
    }

    const conversation = await Conversation.create({
      participants,
      unreadCounts: participants.reduce((map, id) => {
        map[id] = 0;
        return map;
      }, {}),
    });

    res.status(201).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
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

    conversation.hiddenFor = conversation.hiddenFor || [];
    if (!conversation.hiddenFor.some((userId) => userId.toString() === req.user.id)) {
      conversation.hiddenFor.push(req.user._id);
    }

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
