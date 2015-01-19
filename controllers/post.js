/**
 * ./controllers/post.js
 * 
 * Usage:
 * 
 * The pkg var is from the parent module.
 * 
 * app.use( "/api", require( './controllers/post' )( pkg, _router ) );
 * 
 * See: http://www.restapitutorial.com/lessons/httpmethods.html
 * 
 */

/*
 * To test POST at command line (assuming port, prefix and model name):
 *   curl -X POST -H "Content-Type: application/json" 
 *   -d '{"email":"xyz","status":"xyz"}' http://localhost:3010/api/testdoc
 */

module.exports = function ( parent, _router ) {
		
	var _routeName = "post";
	
	_router.post( 
			'/:model', 
			parent.isSSL(_routeName),
			parent.isAuthorized(_routeName), 
			function( req, res, next ) {
				
		model = req.params.model;
		// var collection = parent.model( model );
		var collection = req.collection; // Set by _router.param( 'model', ... );
		if( ! collection ) {
			// TODO - should never get here if _router.params did job right
			var emsg = "INTERNAL ERROR: _router.param let null model collection through.";
			if( parent.log ) parent.log.error( emsg );
			res.status(500).json( { error: emsg } );
			return;
		} else {
			
			function sendDocument( doc ) {
				// parent.log.info( "### POST: sendDocument");
				res
					.location( "/" + model + "/" + doc._id )
					.status(201)	// Created
					.json( doc );	// TODO - this even returns select: false fields
			}
			
			function saveDocument( body, _extras ) {
				// parent.log.info( "DEBUG: Save Document")
				var record = new collection( body );
				if( ! record ) {
					var emsg = "ERROR: Creating new " + model;
					if( parent.log ) parent.log.error( emsg );
					res.status(403).json( { error: emsg } );
					return;
				} else {
					// parent.log.error( "### POST: ABOUT TO SAVE: " + JSON.stringify( body ) );
					record.save( function( err, doc ) {
						if( err ) { 
							var emsg = "ERROR: Can't create new '" + model + "'";
							// Typical - doesn't pass validation, etc.
							if( parent.log ) parent.log.error( emsg );
							var ex = { error: emsg, message: err.message };
							if( parent.log ) parent.log.error( ex );
							res.status(403).json( ex ); 
						} else {
							// parent.log.error( "### POST: setting up AFTER");
							var after = parent.wrapper.after(_routeName);
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
								// parent.log.info( "### POST: skipping AFTER, just calling sendDocument")
								sendDocument( doc );
							}
						}
					});
				}
			}
			
			// parent.log.error( "### POST: setting up BEFORE");
			var before = parent.wrapper.before(_routeName);
			if( before ) {
				before( 
						function( err ) {
							var ex = { status:500, message: err.message, type:'internal'};
							return next( ex );
						},
						{ req: req }, 
						saveDocument )
			} else {
				// parent.log.info( "### POST: skipping BEFORE, just calling saveDocument");
				saveDocument( req.body, null );
			}
		}
	});
		
	// Note that we are returning the router here.
	
	return _router;
};
