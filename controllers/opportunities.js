const Opportunity = require('../models/opportunity.js');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require('../cloudinary');

module.exports.index = async (req, res) => {
    const allOpportunities = await Opportunity.find({});
    res.render('index', { allOpportunities });
};

module.exports.renderNewForm = async (req, res) => {
    res.render('new');
};

module.exports.createOpportunity = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.opportunity.location,
        limit: 1
    }).send();
    const newOpportunity = new Opportunity(req.body.opportunity);
    newOpportunity.geometry = geoData.body.features[0].geometry;
    newOpportunity.author = req.user._id;
    newOpportunity.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    await newOpportunity.save();
    req.flash('success', "Successfully registered a new opportunity!");
    res.redirect(`/opportunities/${newOpportunity._id}`);
};

module.exports.showOpportunity = async (req, res) => {
    try {
        const foundOpportunity = await Opportunity.findById({ _id: req.params.id }).populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        }).populate('author');
        res.render('show', { foundOpportunity });
    } catch {
        req.flash('error', "Opportunity not found!")
        return res.redirect('/opportunities');
    }
};

module.exports.renderEditForm = async (req, res) => {
    try {
        const foundOpportunity = await Opportunity.findById({ _id: req.params.id });
        res.render('edit', { foundOpportunity });
    } catch {
        req.flash('error', "Opportunity not found!")
        return res.redirect('/opportunities');
    }
};

module.exports.editOpportunity = async (req, res) => {
    const foundOpportunity = await Opportunity.findByIdAndUpdate(req.params.id, { ...req.body.opportunity });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    foundOpportunity.images.push(...imgs);
    await foundOpportunity.save();
    console.log(req.body);
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await foundOpportunity.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', "Successfully updated the opportunity's details!");
    res.redirect(`/opportunities/${foundOpportunity._id}`);
};

module.exports.deleteOpportunity = async (req, res) => {
    await Opportunity.findByIdAndDelete(req.params.id);
    req.flash('success', "Successfully deleted a registered opportunity!");
    res.redirect('/opportunities');
};