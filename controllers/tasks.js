const Task = require('../models/task.js');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require('../cloudinary');

module.exports.index = async (req, res) => {
    const allTasks = await Task.find({});
    res.render('index', { allTasks });
};

module.exports.renderNewForm = async (req, res) => {
    res.render('new');
};

module.exports.createTask = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.task.location,
        limit: 1
    }).send();
    const newTask = new Task(req.body.task);
    newTask.geometry = geoData.body.features[0].geometry;
    newTask.author = req.user._id;
    newTask.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    await newTask.save();
    req.flash('success', "Successfully registered a new task!");
    res.redirect(`/tasks/${newTask._id}`);
};

module.exports.showTask = async (req, res) => {
    try {
        const foundTask = await Task.findById({ _id: req.params.id }).populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        }).populate('author');
        res.render('show', { foundTask });
    } catch {
        req.flash('error', "Task not found!")
        return res.redirect('/tasks');
    }
};

module.exports.renderEditForm = async (req, res) => {
    try {
        const foundTask = await Task.findById({ _id: req.params.id });
        res.render('edit', { foundTask });
    } catch {
        req.flash('error', "Task not found!")
        return res.redirect('/tasks');
    }
};

module.exports.editTask = async (req, res) => {
    const foundTask = await Task.findByIdAndUpdate(req.params.id, { ...req.body.task });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    foundTask.images.push(...imgs);
    await foundTask.save();
    console.log(req.body);
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await foundTask.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', "Successfully updated the task's details!");
    res.redirect(`/tasks/${foundTask._id}`);
};

module.exports.deleteTask = async (req, res) => {
    await Task.findByIdAndDelete(req.params.id);
    req.flash('success', "Successfully deleted a registered task!");
    res.redirect('/tasks');
};