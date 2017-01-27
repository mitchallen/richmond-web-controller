Richmond Web Controller
========================

Official Demo Web controller for richmond.js
-----------------------------------------------

<a href="https://travis-ci.org/mitchallen/richmond-web-controller">
    <img src="https://img.shields.io/travis/mitchallen/richmond-web-controller.svg?style=flat-square" alt="CI">
</a>
<a href="https://codecov.io/gh/mitchallen/richmond-web-controller">
<img src="https://codecov.io/gh/mitchallen/richmond-web-controller/branch/master/graph/badge.svg" alt="Coverage Status">
 </a>
<a href="https://npmjs.org/package/richmond-web-controller">
    <img src="http://img.shields.io/npm/dt/richmond-web-controller.svg?style=flat-square" alt="Downloads">
</a>
<a href="https://npmjs.org/package/richmond-web-controller">
    <img src="http://img.shields.io/npm/v/richmond-web-controller.svg?style=flat-square" alt="Version">
</a>
<a href="https://npmjs.com/package/richmond-web-controller">
    <img src="https://img.shields.io/npm/l/richmond-web-controller.svg?style=flat-square" alt="License"></a>
</a>

This package is the official demo Web controller for the __richmond.js__ package.

## Installation

    $ npm init
    $ npm install richmond --save
    $ npm install richmond-web-controller --save

* * *

## Usage and Documentation

Because this is the official *demo controller* for the __richmond.js__ core library, it is heavily documented in that package.

You can find the documentation here:

* [Richmond on npm](https://www.npmjs.com/package/richmond) 

## Summary of Features

* Richmond Web Controller
* All requests take the form of: __http [ *s* ] ://host [ *:port* ] / *prefix* / *:model* [ / *:id* ]__
    * __port__ is provided by __richmond.js__
    * __prefix__ is provided by __richmond.js__
    * __model__ is the name of the MongoDB collection
    * __id__ is the optional MongoDB id passed in if a request requires it
* Connects to MongoDB
* Supports all HTTP methods:
    * __DELETE__
    * __GET__ - single record (getOne) and collections (getMany)
    * __POST__
    * __PUT__
    * __PATCH__
* Supports requests and responses in JSON format (Content-Type: application/json).
* Supports Multiple Models
* Supports SSL:
    * __404__ - if a Non-SSL request is made, will return 404 (not found).
    * __302__ - if a Non-SSL request is made, will return 302 (moved) and redirect to the SSL equivalent.
* Supports __richmond.js__ token management.
* Supports rights management through tokens.
* Supports wrappers for intercepting requests before and after they are made.

* * *    

## Tests

Run the tests in one of the following two ways:

    $ mocha --timeout 20000
    
Or

    $ npm test

The tests generate log files in a logs/ folder under the projects root folder.

* * *

## Repos

* [bitbucket.org/mitchallen/richmond-web-controller.git](https://bitbucket.org/mitchallen/richmond-web-controller.git)
* [github.com/mitchallen/richmond-web-controller.git](https://github.com/mitchallen/richmond-web-controller.git)

* * *

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. Lint and test your code.

* * *

## Version History

#### Version 0.1.8 release notes

* updated test cases, integrated ngrok, travis-ci, codecov

#### Version 0.1.7 release notes

* Updated test cases to use logs/ folder

#### Version 0.1.6 release notes

* Added new github repo to package.json
* Updated README with repo list

#### Version 0.1.5 release notes

* Refined README

#### Version 0.1.4 release notes

* Updated README to keep in sync with __richmond.js__ core.

#### Version 0.1.3 release notes

* Removed validation of param id (:id)
* mongoose.Types.ObjectId.isValid(req.params.id) is rejecting valid ids
* Bogus test also failed because it said an id of 'thisisabadid' was valid.

#### Version 0.1.2 release notes

* Refactored internal logging.

#### Version 0.1.1 release notes

* Updated repo url

#### Version 0.1.0 release notes

* Initial release

