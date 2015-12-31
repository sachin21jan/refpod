module.exports = function(router){
    router.get('/', function(req, res, next){
        res.render('userhome', {title:'Refpod - a new way of employee referral'});
    });
    
    router.get('/signin', function(req, res, next){
        res.render('login', {title:'Refpod - a new way of employee referral'});
    });
	
    
	router.get('/companyjobs', function(req, res, next){
        res.render('companyjobs');
    });
	
	router.get('/friendsjobs', function(req, res, next){
        res.render('friendsjobs');
    });
    
    router.get('/profile', function(req, res, next){
        res.render('profile');
    });
}