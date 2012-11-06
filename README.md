modernizr-bl
============

*NOTE: This project is in the early development state*

Modernizr ported to [BEM](http://bem.info) methodology.

>Modernizr is a JavaScript library that detects HTML5 and CSS3 features in the
user’s browser.

Code based on Modernizr version 2.6.2.

For documentation about using Modernizr, see http://modernizr.com/

---

Project Structure and Usage
---------------------------

All library's parts (feature detectors) are splitted as independent modules
(*block's elements* in [BEM terminolody](http://bem.info/method/definitions/)),
e.g. `i-modernizr__webgl.js`. So you could create a bundle with library, that
include only parts that you need.

If only parts we need are library's core (block in BEM terminolody) and a couply
detectors, e.g. `webgl`, `webgl-extensions` and `file-api`. So we could declare
them as dependencies in our project's blocks level.

```shell
› tree prj/

prj/
  ├ modernizr-bl/
  |   ├ common.blocks/
  |   |   ├ i-modernizr/
  |   |   |   ├ __webgl/
  |   |   |   |   ├ ...
  |   |   |   ├ ...
  |   |   |   └ i-modernizr.js
  |   ├ common.bundles/
  |   |   ├ i-modernizr/
  |   |   |   ├ ...
  ├ blocks/
  |   ├ i-modernizr/
  |   |   └ i-modernizr.deps.js
  └ ...

› cat prj/blocks/i-modernizr/i-modernizr.deps.js

({
  mustDeps: {
    elems: [
      'webgl',
      'webgl-extensions',
      'file-api'
    ];
  }
})
```

To create your bundle you should use `modernizr-bl/common.blocks` and `blocks`
levels while building:

```shell
› bem build -T js \
  -l modernizr-bl/common.blocks \
  -l blocks ...
```

`i-modernizr/common.bundles` is prebuiled bundle, that includes all the library
parts as single block file, so you could use it if you are happy with this.

*Note*: you should use `modernizr-bl/common.bundles` level **insted of**
`common.blocks` for this.

