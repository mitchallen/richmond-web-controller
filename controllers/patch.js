/**
 * ./controllers/patch.js
 * 
 * Usage:
 * 
 * The pkg var is from the parent module.
 * 
 * app.use( "/api", require( './controllers/patch' )( pkg, _router ) );
 * 
 */

var jsonpatch = require('fast-json-patch');

module.exports = function ( parent, _router ) {
	
	/*
	 * Example call:
	 * 
	 * curl -i -X PATCH -H "Content-Type: application/json-patch" 
	 *   -d '[{"op":"replace","path":"/status","value":"UPDATE PATCH"}]' 
	 *   http://localhost:3010/api/testdoc/547fc48cbbb9e99a1b37dc2e
	 */
		
	var _routeName = "patch";
	
	_router.patch( 
			'/:model/:id', 
			parent.rights.getToken,
			parent.isSSL(_routeName),
			parent.isAuthorized(_routeName), 
			function( req, res, next ) {
				// if( ! req ) if( parent.log )  parent.log.error( "INTERNAL ERROR (patch): req not defined.");
				var model = req.params.model;
				collection = req.collection; // Set by _router.param( 'model', ... );
				if( ! collection ) {
					// TODO - should never get here if _router.params did job right
					var emsg = "INTERNAL ERROR: _router.param let null model collection through.";
					if( parent.log ) parent.log.error( emsg );
					return next( { status:500, message: emsg, type:'internal'} )
				} else {
					
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
								if( parent.log ) parent.log.error( ex );
								return next( ex )
							}
						});
						var after = parent.wrapper.after(_routeName);
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
							if( parent.log ) parent.log.error( emsg );
							return next( { status: 404, message: emsg, type:'user'} )
						} else {
							var before = parent.wrapper.before(_routeName);
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
	
	// NOTE: We are returning the _router here.
	
	return _router;
};
