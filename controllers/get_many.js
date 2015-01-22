/**
 * ./controllers/get_many.js
 * 
 * Usage:
 * 
 * The pkg var is from the parent module.
 * 
 * app.use( "/api", require( './controllers/get_many' )( parentInfo, methodOps ) );
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
	
	var methodOps = methodOps || {};
		
	router.get( 
			'/:model', 
			_ssl.isSSL( prefix, methodOps ),
			_rights.isAuthorized( methodOps ), 
			function( req, res, next ) {
				var model = req.params.model;
				collection = req.collection; // Set by router.param( 'model', ... );
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

					function send( docs ) {
						// If no change, sends 304 Not Modified (See: If-Modified-Since)
						res.status(200).json( docs );
					}
			
					function find( _filter, _fields, _extras, _options ) {
				
						var filter = {};
						if( _filter ) {
							// NOTE: where string must use double quotes or JSON.parse will throw error
							// if( log ) log.info( "DEBUG: FILTER = " + req.query.filter );
							try {
								filter = JSON.parse( _filter );
							} catch( ex ) {
								var emsg = "FILTER field parsing error";
								if( log ) log.error( emsg );
								if( log ) log.error( ex );
								res.status(403).json( { error: emsg } );
								return;
							}	
						}
						var fields = '';
						if( _fields ) {
							// log.info( "DEBUG: FIELDS = " + req.query.fields );
							fields = _fields;
						}
						var options = {};
						if( _options ) {
							// NOTE: where string must use double quotes or JSON.parse will throw error
							// log.info( "DEBUG: OPTIONS = " + req.query.options );
							try {
								options = JSON.parse( _options );
							} catch( ex ) {
								var emsg = "OPTIONS field parsing error";
								if( log ) log.error( emsg );
								if( log ) log.error( ex );
								res.status(403).json( { error: emsg } );
								return;
							}	
						}
				
						// MyModel.find( filter (query), fields, { sort: { ... }, skip: 10, limit: 5 }, function(err, results)
						collection.find( filter, fields, options, function( err, docs )  {
							if( err ) { 
								var emsg = "Model find error '" + model + "' not found. [2]";
								if( log ) log.error( emsg );
								if( log ) log.error( err );
								// return next( err );
								res.status(404).json( { error: emsg, message: err.message } );
							} else {
								if( after ) {
									after(
											function( err ) {
												return next( { status:500, message: err.message, type:'internal'} )
											},
											{ req: req, res: res, docs: docs, extras: _extras }, 
											send );
								} else {
									send( docs );
								}
							}
						});
					}
						
					if( before ) {
						before(
								function( err ) {
									var ex = { status:500, message: err.message, type:'internal'}
									return next( ex )
								},
								{ req: req }, 
								find );
					} else {
						find( 
								req.query.filter, 
								req.query.fields, 
								null,
								req.query.options );
					}

				}
			});
	
		// NOTE: We are returning the router here.
	
		return router;
};




