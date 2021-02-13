createUser: (args) => {
    const user = new User({
        email: args.userInput.email,
        password: args.userInput.password,
    })
    //users.push(user);
    //return user;
    user.save().then(resuser => {
        return {...resuser._doc, _id:event._doc._id.toString() } 
    }).catch( err => {
        throw err;
    })
}
