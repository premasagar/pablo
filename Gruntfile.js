module.exports = function(grunt) {
  grunt.initConfig({
      pkg : grunt.file.readJSON('package.json'),

      jshint: {
        files: ['Gruntfile.js', '<%= pkg.name %>.js'],
        options: {
          globals: {
            window: true
          }
        }
      },
      uglify: {
        options: {
          banner: '/*! <%= pkg.name %> v<%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
        },
        build: {
          src: '<%= pkg.name %>.js',
          dest: 'build/<%= pkg.name %>.min.js',
          options: {
              sourceMap: 'build/<%= pkg.name %>.map'
          }
        }
      },
      watch: {
          js: {
              files: ['<%= pkg.name %>.js'],
              tasks: ['jshint', 'uglify'],
              options: {
                spawn: false
              }
          }
      }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('test', ['jshint']);
  grunt.registerTask('default', ['jshint', 'uglify']);
};
