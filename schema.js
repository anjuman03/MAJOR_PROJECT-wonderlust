const Joi = require('joi');
const reviews = require('./models/review');

module.exports.listingSchema=Joi.object({ //in listing schema we are creating one  listing object which have some parameters and that listing must be required
    listing:Joi.object({
        title:Joi.string().required(),
        description:Joi.string().required(),
        location:Joi.string().required(),
        country:Joi.string().required(),
        price:Joi.number().required().min(0),//min value of price must be 0 as there should not be negative values
        image: Joi.object({
            url: Joi.string().allow("", null),
            filename: Joi.string().allow("", null)
        }).allow(null)//in image we can keep it as string and not so required cause we have set a default image link already and it can allow null and empty string
    }).required()
});

module.exports.reviewSchema=Joi.object({ //in listing schema we are creating one  listing object which have some parameters and that listing must be required
    review:Joi.object({
        rating:Joi.number().required().min(1).max(5),
        comment:Joi.string().required(),
    }).required()
});