import User from '../models/user.model.js';
import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';

const formatRequest = (request) => ({
  _id: request._id,
  from: request.from,
  fromName: request.fromName,
  text: request.text,
  seen: request.seen,
  createdAt: request.createdAt,
});

export const getMessageRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('messageRequests').lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({ success: true, data: user.messageRequests || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch message requests' });
  }
};

export const createMessageRequest = async (req, res) => {
  try {
    const { toUserId, text } = req.body;
    const fromId = req.user._id.toString();

    if (!toUserId || !text?.trim()) {
      return res.status(400).json({ success: false, message: 'Recipient and message are required' });
    }

    if (toUserId.toString() === fromId) {
      return res.status(400).json({ success: false, message: 'You cannot message yourself' });
    }

    const existingConversation = await Conversation.findOne({
      participants: { $all: [fromId, toUserId] },
    });

    if (existingConversation) {
      return res.status(409).json({
        success: false,
        message: 'You already have a conversation with this user',
        data: existingConversation,
      });
    }

    const recipient = await User.findById(toUserId);
    if (!recipient) {
      return res.status(404).json({ success: false, message: 'Recipient not found' });
    }

    recipient.messageRequests = recipient.messageRequests || [];
    const existingRequest = recipient.messageRequests.find(
      (request) => request.from.toString() === fromId
    );

    if (existingRequest) {
      existingRequest.text = text.trim();
      existingRequest.fromName = req.user.fullName || '';
      existingRequest.createdAt = new Date();
      await recipient.save();

      const payload = formatRequest(existingRequest);
      req.app?.get('io')?.to(`user:${toUserId}`).emit('messageRequest:received', payload);
      return res.status(200).json({ success: true, data: payload });
    }

    const newRequest = recipient.messageRequests.create({
      from: fromId,
      text: text.trim(),
      fromName: req.user.fullName || '',
    });
    recipient.messageRequests.push(newRequest);
    await recipient.save();

    const payload = formatRequest(newRequest);
    req.app?.get('io')?.to(`user:${toUserId}`).emit('messageRequest:received', payload);

    res.status(201).json({ success: true, data: payload });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create message request' });
  }
};

export const acceptMessageRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const request = user.messageRequests.id(requestId);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    const fromId = request.from.toString();
    const toId = user._id.toString();

    // find existing conversation between the two users
    let conversation = await Conversation.findOne({ participants: { $all: [fromId, toId] } });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [fromId, toId],
        lastMessage: request.text || '',
        unreadCounts: {
          [fromId]: 0,
          [toId]: 0,
        },
      });
    }

    if (request.text?.trim()) {
      const existingMessage = await Message.findOne({
        conversation: conversation._id,
        sender: fromId,
        text: request.text.trim(),
      });

      if (!existingMessage) {
        await Message.create({
          sender: fromId,
          conversation: conversation._id,
          text: request.text.trim(),
        });
      }

      conversation.lastMessage = request.text.trim();
      conversation.unreadCounts = conversation.unreadCounts || new Map();
      conversation.unreadCounts.set(toId, 0);
      conversation.unreadCounts.set(fromId, 0);
      await conversation.save();
    }

    // remove the request
    user.messageRequests.pull({ _id: requestId });
    await user.save();

    await conversation.populate('participants', 'fullName email profilePicture');

    res.status(200).json({ success: true, data: conversation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to accept request' });
  }
};

export const deleteMessageRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const request = user.messageRequests.id(requestId);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    user.messageRequests.pull({ _id: requestId });
    await user.save();

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to delete request' });
  }
};
