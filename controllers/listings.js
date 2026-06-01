const Listing=require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });


//index route call back 
module.exports.index=async (req,res)=>{
    let allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
};

module.exports.renderNewForm=async (req,res)=>{
    // console.log(req.user);
    res.render("listings/new.ejs");
};

module.exports.showListing=async (req,res)=>{
    let {id}=req.params;
    const listing= await Listing.findById(id)
    .populate({path:"reviews",//nested populate
        populate:{
            path:"author",
        },
    }).populate("owner");
    console.log(listing);
    if(!listing){
        req.flash("error","Listing you requested for doesn't exist");
        return res.redirect("/listings");
    };
    res.render("listings/show.ejs",{listing});
};

module.exports.createListing=async (req,res,next)=>{
    let response= await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
    })
    .send()

    let url=req.file.path;
    let filename=req.file.filename;
    // console.log(url,"..",filename);
    // try {
    //     let newListing= new Listing(req.body.Listing);//create new listing by extracting from req.body and store in a variable 
    //     await newListing.save();//and then save it heree in database
    //     console.log("New listing added is ",newListing);
    //     res.redirect("/listings");
    // } catch (err) {
    //     next(err);//for error calling our error handler i.e middleware
    // }
    // instead of using try catch block we can use wrapasync 
        // if(!req.body.listing){
        //     throw new ExpressError(400,"Send a valid data for Listing");
        // };
        //using listing schema (joi tool)
        const newListing= new Listing(req.body.listing);//create new listing by extracting from req.body and store in a variable 
        // if(!newListing.title){
        //     throw new ExpressError(400,"title is missing");
        // };
        // if(!newListing.description){
        //     throw new ExpressError(400,"description is missing");
        // };
        // console.log(req.user);
        newListing.owner=req.user._id;
        newListing.image={url,filename};

        newListing.geometry=response.body.features[0].geometry;

        await newListing.save();//and then save it heree in database
        console.log("New listing added is ",newListing);
        req.flash("success","New Listing created!!");
        res.redirect("/listings");
};

module.exports.renderEditForm=async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    // console.log(listing);
    if(!listing){
        req.flash("error","Listing you requested for doesn't exist");
        return res.redirect("/listings");
    };
    let originalImageUrl=listing.image.url;
    originalImageUrl=originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs",{listing,originalImageUrl});
};

module.exports.updateListing=async (req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing});
    if(typeof req.file!=="undefined"){
        let url=req.file.path;
        let filename=req.file.filename;
        listing.image={url,filename};
        await listing.save();
    }
    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing=async (req,res)=>{
    let {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log("Listing Deleted is ",deletedListing);
    req.flash("success","Listing deleted!!");
    res.redirect("/listings");
};