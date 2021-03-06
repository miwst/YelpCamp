var express        = require('express'),
    app            = express(),
    bodyParser     = require('body-parser'),
    mongoose       = require('mongoose'),
    Campground     = require('./models/campground'),
    Comment        = require('./models/comment'),
    seedDB         = require('./seeds'),
    passport       = require('passport'),
    LocalStrategy  = require('passport-local'),
    User           = require('./models/user'),
    methodOverride = require('method-override'),
    flash          = require('connect-flash')

var commentRoutes    = require('./routes/comments'),
    campgroundRoutes = require('./routes/campgrounds'),
    indexRoutes      = require('./routes/index');

mongoose.connect('mongodb://miwst:assword@ds053166.mlab.com:53166/the_knox');
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine','ejs');
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));
app.use(flash());
//seedDB();

app.set('port', (process.env.PORT || 3000));


//PASSPORT CONFIGURATION
app.use(require('express-session')({
  secret: 'mellon',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  next();
});

app.use(indexRoutes);
app.use('/campgrounds/:id/comments', commentRoutes);
app.use('/campgrounds', campgroundRoutes);

app.listen(app.get('port'), function(){
    console.log("serve's up at port:", app.get('port'));
});
