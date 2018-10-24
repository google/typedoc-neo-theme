module.exports = function(grunt)
{
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        ts: {
            themeDefault: {
                options: {
                    sourceMap: false,
                    module: 'amd',
                    basePath: 'themes',
                    declaration: false
                },
                src: [
                    'third_party/src/default/assets/js/src/lib/**/*.ts',
                    'third_party/src/default/assets/js/src/typedoc/Application.ts',
                    'third_party/src/default/assets/js/src/typedoc/components/**/*.ts',
                    'third_party/src/default/assets/js/src/typedoc/services/**/*.ts',
                    'third_party/src/default/assets/js/src/typedoc/utils/**/*.ts',
                    'third_party/src/default/assets/js/src/~bootstrap.ts'
                ],
                out: 'third_party/src/default/assets/js/main.js'
            }
        },
        uglify: {
            themeDefault: {
                options: {
                    mangle: false
                },
                files: {
                    'bin/default/assets/js/main.js': [
                        'third_party/src/default/assets/js/lib/jquery-2.1.1.min.js',
                        'third_party/src/default/assets/js/lib/underscore-1.6.0.min.js',
                        'third_party/src/default/assets/js/lib/backbone-1.1.2.min.js',
                        'third_party/src/default/assets/js/lib/lunr.min.js',
                        'third_party/src/default/assets/js/main.js'
                    ]
                }
            }
        },
        sass: {
            options: {
                style: 'compact',
                unixNewlines: true
            },
            themeDefault: {
                files: [{
                    expand: true,
                    cwd: 'third_party/src/default/assets/css',
                    src: '**/*.sass',
                    dest: 'bin/default/assets/css',
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
                src: 'bin/**/*.css',
                dest: './'
            }
        },
        copy: {
            plugin: {
              files: [{
                expand: true,
                cwd: 'third_party/src',
                src: ['*.js'],
                dest: 'bin'
              }]
            },
            themeDefault: {
                files: [{
                    expand: true,
                    cwd: 'third_party/src/default',
                    src: ['**/*.hbs', '**/*.png'],
                    dest: 'bin/default'
                }]
            },
        },
        watch: {
            js: {
                files: ['third_party/src/default/assets/js/src/**/*.ts'],
                tasks: ['js']
            },
            css: {
                files: ['third_party/src/default/assets/css/**/*'],
                tasks: ['css']
            },
            default: {
                files: ['third_party/src/default/**/*.hbs'],
                tasks: ['copy']
            }
        }
    });


    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-ts');

    grunt.registerTask('css', ['sass', 'autoprefixer']);
    grunt.registerTask('js', ['ts:themeDefault', 'uglify']);
    grunt.registerTask('default', ['copy', 'css', 'js']);
};
