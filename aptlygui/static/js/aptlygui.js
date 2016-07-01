/*
 * Copyright 2016 SUB Goettingen
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

var aptlyApiGui = angular.module("aptlyapigui", ['angular.filter']);

aptlyApiGui.controller('ctrl1', function($scope,$http) {

  $scope.deletepackages = {}
  $scope.toggleDeleteSelection = function (repo,key) {
    var idx = $scope.deletepackages[repo].indexOf(key);
    if ( idx > -1) {
      $scope.deletepackages[repo].splice(idx, 1);
    } else {
      $scope.deletepackages[repo].push(key);
    }
  };

  // update the published repos
  $scope.publishUpdate = function () {

    // get all published repos
    $http.get('api/publish').
      success(function(publishedrepos) {
        publishedrepos.forEach(function(pubrepo) {
          // the root prefix is a special case
          if (pubrepo.Prefix == '.') {
            repoprefix = ':.'
          } else {
            repoprefix = pubrepo.Prefix
          }

          console.log('api/publish/'+encodeURIComponent(repoprefix)+'/'+encodeURIComponent(pubrepo.Distribution))

          // re-publish the repo
          $http.put('api/publish/'+encodeURIComponent(repoprefix)+'/'+encodeURIComponent(pubrepo.Distribution), {headers:{'Content-Type':'application/json'}, data:{}}).
            success(function() {
          }).
          error(function() {
            alert('Failed to update published repos!');
          });

        });

      }).
      error(function(publishedrepos, status, headers, config) {
        alert('Failed to load published repos!');
      });

  };

  // check whether package is in a repo
  $scope.containsPackageKey = function(repohash,packagekey) {
    var foundkey = false;
    repohash.forEach(function(onepackage){
      if (onepackage['Key'] == packagekey) {
        foundkey = true;
      };
    });
    return foundkey;
  }

  // API call to copy package to another repo
  $scope.copyPackageToRepo = function (package,targetrepo) {
    // security confirmation
    if (confirm("Really copy "+package.Package+" "+package.Version+" to "+targetrepo+"?")) {
      $http.post('api/repos/'+encodeURIComponent(targetrepo)+'/packages', {"PackageRefs": [package.Key]}).
        success(function() {
          $scope.loadData();
        }).
        error(function() {
          alert("Failed to copy "+package.Package+" "+package.Version+" to "+targetrepo+"!");
        });
    }
  };

  // Check whether a certain repo is writable for the current user
  $scope.writeaccessToRepo = function (repo) {
    var ret = false;
    $scope.repos.forEach(function(onerepo){
      if (onerepo.Name == repo){
        ret = onerepo.Writable;
      }
    });
    return ret;
  };

  // load data from api
  $scope.loadData = function () {
    // get repos
    $http.get('api/repos').
      success(function(data) {
        $scope.repos = data;
        packages = {}

        // for each repo, get the repo details
        $scope.repos.forEach(function(repo) {

            $http.get('api/repos/'+encodeURIComponent(repo.Name)+'/packages?format=details').
              success(function(repodata) {
                packages[repo.Name]=repodata;
                $scope.deletepackages[repo.Name]=[];
              }).
              error(function() {
                alert("Error loading data!!");
              });

        });
        $scope.packages = packages;

      }).
      error(function() {
        alert("Error loading data!!");
      });
    // get user data
    $http.get('api/user').
      success(function(data) {
        $scope.user = data;
      }).
      error(function() {
        alert("Error loading user data!!");
      });
  };

  // initial load
  $scope.loadData();

  // delete single package from a repo
  $scope.deletePackage = function (reponame,package) {
    // security confirmation
    if (confirm("Really delete "+package.Package+" v. "+package.Version+"?")) {
      // API call
      $scope.deletePackagesAPICall(reponame,[package.Key]);
    }
  };

  // delete multiple packages from a repo
  $scope.deletePackages = function (reponame) {
    // security confirmation
    if (confirm("Really delete "+$scope.deletepackages[reponame].length+" packages from repository "+reponame+"?")) {
      // API call
      $scope.deletePackagesAPICall(reponame,$scope.deletepackages[reponame]);
    }
  };

  // delete packages from a repo
  $scope.deletePackagesAPICall = function (reponame,packagerefs) {
    // API call
    $http.delete('api/repos/'+reponame+'/packages', {headers:{'Content-Type':'application/json'}, data:{"PackageRefs": packagerefs}}).
      success(function() {
        $scope.loadData();
      }).
      error(function() {
        alert("Error deleting package!");
      });
  };


});

