require("dotenv").config();
const path = require("node:path");
const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("./config/passport.js");
const usersRouter = require("./routes/usersRouter.js");
const messagesRouter = require("./routes/messagesRouter.js");


const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.set("trust proxy", 1)

const assetsPath = path.join(__dirname, "public")

app.use(express.static(assetsPath))
app.use(express.urlencoded({ extended: false }));

app.use(session({ 
    secret: process.env.SESSION_SECRET, 
    resave: false, 
    saveUninitialized: false,
    cookie: {
        secure: true
    }
}));


app.use(flash());
app.use(passport.session());


app.use((req, res, next) => {

  res.locals.user = req.user;

  const flashErrors = req.flash('error');
  res.locals.errors = flashErrors.length > 0 ? flashErrors : null;
  
  next();

});

app.use("/", messagesRouter);
app.use("/", usersRouter);

const PORT = 3000;
app.listen(PORT, (error) => {
    if (error) {
        throw error
    }
    console.log(`Members only app - listening on port ${PORT}!`)
});

