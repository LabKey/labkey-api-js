module.exports = function(grunt)
{
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
                    'src/labkey/theme/assets/js/src/lib/**/*.ts',
                    'src/labkey/theme/assets/js/src/typedoc/Application.ts',
                    'src/labkey/theme/assets/js/src/typedoc/components/**/*.ts',
                    'src/labkey/theme/assets/js/src/typedoc/services/**/*.ts',
                    'src/labkey/theme/assets/js/src/typedoc/utils/**/*.ts',
                    'src/labkey/theme/assets/js/src/~bootstrap.ts'
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
                        'src/labkey/theme/assets/js/lib/jquery-2.1.1.min.js',
                        'src/labkey/theme/assets/js/lib/underscore-1.6.0.min.js',
                        'src/labkey/theme/assets/js/lib/backbone-1.1.2.min.js',
                        'src/labkey/theme/assets/js/lib/lunr.min.js',
                        'src/labkey/theme/assets/js/main.js'
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
                    cwd: 'src/labkey/theme/assets/css',
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
                    cwd: 'src/labkey/theme',
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