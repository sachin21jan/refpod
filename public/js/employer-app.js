var employerApp = angular.module('employerApp', ['ui.bootstrap','ngTagsInput', 'ngRoute']);

employerApp.config(function($routeProvider){
    $routeProvider.when('/', {
        templateUrl: '../partials/employer-signin.html',
        controller: 'employerSignInController'
        })
        .when('/signup', {
            templateUrl: '../partials/employer-signup.html',
            controller: 'employerSignUpController'
        })
        .when('/home', {
        templateUrl: '../partials/employer-home.html',
        controller: 'employerHomeController'
        })
        .when('/postjob', {
            templateUrl: '../partials/employer-postjob.html',
            controller: 'postJobController'
        })
});

employerApp.controller('employerSignInController', ['$scope', '$http', '$window', '$location', '$sce', function($scope, $http, $window, $location, $sce){
    $scope.employerSignIn = function() {
        $scope.errors = {};
        var userData = {
            email: $scope.email,
            password: $scope.password
        };
        $http.post('/employers/signin', JSON.stringify(userData))
            .success(function (data, status, headers, config) {
                console.log("Success - Data returning from server " + data + ", status: " + status);
                $location.path('home');
            })
            .error(function (data, status, headers, config) {
                $scope.errors.hasErrors = data.hasErrors;
                $scope.errors.message = $sce.trustAsHtml(data.message);
                console.log("Failure - Data returning from server " + data.hasErrors + "," + data.message);
                console.log("Failure - $scope.errors.message " + $scope.errors.message);
                $scope.password = "";
            });
    }
}]);

employerApp.controller('employerSignUpController', ['$scope', '$http', '$window', '$sce', function($scope, $http, $window, $sce){
    $scope.employerSignUp = function() {
        $scope.errors = {};
        var userData = {
            firstName: $scope.firstName,
            lastName: $scope.lastName,
            email: $scope.email,
            password: $scope.password,
            password2: $scope.password2
        };
        $http.post('/employers/signup', JSON.stringify(userData))
            .success(function (data, status, headers, config) {
                console.log("Success - Data returning from server " + data + ", status: " + status);
                //$window.location.href = '/employers';
                $location.path('home');
            })
            .error(function (data, status, headers, config) {
                console.log("Failure - Data returning from server " + data.hasErrors + "," + data.errors);
                $scope.errors = data.errors;
                for(var i in data.errors) {
                    var error = data.errors[i];
                    if (error) {
                        console.log(error.msg);
                    }
                }
                console.log("Failure - $scope.errors " + $scope.errors);
            });
    }
}]);

employerApp.controller('employerHomeController', ['$scope', '$http', function($scope, $http){
    $scope.jobPosts = '';
    $http.get('/employers/getJobs')
        .success(function (result){
            $scope.jobPosts = result;
        })
        .error(function(data, status){
            console.log(data);
        });
}]);

