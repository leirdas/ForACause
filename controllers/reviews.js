const Opportunity = require('../models/opportunity.js');
const Review = require('../models/review.js');

module.exports.createReview = async (req, res) => {
    const foundOpportunity = await Opportunity.findById(req.params.id);
    const { rating, body } = req.body.review;
    const newReview = new Review({
        rating: rating,
        body: body,
        author: req.user._id
    });
    foundOpportunity.reviews.push(newReview);
    await newReview.save();
    await foundOpportunity.save();
    req.flash('success', "Successfully created a new review!");
    res.redirect(`/opportunities/${foundOpportunity._id}`);
};

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Opportunity.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', "Successfully deleted your review!");
    res.redirect(`/opportunities/${req.params.id}`)
};