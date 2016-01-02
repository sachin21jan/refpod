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
        .when('/logout', {
            templateUrl: 'partials/signin.html',
            controller: 'logoutController'
        })
});

refpodApp.controller('applicationController', ['$scope', '$http', '$location', function($scope, $http, $location){
    $scope.isAuthenticated = '';
    $http.get('/users/isLoggedIn')
        .success(function (result){
            console.log("Success result returned from /users/isLoggedIn: " + result.message);
            if(result.message === "User authenticated"){
                $scope.isAuthenticated = true;
                $location.path('/users');
            } else {
                $scope.isAuthenticated = false;
            }
        })
        .error(function(data, status){
            console.log("Failure result returned from /users/isLoggedIn: " + data.message);
            $scope.isAuthenticated = false;
        });
}]);

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

refpodApp.controller('userSignUpController', ['$scope', '$http', '$window', '$location', '$sce', function($scope, $http, $window, $location, $sce){
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
                //$window.location.href = '/users';
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
            console.log("Result returned from /users/getCompanyJobs: " + result);
            console.log("typeof result: " + typeof result);
            if(typeof result === "string"){
                $scope.hasMessage = true;
                $scope.message = result;
            } else {
                $scope.companyJobs = result;
                for (var i = 0; i < result.length; i++) {
                    var jobPost = result[i];
                    console.log(jobPost);
                }
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

refpodApp.controller('logoutController', ['$scope', '$http', function($scope, $http){
    $scope.isAuthenticated = '';
    $http.get('/users/logout')
        .success(function (result){
            console.log("Success result returned from /users/logout: " + result);
        })
        .error(function(data, status){
            console.log("Failure result returned from /users/isLoggedIn: " + data);
        });
}]);