const express = require('express');
const router = express.Router();

const catchAsync = require('../utilities/catchAsync.js');
const { isLoggedIn, isAuthor, validateData } = require('../middlewares.js');

const courts = require('../controllers/courts.js');

const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.route('/')
    .get(catchAsync(courts.index))
    .post(isLoggedIn, upload.array('image'), validateData, catchAsync(courts.createCourt));

router.get('/new', isLoggedIn, catchAsync(courts.renderNewForm));

router.route('/:id')
    .get(catchAsync(courts.showCourt))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateData, catchAsync(courts.editCourt))
    .delete(isLoggedIn, isAuthor, catchAsync(courts.deleteCourt))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(courts.renderEditForm));

module.exports = router;