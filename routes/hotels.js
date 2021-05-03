const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const Hotel = require('../models/hotel');

const { isLoggedIn, isAuthor, validateHotel } = require('../middleware.js');
const { populate } = require('../models/hotel');

router.get('/', catchAsync(async (req, res) => {
    const hotels = await Hotel.find({});
    res.render('hotels/index', { hotels });
}))
router.get('/new', isLoggedIn, (req, res) => {
    res.render('hotels/new');
})
router.post('/', isLoggedIn, validateHotel, catchAsync(async (req, res, next) => {

    const hotel = new Hotel(req.body.hotel);
    hotel.author = req.user._id;
    await hotel.save();
    req.flash('success', 'Successfully made a new hotel!')
    res.redirect(`/hotels/${hotel._id}`);
}))
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
        req.flash('error', 'Cannot find the hotel')
        return res.redirect('/hotels');
    }
    res.render('hotels/edit', { hotel });
}))
router.put('/:id', isLoggedIn, isAuthor, validateHotel, catchAsync(async (req, res) => {
    const { id } = req.params;

    const hotel = await Hotel.findByIdAndUpdate(id, { ...req.body.hotel }, { new: true });
    //...is expand operator
    req.flash('success', 'Successfully updated hotel!')
    res.redirect(`/hotels/${hotel._id}`);

}))
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Hotel.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted hotel!')
    res.redirect('/hotels');
}))
router.get('/:id', catchAsync(async (req, res) => {
    const hotel = await Hotel.findById(req.params.id).populate({
        path: 'reviews'
        , populate: {
            path: 'author'
        }
    }).populate('author');
    if (!hotel) {
        req.flash('error', 'Cannot find the hotel')
        return res.redirect('/hotels');
    }
    res.render('hotels/show', { hotel });
}))
module.exports = router;