const { hotelSchema, reviewSchema } = require('./schemas.js')
const ExpressError = require('./utils/ExpressError')
const Hotel = require('./models/hotel');
const Review = require('./models/review');
module.exports.isLoggedIn = (req, res, next) => {

    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', "You must be signed in!")
        return res.redirect('/login');
    }
    next();
}
module.exports.validateReview = (req, res, next) => {

    const { error } = reviewSchema.validate(req.body);
    //we need only error portion of result
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400);
    }
    else {
        next();
    }
}

module.exports.validateHotel = (req, res, next) => {

    const { error } = hotelSchema.validate(req.body);
    //we need only error portion of result
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400);
    }
    else {
        next();
    }
}
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const temp_hotel = await Hotel.findById(id);
    if (!temp_hotel.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/hotels/${id}`)
    }
    else {
        next();
    }
}
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/hotels/${id}`)
    }
    else {
        next();
    }
}