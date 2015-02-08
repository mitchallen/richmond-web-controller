Richmond Web Controller
========================

Official Demo Web controller for richmond.js
-----------------------------------------------

This package is the official demo Web controller for the __richmond.js__ package.

## Installation

    $ npm init
    $ npm install richmond --save
    $ npm install richmond-web-controller --save

## Usage and Documentation

Because this is the official *demo controller* for the __richmond.js__ core library, it is heavily documented in that package.
You can find the documentation here:

* [Richmond on npm](https://www.npmjs.com/package/richmond) 

## Summary of Features

* Richmond Web Controller
* All requests take the form of: http[s]://host[:port]/*prefix*/*:model*[/*:id*]
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
* Supports SSL
    * __404__ - if a Non-SSL request is made, will return 404 (not found).
    * __302__ - if a Non-SSL request is made, will return 304 (moved) and redirect to the SSL equivalent.
* Supports __richmond.js__ token management.
* Supports rights management through tokens.
* Supports wrappers for intercepting requests *before* and *after* they are made.
    
## Tests

In order to run the tests, you need 
to add two more variables to your environment: __TEST_HOST__ and __TEST_SSL__

For testing, I use the services of https://ngrok.com - for a small annual fee I secured a subdomain
that I can tunnel back to a port on my localhost for testing.  It supports both SSL and Non-SSL.

    # Via ngrok
    export TEST_HOST=http://YOURSUBDOMAIN.ngrok.com
    export TEST_SSL=https://YOURSUBDOMAIN.ngrok.com

Tests assume that mocha has been installed globally.  If not execute the following:

    $ npm install -g mocha

Run the tests in one of the following two ways:

    $ mocha --timeout 20000
    
Or

    $ npm test

The tests generate log files in the projects root folder.

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. Lint and test your code.

## Version History

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

