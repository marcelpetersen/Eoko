// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('app', ['ionic', 'app.controllers', 'app.routes', 'app.directives','app.services','firebase','firebaseConfig','ionic.ion.imageCacheFactory','ionic-native-transitions','ngInstafeed','templates',])

.config(function($ionicConfigProvider, $sceDelegateProvider){
  
  ionic.Platform.setPlatform('ios');
  $sceDelegateProvider.resourceUrlWhitelist([ 'self','*://www.youtube.com/**', '*://player.vimeo.com/video/**']);
  //$ionicConfigProvider.scrolling.jsScrolling(false);

})


.config(function($ionicNativeTransitionsProvider){
  $ionicNativeTransitionsProvider.setDefaultOptions({
    duration: 300, // in milliseconds (ms), default 400, 
    slowdownfactor: 1, // overlap views (higher number is more) or no overlap (1), default 4 
    iosdelay: 100, // ms to wait for the iOS webview to update before animation kicks in, default -1 
    androiddelay: 100, // same as above but for Android, default -1 
    winphonedelay: 100, // same as above but for Windows Phone, default -1, 
    fixedPixelsTop: 0, // the number of pixels of your fixed header, default 0 (iOS and Android) 
    fixedPixelsBottom: 0, // the number of pixels of your fixed footer (f.i. a tab bar), default 0 (iOS and Android) 
    triggerTransitionEvent: '$ionicView.beforeEnter', // internal ionic-native-transitions option 
    backInOppositeDirection: false // Takes over default back transition and state back transition to use the opposite direction transition to go back 
  });
})

.config(function($ionicNativeTransitionsProvider){
    $ionicNativeTransitionsProvider.setDefaultTransition({
        type: 'fade'
    });
})

.config(function($ionicNativeTransitionsProvider){
    $ionicNativeTransitionsProvider.setDefaultBackTransition({
        type: 'fade'
    });
})

.config(function(ngInstafeedProvider){
      ngInstafeedProvider.setAccessToken('3085788730.1677ed0.d1d536d1a92f40cab51717419d4cdcbb');
  })


.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {

    setTimeout(function() {
        navigator.splashscreen.hide();
    }, 100);
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})


/*
  This directive is used to disable the "drag to open" functionality of the Side-Menu
  when you are dragging a Slider component.
*/
.directive('disableSideMenuDrag', ['$ionicSideMenuDelegate', '$rootScope', function($ionicSideMenuDelegate, $rootScope) {
    return {
        restrict: "A",  
        controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {

            function stopDrag(){
              $ionicSideMenuDelegate.canDragContent(false);
            }

            function allowDrag(){
              $ionicSideMenuDelegate.canDragContent(true);
            }

            $rootScope.$on('$ionicSlides.slideChangeEnd', allowDrag);
            $element.on('touchstart', stopDrag);
            $element.on('touchend', allowDrag);
            $element.on('mousedown', stopDrag);
            $element.on('mouseup', allowDrag);

        }]
    };
}])

/*
  This directive is used to open regular and dynamic href links inside of inappbrowser.
*/
.directive('hrefInappbrowser', function() {
  return {
    restrict: 'A',
    replace: false,
    transclude: false,
    link: function(scope, element, attrs) {
      var href = attrs['hrefInappbrowser'];

      attrs.$observe('hrefInappbrowser', function(val){
        href = val;
      });
      
      element.bind('click', function (event) {

        window.open(href, '_system', 'location=yes');

        event.preventDefault();
        event.stopPropagation();

      });
    }
  };
});