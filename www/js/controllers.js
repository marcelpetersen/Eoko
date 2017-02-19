angular.module('app.controllers', [])
  
.controller('profileCtrl', ['$scope', '$stateParams', 'UserInfo', 'OtherInfo', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, UserInfo, OtherInfo) {

$scope.user = "";
 $scope.$on('$ionicView.beforeEnter', function() //before anything runs
    {
        console.log($stateParams.avatarClicked);
        if ($stateParams.avatarClicked == 'true')
        {
           console.log("other");
            $scope.user = OtherInfo.getOtherInfo();
            console.log($scope.user); 
        }  
        else
        {
            console.log("user");
            $scope.user = UserInfo.getUserInfo();
            console.log($scope.user)
            if($scope.user.email == "")
            {
                console.log("empty, pulling from database")
                var usr = firebase.auth().currentUser;
                var ref = firebase.database().ref("Buildings").child(usr.displayName + "/Users");
                    
                ref.child(usr.uid).once("value").then(function(snapshot)
                {
                    console.log(snapshot.val());
                    UserInfo.setUserInfo(snapshot.val());
                    $scope.user = UserInfo.getUserInfo();
                });
            }
        }

    });



}])
   
.controller('eventsCtrl', ['$scope', '$stateParams', 'UserInfo','$firebaseArray','$ionicPopover',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, UserInfo, $firebaseArray, $ionicPopover) {

    var usr = UserInfo.getUserInfo();
    var authUser = firebase.auth().currentUser;
    var ref = firebase.database().ref("Buildings").child(usr.buildcode + "/UserEvents");
    var eventdone = true;

    $scope.selection = {tab:"event", porb:"public", privstep: 1};
    $scope.event = {title:"",location:"",date:"",time:"",description:""};
    $scope.goingList = [];


$scope.blurry = {behind : "0px"};
$scope.modalOpen = {
                info: "",
                key: "",
                attend: ""
            };

function checkUser(item)
{
  
  var removeit = true;
  for(var i in item.rolecall)
  {
     if(i == authUser.uid)
     {
        console.log("FOUND!")
        return true;
        break;
     }
  }
  if(removeit === true)
  {
    return false;
  }
   
}


 // .fromTemplateUrl() method
  $ionicPopover.fromTemplateUrl('eventFullView.html',{
    scope: $scope,
    backdropClickToClose: true,
    hardwareBackButtonClose: true
})
  .then(function(popover) 
  {
    $scope.popover = popover;
  });


function makeblurry()
{
    if($scope.popover.isShown())
    {
        console.log("blur background");
        $scope.blurry = {behind : "5px"};
    }
    else
    {
        console.log("clear up");
         $scope.blurry = {behind : "0px"};
    }
}

function findgoing()
{
    $scope.goingList = [];
    var selectedlist = [];
    for(i in $scope.modalOpen.info.rolecall)
    {
        console.log("checking: ", $scope.modalOpen.info.rolecall[i].going);
        if($scope.modalOpen.info.rolecall[i].going === true)
        {
            console.log("true!,", i);
            selectedlist.push(i);
        }
    }
    console.log("list has ", selectedlist.length);
    console.log("list is: ", selectedlist);
    if(selectedlist.length > 0)
    {
        var req = firebase.database().ref("Buildings").child(usr.buildcode + "/Users");
        for(var i = 0; i < selectedlist.length; i++)
        {
            req.child(selectedlist[i]).once('value').then(function(snap)
            {
                $scope.goingList.push({info: snap.val()});
                console.log("record: ", snap.val());
                $scope.$apply();
            });
            
        }

    }
}


$scope.checkHit = function(event)
{
    if(event.target.className.includes("popup-container popup-showing"))
    {
        $scope.closePopover();
    }
};

$scope.openPopover = function($event, notify) {
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

  $scope.closePopover = function() {
    $scope.blurry.behind = "0px";
    $scope.popover.hide();
    makeblurry();
    
  };
  //Cleanup the popover when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.blurry.behind = "0px";
    $scope.popover.remove();
    makeblurry();
  });


$scope.joinEvent = function(notify)
{
    ref.child(notify.key + "/rolecall/" + authUser.uid).set({
        'going' : true
    }).then(function()
    {
        $scope.closePopover();
    });
};


$scope.notifications = [];
//var writeAttend = data.val().rolecall[authUser.uid].going ? 'Joined' : 'Join';

ref.on('child_added', function(data) {
  if(checkUser(data.val()))
  {
    $scope.notifications.push({
        info: data.val(),
        key: data.key,
        attend: data.val().rolecall[authUser.uid].going ? 'Joined' : 'Join'
    });
    $scope.$apply();
  }
});


ref.on('child_changed', function(data) {
  var removeitem = true;
  for(var i in data.val().rolecall)   //iterate over rolecall
  {
    if(i == authUser.uid)   //if user is in rolecall
    {
        removeitem = false;
        var additem = true;
        for(var i = 0; i < $scope.notifications.length; i++)   //check notification list
        {
            if($scope.notifications[i].key == data.key)  //if notification is there, do nothing
            {
                additem = false;
                $scope.notifications[i].attend = data.val().rolecall[authUser.uid].going ? 'Joined' : 'Join';
                $scope.notifications[i].info = data.val();
                console.log("checking attend:", $scope.notifications[i].attend);
                break;
            }
        }
        if(additem === true)   //if not, push to notification stack
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
  if(removeitem === true)   //if user is not in rolecall
  {
    for(var i = 0; i < $scope.notifications.length; i++)  //check notification list
      {
        if($scope.notifications[i].key == data.key)      //if notification found, delete it
        {
            $scope.notifications.splice(i,1);
            $scope.$apply();
            break;
        }
      }
  }
  $scope.$apply();
 
});

ref.on('child_removed', function(data) {
  for(var i = 0; i < $scope.notifications.length; i++)
  {
    if($scope.notifications[i].key == data.key)
    {
        $scope.notifications.splice(i,1);
        $scope.$apply();
        break;
    }
  }
});

var weekday = new Array();
weekday[0] =  "Sunday";
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
  for (var i=0; i<arr.length; i+=size) {
    newArr.push(arr.slice(i, i+size));
  }
  return newArr;
}

    $scope.selectEventTab = function()
    {
        $scope.selection.tab = "event";
    };

    $scope.selectCreateTab = function()
    {
        $scope.selection.tab = "create";
    };

    $scope.selectedPublic = function()
    {
        $scope.selection.porb = "public";
    };

    $scope.selectedPrivate = function()
    {
        $scope.selection.porb = "private";
        $scope.selection.privstep = 1;
    };

    $scope.PrivateNextStep = function()
    {
        $scope.selection.privstep = 2;

        var req = firebase.database().ref("Buildings").child(usr.buildcode + "/Users");
        $scope.owning = {avatar : usr.avatar};
        $scope.userList = $firebaseArray(req);

        $scope.userList.$loaded().then(function(x)
         {
             $scope.userList = chunk(x, 3);
             console.log($scope.userList);
          })
          .catch(function(error) 
          {
            console.log("Error:", error);
          });
    };

    $scope.privateRoll = {};
    $scope.selectUser = function(selected)
    {
        $scope.privateRoll[authUser.uid] = {'going': false};
        if(selected.$id in $scope.privateRoll)
        {
            delete $scope.privateRoll[selected.$id];
        }
        else
        {
            $scope.privateRoll[selected.$id] = {'going': false};
        }
        
    };

    $scope.createEvent = function(makeEventForm)
    {
        var postedEvent = {title: $scope.event.title,
            location:$scope.event.location,
            date:"",
            time:"",
            description:$scope.event.description,
            avatar:usr.avatar};

        var d = $scope.event.date;
        postedEvent.date = weekday[d.getDay()]+", "+month[d.getMonth()]+" "+d.getDate()+", "+d.getFullYear();
        postedEvent.time = $scope.event.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        console.log(postedEvent);



//if public

        if($scope.selection.porb == "public")
            {
                var rec = firebase.database().ref("Buildings").child(usr.buildcode + "/Users");

                var everyone  = $firebaseArray(rec);
                        everyone.$loaded().then(function(x)
                         {
                            var rolecall = {};
                            for(var i = 0; i < everyone.length; i++)
                            {
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
                             
                          })
                          .catch(function(error) 
                          {
                            console.log("Error:", error);
                          });
                
                  
                $scope.selection.tab = "event";
            }
            else if($scope.selection.porb == "private")
            {
                var eventpost = ref.push({
                    'title': postedEvent.title,
                    'location': postedEvent.location,
                    'date': postedEvent.date,
                    'time': postedEvent.time,
                    'description': postedEvent.description,
                    'avatar': postedEvent.avatar,
                    'rolecall': $scope.privateRoll
                });

                $scope.selection.tab = "event";
                $scope.selection.privstep = 1;
            }
        
    };




}])
   
