const express = require('express');
const router = express.Router();

const catchAsync = require('../utilities/catchAsync.js');
const { isLoggedIn, isAuthor, validateData } = require('../middlewares.js');

const tasks = require('../controllers/tasks.js');

const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.route('/')
    .get(catchAsync(tasks.index))
    .post(isLoggedIn, upload.array('image'), validateData, catchAsync(tasks.createTask));

router.get('/new', isLoggedIn, catchAsync(tasks.renderNewForm));

router.route('/:id')
    .get(catchAsync(tasks.showTask))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateData, catchAsync(tasks.editTask))
    .delete(isLoggedIn, isAuthor, catchAsync(tasks.deleteTask))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(tasks.renderEditForm));

module.exports = router;