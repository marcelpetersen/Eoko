angular.module('app.controllers', [])

  .controller('profileCtrl', ['$scope', '$stateParams', 'UserInfo', 'OtherInfo', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope, $stateParams, UserInfo, OtherInfo) {

      $scope.user = "";
      $scope.$on('$ionicView.beforeEnter', function () //before anything runs
      {
        console.log($stateParams.avatarClicked);
        if ($stateParams.avatarClicked == 'true') {
          $scope.user = OtherInfo.getOtherInfo();
          console.log("profileCtrl: other");
          console.log($scope.user);
        }
        else {
          $scope.user = UserInfo.getUserInfo();
          console.log("profileCtrl: User: ")
          console.log($scope.user);

          if ($scope.user.email == "") {
            console.log("profileCtrl: empty, pulling from database")

            var usr = firebase.auth().currentUser;
            var ref = firebase.database().ref("Buildings").child(usr.displayName + "/Users");

            ref.child(usr.uid).once("value").then(function (snapshot) {
              console.log(snapshot.val());
              UserInfo.setUserInfo(snapshot.val());
              $scope.user = UserInfo.getUserInfo();
            });
          }
        }
      });
    }])

  .controller('eventsCtrl', ['$scope', '$stateParams', 'UserInfo',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope, $stateParams, UserInfo) {

      $scope.selection = {tab: "event", porb: "public"};
      $scope.event = {title: "", location: "", date: "", time: "", description: ""};

      var weekday = new Array();
      weekday[0] = "Sunday";
      weekday[1] = "Monday";
      weekday[2] = "Tuesday";
      weekday[3] = "Wednesday";
      weekday[4] = "Thursday";
      weekday[5] = "Friday";
      weekday[6] = "Saturday";

      var month = new Array();
      month[0] = "January";
      month[1] = "February";
      month[2] = "March";
      month[3] = "April";
      month[4] = "May";
      month[5] = "June";
      month[6] = "July";
      month[7] = "August";
      month[8] = "September";
      month[9] = "October";
      month[10] = "November";
      month[11] = "December";

      $scope.selectEventTab = function () {
        $scope.selection.tab = "event";
      };

      $scope.selectCreateTab = function () {
        $scope.selection.tab = "create";
      };

      $scope.selectedPublic = function () {
        $scope.selection.porb = "public";
      };

      $scope.selectedPrivate = function () {
        $scope.selection.porb = "private";
      };


      $scope.createEvent = function (makeEventForm) {
        if (makeEventForm.$valid) {
          var postedEvent = {
            title: $scope.event.title,
            location: $scope.event.location,
            date: "",
            time: "",
            description: $scope.event.description
          };

          var d = $scope.event.date;
          postedEvent.date = weekday[d.getDay()] + ", " + month[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
          postedEvent.time = $scope.event.time.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
          console.log(postedEvent);

          var usr = UserInfo.getUserInfo();
          var ref = firebase.database().ref("Buildings").child(usr.buildcode + "/Users");

          if ($scope.selection.porb == "public") {
            ref.orderByKey().once("value").then(function (snapshot) {
              var val = snapshot.val();
              console.log(val);
              console.log(snapshot.key);
            });
          }

        }

      };


    }])

  .controller('connectCtrl', ['$scope', '$state', '$stateParams', 'UserInfo', 'OtherInfo', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope, $state, $stateParams, UserInfo, OtherInfo) {

      var usr = UserInfo.getUserInfo();
      var ref;

      $scope.$on('$ionicView.beforeEnter', function (){

        if (usr.email == "") {

          console.log("connectCtrl: empty, pulling from database")

          var usor = firebase.auth().currentUser;

          console.log("Current User: ");
          console.log(usor);

          ref = firebase.database().ref("Buildings").child(usor.displayName + "/Users");

          ref.child(usor.uid).once("value").then(function (snapshot) {
            console.log(snapshot.val());
            UserInfo.setUserInfo(snapshot.val());
            $scope.user = UserInfo.getUserInfo();
          });

        }

        $scope.userList = [];

        ref.orderByKey().once("value").then(function (snapshot) {
          var val = snapshot.val();
          console.log("connectCtrl: Val:");
          console.log(snapshot.val());
          $scope.userList = Object.keys(val).map(function (key) {
            if (val[key].email != usr.email) {
              return val[key];
            }
          });
          $scope.$apply();
        });
      });


      $scope.openProfile = function (clicked) {
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


    }])

  .controller('loginCtrl', ['$scope', '$stateParams', '$state', 'UserInfo', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope, $stateParams, $state, UserInfo) {


      $scope.user = {email: "", password: ""};

      $scope.loginUser = function () {
        firebase.auth().signInWithEmailAndPassword($scope.user.email, $scope.user.password).then
        (function (resolve) {
            console.log("logged in!");
            var usr = firebase.auth().currentUser;
            var ref = firebase.database().ref("Buildings").child(usr.displayName + "/Users");

            ref.child(usr.uid).once("value").then(function (snapshot) {
              console.log(snapshot.val());
              UserInfo.setUserInfo(snapshot.val());
              $state.go('tabsController.profile');
            });

          },
          function (error) {
            console.log(error);
          });

        // listen setting observer
        firebase.auth().onAuthStateChanged(function(user) {
          if (user) {
            $scope.user = user;
            console.log("loginCtrl: User (onAuthStateChanged):");
            console.log(user);
          } else {
            console.log("loginCtrl: User is empty");
          }
        });
      }
    }])


  .controller('getNamePageCtrl', ['$scope', '$stateParams', '$state', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope, $stateParams, $state) {

      $scope.user = {lastname: "", firstname: "", email: "", password: "", buildcode: ""};

      $scope.passInfo = function () {
        $state.go('getCodePage', {
          'userinfo': $scope.user
        });

      };

    }])

  .controller('getCodePageCtrl', ['$scope', '$stateParams', '$state', 'UserInfo',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope, $stateParams, $state, UserInfo) {

      $scope.user = $stateParams.userinfo
      console.log($scope.user)

      /*function createUser(){
       $state.go('getPicturePage');
       }*/


      function createUser() {
        firebase.auth().createUserWithEmailAndPassword($scope.user.email, $scope.user.password)
          .then
          (function (success) {
            var usr = firebase.auth().currentUser;
            //var month = $scope.user.birthday.getUTCMonth() + 1; //months from 1-12
            //var day = $scope.user.birthday.getUTCDate();
            //var year = $scope.user.birthday.getUTCFullYear();
            //var newdate = month + "/" + day + "/" + year;
            var name = $scope.user.firstname + " " + $scope.user.lastname;
            //console.log(newdate);
            usr.updateProfile({displayName: $scope.user.buildcode}).then(function (suc) {


                var ref = firebase.database().ref("Buildings").child($scope.user.buildcode + "/Users");

                var userInfo = {
                  name: name,
                  email: usr.email,
                  birthday: "",
                  points: 0,
                  eventCount: 0,
                  surveyCount: 0,
                  major: "",
                  avatar: "",
                  buildcode: $scope.user.buildcode,
                  description: ""
                };
                ref.child(usr.uid).set(userInfo);

                UserInfo.setUserInfo(userInfo);

                console.log("User Logged in!");
                $state.go('getPicturePage');

              },
              function (error) {
                console.log(error);
              });
          });

      }


      $scope.signupUser = function ()  //goes here first
      {

        var ref = firebase.database().ref();
        var verified = false;
        ref.orderByKey().once("value").then(function (snapshot) {
          var result = Object.keys(snapshot.child('Buildings').val());
          for (var i = 0; i < result.length; i++) {
            if (result[i] == $scope.user.buildcode) {
              verified = true;
            }
          }
          if (verified === false) {
            console.log("NO BUILDING LOCATED");
          }
          else {
            createUser();  //verified, create user
          }
        });
      };


    }])

  .controller('getDescriptionPageCtrl', ['$scope', '$stateParams', '$state', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope, $stateParams, $state) {


      $scope.user = {description: ""};
      $scope.submitDescription = function () {
        var usr = firebase.auth().currentUser;
        var ref = firebase.database().ref("Buildings").child(usr.displayName + "/Users");
        ref.child(usr.uid + "/description").set($scope.user.description, function (success) {
          $state.go('getSocialPage');
        });
      }

    }])

  .controller('getSocialPageCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope, $stateParams) {


    }])

  .controller('getPicturePageCtrl', ['$scope', '$stateParams', '$state', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope, $stateParams, $state) {

      $scope.user = {image: "https://firebasestorage.googleapis.com/v0/b/mycommunity-a33e4.appspot.com/o/default-avatar.png?alt=media&amp;token=39dc28f9-e9c1-404e-98f1-8266dda61bb2"};

      function b64toBlob(b64Data, contentType, sliceSize) { //blobs galore
        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        var byteCharacters = atob(b64Data);
        var byteArrays = [];

        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
          var slice = byteCharacters.slice(offset, offset + sliceSize);

          var byteNumbers = new Array(slice.length);
          for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }

          var byteArray = new Uint8Array(byteNumbers);

          byteArrays.push(byteArray);
        }

        var blob = new Blob(byteArrays, {
          type: contentType
        });
        return blob;
      }


      var randID = "";

      $scope.uploadPic = function () {
        console.log("upload picture");

        var options = {
          quality: 75,
          destinationType: 0, //URL = 0, URI = 1;
          sourceType: 0,
          allowEdit: true,
          encodingType: 0,
          targetWidth: 500,
          targetHeight: 500,
          saveToPhotoAlbum: false
        };

        $cordovaCamera.getPicture(options).then(function (imageData) {
          console.log(imageData);
          var contentType = 'image/jpeg';
          var blob = b64toBlob(imageData, contentType);
          console.log("a new blob, ", blob);
          console.log("blobs URL, ", $scope.user.image);

          randID = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
          firebase.storage().ref().child('profilePics/' + randID + ".jpg").put(blob).then(function (snapshot) {
            console.log('Uploaded a blob !');
            $scope.user.image = snapshot.downloadURL;
            $scope.$apply();
          });


        });
      };


      $scope.submitAvatar = function () {
        var usr = firebase.auth().currentUser;
        var ref = firebase.database().ref("Buildings").child(usr.displayName + "/Users");
        ref.child(usr.uid + "/avatar").set($scope.user.image, function (success) {
          $state.go('getDescriptionPage');
        });

      };


    }])
