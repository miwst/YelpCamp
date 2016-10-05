var express = require('express');
var router = express.Router();
var Campground = require('../models/campground');

//INDEX - show all campgrounds
router.get('/',function(req,res){
    //Get all campgrounds from DB
    Campground.find({}, function(err,allCampgrounds){
        if (err) {
            console.log(err);
        } else {
            res.render('campgrounds/index',{campgrounds:allCampgrounds, currentUser: req.user});
        }
    });
});

//CREATE - add new campground to DB
router.post('/', isLoggedIn, function(req,res){
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var author = {
      id: req.user._id,
      username: req.user.username
    };
    var newCampground = {name:name, image:image, description:description, author: author};
    //Create a new campground and save to DB
    Campground.create(newCampground, function(err,newlyCreated){
        if(err) {
            console.log(err);
        } else {
            //Redirect back to campgrounds page
            res.redirect('/campgrounds');
        }
    });
});

//NEW campground form
router.get('/new', isLoggedIn, function(req,res){
   res.render('campgrounds/new.ejs');
});

//SHOW more info about campground
router.get('/:id', function(req, res) {
    //Find the campground with provided ID
    Campground.findById(req.params.id).populate('comments').exec(function(err, foundCampground){
        if(err) {
            console.log(err);
        } else {
            console.log(foundCampground);
            //Render show template with that campground
            res.render('campgrounds/show', {campground: foundCampground});
        }
    });
});

//EDIT campground
router.get('/:id/edit', checkCampgroundOwnership, function(req, res){
  Campground.findById(req.params.id, function(err, foundCampground){
    res.render('campgrounds/edit', {campground: foundCampground});
  });
});

//UPDATE campground
router.put('/:id', checkCampgroundOwnership, function(req, res){
  Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
    if(err) {
      console.log(err);
    } else {
      res.redirect('/campgrounds/' + req.params.id);
    }
  });
});

//DESTROY campground
router.delete('/:id', checkCampgroundOwnership, function(req, res){
  Campground.findByIdAndRemove(req.params.id, function(err){
    if(err){
      console.log(err);
    } else {
      res.redirect('/campgrounds');
    }
  });
});

//middleware
function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/login');
};

function checkCampgroundOwnership(req, res, next){
  //is user logged in?
  if(req.isAuthenticated()){
    Campground.findById(req.params.id, function(err, foundCampground){
      if(err){
        res.redirect('back');
      } else {
        //does user own campground?
        //instead of === use .equals(), because foundCampground.id is a mongoose object, not a string
        if(foundCampground.author.id.equals(req.user._id)){
          next();
        } else {
          res.redirect('back');
        }
      }
    });
  } else {
    res.redirect('back');
  };
}

module.exports = router;
