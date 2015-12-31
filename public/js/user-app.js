var refpodApp = angular.module('refpodApp', ['ngRoute', 'ui.grid']);

refpodApp.config(function($routeProvider){
    $routeProvider.when('/', {
        templateUrl: 'partials/signin.html',
        controller: 'userSignInController'
        })
        .when('/signup', {
            templateUrl: 'partials/signup.html',
            controller: 'userSignUpController'
        })
        .when('/users', {
            templateUrl: 'partials/userhome.html',
            controller: 'userHomeController'
        })
        .when('/forgot_password', {
            templateUrl: 'partials/forgot_password.html',
            controller: 'forgotPasswordController'
        })
        .when('/friends', {
            templateUrl: 'partials/friends.html',
            controller: 'friendsController'
        })
});

refpodApp.controller('userSignInController', ['$scope', '$http', '$window', '$location', '$sce', function($scope, $http, $window, $location, $sce){
    $scope.userSignIn = function() {
        $scope.errors = {};
        var userData = {
            email: $scope.email,
            password: $scope.password
        };
        $http.post('/users/signin', JSON.stringify(userData))
            .success(function (data, status, headers, config) {
                console.log("Success - Data returning from server " + data + ", status: " + status);
                //$window.location.href = '/users';
                $location.path('/users');
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

refpodApp.controller('userSignUpController', ['$scope', '$http', '$window', '$sce', function($scope, $http, $window, $sce){
    $scope.userSignUp = function() {
        $scope.errors = {};
        var userData = {
            firstName: $scope.firstName,
            lastName: $scope.lastName,
            email: $scope.email,
            password: $scope.password,
            password2: $scope.password2
        };
        $http.post('/users/signup', JSON.stringify(userData))
            .success(function (data, status, headers, config) {
                console.log("Success - Data returning from server " + data + ", status: " + status);
                $window.location.href = '/users';
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

refpodApp.controller('userHomeController', ['$scope', '$http', '$location', function($scope, $http, $location){
    $scope.companyJobs = '';
    $http.get('/users/getCompanyJobs')
        .success(function (result){
            $scope.companyJobs = result;
            for(var i = 0 ; i < result.length; i++){
                var jobPost = result[i];
                console.log(jobPost);
            }
        })
        .error(function(data, status){
            console.log(data);
            $location.path('/');
        });
}]);

refpodApp.controller('friendsController', ['$scope', '$http', '$location', function($scope, $http, $location){
    $scope.friends = '';
    $http.get('/users/getFriends')
        .success(function (result){
            $scope.friends = result;
            for(var i = 0 ; i < result.length; i++){
                var friend = result[i];
                console.log(friend.email);
            }
        })
        .error(function(data, status){
            console.log(data);
            $location.path('/');
        });
}]);