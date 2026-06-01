const express=require("express");
const router=express.Router({mergeParams:true});
const Review = require("../models/review.js");
const wrapAsync= require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");//listing schema is required becuase in listing we are deleting the review 
const {validateReview, isLoggedIn, isReviewAuthor}=require("../middleware.js")
const reviewController = require("../controllers/reviews.js");

//Reviews--post request
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview));

// delete review route
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(reviewController.destroyReview));

module.exports=router;