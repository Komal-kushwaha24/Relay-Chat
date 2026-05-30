import Conversation from '../models/conversation.model.js';

export const getUserConversations = async (req, res) => {
  const conversations = await Conversation.find({ participants: req.user.id })
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