var mongoose = require('mongoose');

var CompanySchema = mongoose.Schema({
    name: {
        type: String
    },
    url: {
        type: String
    },
    domainName: {
        type: String
    },
    logo: {
        type: String
    }
});

var Company = module.exports = mongoose.model('company', CompanySchema);

module.exports.findCompanyByDomain = function(domain, callback){
    console.log("finding company with domain name: " + domain);
    Company.findOne({'domainName' : domain}, function(err, company){
       //console.log("returning following company: " + company);
        return callback(err, company);
    });
};

module.exports.saveCompany = function(company, callback){
    company.save(callback);
};