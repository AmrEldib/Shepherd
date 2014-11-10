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
        }
    });
    
    grunt.loadNpmTasks("grunt-contrib-uglify");
    
    grunt.registerTask("default", ['uglify']);
};