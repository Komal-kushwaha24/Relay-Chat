import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';

export const registerChatHandlers = (io, socket) => {
  socket.on('chat:join', async (roomId, callback) => {
    if (!roomId) {
      callback?.({ success: false, message: 'Room ID is required' });
      return;
    }

    try {
      const conversation = await Conversation.findById(roomId);
      if (!conversation) {
        callback?.({ success: false, message: 'Conversation not found' });
        return;
      }

      const isParticipant = conversation.participants.some(
        (participant) => participant.toString() === socket.data.user.id
      );

      if (!isParticipant) {
        callback?.({ success: false, message: 'Not authorized for this conversation' });
        return;
      }

      socket.join(roomId);
      callback?.({ success: true, roomId });
    } catch (error) {
      callback?.({ success: false, message: error.message || 'Failed to join room' });
    }
  });

  socket.on('chat:leave', (roomId) => {
    if (!roomId) return;
    socket.leave(roomId);
  });

  socket.on('chat:message', async (payload, callback) => {
    const { roomId, text } = payload ?? {};

    if (!roomId || !text?.trim()) {
      callback?.({ success: false, message: 'roomId and text are required' });
      return;
    }

    try {
      const conversation = await Conversation.findById(roomId);
      if (!conversation) {
        callback?.({ success: false, message: 'Conversation not found' });
        return;
      }

      const isParticipant = conversation.participants.some(
        (participant) => participant.toString() === socket.data.user.id
      );

      if (!isParticipant) {
        callback?.({ success: false, message: 'Not authorized for this conversation' });
        return;
      }

      const createdMessage = await Message.create({
        sender: socket.data.user.id,
        conversation: roomId,
        text: text.trim(),
      });

      conversation.lastMessage = createdMessage.text;
      await conversation.save();

      const message = {
        _id: createdMessage._id.toString(),
        sender: createdMessage.sender.toString(),
        conversation: createdMessage.conversation.toString(),
        text: createdMessage.text,
        createdAt: createdMessage.createdAt,
        updatedAt: createdMessage.updatedAt,
      };

      await socket.join(roomId);

      socket.to(roomId).emit('chat:message', {
        roomId,
        message,
        socketId: socket.id,
      });

      const conversationUpdate = {
        conversationId: roomId,
        lastMessage: createdMessage.text,
        updatedAt: conversation.updatedAt,
      };

      conversation.participants.forEach((participant) => {
        io.to(`user:${participant.toString()}`).emit('conversation:update', conversationUpdate);
      });

      callback?.({ success: true, data: message });
    } catch (error) {
      callback?.({ success: false, message: error.message || 'Failed to send message' });
    }
  });
};
