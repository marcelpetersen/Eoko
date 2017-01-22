angular.module('app.controllers', [])
  
.controller('profileCtrl', ['$scope', '$stateParams', 'UserInfo', 'OtherInfo', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, UserInfo, OtherInfo) {

var data;
if ($stateParams.avatarClicked) {
    console.log("other");
    data = OtherInfo.getOtherInfo();
}
else
{
    console.log("user");
    data = UserInfo.getUserInfo();
}

//var myself = UserInfo.getUserInfo();
console.log(data);

}])
   
.controller('eventsCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])
   
.controller('connectCtrl', ['$scope', '$state', '$stateParams', 'UserInfo', 'OtherInfo', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $state, $stateParams, UserInfo, OtherInfo) {

usr = UserInfo.getUserInfo();
var ref = firebase.database().ref("Buildings").child(usr.buildcode + "/Users");
$scope.userList = [];
ref.orderByKey().once("value").then(function(snapshot) {
    
    var val = snapshot.val();
    $scope.userList= Object.keys(val).map(function (key) { return val[key]; });

$scope.$apply();
});


$scope.openProfile = function(clicked)
{
    OtherInfo.setOtherInfo(clicked);
    $state.go('tabsController.profile', {
                'avatarClicked': 'true'
            });
};


}])
   
.controller('buildingEventsCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {
    
}])
   
.controller('infoCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])
      
.controller('homeCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])
   
.controller('signupCtrl', ['$scope', '$stateParams', '$firebaseArray', '$state', 'UserInfo', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, $firebaseArray, $state, UserInfo) {
    
    $scope.user = {lastname: "", firstname: "", email: "", password: "", birthday: "",buildcode: "", avatar:"https://firebasestorage.googleapis.com/v0/b/mycommunity-a33e4.appspot.com/o/default-avatar.png?alt=media&token=39dc28f9-e9c1-404e-98f1-8266dda61bb2"};



function createUser(){
    firebase.auth().createUserWithEmailAndPassword($scope.user.email, $scope.user.password)
           .then
        (function(success)
        {
            var usr = firebase.auth().currentUser;
            var month = $scope.user.birthday.getUTCMonth() + 1; //months from 1-12
            var day = $scope.user.birthday.getUTCDate();
            var year = $scope.user.birthday.getUTCFullYear();
            var newdate = month + "/" + day + "/" + year;
            var name = $scope.user.firstname + " " + $scope.user.lastname;
            console.log(newdate);
            usr.updateProfile( {displayName: $scope.user.buildcode}).then(function(suc)
            {
                
           
            
            var ref = firebase.database().ref("Buildings").child($scope.user.buildcode + "/Users");
            
            var userInfo = {
                    name: name,
                    email: usr.email,
                    birthday: newdate,
                    points: 0,
                    eventCount: 0,
                    surveyCount: 0,
                    major: "",
                    avatar: $scope.user.avatar,
                    buildcode: $scope.user.buildcode
                };
                ref.child(usr.uid).set(userInfo);
                
                UserInfo.setUserInfo(userInfo);
            
                console.log("User Logged in!");
                 $state.go('tabsController.connect');
                        
        },
        function(error)
        {
             console.log(error);
        });
    });
        
}


$scope.signupUser = function()  //goes here first
{

    var ref = firebase.database().ref();
    var verified = false;
    ref.orderByKey().once("value").then(function(snapshot) {
        var result = Object.keys(snapshot.child('Buildings').val());
        for(var i = 0; i < result.length; i++)
        {
            if(result[i] == $scope.user.buildcode)
            {
                verified = true;
            }
        }
        if(verified === false)
        {
            console.log("NO BUILDING LOCATED");
        }
        else
        {
            createUser();  //verified, create user
        }
    });
};



}])
   
.controller('loginCtrl', ['$scope', '$stateParams', '$state', 'UserInfo', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, $state, UserInfo) {
 
 
 
 $scope.user = {email: "", password: ""};
 
 
 $scope.loginUser = function () {
     

firebase.auth().signInWithEmailAndPassword($scope.user.email, $scope.user.password).then
        (function(resolve)
        {
            console.log("logged in!");
            var usr = firebase.auth().currentUser;
            var ref = firebase.database().ref("Buildings").child(usr.displayName + "/Users");
            
            ref.child(usr.uid).once("value").then(function(snapshot)
            {
                console.log(snapshot.val());
                UserInfo.setUserInfo(snapshot.val());
                 $state.go('tabsController.connect');
            });
            
            
        },
        function(error)
        {
            console.log(error);
        });
 };

}])
 