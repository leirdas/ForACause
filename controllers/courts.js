const Court = require('../models/court.js');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require('../cloudinary');

module.exports.index = async (req, res) => {
    const allCourts = await Court.find({});
    res.render('index', { allCourts });
};

module.exports.renderNewForm = async (req, res) => {
    res.render('new');
};

module.exports.createCourt = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.court.location,
        limit: 1
    }).send();
    const newCourt = new Court(req.body.court);
    newCourt.geometry = geoData.body.features[0].geometry;
    newCourt.author = req.user._id;
    newCourt.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    await newCourt.save();
    req.flash('success', "Successfully registered a new court!");
    res.redirect(`/courts/${newCourt._id}`);
};

module.exports.showCourt = async (req, res) => {
    try {
        const foundCourt = await Court.findById({ _id: req.params.id }).populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        }).populate('author');
        res.render('show', { foundCourt });
    } catch {
        req.flash('error', "Court not found!")
        return res.redirect('/courts');
    }
};

module.exports.renderEditForm = async (req, res) => {
    try {
        const foundCourt = await Court.findById({ _id: req.params.id });
        res.render('edit', { foundCourt });
    } catch {
        req.flash('error', "Court not found!")
        return res.redirect('/courts');
    }
};

module.exports.editCourt = async (req, res) => {
    const foundCourt = await Court.findByIdAndUpdate(req.params.id, { ...req.body.court });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    foundCourt.images.push(...imgs);
    await foundCourt.save();
    console.log(req.body);
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await foundCourt.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', "Successfully updated the court's details!");
    res.redirect(`/courts/${foundCourt._id}`);
};

module.exports.deleteCourt = async (req, res) => {
    await Court.findByIdAndDelete(req.params.id);
    req.flash('success', "Successfully deleted a registered court!");
    res.redirect('/courts');
};