angular.module('app.routes', ['ionicUIRouter'])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider




  .state('tabsController.profile', {
    url: '/profilePage',
    nativeTransitions: {
        type: "fade"
    },
    params: {
    'avatarClicked': 'false'
},
	    views: {
      'tab1': {
        templateUrl: 'templates/profile.html',
        controller: 'profileCtrl'
      }
    }
  })


  .state('tabsController.events', {
    url: '/EventPage',
    nativeTransitions: {
        type: "fade"
    },
    views: {
      'tab2': {
        templateUrl: 'templates/events.html',
        controller: 'eventsCtrl'
      }
    }
  })

  .state('tabsController.connect', {
    url: '/connectPage',
    nativeTransitions: {
        type: "fade"
    },
    views: {
      'tab3': {
        templateUrl: 'templates/connect.html',
        controller: 'connectCtrl'
      }
    }
  })

  .state('tabsController.buildingEvents', {
    url: '/buildingEventPage',
    nativeTransitions: {
        type: "fade"
    },
    views: {
      'tab4': {
        templateUrl: 'templates/buildingEvents.html',
        controller: 'buildingEventsCtrl'
      }
    }
  })

  .state('tabsController.info', {
    url: '/infoPage',
    nativeTransitions: {
        type: "fade"
    },
    views: {
      'tab5': {
        templateUrl: 'templates/info.html',
        controller: 'infoCtrl'
      }
    }
  })

  .state('tabsController', {
    url: '/page1',
    nativeTransitions: {
        type: "fade"
    },
    templateUrl: 'templates/tabsController.html',
    abstract:true
  })

  .state('home', {
    url: '/homePage',
    nativeTransitions: {
        type: "fade"
    },
    templateUrl: 'templates/home.html',
    controller: 'homeCtrl'
  })

  .state('signup', {
    url: '/signupPage',
    nativeTransitions: {
        type: "fade"
    },
    templateUrl: 'templates/signup.html',
    controller: 'signupCtrl'
  })

  .state('login', {
    url: '/loginPage',
    nativeTransitions: {
        type: "fade"
    },
    templateUrl: 'templates/login.html',
    controller: 'loginCtrl'
  })




    .state('getNamePage', {
    url: '/namePage',
    nativeTransitions: {
        type: "fade"
    },
    templateUrl: 'templates/getNamePage.html',
    controller: 'getNamePageCtrl'
  })

  .state('getCodePage', {
    url: '/codePage',
    nativeTransitions: {
        type: "fade"
    },
    params: {
    userinfo: {firstname:"",lastname:"", email: "", password: "", buildcode: "" }
},
    templateUrl: 'templates/getCodePage.html',
    controller: 'getCodePageCtrl'
  })

  .state('getDescriptionPage', {
    url: '/descriptionPage',
    nativeTransitions: {
        type: "fade"
    },
    templateUrl: 'templates/getDescriptionPage.html',
    controller: 'getDescriptionPageCtrl'
  })

  .state('getSocialPage', {
    url: '/socialPage',
    nativeTransitions: {
        type: "fade"
    },
    templateUrl: 'templates/getSocialPage.html',
    controller: 'getSocialPageCtrl'
  })

  .state('getPicturePage', {
    url: '/picturePage',
    nativeTransitions: {
        type: "fade"
    },
    templateUrl: 'templates/getPicturePage.html',
    controller: 'getPicturePageCtrl'
  })

  .state('notificationPage', {
    url: '/notifications',
    nativeTransitions: {
        type: "fade"
    },
    templateUrl: 'templates/notificationPage.html',
    controller: 'notificationPageCtrl'
  })

  .state('chatTab', {
    url: '/chatTab',
    nativeTransitions: {
        type: "fade"
    },
    templateUrl: 'templates/chatTab.html',
    controller: 'chatTabCtrl'
  })

  .state('chatPage', {
    url: '/chatPage',
    nativeTransitions: {
        type: "fade"
    },
    params: {
    otherID: "",
    convoID: ""
},
    templateUrl: 'templates/chatPage.html',
    controller: 'chatPageCtrl'
  })

$urlRouterProvider.otherwise('/homePage')



});
