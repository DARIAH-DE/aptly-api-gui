module.exports = function(config) {
  config.set({
    basePath: '..',
    hostname: '127.0.0.1',
    frameworks: ['jasmine'],
    files: [
      'aptlygui/static/js/jquery-1.12.4.min.js',
      'aptlygui/static/js/angular.min.1.5.7.js',
      'aptlygui/static/js/angular-filter.min.0.5.8.js',
      'jstests/lib/angular-mocks.1.5.7.js',
      'aptlygui/static/js/aptlygui.js',
      'jstests/**/*.spec.js'
    ],
    exclude: [
    ],
    reporters: ['progress','junit'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['PhantomJS'],
    captureTimeout: 10000,
    singleRun: true,
    junitReporter: {
      outputFile: 'test-results.xml'
    }
  });
};

