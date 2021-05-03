const express = require('express');
const router = express.Router({ mergeParams: true });
const Hotel = require('../models/hotel');
const catchAsync = require('../utils/catchAsync')
const Review = require('../models/review')
const ExpressError = require('../utils/ExpressError')
const User = require('../models/user');
const passport = require('passport');



router.get('/register', (req, res) => {
    res.render('users/register')
})

router.post('/register', catchAsync(async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registerUser = await User.register(user, password);
        req.login(registerUser, err => {
            if (err) return next(err);

            req.flash('success', 'Welcome to Travelpedia!');
            res.redirect('/hotels');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/hotels');
    }
}));
router.get('/login', (req, res) => {
    res.render('users/login');
})
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'welcome back!');
    const redirectUrl = req.session.returnTo || '/hotels';
    delete req.session.returnTo
    res.redirect(redirectUrl)
})
router.get('/logout', (req, res) => {
    req.logOut();
    req.flash('success', "SEE YOU!")
    res.redirect('/hotels');
})
module.exports = router;