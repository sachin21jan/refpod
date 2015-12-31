var mongoose = require('mongoose');

//mongoose.connect("mongodb://refpoduser:refpod123@ds037622.mongolab.com:37622/refpod");

var JobPostSchema = mongoose.Schema({
    jobTitle: {
        type: String
    },
    jobDescription: {
        type: String
    },
    jobLocation: {
        type: String
    },
    salary: {
        type: String
    },
    salaryFrequency: {
        type: String
    },
    experience: {
        type: String
    },
    skillSets: {
        type: String
    },
    hrId: {
        type: mongoose.Schema.ObjectId
    },
    companyId: {
        type: mongoose.Schema.ObjectId
    }
});

var JobPost = module.exports = mongoose.model('JobPost', JobPostSchema);

module.exports.postJob = function(newJob, callback){
    console.log("saving job: " + newJob);
    newJob.save(callback);
    console.log("saved job: " + callback);
};

module.exports.getJobs = function(hrId, callback){
    //console.log("quering jobs for hrId: " + hrId);
    JobPost.find({'hrId' : hrId}, function(err, jobPosts){
        //console.log('returned following job posts: ' + jobPosts);
        return callback(err, jobPosts);
    });
};

module.exports.getJobsByCompany = function(companyId, callback){
    console.log('quering jobs by companyId: ' + companyId);
    JobPost.find({'companyId' : companyId}, function(err, jobPosts){
    //console.log('returned following job posts by companyId: ' + jobPosts);
        return callback(err, jobPosts);
    });
};