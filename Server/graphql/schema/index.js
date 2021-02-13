const { buildSchema } = require('graphql');


module.exports = buildSchema(`
        type BookingType {
            _id: ID!
            user: UserType!
            event: EventType!
            createdAt: String!
            updatedAt: String!

        }
        type EventType {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
            creator: UserType!    
        }
        type UserType {
            _id: ID!
            email: String!
            password: String
            createdEvents: [EventType!]
        }
        type RootQuery{
            events: [EventType!]!
            users: [UserType!]!
            bookings: [BookingType!]!
            login(email: String!, password: String!): AuthData!
        }
        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
            creator: String                   
        }
        type AuthData{
            userId: ID!
            token: String!
            tokenExpiry: Int!
        }
        input UserInput{
            email: String!
            password: String
        }
        
        type RootMutation{
            createEvent( eventInput: EventInput ): EventType
            createUser( userInput: UserInput )  : UserType
            bookEvent( eventId: ID! ) : BookingType!
            cancelBooking( bookingId: ID! ) : EventType
        }
        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `)
    //bookEvent(eventId: ID!): Booking!/ 