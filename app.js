var express       = require('express'),
    app           = express(),
    bodyParser    = require('body-parser'),
    mongoose      = require('mongoose'),
    Campground    = require('./models/campground'),
    Comment       = require('./models/comment'),
    seedDB        = require('./seeds'),
    passport      = require('passport'),
    LocalStrategy = require('passport-local'),
    User          = require('./models/user');

mongoose.connect('mongodb://localhost/yelp_camp');
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine','ejs');
app.use(express.static(__dirname + '/public'));
seedDB();

//DEFAULT
app.get('/', function(req, res){
  res.render('landing');
});

//INDEX - show all campgrounds
app.get('/campgrounds',function(req,res){
    //Get all campgrounds from DB
    Campground.find({}, function(err,allCampgrounds){
        if (err) {
            console.log(err);
        } else {
            res.render('campgrounds/index',{campgrounds:allCampgrounds});
        }
    });
});

//CREATE - add new campground to DB
app.post('/campgrounds',function(req,res){
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var newCampground = {name:name, image:image, description:description};
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

//NEW - show form to create new campground
app.get('/campgrounds/new', function(req,res){
   res.render('campgrounds/new.ejs');
});

//SHOW - shows more info about one campground
app.get('/campgrounds/:id', function(req, res) {
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

//COMMENTS
app.get('/campgrounds/:id/comments/new', function(req, res){
  Campground.findById(req.params.id, function(err, campground){
    if (err) {
      console.log(err);
    } else {
      res.render('comments/new', {campground: campground});
    }
  });
});

app.post('/campgrounds/:id/comments', function(req, res){
    Campground.findById(req.params.id, function(err, campground){
      if (err){
        console.log(err);
        res.redirect('/campgrounds');
      } else {
        Comment.create(req.body.comment, function(err, comment){
          if(err){
            console.log(err);
          } else {
            campground.comments.push(comment);
            campground.save();
            res.redirect('/campgrounds/' + campground._id);
          }
        });
      }
    });
});

app.listen(3000, function(){
    console.log("serve's up");
});
