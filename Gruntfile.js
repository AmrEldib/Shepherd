'use strict';

module.exports = function (grunt) {
    
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            development: {
                files: {
                    './Scripts/shepherd.min.js': ['./Scripts/shepherd.js'],
                    './Scripts/mapExtent.min.js': ['./Scripts/mapExtent.js'],
                    './Scripts/mapPreview.min.js': ['./Scripts/mapPreview.js'],
                    './Scripts/mapQuery.min.js': ['./Scripts/mapQuery.js'],
                },
            },
            options: {
                compress: {
                    drop_console: true
                  }
            }
        },
        cssmin: {
            minify: {
                expand: true,
                cwd: './Content/',
                src: ['bootstrap-theme.css', 'bootstrap.css', 'mapExtent.css', 'shepherd.css'],
                dest: './Content/',
                ext: '.min.css'
            }
        }
    });
    
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    
    grunt.registerTask("default", ['uglify', 'cssmin']);
};