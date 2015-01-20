/**
 * ./controllers/put.js
 * 
 * Usage:
 * 
 * The pkg var is from the parent module.
 * 
 * app.use( "/api", require( './controllers/put' )( pkg, _router, ops ) );
 * 
 * See: http://www.restapitutorial.com/lessons/httpmethods.html
 * 
 */

module.exports = function ( parent, _router, ops ) {
	
	var options = ops || {};
	
	var _routeName = "put";
		
	_router.put( 
			'/:model/:id', 
			parent.isSSL(_routeName),
			parent.isAuthorized(_routeName), 
			function( req, res, next ) {
		var model = req.params.model;
		var id    = req.params.id;  // Validated by params.id - but may not exist
		collection = req.collection; // Set by _router.param( 'model', ... );
		// var collection = parent.model( model );
		if( ! collection ) {
			// TODO - should never get here if _router.params did job right
			var emsg = "INTERNAL ERROR: _router.param let null model collection through.";"INTERNAL ERROR: _router.param let null model collection through."
			if( parent.log ) parent.log.error( emsg );
			res.status(500).json( { error: emsg } );
		} else {
			// TODO add error callback.
			if( ! id ) {
				var emsg = "INTERNAL ERROR: _router.id let null ID through";
				if( parent.log ) parent.log.error( emsg );
				res.status(500).json( { error: emsg } );
				return;
			} else {
				
				function send() {
					res.sendStatus(204);	// 204 - not returning data
				}
				
				function update( body, options, _extras ) {
					// TODO - does a merge - not very RESTful at the moment?
					collection.update({
						_id : req.params.id
					}, {
						$set : body
					}, 
					options, // options
					function(err, numAffected) {
						// numAffected is the number of updated documents
						if (err) {
							if( parent.log ) parent.log.error( err );
							return res.status(403).json( { error: err.message } );
						} else {
							var after = parent.wrapper.after(_routeName);
							if( after ) {
								after( 
									function( err ) {
										return next( { status:500, message: err.message, type:'internal'} )
									}, 
									{ 
										req: req, 
										res: res,
										numAffected: numAffected,
										extras: _extras }, 
									send );
							} else {
								send();
							}
						}
					});
				}
				
				var before = parent.wrapper.before(_routeName);
				if( before ) {
					before( 
						function( err ) {
							return next( { status:500, message: err.message, type:'internal'} )
						}, 
						{ req: req }, 
						update );
				} else {
					// TODO - look at options (second param)
					update( req.body, {}, null );
				}
			}
		}
	});
	
	// NOTE: We are returning the _router here.
	
	return _router;
};


