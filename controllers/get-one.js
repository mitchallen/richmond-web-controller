/**
 * ./controllers/get=one.js
 * 
 * Usage:
 * 
 * 	var methodOps =  [ 
 * 	   	{ model: modelName[0], rights: "PUBLIC", ssl: 302 },
 * 		{ model: modelName[1], rights: "PUBLIC" } 
 * 	];
 * 
 * app.use( "/api", require( './controllers/get-one' )( parentInfo, methodOps ) );
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
			
	router.get( 
			'/:model/:id', 
			_ssl.isSSL( prefix, methodOps ),
			_rights.isAuthorized( methodOps ),
			function( req, res, next ) {
				var model = req.params.model;
				collection = req.collection; // Set by router.param( 'model', ... );
				if( ! collection ) {
					// Should never get here if router.params did job right
					var emsg = "INTERNAL ERROR: router.param let null model collection through.";
					if( log ) log.error( emsg );
					res.status(404).json( { error: emsg } );
				} else {
					
					var obj = u.find( 
							methodOps, 
							function(obj) { return obj.model.toLowerCase() === model.toLowerCase() } );
					var before = obj.before;
					var after  = obj.after;
			
					function send( doc ) {
						// If no change, sends 304 Not Modified (See: If-Modified-Since)
						res.status(200).json( doc );
					}
			
					function find( _fields, _extras ) {
						var fields = '';
						if( _fields ) {
							// log.info( "DEBUG: FIELDS = " + _fields );
							fields = _fields;
						}
						collection.findOne( { _id : req.params.id }, fields, function( err, doc )  {
							if( err ) { 
								var emsg = "Model find error '" + model + "' not found. [2]";
								if( log ) log.error( emsg );
								if( log ) log.error( err );
								// return next( err );
								return res.status(404).json( { error: emsg, message: err.message } );
							} else {
								if( after ) {
									after( 
											function( err ) {
												return next( { status:500, message: err.message, type:'internal'} )
											},
											{ req: req, res: res, doc: doc, extras: _extras }, 
											send );
								} else {
									send( doc );
								}
							}
						});
					}
			
					var onErr = function( err ) {
						if( log ) log.error( err.message );
						res.status(500).json( err )
						return; 
					}
			
					if( before ) {
						before( 
								function( err ) {
									return next( { status:500, message: err.message, type:'internal'} )
								},
								{ req: req }, 
								find );
					} else {
						find( req.query.fields, null );
					}
				}
			});
	
		// NOTE: We are returning the router here.
	
		return router;
};