employerApp.controller('postJobController', ['$scope', '$http','$filter', '$window','$log', function($scope, $http, $filter, $window, log){
    $scope.selected = undefined;
    $scope.experience = "Mid-Senior Level";
    $scope.salaryFrequency = "per year";
    $scope.states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Dakota', 'North Carolina', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];
    $scope.jobTitles = ['Account Executive','Account Manager','Accounting Manager','Accounting Clerk','Accounting Assitant','Accounting Intern','Accounting Specialist','Application Developer','Application Support Analyst','Applications Engineer','Associate Developer','Associate Java Engineer','Business Adminstrator','Business Account Executive','Business Analyst','Business Analyst Consultant','Business Analyst Intern','Business Analyst Internship','Business Analyst/Project Manager','Business Manager','Business Development Manager','Business Owner','Business Office Manager','Chief Accounting Officer','Chief Administrative Officer','Chief Analytics Officer','Chief Architect','Chief Business','Development Officer','Chief Compliance Officer','Chief Engineering Officer','Chief Executive Officer','Chief Financial Officer','Chief Human resources Officer','Chief Information Officer','Chief Networking Officer','Chief Operating Officer','Chief Quality Officer','Chief Research Officer','Chief Risk Officer','Chief Scientist','Chief Software Architect','Chief Technology Officer','Computer and Information Systems Manager','Computer Systems Manager','Content Editor','Content Developer','Content Manager','Content Specialist','Content Strategist','Content Writer','Customer Support Administrator','Customer Support Advocate','Customer Support Specialist','Data Center Support Specialist','Data Quality Manager','Database Administrator','Desktop Support Manager','Desktop Support Specialist','Developer','Director of Cloud Production Services','Director, Demand Generation','Director, Strategic Partnerships','Director of Technology','Digital Marketing Manager','Front End Developer','Healthcare Administrator', 'Healthcare Analyst','Healthcare Account Manager','Healthcare Account Executive','Healthcare Billing Specialist','Healthcare Consultant','Healthcare Intern','Healthcare Manager','Healthcare Professional','Healthcare Recruiter','Help Desk Specialist','Help Desk Technician','Human Resources','Human Resources Administrator','Human Resources Administrative Assistant','Human Resources Admin','Human Resources Administration','Human Resources Associate','Human Resources Analyst','Human Resources Assistant Manager','Human Resources Assistant Intern','Human Resources Assistant/Receptionist','Human Resources Assistant/Recruiter','Human Resources Assistant/Receptionist','Human Resources and Payroll Manager','Human Resources and Safety Manager','Human Resources and Office Manager','Human Resources and Operations Manager','Human Resources Assistant','Human Resources Manager','Human Resources Generalist','Human Resources Generalist/Recruiter','Human Resources Generalist/Manager','Human Resources Generalist Intern','Information Technology Coordinator','Information Technology Director','Information Technology Manager','Implementation Developer','Implementation Engineer','IT Consultant','IT Consultant/Project Manager','IT Consultant/Contractor','IT Contractor','IT Coordinator','IT Engineer','IT Manager','IT Support Manager','IT Support Specialist','IT Systems Administrator',,'IT Technician','IT Technician Intern','IT Tech Support','IT Technical Support Specialist','Java Application Developer','Java Architect','Java Consultant','Java Developer','Java Engineer','Java Engineer(Sustaining)','Java/J2EE Consultant','Java/J2EE Developer','Java Programmer','Java UI Engineer','Java Web Developer','Junior Engineer','Junior Software Engineer','Lead Cloud Virtualization Engineer','Manager','Management Information Systems Director','Marketing Technologist','.NET Application Developer','.NET Architect','.NET Consultant','.NET Developer','.NET Programmer','.NET Web Developer','Network Architect','Network Engineer','Network Systems Administrator','Principal Java Engineer','Product Manager','Professional Sales Representative','Professional Services Consultant','Professional Services Coorindator','Professional Services Developer','Professional Services Engineer','Professional Services Manager','Professional Services Representative','Programmer','Programmer Analyst','Project Director','Recruiter','Recruiter Assistant','Recruiter Coordinator','Recruiter (Contract)','Recruiter (Contractor)','Security Specialist','Senior Application Developer','Senior Application Support Analyst','Senior Applications Engineer','Senior Developer','Senior Business Adminstrator','Senior Business Account Executive','Senior Business Analyst','Senior Business Analyst Consultant','Senior Business Analyst Intern','Senior Business Analyst Internship','Senior Business Analyst/Project Manager','Senior Business Manager','Senior Business Development Manager','Senior Business Office Manager','Senior Computer and Information Engineer','Senior Computer and Information Systems Manager','Senior Computer Systems Manager','Senior Customer Support Administrator','Senior Customer Support Specialist','Senior Data Center Support Specialist','Senior Data Quality Manager','Senior Database Administrator','Senior Desktop Support Manager','Senior Desktop Support Specialist','Senior Developer','Senior Director of Technology','Senior Digital Marketing Manager','Senior Front End Developer','Senior Help Desk Specialist','Senior Help Desk Technician','Senior Information Technology Coordinator','Senior Information Technology Director','Senior Information Technology Manager','Senior IT Support Manager','Senior IT Support Specialist','Senior IT Systems Administrator','Senior Java Application Developer','Senior Java Architect','Senior Java Consultant','Senior Java Developer','Senior Java/J2EE Consultant','Senior Java/J2EE Developer','Senior Java programmer','Senior Java Web Developer','Senior Software Engineer','Senior Software Quality Assurance Engineer','Senior Management Information Systems Director','Senior MARKETING TECHNOLOGIST','Senior .NET Application Developer','Senior .NET Architect','Senior .NET Consultant','Senior .NET Developer','Senior .NET Programmer','Senior .NET Web Developer','Senior Network Architect','Senior Network Engineer','Senior Network Systems Administrator','Senior Programmer','Senior Programmer Analyst','Senior Security Specialist','Senior Applications Engineer','Senior Database Administrator','Senior Network Architect','Senior Network Engineer','Senior Network System Administrator','Senior Programmer','Senior Programmer Analyst','Senior Security Specialist','Senior Support Specialist','Senior System Administrator','Senior System Analyst','Senior System Architect','Senior System Designer','Senior Systems Analyst','Senior Systems Software Engineer','Senior Web Administrator','Senior Web Developer','SEO Consultant','Social Media Coorindator','Social Media Intern','Social Media Manager','Social Media Marketing Intern','Social Media Marketing Internship','Software Architect','Software Engineer','Software Developer','Software Quality Assurance Analyst','Software Quality Assurance Engineer','Support Specialist','Systems Administrator','Systems Analyst','System Architect','Systems Designer','Systems Software Engineer','Technical Consultant','Technical Delivery Manager','Technical Designer','Technical Developer','Technical Director','Technical Lead','Technical Leader','Technical Lead/Architect','Technical Lead/Developer','Technical Leader Consultant','Technical Java Lead','Technical .Net Lead','Technical Operations Officer','Technical Recruiter','Technical Representative','Technical Recruiter (Contract)','Technical Recruiter/Account Manager','Technical Recruiter/Account Manager','Technical Support','Technical Support Engineer','Technical Support Specialist','Technical Specialist','Telecommunications Specialist','Trainee','Trainee Engineer','Vice President','Vice President, Customer Success','Vice President Product Marketing','Web Administrator','Web Analytics Developer','Web Developer','Web Tester','Webmaster'];
    //$scope.loadSkillSets = ['Agile Methodologies','Core Java','Java Enterprise Edition','JUnit','Hibernate','Servlets','Spring','Spring AMQP','Spring Android','Spring Batch','Spring Blazeds','Spring Data','Spring Hateos','Spring Integration','Spring Loaded','Spring LDAP','Spring Mobile','Spring MVC','Spring Rest Shell','Spring ROO','Spring Scala','Spring Security','Spring Shell','Spring Session','Spring Social','Spring WebFlow','Spring WebServices','Tomcat','Web Services'];
    var skillSets = ['Agile Methodologies','Core Java','Java Enterprise Edition','JUnit','Hibernate','Servlets','Spring','Spring AMQP','Spring Android','Spring Batch','Spring Blazeds','Spring Data','Spring Hateos','Spring Integration','Spring Loaded','Spring LDAP','Spring Mobile','Spring MVC','Spring Rest Shell','Spring ROO','Spring Scala','Spring Security','Spring Shell','Spring Session','Spring Social','Spring WebFlow','Spring WebServices','Tomcat','Web Services'];
    $scope.loadSkillSets = function(query){
        var result = [];
        for(var skillSet in skillSets){
            var contains = skillSets[skillSet].toLowerCase().indexOf(query.toLowerCase());
            if(contains != -1){
                result.push(skillSets[skillSet]);
            }
        }
        console.log("Selected: " + JSON.stringify($scope.skillSets));
        return result;
    };
    $scope.postJob = function() {
        var jobTitle = $scope.jobTitle;
        var jobDescription = $scope.jobDescription;
        var jobLocation = $scope.jobLocation;
        var experience = $scope.experience;
        var salary = $scope.salary;
        var salaryFrequency = $scope.salaryFrequency;
        var skillSets = $scope.skillSets;
        log.log("jobTitle: " + jobTitle);
        log.log("jobDescription: " + jobDescription);
        log.log("jobLocation: " + jobLocation);
        log.log("experience: " + experience);
        log.log("salary: " + salary);
        log.log("salaryFrequency: " + salaryFrequency);
        log.log("skillSets: " + skillSets);
        var postObject = {
            jobTitle: jobTitle,
            jobDescription: jobDescription,
            jobLocation: jobLocation,
            experience: experience,
            salary: salary,
            salaryFrequency: salaryFrequency,
            skillSets: skillSets
        };
        $http.post('/employers/postjob', postObject)
            .success(function (data, status, headers, config) {
                //log.log("data: " + data + ", status: " + status + ", headers: " + headers + ", config: " + config);
                //$location.path = '/employers';
                $window.location.href = '/employers';
                //$window.location.href;
                // this callback will be called asynchronously
                // when the response is available
            })
            .error(function (data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
    }
}]);
