/**
 * ./controllers/patch.js
 * 
 * Usage:
 * 
 * The pkg var is from the parent module.
 * 
 * app.use( "/api", require( './controllers/patch' )( parentInfo, methodOps ) );
 * 
 * See: http://www.restapitutorial.com/lessons/httpmethods.html
 * 
 */

var jsonpatch = require('fast-json-patch'),
	_ssl = require( '../lib/ssl' ),
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
	
	/*
	 * Example call:
	 * 
	 * curl -i -X PATCH -H "Content-Type: application/json-patch" 
	 *   -d '[{"op":"replace","path":"/status","value":"UPDATE PATCH"}]' 
	 *   http://localhost:3010/api/testdoc/547fc48cbbb9e99a1b37dc2e
	 */
	
	router.patch( 
			'/:model/:id', 
			_ssl.isSSL( prefix, methodOps ),
			_rights.isAuthorized( methodOps ), 
			function( req, res, next ) {
				// if( ! req ) if( log )  log.error( "INTERNAL ERROR (patch): req not defined.");
				var model = req.params.model;
				collection = req.collection; // Set by router.param( 'model', ... );
				if( ! collection ) {
					// TODO - should never get here if router.params did job right
					var emsg = "INTERNAL ERROR: router.param let null model collection through.";
					if( log ) log.error( emsg );
					return next( { status:500, message: emsg, type:'internal'} )
				} else {
					
					var obj = u.find( 
							methodOps, 
							function(obj) { return obj.model.toLowerCase() === model.toLowerCase() } );
					var before = obj.before;
					var after  = obj.after;
					
					var send = function( d ) {
						res.status(200).json( d );
					}

					var patch = function( body, source, _extras ) {
						var patches = body;
						jsonpatch.apply( source, patches );
						source.save(function (err) {
							if(err) {
								var emsg = 'ERROR patching document';
								var ex = { status:500, message: emsg, type:'internal'}
								if( log ) log.error( ex );
								return next( ex )
							}
						});
						if( after ) {
							after(
									function( err ) {
										return next( { status:500, message: err.message, type:'internal'} )
									},
									{ 
										req: req, 
										res: res,
										result: source, 
										patches: patches,
										extras: _extras
									}, 
									send );
						} else {
							send( source );
						}
					}
						
					collection.findOne( { _id : req.params.id }, function( err, doc )  {
						if( err ) { 
							var emsg = "Model find error '" + model + "' not found. [2]";
							if( log ) log.error( emsg );
							return next( { status: 404, message: emsg, type:'user'} )
						} else {
							if( before ) {
								before( 
										function( err ) {
											return next( { status:500, message: err.message, type:'internal'} )
										},
										{ req: req, doc: doc }, 
										patch );
							} else {
								patch( req.body, doc, null );
							}
						}
					});
					
				}
	});
	
	// NOTE: We are returning the router here.
	
	return router;
};
