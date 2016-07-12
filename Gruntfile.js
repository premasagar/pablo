module.exports = function(grunt) {
  grunt.initConfig({
      pkg : grunt.file.readJSON('package.json'),

      jshint: {
        files: ['Gruntfile.js', '<%= pkg.name %>.js'],
        options: {
          globals: {
            window: true
          },
          esnext: true
        }
      },
      uglify: {
        options: {
          report: 'gzip', // Report minified size
          banner: '/*  <%= pkg.name %> v<%= pkg.version %> (<%= grunt.template.today("yyyy-mm-dd") %>) */\n\n'
        },
        build: {
          src: '<%= pkg.name %>.js',
          dest: 'build/<%= pkg.name %>.min.js',
          options: {
              sourceMap: 'build/<%= pkg.name %>.min.map',
              sourceMappingURL: '<%= pkg.name %>.min.map',
              preserveComments: 'some'
          }
        }
      },
      mocha: {
          test: {
            src: ['tests/index.html'],
            options: {
              // log console output
              log: true,
              mocha: {
                ignoreLeaks: false,
                // stop on first failed test
                bail: true
              }
            }
          }
      },
      watch: {
          js: {
              files: ['<%= pkg.name %>.js', 'tests/**'],
              tasks: ['test'],
              options: {
                spawn: false
              }
          }
      }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-notify');

  grunt.registerTask('test', ['jshint', 'mocha']);
  grunt.registerTask('build', ['test', 'uglify']);
  grunt.registerTask('default', ['build']);
};
