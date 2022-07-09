const express = require('express');
const router = express.Router({ mergeParams: true });

const catchAsync = require('../utilities/catchAsync.js');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middlewares.js');
const reviews = require('../controllers/reviews.js');

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete('/:reviewId', isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;