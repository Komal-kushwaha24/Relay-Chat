import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: 'Conversation ID is required',
      });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this conversation',
      });
    }

    const userId = req.user._id.toString();
    const messages = await Message.find({ conversation: conversationId }).sort({ createdAt: 1 });

    if (conversation.unreadCounts?.get?.(userId) > 0) {
      conversation.unreadCounts.set(userId, 0);
      await conversation.save();
    }

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch messages',
    });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { senderId, conversationId, text } = req.body;
    const sender = senderId || req.user?._id;

    if (!sender || !conversationId || !text?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'senderId, conversationId, and text are required',
      });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === sender.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to send messages to this conversation',
      });
    }

    const message = await Message.create({
      sender,
      conversation: conversationId,
      text: text.trim(),
    });

    conversation.lastMessage = message.text;
    conversation.unreadCounts = conversation.unreadCounts || new Map();
    conversation.participants.forEach((participant) => {
      const participantId = participant.toString();
      if (participantId === sender.toString()) {
        conversation.unreadCounts.set(participantId, 0);
      } else {
        const count = conversation.unreadCounts.get(participantId) || 0;
        conversation.unreadCounts.set(participantId, count + 1);
      }
    });
    await conversation.save();

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send message',
    });
  }
};
