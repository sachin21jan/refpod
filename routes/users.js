var express = require('express');
var router = express.Router();
var config = require('../config/auth');
var messages = require('../config/properties');
var User = require('../models/user');
var JobPost = require('../models/employer');
var Company = require('../models/company');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var GoogleContacts = require('google-contacts').GoogleContacts;
var request = require('request');
var fs = require('fs');

router.get('/', ensureUserAuthenticated, function(req, res, next) {
    console.log('users: /');
    res.json(req.user.firstName);
    //res.render('userhome', {title:'Refpod - a new way of employee referral'});
});

function ensureUserAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        console.log('User is authenticated for ' + req.user.email);
        return next();
    }
    console.log('User is not authenticated');
    return res.json(401, {message: "User not authenticated"});
}

router.get('/isLoggedIn', function(req, res, next) {
    console.log('users: /isLoggedIn');
    if(req.isAuthenticated()){
        console.log('isLoggedIn ' + true);
        return res.json(200, {message: "User authenticated"});
    }
    console.log('isLoggedIn ' + false);
    return res.json(401, {message: "User not authenticated"});
});

router.get('/signin', function(req, res, next) {
    console.log('users: /signin get');
    res.render('signin', {title:'Refpod - a new way of employee referral', message: req.flash('error')});
});

router.post('/signin', function(req, res, next) {
    console.log('users: /signin get');
    passport.authenticate('local-user', function(err, user, info) {
        var error = err || info;
        if (error) {
            return res.json(400, error);
        }
        req.logIn(user, function(err) {
            if (err) {
                return res.send(err);
            }
            //console.log("req.user: " + req.user);
            res.json(req.user.firstName);
        });
    })(req, res, next);
});

passport.use('local-user', new LocalStrategy({
        usernameField: 'email'
    },
    function(username, password, done) {
        User.getUserByUsername(username, function(err, user){
            if(err) throw err;
            if(!user){
                console.log('User not found : ' + username);
                return done(null, false, {hasErrors: true, message: 'You are not registered with us. Please <a href=\"#signup\">sign up</a>'});
            } else if (user.isEmployer){
                return done(null, false, {hasErrors: true, message: 'You are registered as an employer. Please use <a href=\"/employers/login\">employer</a> page to sign in'});
            }
            User.comparePassword(password, user.password, function(err, isMatch){
                if(err) throw err;
                if(isMatch){
                    return done(null, user);
                } else {
                    console.log('Invalid password for : ' + username);
                    return done(null, false, {hasErrors: true, message: 'Invalid password'});
                }
            });
        });
    }
));

router.get('/getCompanyjobs', ensureUserAuthenticated, function(req, res, next){
    console.log('users: /companyjobs get');
    console.log("req.user.email: " + req.user.email);
    var userEmail = req.user.email;
    var atIndex = userEmail.indexOf("@");
    var dotIndex = userEmail.indexOf(".");
    var domain = userEmail.substring(atIndex + 1, dotIndex);
    Company.findCompanyByDomain(domain, function(err, company){
        console.log("company: " + company);
        if(company) {
            JobPost.getJobsByCompany(company._id, function (err, jobPosts) {
                res.json(jobPosts);
            });
        } else {
            res.json(200, messages.user.profile.companynotfound);
        }
    });
    //res.render('companyjobs');
});

router.get('/getFriends', ensureUserAuthenticated, function(req, res, next){
    console.log('users: /getFriends get');
    console.log("req.user.email: " + req.user.email);
    var userEmail = req.user.email;
    User.getUserByUsername(userEmail, function(err, user){
       console.log("Number of friends returned for user " + userEmail + " are " + user.googleFriends.length);
        res.json(user.googleFriends);
    });
});

router.get('/friendsjobs', function(req, res, next){
    res.render('friendsjobs');
});

router.get('/profile', function(req, res, next){
    res.render('profile');
});

passport.use('facebook', new FacebookStrategy({
        clientID: config.facebook.clientID,
        clientSecret: config.facebook.clientSecret,
        callbackURL: config.facebook.callbackURL,
        profileFields: ['id', 'displayName', 'photos'],
        passReqToCallback: true
    },
    function(req, accessToken, refreshToken, profile, done) {
        console.log("accessToken: " + accessToken);
        //console.log("refreshToken: " + refreshToken);
        console.log("profile.id: " + profile.id);
        console.log("profile.displayName: " + profile.displayName);
        console.log("req.user.email: " + req.user.email);
        User.getUserByFacebookId(profile.id, function(err, result){
            if(result){
                console.log("Facebook details of " + req.user.email + " already exist in our database");
                done(null, result);
            } else {
                User.updateUser(req.user.email, {facebookId: profile.id},function(err, result){
                    if (err) {
                        return done(err);
                    }
                    console.log("Result from database: " + result);
                    console.log("Facebook information updated in database");
                    done(null, result);
                });
            }
        });
    }
));

