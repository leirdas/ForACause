const Court = require('../models/court.js');
const Review = require('../models/review.js');

module.exports.createReview = async (req, res) => {
    const foundCourt = await Court.findById(req.params.id);
    const { rating, body } = req.body.review;
    const newReview = new Review({
        rating: rating,
        body: body,
        author: req.user._id
    });
    foundCourt.reviews.push(newReview);
    await newReview.save();
    await foundCourt.save();
    req.flash('success', "Successfully created a new review!");
    res.redirect(`/courts/${foundCourt._id}`);
};

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Court.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', "Successfully deleted your review!");
    res.redirect(`/courts/${req.params.id}`)
};