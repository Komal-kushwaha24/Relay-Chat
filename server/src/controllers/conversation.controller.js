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
