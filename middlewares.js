const ExpressError = require('./utilities/ExpressError.js');
const { taskSchema, reviewSchema } = require('./schema.js');
const Task = require('./models/task.js');
const Review = require('./models/review.js');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', "Please Login to Access This Page!");
        return res.redirect('/login');
    }
    next();
}

module.exports.validateData = (req, res, next) => {
    const { error } = taskSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const verifyTask = await Task.findById(id);
    if (!verifyTask.author.equals(req.user._id)) {
        req.flash('error', "You do not have permission to do that.");
        return res.redirect(`/tasks/${id}`);
    }
    next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const verifyReview = await Review.findById(reviewId);
    if (!verifyReview.author.equals(req.user._id)) {
        req.flash('error', "You do not have permission to do that.");
        return res.redirect(`/tasks/${id}`);
    }
    next();
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}