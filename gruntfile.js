var grunt = require('grunt'),
    gobble = require('gobble'),
    path = require('path');

var rollup = require('rollup');


grunt.loadNpmTasks('grunt-gobble');
grunt.loadNpmTasks('grunt-mocha-test');

function uglify(gob){
  return gobble([
    gob,
    gob.transformIf(uglify, 'uglifyjs', {ext: '.min.js'})
  ]);
}

function compile(dir, fmt, ugly, src, dest) {
  var compiled = gobble(dir).transform('rollup-babel', {
    sourceMap: true,
    entry: src,
    dest: dest,
    format: fmt
  });

  return ugly ? uglify(compiled) : compiled;
}

function compileSrc(fmt, ugly, src){
  return compile('src', fmt, ugly, src || 'frozen-river.js', 'frozen-river.js');
}

function compileCJS(){
  return compileSrc('cjs', true).moveTo('cjs');
}

function compileIIFE(){
  return compileSrc('iife', true, 'global.js').moveTo('global');
}

function compileAllSrc(){
  return gobble([
    compileCJS(),
    compileIIFE(),
    compileSrc('amd', true).moveTo('amd'),
    compileSrc('es6', false).moveTo('es6'),
  ]);
}

function compileBrowserTest(){
  return gobble('test')
    .transform('rollup-babel', {
      sourceMap: true,
      entry: 'instant/instant.spec.js',
      dest: 'browser.spec.js',
      format: 'iife',
      external: ['chai', 'frozen-river']
    });
}

function compileNodeTest(){
  return gobble('test')
    .transform('rollup-babel', {
      sourceMap: true,
      entry: 'instant/instant.spec.js',
      dest: 'node.spec.js',
      format: 'cjs',
      external: ['chai'],
      //todo: this will need replaced with a plugin on the next gobble-rollup-babble upgrade
      resolveExternal: function(id, importer){
        return id === 'frozen-river' ? path.resolve(__dirname, 'src/frozen-river.js') : id;
      }
    });
}

grunt.initConfig({
  gobble: {
    src: {dest: 'dist', force: true, config: compileAllSrc},
    cjs: {dest: 'dist', force: true, config: compileCJS},
    iife: {dest: 'dist', force: true, config: compileIIFE},
    browserTest: {dest: '.compiled-tests', force: true, config: compileBrowserTest},
    nodeTest: {dest: '.compiled-tests', force: true, config: compileNodeTest}
  },
  mochaTest: {
    test: {
      options: {
        reporter: 'spec',
        require: 'babel-core/register'
      },
      src: ['.compiled-tests/node.spec.js']
    }
  }
});

grunt.registerTask('default', ['gobble:src']);
grunt.registerTask('test', ['gobble:cjs', 'gobble:nodeTest', 'mochaTest:test']);
grunt.registerTask('browser-test', ['gobble:iife', 'gobble:browserTest']);
