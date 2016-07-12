describe('first unit tests', function() {

  beforeEach(angular.mock.module('aptlyapigui'));

  var $controller;

  beforeEach(inject(function(_$controller_){
    // https://docs.angularjs.org/guide/unit-testing
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $controller = _$controller_;
  }));

  describe('$scope.deletepackages', function() {
    it('can add a package', function() {
      var $scope = {};
      var controller = $controller('ctrl1', { $scope: $scope });
      $scope.deletepackages['repo']=[];
      $scope.toggleDeleteSelection('repo','packagekey');
      expect($scope.deletepackages).toEqual({'repo':['packagekey']});
    });
  });

});

