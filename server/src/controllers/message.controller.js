import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';

const refreshConversationAfterMessageDelete = async (conversation) => {
  const latestMessage = await Message.findOne({ conversation: conversation._id })
    .sort({ createdAt: -1 })
    .lean();

  conversation.lastMessage = latestMessage?.text || '';
  await conversation.save();

  return {
    lastMessage: conversation.lastMessage,
    updatedAt: conversation.updatedAt,
  };
};

const refreshConversationAfterMessageChange = async (conversation) => {
  const latestMessage = await Message.findOne({ conversation: conversation._id })
    .sort({ createdAt: -1 })
    .lean();

  const lastMessage = latestMessage?.text || '';
  if (conversation.lastMessage !== lastMessage) {
    conversation.lastMessage = lastMessage;
    await conversation.save();
  }

  return {
    lastMessage: conversation.lastMessage,
    updatedAt: conversation.updatedAt,
  };
};

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

export const undoMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    if (!messageId) {
      return res.status(400).json({
        success: false,
        message: 'Message ID is required',
      });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only undo your own messages',
      });
    }

    const conversation = await Conversation.findById(message.conversation);
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
        message: 'You are not authorized to undo this message',
      });
    }

    await Message.deleteOne({ _id: message._id });

    conversation.unreadCounts = conversation.unreadCounts || new Map();
    conversation.participants.forEach((participant) => {
      const participantId = participant.toString();
      if (participantId !== req.user._id.toString()) {
        const count = conversation.unreadCounts.get(participantId) || 0;
        conversation.unreadCounts.set(participantId, Math.max(0, count - 1));
      }
    });

    const conversationUpdate = await refreshConversationAfterMessageDelete(conversation);

    conversation.participants.forEach((participant) => {
      const participantId = participant.toString();
      req.app?.get('io')?.to(`user:${participantId}`).emit('chat:message:deleted', {
        roomId: conversation._id.toString(),
        messageId: message._id.toString(),
        conversation: {
          conversationId: conversation._id.toString(),
          ...conversationUpdate,
        },
      });
      req.app?.get('io')?.to(`user:${participantId}`).emit('conversation:update', {
        conversationId: conversation._id.toString(),
        lastMessage: conversationUpdate.lastMessage,
        updatedAt: conversationUpdate.updatedAt,
        unreadCount: conversation.unreadCounts?.get(participantId) || 0,
      });
    });

    res.status(200).json({
      success: true,
      data: {
        messageId: message._id,
        conversationId: conversation._id,
        ...conversationUpdate,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to undo message',
    });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text } = req.body;

    if (!messageId || !text?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message ID and text are required',
      });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own messages',
      });
    }

    const conversation = await Conversation.findById(message.conversation);
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
        message: 'You are not authorized to edit this message',
      });
    }

    message.text = text.trim();
    await message.save();

    const conversationUpdate = await refreshConversationAfterMessageChange(conversation);
    const updatedMessage = {
      _id: message._id.toString(),
      sender: message.sender.toString(),
      conversation: message.conversation.toString(),
      text: message.text,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };

    conversation.participants.forEach((participant) => {
      const participantId = participant.toString();
      req.app?.get('io')?.to(`user:${participantId}`).emit('chat:message:updated', {
        roomId: conversation._id.toString(),
        message: updatedMessage,
        conversation: {
          conversationId: conversation._id.toString(),
          ...conversationUpdate,
        },
      });
      req.app?.get('io')?.to(`user:${participantId}`).emit('conversation:update', {
        conversationId: conversation._id.toString(),
        lastMessage: conversationUpdate.lastMessage,
        updatedAt: conversationUpdate.updatedAt,
        unreadCount: conversation.unreadCounts?.get(participantId) || 0,
      });
    });

    res.status(200).json({
      success: true,
      data: {
        message: updatedMessage,
        conversation: {
          conversationId: conversation._id,
          ...conversationUpdate,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to edit message',
    });
  }
};
