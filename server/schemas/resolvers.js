const { AuthenticationError } = require('apollo-server-express');
const { User, book } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
      me: async (parent, args, context) => {
        if (context.user) {
          const userData = await User.findOne({ _id: context.user._id })
            .select('-__v -password')
            .populate('books')
            
  
          return userData;
        }
  
        throw new AuthenticationError('Not logged in');
      },
      users: async () => {
        return User.find()
          .select('-__v -password')
          .populate('books')
          
      },
      user: async (parent, { username }) => {
        return User.findOne({ username })
          .select('-__v -password')
          .populate('friends')
          .populate('books');
      },
      books: async (parent, { username }) => {
        const params = username ? { username } : {};
        return book.find(params).sort({ createdAt: -1 });
      },
      book: async (parent, { _id }) => {
        return book.findOne({ _id });
      }
    },
  
    Mutation: {
      addUser: async (parent, args) => {
        const user = await User.create(args);
        const token = signToken(user);
  
        return { token, user };
      },
      login: async (parent, { email, password }) => {
        const user = await User.findOne({ email });
  
        if (!user) {
          throw new AuthenticationError('Incorrect credentials');
        }
  
        const correctPw = await user.isCorrectPassword(password);
  
        if (!correctPw) {
          throw new AuthenticationError('Incorrect credentials');
        }
  
        const token = signToken(user);
        return { token, user };
      },
      addbook: async (parent, args, context) => {
        if (context.user) {
          const book = await book.create({ ...args, username: context.user.username });
  
          await User.findByIdAndUpdate(
            { _id: context.user._id },
            { $push: { books: book._id } },
            { new: true }
          );
  
          return book;
        }
  
        throw new AuthenticationError('You need to be logged in!');
      },
      addReaction: async (parent, { bookId, reactionBody }, context) => {
        if (context.user) {
          const updatedbook = await book.findOneAndUpdate(
            { _id: bookId },
            { $push: { reactions: { reactionBody, username: context.user.username } } },
            { new: true, runValidators: true }
          );
  
          return updatedbook;
        }
  
        throw new AuthenticationError('You need to be logged in!');
      },
      addFriend: async (parent, { friendId }, context) => {
        if (context.user) {
          const updatedUser = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $addToSet: { friends: friendId } },
            { new: true }
          )
  
          return updatedUser;
        }
  
        throw new AuthenticationError('You need to be logged in!');
      }
    }
  };
  
  module.exports = resolvers;
  
