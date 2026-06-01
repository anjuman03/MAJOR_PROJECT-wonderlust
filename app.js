if(process.env.NODE_ENV !="production"){
    require('dotenv').config();
}

// console.log(process.env.KEY);

const express=require("express")
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const methodOverride = require('method-override');
const ejsMate=require("ejs-mate"); 
const ExpressError =require("./utils/ExpressError.js");
const session=require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

// require the routes -listings,reviews
const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");

// const MONGO_URL='mongodb://127.0.0.1:27017/wanderlust';
const dburl=process.env.ATLASDB_URL;

main().then(()=>{
    console.log("connected to DB");
}).catch(err=>{
    console.log(err);
});

async function main() {
    await mongoose.connect(dburl);
};

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const store = MongoStore.create({
    mongoUrl: dburl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter: 24*60*60,
});

const sessionOptions={      //defining session options 
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAvg:7*24*60*60*1000,
        httpOnly:true,
    },
};

store.on("error",()=>{
    console.log("EROOR IN SESSION STORE",err);
});

// app.get("/",(req,res)=>{
//     // console.log("I am Root and is working");
//     res.send("I am Root and is working");
// });

app.use(session(sessionOptions));//use sessions 
app.use(flash());//using flash 

// use passport after session bcz passport will use session 
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{  //creating a middleware for flash the message by storing in local variable 
    res.locals.success=req.flash("success");
    // console.log(res.locals.success);
    // for error message to flash and acces error
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;//stores user info in curruser to acces in ejs template 
    next();
});

app.get("/demouser", async (req, res) => {
    try {
        let fakeUser = new User({
            email: "anjuman@gmail.com",
            username: "anjuman",
        });
        let registeredUser = await User.register(fakeUser, "helloworld");
        res.send(registeredUser);
    } catch(e) {
        console.log(e);
        // console.log(e.message);
        res.send(e.message);
    }
});

//using listing.js,review.js route ROUTER 
app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

// using expresserror class
app.all("/{*splat}",(req,res,next)=>{
    // throw new ExpressError(404,"Page not Found! ")
    next(new ExpressError(404,"Page not found!"));
});

// error handler (middleware)
app.use((err,req,res,next)=>{
    let {statusCode=500,message="Something went wrong"}=err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080,()=>{
    console.log("server is listening to port 8080");
});