.controller('connectCtrl', ['$scope', '$state', '$stateParams', 'UserInfo', 'OtherInfo','$firebaseArray', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $state, $stateParams, UserInfo, OtherInfo,$firebaseArray) {

var usr = UserInfo.getUserInfo();
if(usr.email == "")
    {
        console.log("empty, pulling from database")
        var usor = firebase.auth().currentUser;
        var ref = firebase.database().ref("Buildings").child(usor.displayName + "/Users");
            
        ref.child(usor.uid).once("value").then(function(snapshot)
        {
            console.log(snapshot.val());
            UserInfo.setUserInfo(snapshot.val());
            usr = UserInfo.getUserInfo();
        });
    }

    var ref = firebase.database().ref("Buildings").child(usr.buildcode + "/Users");


function chunk(arr, size) {
  var newArr = [];
  for (var i=0; i<arr.length; i+=size) {
    newArr.push(arr.slice(i, i+size));
  }
  return newArr;
}

 $scope.owning = {avatar : usr.avatar};
$scope.userList = $firebaseArray(ref);
                $scope.userList.$loaded().then(function(x)
                 {
                    $scope.userList = chunk(x, 3);
                  })
                  .catch(function(error) 
                  {
                    console.log("Error:", error);
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
                 $state.go('tabsController.profile');
            });
            
        },
        function(error)
        {
            console.log(error);
        });
 };

}])

   
.controller('getNamePageCtrl', ['$scope', '$stateParams','$state', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, $state) {

$scope.user = {lastname: "", firstname: "", email: "", password: "", buildcode: "" };

$scope.passInfo = function()
{
    $state.go('getCodePage', {
                'userinfo': $scope.user
            });

};

}])
   
