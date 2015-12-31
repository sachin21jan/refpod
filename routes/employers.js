





var express = require('express');
var router = express.Router();
var User = require('../models/user');
var JobPost = require('../models/employer');
var Company = require('../models/company');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

router.get('/', function(req, res, next) {
    console.log('employers: /');
    res.render('employer-shell', {title:'Refpod - a new way of employee referral', message: req.flash('error')});
});

function ensureEmployerAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        console.log('Employer is authenticated for ' + req.user.email);
        return next();
    }
    return res.json(401, {message: "User not authenticated"});
}

router.get('/signin', function(req, res, next) {
    console.log('employers: /signin get');
    res.render('employer-signin', {title:'Refpod - a new way of employee referral', message: req.flash('error')});
});

router.post('/signin', function(req, res, next) {
    passport.authenticate('local-employer', function(err, user, info) {
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


passport.use('local-employer', new LocalStrategy({
        usernameField: 'email',
    },
    function(username, password, done) {
        console.log("username: " + username);
        User.getUserByUsername(username, function(err, user){
            if(err) throw err;
            if(!user){
                console.log('Employer not found : ' + username);
                return done(null, false, {hasErrors: true, message: 'You are not registered with us. Please <a href=\"#signup\">sign up</a>'});
            }
            if(!user.isEmployer) {
                console.log('Registered as an employee : ' + username);
                return done(null, false, {hasErrors: true, message: 'You are registered as an employee. Please use <a href=\"/#/\">user</a> page to sign in'});
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

router.get('/logout', function(req, res){
    req.logout();
    req.flash('success', 'You have logged out');
    res.redirect('/employers/login');
}); 

router.get('/signup', function(req, res, next) {
    console.log('employers: /signup get');
    res.render('employersignup', {title: 'Employer Sign Up | Refpod'});
});

/* Register new user */
router.post('/signup', function(req, res, next) {
    console.log('employers: /signup post');
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
    console.log(errors);
    if(errors){
        //res.render('employersignup', {
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
        var newEmployer = new User({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password,
            isEmployer: true
        });
        
        User.createUser(newEmployer, function(err, employer){
            if(err) throw err;
            console.log(employer);
        });
        
        req.flash('success', 'You have successfully signed up');
        res.location('/employers');
        res.redirect('/employers');
    }
    
});

router.get('/postjob', function(req, res, next) {
    console.log('employers: /postjob get');
    res.render('postjob', {title: 'Post Job | Refpod'});
});

router.post('/postjob', function(req, res, next) {
    console.log('employers: /postjob post');
    var jobTitle = req.body.jobTitle;
    var jobDescription = req.body.jobDescription;
    var jobLocation = req.body.jobLocation;
    var salary = req.body.salary;
    var salaryFrequency = req.body.salaryFrequency;
    var experience = req.body.experience;
    var skillSets = req.body.skillSets;

    console.log("jobTitle: " + jobTitle);
    console.log("jobDescription: " + jobDescription);
    console.log("jobLocation: " + jobLocation);
    console.log("salary: " + salary);
    console.log("salaryFrequency: " + salaryFrequency);
    console.log("experience: " + experience);
    console.log("skillSets: " + skillSets);

    //Form Validation
    req.checkBody('jobTitle', 'Job Title is required').notEmpty();
    req.checkBody('jobDescription', 'Job description is required').notEmpty();
    req.checkBody('jobLocation', 'Job location is required').notEmpty();
    req.checkBody('salary', 'Salary is required').notEmpty();
    req.checkBody('experience', 'Experience is required').notEmpty();

    //printObject(req.session);
    var hrId = req.session.passport.user;
    console.log("req.user.email: " + req.user.email);
    console.log("hrId="+hrId);
    var userEmail = req.user.email;
    var atIndex = userEmail.indexOf("@");
    var dotIndex = userEmail.indexOf(".");
    var domain = userEmail.substring(atIndex + 1, dotIndex);
    Company.findCompanyByDomain(domain, function(err, company){
        console.log("company: " + company);
        //Check for errors
        var errors = req.validationErrors();
        console.log(errors);
        if(errors){
            res.render('postjob', {
                hasErrors: true,
                errors: errors,
                jobTitle: jobTitle,
                jobDescription: jobDescription,
                jobLocation: jobLocation,
                salary: salary,
                experience: experience,
                skillSets: skillSets
            });
        } else {
            var newJob = new JobPost({
                jobTitle: jobTitle,
                jobDescription: jobDescription,
                jobLocation: jobLocation,
                salary: salary,
                experience: experience,
                skillSets: skillSets,
                hrId: hrId,
                companyId: company._id
            });

            JobPost.postJob(newJob, function(err, savedJob){
                if(err) throw err;
                console.log(savedJob);
            });

            req.flash('success', 'You have successfully posted the job');
            res.send(200);
            //res.location('/employers');
            //res.redirect('/employers');
        }
    });
});

router.get('/getJobs', function(req, res, next) {
    var hrId = req.session.passport.user;
    console.log('/getJobs - hrId = ' + hrId);
    JobPost.getJobs(hrId, function(err, jobPosts){
        if(err) throw err;
        //console.log("returning: " + jobPosts);
        var result = [];
        for(var i = 0; i < jobPosts.length; i++){
            var jobPost = jobPosts[i];
            var d = jobPost._id.getTimestamp();
            var resultJobPost = new Object();
            resultJobPost.jobTitle = jobPost.jobTitle;
            resultJobPost.jobLocation = jobPost.jobLocation;
            resultJobPost.salary = jobPost.salary;
            resultJobPost.experience = jobPost.experience;
            resultJobPost.skillSets = jobPost.skillSets;
            resultJobPost.timestamp = d;
            result.push(resultJobPost);
        }
        //var cisco = new Company ({name: 'Cisco Systems', url: 'www.cisco.com', domainName: 'cisco'});
        //var gap = new Company ({name: 'Gap Inc', url: 'www.gap.com', domainName: 'gap'});
        //var healthedge = new Company ({name: 'Healthedge Software', url: 'www.healthedge.com', domainName: 'healthedge'});
        //var microsoft = new Company ({name: 'Microsoft', url: 'www.microsoft.com', domainName: 'microsoft'});
        //var cognizant = new Company ({name: 'Cognizant', url: 'www.cognizant.com', domainName: 'cognizant'});
        //var capgemini = new Company ({name: 'Capgemini', url: 'www.capgemini.com', domainName: 'capgemini'});
        //var ibm = new Company ({name: 'IBM', url: 'www.ibm.com', domainName: 'ibm'});
        //var hp = new Company ({name: 'Hewlett Packard', url: 'www.hp.com', domainName: 'hp'});
        //var dell = new Company ({name: 'Dell', url: 'www.dell.com', domainName: 'dell'});
        //var walmart = new Company ({name: 'Walmart', url: 'www.walmart.com', domainName: 'walmart'});
        //Company.saveCompany(cisco);
        //Company.saveCompany(gap);
        //Company.saveCompany(healthedge);
        //Company.saveCompany(microsoft);
        //Company.saveCompany(cognizant);
        //Company.saveCompany(capgemini);
        //Company.saveCompany(capgemini);
        //Company.saveCompany(ibm);
        //Company.saveCompany(hp);
        //Company.saveCompany(dell);
        //Company.saveCompany(walmart);

        res.json(result);
    });
});

function printObject(object) {
    if(object){
        for(var key in object){
            if(typeof object[key] == "object"){
                printObject(object[key]);
            } else if(typeof object[key] != "function"){
                console.log(key + "=" + object[key]);
            }
        }
    }
}

module.exports = router;