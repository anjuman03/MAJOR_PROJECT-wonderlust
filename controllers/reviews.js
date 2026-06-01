const Review = require("../models/review.js");
const Listing = require("../models/listing.js");//listing schema is required becuase in listing we are deleting the review 

module.exports.createReview=async(req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id);
    // let listing= await Listing.findById(req.params.id);
    let newReview=new Review(req.body.review);//new review stored in backend given from the show.ejs where you have review[comment],[rating] objects 
    newReview.author=req.user._id;
    console.log(newReview);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();//if we want to do anything/change in the  existing doc in db then we have to call .save 

    // console.log("new review saved");
    // res.send("new review saved");
    // res.redirect(`/listings/${listing._id}`);
    req.flash("success","Review created!!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyReview=async(req,res)=>{
    let {id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});//using pull operator from listing using listingId the deleted review we will match it with reviewId in the array and pull it out i.e remove it out
    await Review.findByIdAndDelete(reviewId);//deleting the review from reviews
    console.log("Deleted reviewId is",reviewId);
    req.flash("success","Review deleted!!");
    res.redirect(`/listings/${id}`);
};