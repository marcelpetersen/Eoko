angular.module('app.services', [])

  .factory('UserInfo', [function () {
    var userData = {
      id:"",
      name: "",
      email: "",
      birthday: "",
      points: 0,
      eventCount: 0,
      surveyCount: 0,
      major: "",
      avatar: "",
      buildcode: "",
      description: "",
<<<<<<< HEAD
      notifications: ""
=======
      friendlist: []
>>>>>>> refs/remotes/origin/MilordDev
    };

    return {
      setUserInfo: function (info,uid) {
        userData = {
          id: uid,
          name: info.name,
          email: info.email,
          birthday: info.birthday,
          points: info.points,
          eventCount: info.eventCount,
          surveyCount: info.surveyCount,
          major: info.major,
          avatar: info.avatar,
          buildcode: info.buildcode,
          description: info.description,
<<<<<<< HEAD
          notifications:info.notifications
=======
          friendlist: info.friendlist
>>>>>>> refs/remotes/origin/MilordDev
        };
        return true;
      },

      getUserInfo: function () {
        return userData;
      }
    };

  }])


  .factory('OtherInfo', [function () {
    var userData = {
       id:"",
      name: "",
      email: "",
      birthday: "",
      points: 0,
      eventCount: 0,
      surveyCount: 0,
      major: "",
      avatar: "",
      buildcode: "",
      description: "",
      friendlist: []
    };

    return {
      setOtherInfo: function (info, uid) {
        userData = {
           id: uid,
          name: info.name,
          email: info.email,
          birthday: info.birthday,
          points: info.points,
          eventCount: info.eventCount,
          surveyCount: info.surveyCount,
          major: info.major,
          avatar: info.avatar,
          buildcode: info.buildcode,
          description: info.description,
          friendlist: info.friendlist
        };
        return true;
      },

      getOtherInfo: function () {
        return userData;
      }
    };

  }])


    .factory('ProfilePress', [function () {
    var aprofile = false;

    return {
      setState: function (info) {
        aprofile = info;
        return true;
      },

      getState: function () {
        return aprofile;
      }
    };

  }])



.factory('openAction', [function () {
    var act = false;

    return {
      setAction: function (info) {
        act = info;
        return true;
      },

      getAction: function () {
        return act;
      }
    };

  }])


.filter('reverseAnything', function() {
  return function(items) {
    console.log("REVERSE ANYTHING!!");
    if(typeof items === 'undefined') { return; }
    return angular.isArray(items) ? 
      items.slice().reverse() : // If it is an array, split and reverse it
      (items + '').split('').reverse().join(''); // else make it a string (if it isn't already), and reverse it
  };
})