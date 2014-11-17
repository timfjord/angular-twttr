(function(window, angular, undefined) {
  'use strict';

  /**
   * twttr module
   */
  angular.module('Twttr', []).

    /**
     * twttr provider
     */
    provider('twttr', [function() {
      /**
       * This defines the twttr Service on run.
       */
      this.$get = ['$rootScope', '$q', '$window', function($rootScope, $q, $window) {
        /**
         * Create a new scope for listening to broadcasted events,
         * this is for better approach of asynchronous Twitter API usage.
         * @type {Object}
         */
        var twitterScope = $rootScope.$new(),
            deferred  = $q.defer(),
            ready = angular.isDefined($window.twttr.widgets);

        /**
         * Twitter API is ready to use
         * @param  {Object} event
         * @param  {Object} twttr
         */
        twitterScope.$on('twttr:ready', function(event, twttr) {
          ready = true;
          $rootScope.$apply(function() {
            deferred.resolve(twttr);
          });
        });

        /**
         * This is the NgTwttr class to be retrieved on twttr Service request.
         */
        function NgTwttr() {}

        /**
         * Ready state method
         * @return {Boolean}
         */
        NgTwttr.prototype.isReady = function() {
          return ready;
        };

        /**
         * Map widget functions to NgTwttr
         */
        angular.forEach([
          'load',
          'createShareButton',
          'createFollowButton',
          'createHashtagButton',
          'createMentionButton',
          'createTimeline',
          'createTweet'
        ], function(name) {
          NgTwttr.prototype[name] = function() {
            if (this.isReady()) {
              $window.twttr.widgets[name].apply($window.twttr, arguments);
            } else {
              deferred.promise.then(function(twttr) {
                twttr.widgets[name].apply(twttr, arguments);
              });

            }
          };
        });

        return new NgTwttr();
      }];
  }]).

  // Initialization of module
  run(['$rootScope', '$q','$window', function($rootScope, $q, $window) {
    $window.twttr = (function (d,s,id) {
      var t, js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return $window.twttr;
      js = d.createElement(s); js.id=id;
      js.src="https://platform.twitter.com/widgets.js";
      fjs.parentNode.insertBefore(js, fjs);
      return $window.twttr || (t = { _e: [], ready: function(f){ t._e.push(f); } });
    }(document, "script", "twitter-wjs"));

    $window.twttr.ready(function (twttr) {
      $rootScope.$broadcast('twttr:ready', twttr);
      angular.forEach([
        'tweet',
        'follow',
        'retweet',
        'favorite'
      ], function(name) {
        twttr.events.bind(name, function(event) {
          $rootScope.$broadcast('twttr:' + name, event);
        });
      });
    });
  }]);

})(window, angular);
