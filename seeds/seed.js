const mongoose = require('mongoose');
const Opportunity = require('../models/opportunities.js');

const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/hoopzone', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(res => {
        console.log("MongoDB Connection Established.");
    })
    .catch(err => {
        console.log(err);
    })

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Opportunity.deleteMany({});
    for (let i = 0; i < 200; i++) {
        const randomNum = Math.floor((Math.random() * 1000) + 1);
        const newOpportunity = new Opportunity({
            author: '626f77471c4b842f0196b5a1',
            title: `${sample(descriptors)}, ${sample(places)}`,
            location: `${cities[randomNum].city}, ${cities[randomNum].state}`,
            geometry: {
                type : "Point",
                coordinates: [
                    cities[randomNum].longitude,
                    cities[randomNum].latitude
                ]
            },
            description: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Eius est ducimus perferendis vero beatae. Optio numquam animi sapiente incidunt labore exercitationem eaque nostrum nam voluptas. Animi iusto autem aut voluptatum.",
            images: [
                {
                    url: 'https://res.cloudinary.com/dkogjegm5/image/upload/v1651997897/hoopzone/i43wledvevddpqmdnuuf.png',
                    filename: 'hoopzone/i43wledvevddpqmdnuuf',
                },
                {
                    url: 'https://res.cloudinary.com/dkogjegm5/image/upload/v1651997897/hoopzone/m83ismesxbklitjqxtwf.png',
                    filename: 'hoopzone/m83ismesxbklitjqxtwf',
                }
            ]
        });
        await newOpportunity.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close;
    console.log("Connection is Closed");
});