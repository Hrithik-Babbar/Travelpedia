const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync')
const methodOverride = require('method-override');
const session = require('express-session');
const Hotel = require('./models/hotel');
const Review = require('./models/review');

const hotelsRoutes = require('./routes/hotels')
const reviewsRoutes = require('./routes/reviews')
const userRoutes = require('./routes/users');
const ExpressError = require('./utils/ExpressError')
const passport = require('passport');
const LocalStrategy = require('passport-local');
const app = express(); //new express application in app
const User = require('./models/user');
const flash = require('connect-flash');
const Joi = require('joi')

mongoose.connect('mongodb://localhost:27017/Travelpedia', { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false, useFindAndModify: false })
    .then(() => {
        console.log("DataBase Connected");
    })
    .catch(err => {
        console.log("DataBase Not Connected");
    })
const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24,
        maxAge: 1000 * 60 * 60 * 24
    }
}
app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static('public'));
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
//_method keyword is not mandatory 

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next();
})
app.get('/', (req, res) => {
    res.render('home');
})

app.use('/hotels', hotelsRoutes);
app.use('/hotels/:id/reviews', reviewsRoutes);
app.use('/', userRoutes)

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message)
        err.message = 'Oh no,something went wrong'
    res.status(statusCode).render('error', { err });
})
app.listen(3000, () => {
    //app.listen set port which will listen to our request
})