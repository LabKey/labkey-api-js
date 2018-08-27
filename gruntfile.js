module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        ts: {
            themeDefault: {
                options: {
                    sourceMap: false,
                    module: 'amd',
                    rootDir: 'themes',
                    declaration: false
                },
                src: [
                    'theme/assets/js/src/lib/**/*.ts',
                    'theme/assets/js/src/typedoc/Application.ts',
                    'theme/assets/js/src/typedoc/components/**/*.ts',
                    'theme/assets/js/src/typedoc/services/**/*.ts',
                    'theme/assets/js/src/typedoc/utils/**/*.ts',
                    'theme/assets/js/src/~bootstrap.ts'
                ],
                out: 'docs/assets/js/main.js'
            }
        },
        uglify: {
            themeDefault: {
                options: {
                    mangle: false
                },
                files: {
                    'docs/assets/js/main.js': [
                        'theme/assets/js/lib/jquery-2.1.1.min.js',
                        'theme/assets/js/lib/underscore-1.6.0.min.js',
                        'theme/assets/js/lib/backbone-1.1.2.min.js',
                        'theme/assets/js/lib/lunr.min.js',
                        'theme/assets/js/main.js'
                    ]
                }
            }
        },
        sass: {
            dist: {
                options: {
                    style: 'compact',
                    unixNewlines: true
                },
                files: [{
                    expand: true,
                    cwd: 'theme/assets/css',
                    src: '**/*.sass',
                    dest: 'docs/assets/css',
                    ext: '.css'
                }]
            }
        },
        autoprefixer: {
            options: {
                cascade: false
            },
            themeDefault: {
                expand: true,
                src: 'docs/**/*.css',
                dest: './'
            }
        },
        copy: {
            themeDefault: {
                files: [{
                    expand: true,
                    cwd: 'theme',
                    src: ['**/*.png'],
                    dest: 'docs'
                }]
            }
        }
    });


    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-ts');

    grunt.registerTask('css', ['sass', 'autoprefixer']);
    grunt.registerTask('js', ['ts:themeDefault', 'uglify']);
    grunt.registerTask('default', ['copy', 'css', 'js']);
};