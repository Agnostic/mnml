module.exports = function(grunt) {

    grunt.initConfig({
        concat: {
            options: {
                separator: ';',
            },
            dist: {
                src: ['src/mnml-src.js', 'src/libs/**'],
                dest: 'dist/mnml.js',
            },
        },
        uglify: {
            dist: {
                files: {
                    'dist/mnml.min.js': ['dist/mnml.js']
                }
            }
        },
        watch: {
            files: ['src/mnml-src.js'],
            tasks: ['concat', 'uglify']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('default', ['concat', 'uglify', 'watch']);
};