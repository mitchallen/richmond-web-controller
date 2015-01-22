/**
 * ./controllers/get_one.js
 * 
 * Usage:
 * 
 * The pkg var is from the parent module.
 * 
 * app.use( "/api", require( './controllers/get_one' )( parentInfo, methodOps ) );
 * 
 * See: http://www.restapitutorial.com/lessons/httpmethods.html
 * 
 */

var _ssl = require( '../lib/ssl' );

module.exports = function ( parentInfo, methodOps ) {
	
	var info = parentInfo || {};
	
	var parent = info.parent;
	var router = info.router;
	var prefix = info.prefix;
	
	// TODO - phase out
	var _routeNameByModelId = "get_by_model_id";
	
	router.get( 
			'/:model/:id', 
			// parent.isSSL(_routeNameByModelId),
			_ssl.isSSL( prefix, methodOps ),
			parent.isAuthorized(_routeNameByModelId),  
			function( req, res, next ) {
		var model = req.params.model;
		collection = req.collection; // Set by router.param( 'model', ... );
		if( ! collection ) {
			// TODO - should never get here if router.params did job right
			var emsg = "INTERNAL ERROR: router.param let null model collection through.";"INTERNAL ERROR: router.param let null model collection through."
			if( parent.log ) parent.log.error( emsg );
			res.status(404).json( { error: emsg } );
		} else {
			
			function send( doc ) {
				// If no change, sends 304 Not Modified (See: If-Modified-Since)
				res.status(200).json( doc );
			}
			
			function find( _fields, _extras ) {
				var fields = '';
				if( _fields ) {
					// parent.log.info( "DEBUG: FIELDS = " + _fields );
					fields = _fields;
				}
				collection.findOne( { _id : req.params.id }, fields, function( err, doc )  {
					if( err ) { 
						var emsg = "Model find error '" + model + "' not found. [2]";
						if( parent.log ) parent.log.error( emsg );
						if( parent.log ) parent.log.error( err );
						// return next( err );
						return res.status(404).json( { error: emsg, message: err.message } );
					} else {
						var after = parent.wrapper.after(_routeNameByModelId);
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
				if( parent.log ) parent.log.error( err.message );
				res.status(500).json( err )
				return; 
			}
			
			var before = parent.wrapper.before(_routeNameByModelId);
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




