/**
 * ./controllers/post.js
 * 
 * Usage:
 * 
 * The pkg var is from the parent module.
 * 
 * app.use( "/api", require( './controllers/post' )( parentInfo, methodOps ) );
 * 
 * See: http://www.restapitutorial.com/lessons/httpmethods.html
 * 
 */

var _ssl = require( '../lib/ssl' ),
	_rights = require( '../lib/rights' ),
	u = require("underscore");

module.exports = function ( parentInfo, methodOps ) {
	
	var info = parentInfo || {};	
	var parent = info.parent || {};
	var log = parent.log;
	var router = info.router;
	var prefix = info.prefix;
	// TODO - option for rightsAccess table later
	
	var methodOps  = methodOps || {};
		
	var _routeName = "post";
	
	router.post( 
			'/:model', 
			_ssl.isSSL( prefix, methodOps ),
			_rights.isAuthorized( methodOps ),
			function( req, res, next ) {
				
		model = req.params.model;
		// var collection = parent.model( model );
		var collection = req.collection; // Set by router.param( 'model', ... );
		if( ! collection ) {
			// TODO - should never get here if router.params did job right
			var emsg = "INTERNAL ERROR: router.param let null model collection through.";
			if( log ) log.error( emsg );
			res.status(500).json( { error: emsg } );
			return;
		} else {
			
			var obj = u.find( 
					methodOps, 
					function(obj) { return obj.model.toLowerCase() === model.toLowerCase() } );
			var before = obj.before;
			var after  = obj.after;
			
			function sendDocument( doc ) {
				// log.info( "### POST: sendDocument");
				res
					.location( "/" + model + "/" + doc._id )
					.status(201)	// Created
					.json( doc );	// TODO - this even returns select: false fields
			}
			
			function saveDocument( body, _extras ) {
				// log.info( "DEBUG: Save Document")
				var record = new collection( body );
				if( ! record ) {
					var emsg = "ERROR: Creating new " + model;
					if( log ) log.error( emsg );
					res.status(403).json( { error: emsg } );
					return;
				} else {
					// log.error( "### POST: ABOUT TO SAVE: " + JSON.stringify( body ) );
					record.save( function( err, doc ) {
						if( err ) { 
							var emsg = "ERROR: Can't create new '" + model + "'";
							// Typical - doesn't pass validation, etc.
							if( log ) log.error( emsg );
							var ex = { error: emsg, message: err.message };
							if( log ) log.error( ex );
							res.status(403).json( ex ); 
						} else {
							// log.error( "### POST: setting up AFTER");
							if( after ) {
								after( 
										function( err ) {
											var ex = { status:500, message: err.message, type:'internal'};
											return next( ex )
										},
										{ 
											req: req,
											res: res,
											result: doc, 
											extras: _extras }, 
										sendDocument );
							} else {
								// log.info( "### POST: skipping AFTER, just calling sendDocument")
								sendDocument( doc );
							}
						}
					});
				}
			}
			
			if( before ) {
				before( 
						function( err ) {
							var ex = { status:500, message: err.message, type:'internal'};
							return next( ex );
						},
						{ req: req }, 
						saveDocument )
			} else {
				// log.info( "### POST: skipping BEFORE, just calling saveDocument");
				saveDocument( req.body, null );
			}
		}
	});
		
	// Note that we are returning the router here.
	
	return router;
};