passport.use('google', new GoogleStrategy({
        clientID: config.google.clientID,
        clientSecret: config.google.clientSecret,
        callbackURL: config.google.callbackURL,
        passReqToCallback: true
    },
    function(req, token, tokenSecret, profile, done) {
        console.log("token: " + token);
        console.log("tokenSecret: " + tokenSecret);
        console.log("profile.id: " + profile.id);
        console.log("profile.displayName: " + profile.displayName);
        console.log("req.user.email: " + req.user.email);
        User.getUserByGoogleId(profile.id, function(err, result){
            //if(result){
            //    console.log("Google details of " + req.user.email + " already exist in our database");
            //    done(null, result);
            //} else {
                //console.log("Google information updated in database");
                console.log("########## Google contacts API to retrieve google contacts");
                var c = new GoogleContacts({
                    token: token
                });
                c.on('error', function (e) {
                    console.log('error', e);
                });
                c.on('contactsReceived', function (contacts) {
                    console.log('contacts: ' + contacts);
                });
                c.on('contactGroupsReceived', function (contactGroups) {
                    console.log('groups: ' + contactGroups);
                });
                c.getContacts(function(err, contacts){
                    console.log("Error: " + err);
                    console.log("Contacts returned: "+ contacts.length);
                    var googleFriends = [];
                    var i = 0, length = contacts.length;
                    var readContacts = function() {
                        if (i == length) {
                            return;
                        }
                        var name = contacts[i].name;
                        var email = contacts[i].email;
                        var photoURL = contacts[i].photoURL;
                        console.log("Name: " + name + ", Email: " + email + ", Photo: " + photoURL);
                        if (email && email.indexOf('-') === -1 && /^[a-zA-Z0-9 ]+$/.test(name)) {
                            if (name === '' || name === undefined || name === null) {
                                name = email;
                            }
                            if (photoURL.indexOf('https://') != -1) {
                                var googlePhotoURL = photoURL + '?access_token=' + token;
                                console.log("Trying to access " + googlePhotoURL);
                                request
                                    .get(googlePhotoURL)
                                    .on('error', function (err) {
                                        console.log(err);
                                    })
                                    .on('response', function (response) {
                                        //console.log(response.statusCode);
                                        //console.log(response.headers['content-type']);
                                    })
                                    .pipe(fs.createWriteStream('public/images/users/' + name + ".jpeg"));

                            }
                        }
                        i++;
                        setTimeout(readContacts, 1000);
                    };
                    readContacts();

                    //for(var i = 0 ; i < contacts.length; i++ ) {
                    //    var name = contacts[i].name;
                    //    var email = contacts[i].email;
                    //    var photoURL = contacts[i].photoURL;
                    //    console.log("Name: " + name + ", Email: " + email + ", Photo: " + photoURL);
                    //    if(email && email.indexOf('-') === -1 && /[^a-zA-Z0-9]/.test(name)) {
                    //        if(name === '' || name === undefined || name === null){
                    //            name = email;
                    //        }
                    //        if (photoURL.indexOf('https://') != -1) {
                    //            var googlePhotoURL = photoURL + '?access_token=' + token;
                    //            console.log("Trying to access " + googlePhotoURL);
                    //            request
                    //                    .get(googlePhotoURL)
                    //                    .on('error', function (err) {
                    //                        console.log(err);
                    //                    })
                    //                    .on('response', function (response) {
                    //                        console.log(response.statusCode) // 200
                    //                        console.log(response.headers['content-type']) // 'image/png'
                    //                    })
                    //                    .pipe(fs.createWriteStream(name + ".jpg"));
                    //
                    //        }
                    //    googleFriends.push({name: name, email: email});
                    //    }
                    //}
                    User.updateUser(req.user.email, {googleId: profile.id, googleFriends: googleFriends}, function(err, result){
                        if (err) {
                            return done(err);
                        }
                        console.log("Result from database: " + result);
                        done(null, result);
                    });
                });
            //}
        });
    }
));

router.get('/auth/facebook', passport.authenticate('facebook'));

router.get('/auth/facebook/callback',
        passport.authenticate('facebook',
        {
            successRedirect: '/#/users',
            failureRedirect: '/#/users'
        }
    ));

router.get('/auth/google',
    passport.authenticate('google', { scope: [ // One of the next three `auth` scopes are needed.
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
        //'https://www.googleapis.com/auth/plus.login',
        'https://www.google.com/m8/feeds'
    ] }));

router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/#/friends' }),
    function(req, res) {
        res.redirect('/#/friends');
    });

router.get('/logout', function(req, res){
    console.log('users: /logout get');
    req.logout();
    req.flash('success', 'You have logged out');
    //res.redirect('/users/signin');
    res.json(200);
});

router.get('/signup', function(req, res, next) {
    console.log('users: /signup get');
    res.render('signup', {title: 'Sign up for Refpod'});
});

/* Register new user */
router.post('/signup', function(req, res, next) {
    console.log('users: /signup post');
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var email = req.body.email;
    var password = req.body.password;
    
    console.log("firstName: " + firstName);
    console.log("lastName: " + lastName);
    console.log("email: " + email);
    console.log("password: " + password);
    
    //Form Validation
    req.checkBody('firstName', 'First name is required').notEmpty();
    req.checkBody('lastName', 'Last name is required').notEmpty();
    req.checkBody('email', 'Email address is required').notEmpty();
    req.checkBody('email', 'Email address is not valid').isEmail();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(password);
    
    //Check for errors
    var errors = req.validationErrors();
    console.log("Errors: " + errors);
    if(errors){
        //res.render('signup', {
        //    hasErrors: true,
        //    errors: errors,
        //    firstName: firstName,
        //    lastName: lastName,
        //    email: email,
        //    password: password
        //});
        var errorMessage = {
            hasErrors: true,
            errors: errors,
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password
        };
        res.json(400, errorMessage);
    } else {
        var newUser = new User({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password
        });
        
        User.createUser(newUser, function(err, user){
            if(err) throw err;
            console.log(user);
        });
        
        req.flash('success', 'You have successfully signed up');
        //res.location('/users/');
        //res.redirect('/users/');
        res.json(200, "success");
    }
    
});

passport.serializeUser(function(user, done) {
    //console.log('users: deserializeUser ' + user);
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    //console.log('users: deserializeUser ' + id);
    User.getUserById(id, function(err, user) {
        //console.log('users: deserializeUser ' + user);
        done(err, user);
    });
});

module.exports = router;