.controller('getCodePageCtrl', ['$scope', '$stateParams','$state', 'UserInfo',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, $state, UserInfo) {

$scope.user = $stateParams.userinfo
console.log($scope.user)

/*function createUser(){
    $state.go('getPicturePage');
}*/


function createUser(){
    firebase.auth().createUserWithEmailAndPassword($scope.user.email, $scope.user.password)
           .then
        (function(success)
        {
            var usr = firebase.auth().currentUser;
            //var month = $scope.user.birthday.getUTCMonth() + 1; //months from 1-12
            //var day = $scope.user.birthday.getUTCDate();
            //var year = $scope.user.birthday.getUTCFullYear();
            //var newdate = month + "/" + day + "/" + year;
            var name = $scope.user.firstname + " " + $scope.user.lastname;
            //console.log(newdate);
            usr.updateProfile( {displayName: $scope.user.buildcode}).then(function(suc)
            {
                
           
            
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
   
.controller('getDescriptionPageCtrl', ['$scope', '$stateParams', '$state', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, $state) {


    $scope.user = {description: ""};
    $scope.submitDescription = function()
    {
        var usr = firebase.auth().currentUser;
        var ref = firebase.database().ref("Buildings").child(usr.displayName + "/Users");
        ref.child(usr.uid + "/description").set($scope.user.description,function(success)
        {
            $state.go('getSocialPage');
        });
    }
   
}])
   
.controller('getSocialPageCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])
   
.controller('getPicturePageCtrl', ['$scope', '$stateParams','$state', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams,$state) {

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

        $scope.uploadPic = function() {
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

            $cordovaCamera.getPicture(options).then(function(imageData) {
                console.log(imageData);
                var contentType = 'image/jpeg';
                var blob = b64toBlob(imageData, contentType);
                console.log("a new blob, ", blob);
                console.log("blobs URL, ", $scope.user.image);

                randID = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
                firebase.storage().ref().child('profilePics/' + randID + ".jpg").put(blob).
                then(function(snapshot) {
                    console.log('Uploaded a blob !');
                    $scope.user.image = snapshot.downloadURL;
                    $scope.$apply();
                });


            });
        };


    $scope.submitAvatar = function()
    {
         var usr = firebase.auth().currentUser;
         var ref = firebase.database().ref("Buildings").child(usr.displayName + "/Users");
         ref.child(usr.uid + "/avatar").set($scope.user.image,function(success)
            {
                $state.go('getDescriptionPage');
            });
        
    };
   

}])
 