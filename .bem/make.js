/*global MAKE:true */

"use strict";

var PATH = require('path'),
    BEM = require('bem'),
    Q = BEM.require('qq'),

    U = BEM.util,

    COMMON_LEVEL = 'common';


MAKE.decl('Arch', {

    bundlesLevelsRegexp : /^(.+?\.bundles)$/,

    createCustomNodes : function(common) {

        var node = new (MAKE.getNodeClass('Convert'))({
                id : 'convert',
                root : this.root
            });

        this.arch.setNode(node, common);

        return node.getId();

    }

});


MAKE.decl('Convert', 'Node', {

    __constructor : function(opt) {

        this.__base(opt);
        this.root = opt.root;

    },

    make : function() {

        var _this = this,
            block = 'i-modernizr',
            prj = BEM.createLevel(this.root);

        Q.all(['blocks', 'bundles'].map(function(tech) {
                return prj.getTech(tech).createByDecl({ block : COMMON_LEVEL }, prj, { force : false });
            }))
            .fin(function() {
                _this.proccess(prj, block);
            })
            .end();

    },

    proccess : function(prj, name) {

        var _this = this,
            prefix = 'tmp',
            index = 'modernizr.js',
            lib = 'feature-detects',

            level = BEM.createLevel(prj.getRelPathByObj({ block : COMMON_LEVEL }, 'blocks')),

            jsTech = level.getTech('js'),
            depsTech = level.getTech('deps.js');

        Q.all([
            (function() {

                return U.readFile(PATH.resolve(this.root, prefix, index)).then(function(data) {
                    var prefix = level.getByObj({ block : name });

                    jsTech.storeCreateResults(prefix, { js : data }, true);
                });

            }).call(_this),

            (function() {

                var libPath = PATH.resolve(this.root, prefix, lib);

                return U.getFiles(libPath)
                    .filter(function(f) {
                        return ~f.indexOf('.js');
                    })
                    .forEach(function(f) {

                        U.readFile(PATH.join(libPath, f)).then(function(data) {
                            var prefix = level.getByObj({ block : name, elem : PATH.basename(f, '.js') });

                            return Q.all(
                                jsTech.storeCreateResults(prefix,
                                        { 'js' : data }, true),
                                depsTech.storeCreateResults(prefix,
                                        { 'deps.js' :
                                            ('(' + JSON.stringify({ mustDeps : name }, null, 4) + ');\n') }, true)
                                );
                        });

                    });

            }).call(_this)
        ])
        .then(function() {

            return Q.step(
                function() {

                    var decl = BEM.createLevel(prj.getRelPathByObj({ block : COMMON_LEVEL }, 'blocks'))
                            .getItemsByIntrospection()
                            .map(function(item) {
                                return { block : item.block, elem : item.elem };
                            });

                    return decl;

                },

                function(decl) {

                    var bundles = BEM.createLevel(prj.getRelPathByObj({ block : COMMON_LEVEL }, 'bundles')),
                        prefix = bundles.getByObj({ block : name }),
                        tech = bundles.getTech('bemdecl.js');

                    return tech.storeCreateResults(prefix,
                            { 'bemdecl.js': ('exports.blocks = ' + JSON.stringify(decl, null, 4) + ';\n') }, true);

                }
            );

        })
        .fail(console.log)
        .end();
    }

}, {

    createId : function(opt) {

        return opt.id;

    }

});


MAKE.decl('BundleNode', {

    run : function(ctx) {

        var node = this.id,
            lock = ctx.arch.withLock(function() {
                ctx.arch.addParents(node, 'convert');
            });

        this.__base.apply(this, arguments);

        return lock;

    },

    getTechs : function() {

        return [
            'bemdecl.js',
            'deps.js',
            'js'
            ];

    },

    getOptimizerTechs : function() {

        return [];

    },

    getLevels : function() {

        return [PATH.resolve(this.root, 'common.blocks')];

    }

});
