(function (){
  'use strict';

  var app = angular.module('app',[], function config($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor')
  })

  app.constant('API_URL', 'http://localhost:3001')

  app.controller('MainCtrl', function MainCtrl(RandomUserFactory, UserFactory) {
    'use strict'
    var vm = this;
    vm.getRandomUser = getRandomUser;
    vm.login = login;
    vm.logout = logout;

    // initialization
    UserFactory.getUser().then( response => vm.user = response.data )

    function getRandomUser() {
      RandomUserFactory.getUser()
        .then( response => vm.randomUser = response.data )
        .catch( handleError )
    }

    function login(username, password) {
      UserFactory.login(username, password)
        .then( response => {
          console.log(response.data.token)
          vm.user = response.data.user
        })
        .catch( handleError )
    }

    function logout() {
      UserFactory.logout();
      vm.user = null;
    }

    function handleError(err) {
      console.log("Something bad happened!")
      console.error(err)
    }

  })

  app.factory('RandomUserFactory', function RandomUserFactory($http, API_URL){
    'use strict';

    return { getUser };

    function getUser() {
      return $http.get(API_URL + '/random-user')
    }
  })

  app.factory('UserFactory', function UserFactory($http, API_URL, AuthTokenFactory, $q){
    'use strict';

    return { login, logout, getUser };

    function login(username, password) {
      return $http.post(API_URL + '/login', { username, password })
                  .then( response => {
                    AuthTokenFactory.setToken(response.data.token)
                    return response
                  })
    }

    function logout() {
      AuthTokenFactory.setToken()
    }

    function getUser() {
      if ( AuthTokenFactory.getToken() ) {
        return $http.get(API_URL + '/me')
      }
      else {
        return $q.reject({ data: 'client has no auth token'})
      }
    }

  })

  app.factory('AuthTokenFactory', function AuthTokenFactory($window){
    'use strict';

    const store = $window.localStorage;
    const key = 'auth-token';

    return { getToken, setToken };

    function getToken() {
      return store.getItem(key)
    }

    function setToken(token) {
      if (token) {
        store.setItem(key, token)
      }
      else {
        store.removeItem(key)
      }
    }
  })

  app.factory('AuthInterceptor', function AuthInterceptor(AuthTokenFactory){
    'use strict';

    return {
      request: addToken
    };

    function addToken(config) {
      const token = AuthTokenFactory.getToken()
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = 'Bearer ' + token
      }
      return config;
    }

  })

})();