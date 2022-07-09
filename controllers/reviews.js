const Task = require('../models/task.js');
const Review = require('../models/review.js');

module.exports.createReview = async (req, res) => {
    const foundTask = await Task.findById(req.params.id);
    const { rating, body } = req.body.review;
    const newReview = new Review({
        rating: rating,
        body: body,
        author: req.user._id
    });
    foundTask.reviews.push(newReview);
    await newReview.save();
    await foundTask.save();
    req.flash('success', "Successfully created a new review!");
    res.redirect(`/tasks/${foundTask._id}`);
};

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Task.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', "Successfully deleted your review!");
    res.redirect(`/tasks/${req.params.id}`)
};