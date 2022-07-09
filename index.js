if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');

const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');

const mongoose = require('mongoose');

const ExpressError = require('./utilities/ExpressError.js');

const courtRoutes = require('./routes/courts.js');
const reviewRoutes = require('./routes/reviews.js');
const userRoutes = require('./routes/user.js');

const passport = require('passport');
const LocalStrategy = require('passport-local');

const User = require('./models/user.js');

const mongoSanitize = require('express-mongo-sanitize');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/hoopzone';

const MongoDBStore = require("connect-mongo");

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(res => {
        console.log("MongoDB Connection Established.");
    })
    .catch(err => {
        console.log(err);
    })

app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({
    replaceWith: '_'
}));

const secret = process.env.SECRET || 'secretCode';

const store = MongoDBStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    name: "session",
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.get('/', (req, res) => {
    res.render('home');
});

app.use('/courts', courtRoutes);
app.use('/courts/:id/reviews', reviewRoutes);
app.use('/', userRoutes);

app.get('*', (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Something Went Wrong";
    res.status(statusCode).render('error', { err });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    try {
        console.log(`Listening on PORT ${port}}`);
    } catch (err) {
        console.log(err);
    }
});