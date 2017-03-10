angular.module('app.controllers', [])

  .controller('profileCtrl', ['$scope', '$stateParams', 'UserInfo', 'OtherInfo', '$firebaseObject', '$ionicTabsDelegate', '$timeout', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope, $stateParams, UserInfo, OtherInfo, $firebaseObject, $ionicTabsDelegate, $timeout) {

      var usr = UserInfo.getUserInfo();
      $scope.$on('$ionicView.beforeEnter', function () //before anything runs
      {
        $scope.user = UserInfo.getUserInfo();
        if ($stateParams.avatarClicked == 'true') {
          console.log("other");
          $ionicTabsDelegate.showBar(false);
          $scope.user = OtherInfo.getOtherInfo();
          console.log($scope.user);
        }
        else {
          if (usr == undefined || usr.email == "") {
            console.log("undefined usr");
            firebase.auth().onAuthStateChanged(function (user) {
              usr = firebase.auth().currentUser;

              console.log(usr.displayName);
              var ref = firebase.database().ref("Buildings").child(usr.displayName + "/Users/" + usr.uid);
              $scope.user = $firebaseObject(ref);
              $scope.user.$loaded().then(function (x) {
                UserInfo.setUserInfo($scope.user);
                console.log($scope.user);

                if ($scope.user.notifications) {
                  $scope.friendR = Object.keys($scope.user.notifications).length;
                }
                else {
                  $scope.friendR = 0;
                }

              })
                .catch(function (error) {
                  console.log("Error:", error);
                });
            });
          }
          else {
            console.log("userinfo is:", UserInfo.getUserInfo());
            $scope.user = UserInfo.getUserInfo();
            if ($scope.user.notifications) {
              $scope.friendR = Object.keys($scope.user.notifications).length;
            }
            else {
              $scope.friendR = 0;
            }
          }
        }
        $timeout(function () {
          $scope.$apply();
        });
      });


    }])

  .controller('eventsCtrl', ['$scope', '$stateParams', 'UserInfo', 'OtherInfo', '$firebaseArray', '$firebaseObject', '$ionicPopover', '$timeout', '$state',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope, $stateParams, UserInfo, OtherInfo, $firebaseArray, $firebaseObject, $ionicPopover, $timeout, $state) {
      var usr = UserInfo.getUserInfo();
      var authUser = firebase.auth().currentUser;
      var ref = firebase.database().ref("Buildings").child(usr.buildcode + "/UserEvents");
      var eventdone = true;

      $scope.selection = {tab: "event", porb: "public", privstep: 1};
      $scope.event = {title: "", location: "", date: "", time: "", description: ""};
      $scope.goingList = [];
      $scope.notifications = [];

      $scope.$on('$ionicView.beforeEnter', function () //before anything runs
      {
        usr = UserInfo.getUserInfo();
        console.log("working?", UserInfo.getUserInfo());
        if ($scope.notifications.length == 0 && authUser == undefined || usr.email == "") {
          console.log("Why yes it is!");
          firebase.auth().onAuthStateChanged(function (user) {
            authUser = firebase.auth().currentUser;
            var rez = firebase.database().ref("Buildings").child(authUser.displayName + "/Users/" + authUser.uid);
            var loadit = $firebaseObject(rez);
            loadit.$loaded().then(function (x) {
              UserInfo.setUserInfo(x);
              usr = UserInfo.getUserInfo();
              ref = firebase.database().ref("Buildings").child(usr.buildcode + "/UserEvents");
              refActivate();

            })
              .catch(function (error) {
                console.log("Error:", error);
              });
          });
        }
        else {
          refActivate();
        }

      });

      $scope.blurry = {behind: "0px"};
      $scope.modalOpen = {
        info: "",
        key: "",
        attend: ""
      };

      function checkUser(item) {

        var removeit = true;
        for (var i in item.rolecall) {
          if (i == authUser.uid) {
            console.log("FOUND!")
            return true;
            break;
          }
        }
        if (removeit === true) {
          return false;
        }

      }


      // .fromTemplateUrl() method
      $ionicPopover.fromTemplateUrl('eventFullView.html', {
        scope: $scope,
        backdropClickToClose: true,
        hardwareBackButtonClose: true
      })
        .then(function (popover) {
          $scope.popover = popover;
        });


      function makeblurry() {
        if ($scope.popover.isShown()) {
          console.log("blur background");
          $scope.blurry = {behind: "5px"};
        }
        else {
          console.log("clear up");
          $scope.blurry = {behind: "0px"};
        }
      }

      function findgoing() {
        $scope.goingList = [];
        var selectedlist = [];
        for (i in $scope.modalOpen.info.rolecall) {
          console.log("checking: ", $scope.modalOpen.info.rolecall[i].going);
          if ($scope.modalOpen.info.rolecall[i].going === true) {
            console.log("true!,", i);
            selectedlist.push(i);
          }
        }
        console.log("list has ", selectedlist.length);
        console.log("list is: ", selectedlist);
        if (selectedlist.length > 0) {
          var req = firebase.database().ref("Buildings").child(usr.buildcode + "/Users");
          for (var i = 0; i < selectedlist.length; i++) {
            req.child(selectedlist[i]).once('value').then(function (snap) {
              $scope.goingList.push({info: snap.val()});
              console.log("record: ", snap.val());
              $timeout(function () {
                $scope.$apply();
              });
            });
          }
        }
      }


      $scope.checkHit = function (event) {
        if (event.target.className.includes("popup-container popup-showing")) {
          $scope.closePopover();
        }
      };

      $scope.openPopover = function ($event, notify) {
        $scope.blurry.behind = "5px";
        $scope.modalOpen = {
          info: notify.info,
          key: notify.key,
          attend: notify.attend
        };
        findgoing();
        $scope.popover.show($event);
        makeblurry();
      };

      $scope.closePopover = function () {
        $scope.blurry.behind = "0px";
        $scope.popover.hide();
        makeblurry();

      };
      //Cleanup the popover when we're done with it!
      $scope.$on('$destroy', function () {
        $scope.blurry.behind = "0px";
        $scope.popover.remove();
        makeblurry();
      });


      $scope.joinEvent = function (notify) {
        ref.child(notify.key + "/rolecall/" + authUser.uid).set({
          'going': true
        }).then(function () {
          $scope.closePopover();
        });
      };


      //go to other profile from action detail popup
      $scope.openProfile = function (clicked) {
        OtherInfo.setOtherInfo(clicked);
        $scope.closePopover();
        $state.go('tabsController.profile', {
          'avatarClicked': 'true'
        });
      };

      //hold on the avatar to send the message
      $scope.openMessagePopover = function ($event, notify) {
        $scope.blurry.behind = "5px";
        messageUser = notify;
        $scope.popover.show($event);
        makeblurry();
      };


      //store the selected button for showAttendants()
      var selected = "";
      //showing attendants of the action in poppu
      $scope.showAttendants = function (button) {


        //change the selected button to orange and hide details
        document.getElementById(button).style.background = "#F57C00";
        document.getElementById("actionDetail").className = "eoko-hide";
        document.getElementById("attendants").className = "eoko-show";

        //change other buttons to normal color
        switch (button) {
          case "goingButton":
            document.getElementById("maybeButton").style.background = "rgba(255, 255, 255, 0.4)";
            document.getElementById("declinedButton").style.background = "rgba(255, 255, 255, 0.4)";
            document.getElementById("invitedButton").style.background = "rgba(255, 255, 255, 0.4)";
            break;
          case "maybeButton":
            document.getElementById("goingButton").style.background = "rgba(255, 255, 255, 0.4)";
            document.getElementById("declinedButton").style.background = "rgba(255, 255, 255, 0.4)";
            document.getElementById("invitedButton").style.background = "rgba(255, 255, 255, 0.4)";
            break;
          case "declinedButton":
            document.getElementById("goingButton").style.background = "rgba(255, 255, 255, 0.4)";
            document.getElementById("maybeButton").style.background = "rgba(255, 255, 255, 0.4)";
            document.getElementById("invitedButton").style.background = "rgba(255, 255, 255, 0.4)";
            break;
          case "invitedButton":
            document.getElementById("goingButton").style.background = "rgba(255, 255, 255, 0.4)";
            document.getElementById("maybeButton").style.background = "rgba(255, 255, 255, 0.4)";
            document.getElementById("declinedButton").style.background = "rgba(255, 255, 255, 0.4)";
            break;
        }

        //deselect a button
        if (selected === button) {
          document.getElementById(button).style.background = "rgba(255, 255, 255, 0.4)";
          document.getElementById("actionDetail").className = "eoko-show";
          document.getElementById("attendants").className = "eoko-hide";
          selected = "";
        } else {
          selected = button;
        }
      };


//var writeAttend = data.val().rolecall[authUser.uid].going ? 'Joined' : 'Join';
      var refActivate = (function () {
        var executed = false;
        return function () {
          if (!executed) {
            executed = true;
            console.log("ACTIVATE REF!!!");
            ref.on('child_added', function (data) {
              console.log("child_added triggered");
              if (checkUser(data.val())) {
                $scope.notifications.push({
                  info: data.val(),
                  key: data.key,
                  attend: data.val().rolecall[authUser.uid].going ? 'Joined' : 'Join'
                });
                $timeout(function () {
                  $scope.$apply();
                });
              }
            });


            ref.on('child_changed', function (data) {
              console.log("child_changed triggered");
              var removeitem = true;
              for (var i in data.val().rolecall)   //iterate over rolecall
              {
                if (i == authUser.uid)   //if user is in rolecall
                {
                  removeitem = false;
                  var additem = true;
                  for (var i = 0; i < $scope.notifications.length; i++)   //check notification list
                  {
                    if ($scope.notifications[i].key == data.key)  //if notification is there, do nothing
                    {
                      additem = false;
                      $scope.notifications[i].attend = data.val().rolecall[authUser.uid].going ? 'Joined' : 'Join';
                      $scope.notifications[i].info = data.val();
                      console.log("checking attend:", $scope.notifications[i].attend);
                      break;
                    }
                  }
                  if (additem === true)   //if not, push to notification stack
                  {
                    $scope.notifications.push({
                      info: data.val(),
                      key: data.key,
                      attend: data.val().rolecall[authUser.uid].going ? 'Joined' : 'Join'
                    });
                    break;
                  }
                  break;
                }
              }
              if (removeitem === true)   //if user is not in rolecall
              {
                for (var i = 0; i < $scope.notifications.length; i++)  //check notification list
                {
                  if ($scope.notifications[i].key == data.key)      //if notification found, delete it
                  {
                    $scope.notifications.splice(i, 1);
                    $timeout(function () {
                      $scope.$apply();
                    });
                    break;
                  }
                }
              }
              $timeout(function () {
                $scope.$apply();
              });

            });

            ref.on('child_removed', function (data) {
              console.log("child_removed triggered");
              for (var i = 0; i < $scope.notifications.length; i++) {
                if ($scope.notifications[i].key == data.key) {
                  $scope.notifications.splice(i, 1);
                  $timeout(function () {
                    $scope.$apply();
                  });
                  break;
                }
              }
            });
          }
        };

      })();


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


      function chunk(arr, size) {
        var newArr = [];
        for (var i = 0; i < arr.length; i += size) {
          newArr.push(arr.slice(i, i + size));
        }
        return newArr;
      }

      $scope.selectEventTab = function () {
        document.getElementById("EventButton").className = "eoko-button-text-selected eoko-text-button-nav";
        document.getElementById("CreateEventButton").className = "eoko-button-text eoko-text-button-nav";
        $scope.selection.tab = "event";
      };

      $scope.selectCreateTab = function () {
        document.getElementById("EventButton").className = "eoko-button-text eoko-text-button-nav";
        document.getElementById("CreateEventButton").className = "eoko-button-text-selected eoko-text-button-nav";
        $scope.selection.tab = "create";
      };


      $scope.selectedPublic = function () {
        document.getElementById("PublicButton").className = "button button-energized button-block eoko-text-light";
        document.getElementById("PrivateButton").className = "button button-energized button-block button-outline eoko-text-light";
        $scope.selection.porb = "public";
      };

      $scope.selectedPrivate = function () {
        document.getElementById("PublicButton").className = "button button-energized button-block button-outline eoko-text-light";
        document.getElementById("PrivateButton").className = "button button-energized button-block eoko-text-light";
        $scope.selection.porb = "private";
        $scope.selection.privstep = 1;
      };

      $scope.PrivateNextStep = function () {
        $scope.selection.privstep = 2;

        var req = firebase.database().ref("Buildings").child(usr.buildcode + "/Users");
        $scope.owning = {avatar: usr.avatar};
        $scope.userList = $firebaseArray(req);

        $scope.userList.$loaded().then(function (x) {
          $scope.userList = chunk(x, 3);
          console.log($scope.userList);
        })
          .catch(function (error) {
            console.log("Error:", error);
          });
      };

      $scope.privateRoll = {};
      $scope.selectUser = function (selected) {
        $scope.privateRoll[authUser.uid] = {'going': false};
        if (selected.$id in $scope.privateRoll) {
          delete $scope.privateRoll[selected.$id];
        }
        else {
          $scope.privateRoll[selected.$id] = {'going': false};
        }

      };

      $scope.createEvent = function (makeEventForm) {
        var rec = firebase.database().ref("Buildings").child(usr.buildcode + "/Users");
        var postedEvent = {
          title: $scope.event.title,
          location: $scope.event.location,
          date: "",
          time: "",
          description: $scope.event.description,
          avatar: usr.avatar
        };

        var d = $scope.event.date;
        postedEvent.date = weekday[d.getDay()] + ", " + month[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
        postedEvent.time = $scope.event.time.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
        console.log(postedEvent);


//if public

        if ($scope.selection.porb == "public") {
          var everyone = $firebaseArray(rec);
          everyone.$loaded().then(function (x) {
            var rolecall = {};
            for (var i = 0; i < everyone.length; i++) {
              rolecall[everyone[i].$id] = {'going': false};
            }
            var eventpost = ref.push({
              'title': postedEvent.title,
              'location': postedEvent.location,
              'date': postedEvent.date,
              'time': postedEvent.time,
              'description': postedEvent.description,
              'avatar': postedEvent.avatar,
              'rolecall': rolecall
            });

            rec.child(authUser.uid + "/notifications").push({
              'title': postedEvent.title,
              'location': postedEvent.location,
              'date': postedEvent.date,
              'time': postedEvent.time,
              'description': postedEvent.description,
              'avatar': postedEvent.avatar,
              'rolecall': rolecall
            });

            rec.child(authUser.uid + "/yourEvents").push({
              'title': postedEvent.title,
              'location': postedEvent.location,
              'date': postedEvent.date,
              'time': postedEvent.time,
              'description': postedEvent.description,
              'avatar': postedEvent.avatar,
              'rolecall': rolecall
            });

            rec.child(authUser.uid + "/eventCount").transaction(function (counts) {
              if (counts) {
                counts = counts + 1;
              }
              return (counts || 0) + 1;
            });

          })
            .catch(function (error) {
              console.log("Error:", error);
            });


          $scope.selection.tab = "event";
        }
//if private
        else if ($scope.selection.porb == "private") {
          var eventpost = ref.push({
            'title': postedEvent.title,
            'location': postedEvent.location,
            'date': postedEvent.date,
            'time': postedEvent.time,
            'description': postedEvent.description,
            'avatar': postedEvent.avatar,
            'rolecall': $scope.privateRoll
          });


          rec.child(authUser.uid + "/notifications").push({
            'title': postedEvent.title,
            'location': postedEvent.location,
            'date': postedEvent.date,
            'time': postedEvent.time,
            'description': postedEvent.description,
            'avatar': postedEvent.avatar,
            'rolecall': $scope.privateRoll
          });

          rec.child(authUser.uid + "/yourEvents").push({
            'title': postedEvent.title,
            'location': postedEvent.location,
            'date': postedEvent.date,
            'time': postedEvent.time,
            'description': postedEvent.description,
            'avatar': postedEvent.avatar,
            'rolecall': $scope.privateRoll
          });

          rec.child(authUser.uid + "/eventCount").transaction(function (counts) {
            if (counts) {
              counts = counts + 1;
            }
            return (counts || 0) + 1;
          });

          $scope.selection.tab = "event";
          $scope.selection.privstep = 1;
        }

      };


    }])


  .controller('connectCtrl', ['$scope', '$state', '$stateParams', 'UserInfo', 'OtherInfo', '$firebaseArray', '$firebaseObject', '$ionicPopover', 'orderByFilter', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope, $state, $stateParams, UserInfo, OtherInfo, $firebaseArray, $firebaseObject, $ionicPopover, orderByFilter) {

      var usr = UserInfo.getUserInfo();
      var usor = firebase.auth().currentUser;
      var ref;

      $scope.$on('$ionicView.beforeEnter', function () //before anything runs
      {
        if (usor == undefined) {
          console.log('running once!')
          firebase.auth().onAuthStateChanged(function (user) {
            usor = firebase.auth().currentUser;
            ref = firebase.database().ref("Buildings").child(usor.displayName + "/Users");

            var tempdata = $firebaseObject(ref.child(usor.uid));
            tempdata.$loaded().then(function (x) {
              UserInfo.setUserInfo(tempdata);
              console.log(tempdata);
              usr = UserInfo.getUserInfo();

              console.log(usr);
              $scope.userList = $firebaseArray(ref);
              $scope.userList.$loaded().then(function (x) {
                $scope.userList = chunk(x, 3);
              })
                .catch(function (error) {
                  console.log("Error:", error);

                });

              $scope.owning = {id: tempdata.$id};
              console.log($scope.owning);
              console.log($scope.userList);


            })
              .catch(function (error) {
                console.log("Error:", error);
              });
          });
        }
        else {
          ref = firebase.database().ref("Buildings").child(usor.displayName + "/Users");
          console.log(usr);
          $scope.userList = $firebaseArray(ref);
          $scope.userList.$loaded().then(function (x) {
            $scope.userList = chunk(x, 3);
          })
            .catch(function (error) {
              console.log("Error:", error);
            });

          $scope.owning = {avatar: usr.avatar};
          console.log($scope.owning);


        }
      });


      $scope.selectEveryoneTab = function () {
        //change css class to udnerline the selected tab
        document.getElementById("EveryoneButton").className = "eoko-button-text-selected eoko-text-button-nav";
        document.getElementById("FriendsButton").className = "eoko-button-text eoko-text-button-nav";
        $scope.selection.tab = "everyone";
      };

      $scope.selectFriendsTab = function () {
        //change css class to udnerline the selected tab
        document.getElementById("EveryoneButton").className = "eoko-button-text eoko-text-button-nav";
        document.getElementById("FriendsButton").className = "eoko-button-text-selected eoko-text-button-nav";
        $scope.selection.tab = "friends";
      };


      function chunk(arr, size) {
        var newArr = [];
        for (var i = 0; i < arr.length; i += size) {
          newArr.push(arr.slice(i, i + size));
        }
        return newArr;
      }


      $scope.openProfile = function (clicked) {
        OtherInfo.setOtherInfo(clicked);
        $state.go('tabsController.profile', {
          'avatarClicked': 'true'
        });
      };


// .fromTemplateUrl() method
      $ionicPopover.fromTemplateUrl('my-popover.html', {
        scope: $scope
      }).then(function (popover) {
        $scope.popover = popover;
      });

//$scope.blurry = $scope.popover.isShown() ? $scope.blurry = {behind : "5px"} : $scope.blurry = {behind : "0px"};
      $scope.blurry = {behind: "0px"};

      function makeblurry() {
        if ($scope.popover.isShown()) {
          console.log("blur background");
          $scope.blurry = {behind: "5px"};
        }
        else {
          console.log("clear up");
          $scope.blurry = {behind: "0px"};
        }
      }

      $scope.checkHit = function (event) {
        if (event.target.className.includes("popup-container popup-showing")) {
          $scope.closePopover();
        }
      };

      var messageUser;
      $scope.createMessage = function () {
        var combino = orderByFilter([{
          eyed: usor.uid
        }, {
          eyed: messageUser.$id
        }], 'eyed');
        var uniqueMessageID = combino[0].eyed + '_' + combino[1].eyed;
        console.log(uniqueMessageID);

        var res = firebase.database().ref("Buildings").child(usor.displayName + "/Chats");

        res.child(uniqueMessageID).once('value', function (snapshot) {
          if (snapshot.val() !== null) {
            $scope.closePopover();
            $state.go('chatPage', {
              'otherID': messageUser.$id,
              'convoID': uniqueMessageID
            });
          }
          else {
            res.child(uniqueMessageID).set({
              'chatTitle': "",
              'chatIDs': [usor.uid, messageUser.$id]
            }).then(function () {
              $scope.closePopover();
              $state.go('chatPage', {
                'otherID': messageUser.$id,
                'convoID': uniqueMessageID
              });
            });
          }
        });


      };

      $scope.openPopover = function ($event, notify) {
        $scope.blurry.behind = "5px";
        messageUser = notify;
        $scope.popover.show($event);
        makeblurry();
      };

      $scope.closePopover = function () {
        $scope.blurry.behind = "0px";
        $scope.popover.hide();
        //$scope.popover.remove();
      };

      //Cleanup the popover when we're done with it!
      $scope.$on('$destroy', function () {
        $scope.popover.remove();
      });

      // Execute action on hide popover
      $scope.$on('popover.hidden', function () {
        makeblurry();
      });

      // Execute action on remove popover
      $scope.$on('popover.removed', function () {
        makeblurry();
      });


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

  .controller('homeCtrl', ['$scope', '$stateParams', '$ImageCacheFactory', '$ionicPlatform', '$timeout', '$firebaseObject', '$state', 'UserInfo', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope, $stateParams, $ImageCacheFactory, $ionicPlatform, $timeout, $firebaseObject, $state, UserInfo) {

      $ionicPlatform.ready(function () {
        $ImageCacheFactory.Cache([
          "img/main_background.png",
          "img/action_icon_off.png",
          "img/action_icon_on.png",
          "img/empty_profile_icon.png",
          "img/event_icon_on.png",
          "img/event_icon_off.png",
          "img/facebook_icon.png",
          "img/info_icon_off.png",
          "img/info_icon_on.png",
          "img/instagram_icon.png",
          "img/linkedin_icon.png",
          "img/logoWhite.png",
          "img/ionic.png",
          "img/notification_icon.png",
          "img/people_icon_on.png",
          "img/profile_icon_off.png",
          "img/people_icon_off.png",
          "img/profile_icon_on.png",
          "img/twitter_icon.png",
          "img/setting_icon.png"
        ]).then(function () {
          console.log("Images done loading!");
          firebase.auth().onAuthStateChanged(function (user) {
            var usr = firebase.auth().currentUser;
            console.log(usr.displayName);
            var ref = firebase.database().ref("Buildings").child(usr.displayName + "/Users/" + usr.uid);
            var youser = $firebaseObject(ref);
            youser.$loaded().then(function (x) {
              UserInfo.setUserInfo(youser);
              console.log(youser);
              $state.go('tabsController.profile');
            })
              .catch(function (error) {
                console.log("Error:", error);
              });
          });

        });
        $timeout(function () {
          $scope.$digest();
        });

      });


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
      };

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

  .controller('getPicturePageCtrl', ['$scope', '$stateParams', '$state', '$timeout', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope, $stateParams, $state, $timeout) {

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
            $timeout(function () {
              $scope.$apply();
            });
          });


        });
      };

      $scope.$on('$ionicView.beforeEnter', function () //before anything runs
      {
        var usr = firebase.auth().currentUser;
        var ref = firebase.database().ref("Buildings").child(usr.displayName + "/Users");
        ref.child(usr.uid + "/avatar").set($scope.user.image, function (success) {
        });
      });

      $scope.submitAvatar = function () {
        usr = firebase.auth().currentUser;
        ref = firebase.database().ref("Buildings").child(usr.displayName + "/Users");
        ref.child(usr.uid + "/avatar").set($scope.user.image, function (success) {
          $state.go('getDescriptionPage');
        });

      };


    }])


  .controller('notificationPageCtrl', ['$scope', '$stateParams', 'UserInfo', '$firebaseObject', '$timeout', '$ionicScrollDelegate', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope, $stateParams, UserInfo, $firebaseObject, $timeout, $ionicScrollDelegate) {


      var usr = UserInfo.getUserInfo();
      var authUser = firebase.auth().currentUser;
      var ref;

      $scope.selection = {tab: "notifications"};
      $scope.goingList = [];
      $scope.notifications = [];
      $scope.youractions = [];

      $scope.$on('$ionicView.beforeEnter', function () //before anything runs
      {
        if ($scope.notifications.length == 0 && authUser == undefined) {
          console.log("Why yes it is!");
          firebase.auth().onAuthStateChanged(function (user) {
            authUser = firebase.auth().currentUser;
            ref = firebase.database().ref("Buildings").child(authUser.displayName + "/Users/" + authUser.uid);
            var loadit = $firebaseObject(ref);
            loadit.$loaded().then(function (x) {
              UserInfo.setUserInfo(x);
              usr = UserInfo.getUserInfo();
              refActivate();

            })
              .catch(function (error) {
                console.log("Error:", error);
              });
          });
        }
        else {
          ref = firebase.database().ref("Buildings").child(authUser.displayName + "/Users/" + authUser.uid);
          refActivate();
        }

      });

      $scope.$on('$ionicView.afterEnter', function () { //after all loads
        for (var i in $scope.youractions) {
          var listdate = $scope.youractions[i].info.date;
          var listtime = $scope.youractions[i].info.time;
          console.log($scope.youractions[i].info.date); //Thursday, March 4, 123   2:34 PM

          var splitted = listdate.split(" ");
          var resultingDate;
          for (var i in splitted) {
            splitted[i].replace(/,/g, '')

          }

        }
      });

      function checkUser(item) {
        var removeit = true;
        for (var i in item.rolecall) {
          if (i == authUser.uid) {
            console.log("FOUND!")
            return true;
            break;
          }
        }
        if (removeit === true) {
          return false;
        }
      }

      var refActivate = (function () {
        var executed = false;
        return function () {
          if (!executed) {
            executed = true;
            console.log("ACTIVATE REF!!!");

            ref.child('notifications').on('child_added', function (data) {
              console.log("child_added notify triggered");
              if (checkUser(data.val())) {
                $scope.notifications.push({
                  info: data.val(),
                  key: data.key,
                  attend: data.val().rolecall[authUser.uid].going ? 'Joined' : 'Join'
                });
                $timeout(function () {
                  $scope.$apply();
                });
              }
            });

            ref.child('yourEvents').on('child_added', function (data) {
              console.log("child_added yourevents triggered");
              if (checkUser(data.val())) {
                $scope.youractions.push({
                  info: data.val(),
                  key: data.key,
                  attend: data.val().rolecall[authUser.uid].going ? 'Joined' : 'Join'
                });
                $timeout(function () {
                  $scope.$apply();
                });
              }
            });


            ref.child('notifications').on('child_changed', function (data) {
              console.log("child_changed notify triggered");
              var removeitem = true;
              for (var i in data.val().rolecall)   //iterate over rolecall
              {
                if (i == authUser.uid)   //if user is in rolecall
                {
                  removeitem = false;
                  var additem = true;
                  for (var i = 0; i < $scope.notifications.length; i++)   //check notification list
                  {
                    if ($scope.notifications[i].key == data.key)  //if notification is there, do nothing
                    {
                      additem = false;
                      $scope.notifications[i].attend = data.val().rolecall[authUser.uid].going ? 'Joined' : 'Join';
                      $scope.notifications[i].info = data.val();
                      console.log("checking attend:", $scope.notifications[i].attend);
                      break;
                    }
                  }
                  if (additem === true)   //if not, push to notification stack
                  {
                    $scope.notifications.push({
                      info: data.val(),
                      key: data.key,
                      attend: data.val().rolecall[authUser.uid].going ? 'Joined' : 'Join'
                    });
                    break;
                  }
                  break;
                }
              }
              if (removeitem === true)   //if user is not in rolecall
              {
                for (var i = 0; i < $scope.notifications.length; i++)  //check notification list
                {
                  if ($scope.notifications[i].key == data.key)      //if notification found, delete it
                  {
                    $scope.notifications.splice(i, 1);
                    $timeout(function () {
                      $scope.$apply();
                    });
                    break;
                  }
                }
              }
              $timeout(function () {
                $scope.$apply();
              });

            });


            ref.child('yourEvents').on('child_changed', function (data) {
              console.log("child_changed yourEvents triggered");
              var removeitem = true;
              for (var i in data.val().rolecall)   //iterate over rolecall
              {
                if (i == authUser.uid)   //if user is in rolecall
                {
                  removeitem = false;
                  var additem = true;
                  for (var i = 0; i < $scope.youractions.length; i++)   //check notification list
                  {
                    if ($scope.youractions[i].key == data.key)  //if notification is there, do nothing
                    {
                      additem = false;
                      $scope.youractions[i].attend = data.val().rolecall[authUser.uid].going ? 'Joined' : 'Join';
                      $scope.youractions[i].info = data.val();
                      console.log("checking attend:", $scope.youractions[i].attend);
                      break;
                    }
                  }
                  if (additem === true)   //if not, push to notification stack
                  {
                    $scope.youractions.push({
                      info: data.val(),
                      key: data.key,
                      attend: data.val().rolecall[authUser.uid].going ? 'Joined' : 'Join'
                    });
                    break;
                  }
                  break;
                }
              }
              if (removeitem === true)   //if user is not in rolecall
              {
                for (var i = 0; i < $scope.youractions.length; i++)  //check notification list
                {
                  if ($scope.youractions[i].key == data.key)      //if notification found, delete it
                  {
                    $scope.youractions.splice(i, 1);
                    $timeout(function () {
                      $scope.$apply();
                    });
                    break;
                  }
                }
              }
              $timeout(function () {
                $scope.$apply();
              });

            });

            ref.child('notifications').on('child_removed', function (data) {
              console.log("child_removed triggered");
              for (var i = 0; i < $scope.notifications.length; i++) {
                if ($scope.notifications[i].key == data.key) {
                  $scope.notifications.splice(i, 1);
                  $timeout(function () {
                    $scope.$apply();
                  });
                  break;
                }
              }
            });

            ref.child('yourEvents').on('child_removed', function (data) {
              console.log("child_removed triggered");
              for (var i = 0; i < $scope.youractions.length; i++) {
                if ($scope.youractions[i].key == data.key) {
                  $scope.youractions.splice(i, 1);
                  $timeout(function () {
                    $scope.$apply();
                  });
                  break;
                }
              }
            });
          }
        };

      })();


      $scope.selectNotificationTab = function () {
        //change css class to udnerline the selected tab
        document.getElementById("NotificationButton").className = "eoko-button-text-selected eoko-text-button-nav";
        document.getElementById("YourActionButton").className = "eoko-button-text eoko-text-button-nav";
        $scope.selection.tab = "notifications";
      };

      $scope.selectYourActionTab = function () {
        //change css class to udnerline the selected tab
        document.getElementById("NotificationButton").className = "eoko-button-text eoko-text-button-nav";
        document.getElementById("YourActionButton").className = "eoko-button-text-selected eoko-text-button-nav";
        $scope.selection.tab = "yourevents";
      };

      function getIonWidth(curr) {
        if (curr.hasClass('item-thumbnail-left')) {
          return curr[0];
        }
        else {
          return getIonWidth(curr.parent());
        }
      }

      $scope.draggedStyle = {};
      var swiped;

      $scope.onDrag = function (event, index) {
        swiped = false;
        $ionicScrollDelegate.$getByHandle('mainScroll').freezeScroll(true);
        $scope.draggedStyle[index] = {
          "transform": "translate(" + event.gesture.deltaX + "px)",
          "-webkit-transform": "translate(" + event.gesture.deltaX + "px)"
        };
      };

      $scope.onRelease = function (event, index, notify) {
        $ionicScrollDelegate.$getByHandle('mainScroll').freezeScroll(false);
        if (swiped === false) {
          var ionitem = getIonWidth(angular.element(event.srcElement));

          if (event.gesture.deltaX < (ionitem.offsetWidth * 0.618) * -1) {
            $scope.onSwipeLeft(notify, index);
          }
          else {
            $scope.draggedStyle[index] = {
              "transform": "translate(" + 0 + "px)",
              "-webkit-transition": "transform 0.61s",
              "-moz-transition": "transform 0.61s",
              "-ms-transition": "transform 0.61s",
              "-o-transition": "transform 0.61s",
              "transition": "transform 0.61s"
            };
          }

        }
      };

      $scope.onSwipeLeft = function (notify, index) {
        console.log(index);
        swiped = true;
        $scope.draggedStyle[index] = {
          "transform": "translate(" + -100 + "%)",
          "-webkit-transition": "transform 0.61s",
          "-moz-transition": "transform 0.61s",
          "-ms-transition": "transform 0.61s",
          "-o-transition": "transform 0.61s",
          "transition": "transform 0.61s"
        };
        $timeout(function () {
          console.log("Swiped left, remove object");


          delete $scope.draggedStyle[index];
          //$scope.draggedStyle[index] = {};
          $scope.notifications.splice(index, 1);
          console.log(index);


          ref.child('notifications/' + notify.key).remove().then(function () {
            console.log("object removed from database");
          });

        }, 610);

        /**/
      };

    }])


  .controller('chatTabCtrl', ['$scope', '$stateParams', '$firebaseObject', 'UserInfo', '$firebaseArray', '$timeout', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope, $stateParams, $firebaseObject, UserInfo, $firebaseArray, $timeout) {

      var usr = UserInfo.getUserInfo();
      var authUser = firebase.auth().currentUser;
      var ref;

      $scope.$on('$ionicView.beforeEnter', function () //before anything runs
      {
        if (authUser == undefined) {
          console.log('running once!')
          firebase.auth().onAuthStateChanged(function (user) {
            authUser = firebase.auth().currentUser;
            ref = firebase.database().ref("Buildings").child(authUser.displayName + "/Chats");
            reds = firebase.database().ref("Buildings").child(authUser.displayName + "/Users/" + authUser.uid);

            var objs = $firebaseObject(reds);
            objs.$loaded().then(function (x) {
              UserInfo.setUserInfo(x);
              usr = UserInfo.getUserInfo();

              $scope.conversations = $firebaseArray(ref);
              $scope.conversations.$loaded().then(function (x) {
                getInfo(x);

              })
                .catch(function (error) {
                  console.log("Error:", error);
                });
            })
              .catch(function (error) {
                console.log("Error:", error);
              });
          });
        }
        else {
          ref = firebase.database().ref("Buildings").child(authUser.displayName + "/Chats");
          console.log(usr);
          $scope.conversations = $firebaseArray(ref);
          $scope.conversations.$loaded().then(function (x) {
            getInfo(x);

          })
            .catch(function (error) {
              console.log("Error:", error);
            });
        }

      });


      function getInfo(x) {
        var rec = firebase.database().ref("Buildings").child(authUser.displayName + "/Users");
        rec.once('value').then(function (snap) {
          for (var i = 0; i < $scope.conversations.length; i++) {
            //console.log();
            if (x[i].chatIDs.indexOf(authUser.uid) > -1)   //one of my convos
            {

              if (x[i].chatTitle == "")   //two way talk
              {
                console.log("innerfor");
                var lastmessage = "";
                var lasttime = "";
                for (var j in x[i].messages) {
                  lastmessage = x[i].messages[j].text;
                  lasttime = x[i].messages[j].time;
                }

                partner = (x[i].chatIDs.indexOf(authUser.uid) == 0) ? x[i].chatIDs[1] : x[i].chatIDs[0];

                $scope.conversations[i].avatar = snap.val()[partner].avatar;
                $scope.conversations[i].name = snap.val()[partner].name;
                $scope.conversations[i].partnerID = partner;
                $scope.conversations[i].chatID = x[i].$id;
                $scope.conversations[i].lastmessage = lastmessage;
                $scope.conversations[i].lasttime = lasttime;
              }
            }
          }
          $timeout(function () {
            $scope.$apply();
          });
        });
      }

    }])


  .controller('chatPageCtrl', ['$scope', '$stateParams', '$firebaseObject', 'UserInfo', '$firebaseArray', '$ionicScrollDelegate', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
    function ($scope, $stateParams, $firebaseObject, UserInfo, $firebaseArray, $ionicScrollDelegate) {

      var authUser = firebase.auth().currentUser;
      $scope.myId = authUser.uid;
      var ref = firebase.database().ref("Buildings").child(authUser.displayName);
      var partnerID = $stateParams.otherID;
      var convoID = $stateParams.convoID;
      var currentnum = 0;

      $scope.$on('$ionicView.beforeEnter', function () //before anything runs
      {
        ref.child('Chats').child(convoID).once("value").then(function (snap) {
          console.log("the whole chat", snap.val());
          $scope.chatObj = snap.val();
        });

        ref.child('Users').child(partnerID).once("value").then(function (snap) {
          console.log("the partner", snap.val());
          $scope.partner = snap.val();
        });

      });


      $scope.$on('$ionicView.afterEnter', function () //before anything runs
      {
        console.log("ref is:", ref);
        $ionicScrollDelegate.scrollBottom();
        $scope.messages = $firebaseArray(ref.child('Chats').child(convoID + '/messages'));
        $scope.messages.$loaded()
          .then(function (x) {
            console.log("messages are loaded", x)
            currentnum = Object.keys($scope.messages).length;
          })
          .catch(function (error) {
            console.log("Error:", error);
          });
      });


      $scope.data = {messageText: ""};


      $scope.sendMessage = function () {
        console.log("starting messagesend");
        var d = new Date();
        d = d.toLocaleTimeString().replace(/:\d+ /, ' ');
        console.log("message:", $scope.data.messageText);
        console.log("toadded: ", $scope.messages);

        $scope.messages.$add({
          userId: authUser.uid,
          text: $scope.data.messageText,
          time: d

        });
        $scope.data.messageText = "";
        $ionicScrollDelegate.scrollBottom();


      };

      $scope.closeKeyboard = function () {

      };


    }])
