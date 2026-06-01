const express=require("express");
const router=express.Router();
const Listing = require("../models/listing.js");
const wrapAsync=require("../utils/wrapAsync.js");
const {isLoggedIn,isOwner,validateListing}=require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer  = require('multer');
const {storage}=require("../cloudConfig.js");
const upload = multer({ storage });

router
    .route("/")
    // Index Route
    .get(wrapAsync(listingController.index))//listingController whole file we got in that one function index we are passing here 
    // Create Route
    .post(isLoggedIn,
        upload.single('listing[image]'),
        validateListing,
        wrapAsync(listingController.createListing)
    );

// new Listing Route
router.get("/new",isLoggedIn,wrapAsync(listingController.renderNewForm));

router
    .route("/:id")
    // show individual listing route
    .get(wrapAsync(listingController.showListing))
    // update route
    .put(isLoggedIn,isOwner,upload.single('listing[image]'),validateListing,wrapAsync(listingController.updateListing))
    // delete route
    .delete(isLoggedIn,isOwner,wrapAsync(listingController.destroyListing));

// edit Route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm));

// app.get("/testlisting",async (req,res)=>{
//     let sampleListing = new Listing ({
//         title:"Entire villa in Bagayam",
//         description:"it is a villa located in bagayam",
//         price:4794,
//         location:"bagayam",
//         country:"india",
//     })
//     await sampleListing.save();
//     console.log("sampledata was saved");
//     res.send("testing is working");
// });


module.exports=router;