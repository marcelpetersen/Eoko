angular.module('app.routes', ['ionicUIRouter'])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider




  .state('tabsController.profile', {
    url: '/profilePage',
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
    views: {
      'tab2': {
        templateUrl: 'templates/events.html',
        controller: 'eventsCtrl'
      }
    }
  })

  .state('tabsController.connect', {
    url: '/connectPage',
    views: {
      'tab3': {
        templateUrl: 'templates/connect.html',
        controller: 'connectCtrl'
      }
    }
  })

  .state('tabsController.buildingEvents', {
    url: '/buildingEventPage',
    views: {
      'tab4': {
        templateUrl: 'templates/buildingEvents.html',
        controller: 'buildingEventsCtrl'
      }
    }
  })

  .state('tabsController.info', {
    url: '/infoPage',
    views: {
      'tab5': {
        templateUrl: 'templates/info.html',
        controller: 'infoCtrl'
      }
    }
  })

  .state('tabsController', {
    url: '/page1',
    templateUrl: 'templates/tabsController.html',
    abstract:true
  })

  .state('home', {
    url: '/homePage',
    templateUrl: 'templates/home.html',
    controller: 'homeCtrl'
  })

  .state('signup', {
    url: '/signupPage',
    templateUrl: 'templates/signup.html',
    controller: 'signupCtrl'
  })

  .state('login', {
    url: '/loginPage',
    templateUrl: 'templates/login.html',
    controller: 'loginCtrl'
  })




    .state('getNamePage', {
    url: '/namePage',
    templateUrl: 'templates/getNamePage.html',
    controller: 'getNamePageCtrl'
  })

  .state('getCodePage', {
    url: '/codePage',
    params: {
    userinfo: {firstname:"",lastname:"", email: "", password: "", buildcode: "" }
},
    templateUrl: 'templates/getCodePage.html',
    controller: 'getCodePageCtrl'
  })

  .state('getDescriptionPage', {
    url: '/descriptionPage',
    templateUrl: 'templates/getDescriptionPage.html',
    controller: 'getDescriptionPageCtrl'
  })

  .state('getSocialPage', {
    url: '/socialPage',
    templateUrl: 'templates/getSocialPage.html',
    controller: 'getSocialPageCtrl'
  })

  .state('getPicturePage', {
    url: '/picturePage',
    templateUrl: 'templates/getPicturePage.html',
    controller: 'getPicturePageCtrl'
  })

$urlRouterProvider.otherwise('/homePage')



});
