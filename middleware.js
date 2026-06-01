const Listing=require("./models/listing");
const Review=require("./models/review");
const ExpressError =require("./utils/ExpressError.js");
const {listingSchema,reviewSchema}=require("./schema.js");

module.exports.isLoggedIn=((req,res,next)=>{
    // console.log(req.path,"..",req.originalUrl);
    if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","You must login!");
        return res.redirect("/login");
    }
    next();
});

module.exports.saveRedirectUrl=((req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
});

module.exports.isOwner=(async(req,res,next)=>{
    let {id}=req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error","You are not the owner of this Listing");
        return res.redirect(`/listings/${id}`);
    };
    next();
});

module.exports.isReviewAuthor=(async(req,res,next)=>{
    let {id,reviewId}=req.params;
    let review = await Review.findById(reviewId);
    if(!review.author._id.equals(res.locals.currUser._id)){
        req.flash("error","You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    };
    next();
});

//for server side validation of listings and use it in create route
module.exports.validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");//map the message of individual elements with error details and join them with ,
        throw new ExpressError(400,errMsg);//pass that errMsg 
    }else{
        next();
    }
};

//for server side validation of review and use it in reviews route
module.exports.validateReview=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");//map the message of individual elements with error details and join them with ,
        throw new ExpressError(400,errMsg);//pass that errMsg 
    }else{
        next();
    }
};