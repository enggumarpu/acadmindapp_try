const express = require("express");
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const graphSchema = require('./graphql/schema/index');
const graphResolvers = require('./graphql/resolvers/index');
const isAuth = require('./middleware/auth');
const cors = require('cors');

const graphqlHttp = require('express-graphql').graphqlHTTP;
const app = express();

//All About Databases
//Connection to the Database
url = `mongodb+srv://umar:123@cluster0.foq8i.mongodb.net/db?retryWrites=true&w=majority`;
mongoose.connect(url);
mongoose.connection.once('open', () => console.log('Database Connected'));

app.use(isAuth);
app.use(cors());
app.use('/graphql', graphqlHttp({
    schema: graphSchema,
    rootValue: graphResolvers,
    graphiql: true
}));
app.listen(3050, () => {
    console.log("Connected Port 3050")
})