const express = require('express');
const router = express.Router();

const catchAsync = require('../utilities/catchAsync.js');
const { isLoggedIn, isAuthor, validateData } = require('../middlewares.js');

const opportunities = require('../controllers/opportunities.js');

const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.route('/')
    .get(catchAsync(opportunities.index))
    .post(isLoggedIn, upload.array('image'), validateData, catchAsync(opportunities.createOpportunity));

router.get('/new', isLoggedIn, catchAsync(opportunities.renderNewForm));

router.route('/:id')
    .get(catchAsync(opportunities.showOpportunity))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateData, catchAsync(opportunities.editOpportunity))
    .delete(isLoggedIn, isAuthor, catchAsync(opportunities.deleteOpportunity))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(opportunities.renderEditForm));

module.exports = router;