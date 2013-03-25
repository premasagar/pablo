module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: '../<%= pkg.name %>.js',
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },
    jshint: {
      src: '<%= pkg.name %>.js',
      options: {
        curly: true
      },
      globals: {
        document: true,
        window: true
      }
    }
  });

  // Load the plugin that provides the "jshint" task.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'uglify']);

};
