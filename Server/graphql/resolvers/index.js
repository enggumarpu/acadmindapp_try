const Event = require('../../models/event');
const User = require('../../models/user');
const Booking = require('../../models/booking');
const jwt = require('jsonwebtoken');

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const eventsFind = () => {
    return Event.find({_id: {$in: eventIds}}).then( events => {
         events.map( event => {
             console.log(...event._doc);
            return {
                ...event._doc,
                _id: event.id,
                date: new Date(event._doc.date).toISOString(),
                creator: userFind.bind(this, event.creator)
            }
         })
    }).catch()
}
const userFind = (userID) => {  
    return User.findById(userID).then( user => {
       return {
           ...user._doc,
           _id: user.id,
           createdEvents: eventsFind.bind(this, user._doc.createdEvents)
       }     
    }).catch({ })

}
const singleEvent = async (eventID) => {  
    const fetEvent = await Event.findById(eventID);
       return {
           ...fetEvent._doc,
           _id: fetEvent.id,
           creator: userFind.bind(this, fetEvent._doc.creator)
       }     

}
module.exports = {
    events: () => {
        return Event.find().then( events => {
           return events.map( event => {
                 return {
                     ...event._doc, 
                     _id: event._doc._id.toString(),
                     date: new Date(event._doc.date).toISOString(),
                     creator: userFind.bind(this, event._doc.creator)
                 } 
             })
         }).catch (err =>{
             throw err;
         })
     },
     bookings:async (parent, args, context, info) => {        
        try{
            const allBookings = await Booking.find();
            return allBookings.map((booking)=>{
               return {
                   ...booking._doc,
                   _id: booking.id,
                   //eventToBooked: singleEvent.bind(this, booking._doc.eventToBooked),
                   //userOfBooking: userFind.bind(this, booking._doc.userOfBooking),
                   createdAt: new Date(booking._doc.createdAt).toISOString(),
                   updatedAt: new Date(booking._doc.createdAt).toISOString()
               } 
            });

        }catch(err){
            throw err;
        }
     },
     bookEvent: async (args, req) => {
            const fetchedEvent  = await Event.findOne({ _id: args.eventId });
            const addedBooking = await new Booking({
                user: req.userId,
                event: fetchedEvent
            });
      
            const createdBooking = await addedBooking.save();
            return {
                ...createdBooking._doc,
                _id: createdBooking.id,
                event: singleEvent.bind(this, createdBooking._doc.event),
                user: userFind.bind(this, createdBooking._doc.user),
                createdAt: new Date(createdBooking._doc.createdAt).toISOString(),
                updatedAt: new Date(createdBooking._doc.createdAt).toISOString(),

            }
     },
     
 login: async ({email, password}, req) => {

        // if (!req.isAuth){
        //     throw new Error ('User not authenticated');
        // }
        const user = await User.findOne({email: email})
        if(!user){
            throw new Error ('User not found')
        }
        const passfind = await bcrypt.compare(password, user.password);
        if(!passfind){
            throw new Error ('Password not found');
        }
        const token = jwt.sign({
            userId: user.id,
            email: user.email,
          }, 'secret', { expiresIn: '1h' });

        return {userId: user.id, token: token, tokenExpiry: 1} 
     },


     createUser: async (args) => {
    
        const usr = await User.findOne({email: args.userInput.email});
        if(usr){
         throw new Error('User is taken.');
        }
         const pass = await bcrypt.hash(args.userInput.password, 12);
         const user = new User({
             email: args.userInput.email,
             password: pass
         })
         
         const userReg = await user.save();
    
         return {
             ...userReg._doc,
             id: userReg._id,
             email: userReg._doc.email,
             password: null
         }
     },
     createEvent: async (args, req) => {
         // const event = {
         //     _id: Math.random.toString(),
         //     title: args.eventInput.title,
         //     description: args.eventInput.description,
         //     price: args.eventInput.price, 
         //     date: args.eventInput.date
         // };
         const event = new Event({
             title: args.eventInput.title,
             description: args.eventInput.description,
             price: args.eventInput.price, 
             date: new Date(args.eventInput.date),
             creator: req.userId
         });
     
         const addedEvent = await event.save();
         let createdEvent = {
             ...addedEvent._doc,
             _id: addedEvent._doc._id.toString(),
             date: new Date(event._doc.date).toISOString(),
             creator: userFind.bind(this, addedEvent._doc.creator)
         };
         const userToUpdate = await User.findById(req.userId);
         if(!userToUpdate){
             throw new Error('User does not exits.');
             }
            
         userToUpdate.createdEvents.push(event);
         await userToUpdate.save();
         return createdEvent;
      
         //events.push(event);
         //return event;
     },
     cancelBooking: async args => {
        try {
          const booking = await Booking.findById(args.bookingId).populate('event'); //populate event field in booking 
          const event = {
            ...booking.event._doc,
            _id: booking.event.id,
            creator: userFind.bind(this, booking.event._doc.creator)
          };
          await Booking.deleteOne({ _id: args.bookingId });
          return event;
        } catch (err) {
          throw err;
        }
      }
        
} 
