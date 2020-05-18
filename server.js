const express = require('express');
const passport = require("passport");
const mongoose = require("mongoose");
require('dotenv').config()
const app = express();

app.use(express.urlencoded({ extended: false })) //tell application we want to access form info inside of request variable inside post method
app.use(express.json());

//connect to database
mongoose.connect(process.env.DB_CONNECTION_2,
{ useNewUrlParser: true, useUnifiedTopology: true } 
);
mongoose.connection.on("connected", () => console.log('connected to database'));
mongoose.connection.on("error", () => console.log('error connecting to database'));

//Routing
const usersRoute = require("./routes/api/users");
app.use("/api/users", usersRoute);

const port = 3456;

app.listen(port, () => console.log(`Server started on port ${port}`));


