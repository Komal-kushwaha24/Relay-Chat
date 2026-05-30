import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { getAuthCookieName } from '../utils/setAuthCookie.js';
import { registerChatHandlers } from './chat.socket.js';

const parseCookies = (cookieHeader = '') =>
  cookieHeader.split(';').reduce((cookies, cookie) => {
    const [name, ...rest] = cookie.split('=');
    if (!name) return cookies;
    cookies[name.trim()] = decodeURIComponent(rest.join('='));
    return cookies;
  }, {});

const getPublicUser = (user) => ({
  id: user.id,
  name: user.fullName || user.email || 'Unknown user',
  profilePicture: user.profilePicture || null,
});

export const initSocketHandlers = (io) => {
  const onlineUsers = new Map();

  const broadcastOnlineUsers = () => {
    const users = Array.from(onlineUsers.values()).map(getPublicUser);
    io.emit('online:users', users);
  };

  io.updateOnlineUser = (updatedUser) => {
    const id = updatedUser?.id?.toString?.() || updatedUser?._id?.toString?.();
    if (!id || !onlineUsers.has(id)) return;

    const existing = onlineUsers.get(id);
    onlineUsers.set(id, {
      ...existing,
      fullName: updatedUser.fullName || existing.fullName,
      email: updatedUser.email || existing.email,
      profilePicture: updatedUser.profilePicture || null,
    });
    broadcastOnlineUsers();
  };

  io.use(async (socket, next) => {
    const cookies = parseCookies(socket.request.headers.cookie);
    const token = cookies[getAuthCookieName()];

    if (!token) {
      return next(new Error('Not authorized, missing auth token'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');

      if (!user) {
        return next(new Error('Not authorized, user not found'));
      }

      socket.data.user = {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        profilePicture: user.profilePicture || null,
      };

      next();
    } catch (error) {
      return next(new Error('Not authorized, invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    console.log(`Socket connected: ${socket.id} (${user.id})`);

    socket.join(`user:${user.id}`);

    const existing = onlineUsers.get(user.id);
    if (existing) {
      existing.socketIds.add(socket.id);
      existing.fullName = user.fullName;
      existing.email = user.email;
      existing.profilePicture = user.profilePicture || null;
    } else {
      onlineUsers.set(user.id, {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        profilePicture: user.profilePicture || null,
        socketIds: new Set([socket.id]),
      });
    }

    broadcastOnlineUsers();

    registerChatHandlers(io, socket);

    socket.on('disconnect', () => {
      const existing = onlineUsers.get(user.id);
      if (existing) {
        existing.socketIds.delete(socket.id);
        if (existing.socketIds.size === 0) {
          onlineUsers.delete(user.id);
        }
      }

      console.log(`Socket disconnected: ${socket.id} (${user.id})`);
      broadcastOnlineUsers();
    });
  });
};
