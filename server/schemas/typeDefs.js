const { gql } = require('apollo-server-express');

const typeDefs = gql`
type User {
    _id: ID
    username: String
    email: String
    bookCount: Int
    savedBooks [Book]
}

type Book {
bookId: String
authors: [authors]
}

type Auth {
    token: ID!
    user: User
}

type Query {
    me: User
    users: [User]
    user(username: String!): User
  }
  
  input BookInput {
      content: String

  }

  type Mutation {
    login(email: String!, password: String!): Auth
    addUser(username: String!, email: String!, password: String!): Auth
    saveBook( authors: String!, Description: String!, title: String!, bookId: String!, image: String!, link: String! ): Book
    removeBook(bookId: Int! ) User
    
  }
`;

module.exports = typeDefs;