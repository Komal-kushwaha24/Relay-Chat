import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';
import User from '../models/user.model.js';

const createMessageRequestPayload = (request) => ({
  _id: request._id,
  from: request.from,
  fromName: request.fromName,
  text: request.text,
  createdAt: request.createdAt,
});

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

  // Typing indicator: broadcast typing state to other room participants
  socket.on('chat:typing', async (payload) => {
    const { roomId, isTyping } = payload ?? {};
    if (!roomId) return;

    try {
      const conversation = await Conversation.findById(roomId);
      if (!conversation) return;

      const isParticipant = conversation.participants.some(
        (participant) => participant.toString() === socket.data.user.id
      );
      if (!isParticipant) return;

      socket.to(roomId).emit('chat:typing', {
        roomId,
        userId: socket.data.user.id,
        name: socket.data.user.fullName,
        isTyping: !!isTyping,
      });
      // Also notify participants via their user rooms so sidebar can react
      const conversationTypingUpdate = {
        conversationId: roomId,
        userId: socket.data.user.id,
        name: socket.data.user.fullName,
        isTyping: !!isTyping,
      };

      conversation.participants.forEach((participant) => {
        io.to(`user:${participant.toString()}`).emit('conversation:typing', conversationTypingUpdate);
      });
    } catch (error) {
      // ignore typing errors
    }
  });

  socket.on('chat:message', async (payload, callback) => {
    const { roomId, text, toUserId } = payload ?? {};

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
        // If sender is not participant, treat as message request to the recipient
        const recipientId = toUserId || conversation.participants.find(p => p.toString() !== socket.data.user.id)?.toString();
        if (!recipientId) {
          callback?.({ success: false, message: 'Recipient not found' });
          return;
        }

        // Add message request to recipient's record
        const recipient = await User.findById(recipientId);
        if (!recipient) {
          callback?.({ success: false, message: 'Recipient not found' });
          return;
        }

        recipient.messageRequests = recipient.messageRequests || [];
        let newRequest = recipient.messageRequests.find(
          (request) => request.from.toString() === socket.data.user.id
        );

        if (newRequest) {
          newRequest.text = text.trim();
          newRequest.fromName = socket.data.user.fullName || '';
          newRequest.createdAt = new Date();
        } else {
          newRequest = recipient.messageRequests.create({
            from: socket.data.user.id,
            text: text.trim(),
            fromName: socket.data.user.fullName || '',
          });
          recipient.messageRequests.push(newRequest);
        }

        await recipient.save();

        // notify recipient via their user room
        io.to(`user:${recipientId}`).emit('messageRequest:received', createMessageRequestPayload(newRequest));

        callback?.({ success: true, data: { request: true } });
        return;
      }

      const createdMessage = await Message.create({
        sender: socket.data.user.id,
        conversation: roomId,
        text: text.trim(),
      });

      conversation.lastMessage = createdMessage.text;
      conversation.unreadCounts = conversation.unreadCounts || new Map();
      conversation.participants.forEach((participant) => {
        const participantId = participant.toString();
        if (participantId === socket.data.user.id) {
          conversation.unreadCounts.set(participantId, 0);
        } else {
          const count = conversation.unreadCounts.get(participantId) || 0;
          conversation.unreadCounts.set(participantId, count + 1);
        }
      });
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

      conversation.participants.forEach((participant) => {
        const participantId = participant.toString();
        const conversationUpdate = {
          conversationId: roomId,
          lastMessage: createdMessage.text,
          updatedAt: conversation.updatedAt,
          unreadCount: conversation.unreadCounts?.get(participantId) || 0,
        };

        io.to(`user:${participantId}`).emit('conversation:update', conversationUpdate);
      });

      callback?.({ success: true, data: message });
    } catch (error) {
      callback?.({ success: false, message: error.message || 'Failed to send message' });
    }
  });
};
