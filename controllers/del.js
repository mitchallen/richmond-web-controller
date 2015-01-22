/**
 * ./controllers/del.js
 * 
 * Usage:
 * 
 * The pkg var is from the parent module.
 * 
 * app.use( "/api", require( './controllers/del' )( parentInfo, methodOps ) );
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
		
	// TODO - consider methodOveride() as an option.
	
	var _routeName = "delete";
	
	router.delete( 
			'/:model/:id', 
			// parent.isSSL(_routeNameByModelId),
			_ssl.isSSL( prefix, methodOps ), 
			parent.isAuthorized(_routeName), 
			function(req, res, next) {
		// console.log("DEBUG: del.delete");
		var model = req.params.model;
		collection = req.collection; // Set by router.param( 'model', ... );
		// var collection = parent.model( model );
		if( ! collection ) {
			// TODO - should never get here if router.params did job right
			var emsg = "INTERNAL ERROR: router.param let null model collection through.";"INTERNAL ERROR: router.param let null model collection through."
			if( parent.log ) parent.log.error( emsg );
			res.status(404).json( { error: emsg } );
			return;
		} else {	
			
			function send() {
				res.status(200).json( { status: "OK" } );
			}
			
			function find( _extras ) {
				// if( parent.log ) parent.log.debug("del.find")
				collection.findById(req.params.id, function(err, doc) {
					if( ! doc ) {
						// NOTE: If doc is undefined, err may be undefined too.
						var emsg = "No " + model + " found for id = " + req.params.id;
						if( parent.log ) parent.log.error( emsg );
						res.status(404).json( { error: emsg } );
						return;
					} else if( err ) { 
						var emsg = "Model find error '" + model + "'";
						var ex = { error: emsg, message: err.message };
						if( parent.log ) parent.log.error( ex );
						res.status(404).json( ex );
						return;
					} else {
						doc.remove(function(err) { 
							if( err ) {  
								var emsg = "Model remove error '" + model + "'";
								var ex = { error: emsg, message: err.message }
								if( parent.log ) parent.log.error( ex );
								res.status(404).json( ex );
							} else { 
								var after = parent.wrapper.after(_routeName);
								if( after ) {
									after( 
										function( err ) {
											return next( { status:500, message: err.message, type:'internal'} );
										},
										{ req: req, res: res, extras: _extras }, 
										send );
								} else {
									send();
								}
							} 	
						});   
					};
				});
			}
			
			var before = parent.wrapper.before(_routeName);
			if( before ) {
				before(  
					function( err ) {
						return next( { status:500, message: err.message, type:'internal'} )
					},
					{ req: req }, 
					find );
			} else {
				find( null );
			}
		}
	});
	
	// NOTE: We are returning the router here.
	
	return router;
};
