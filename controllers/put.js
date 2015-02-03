/**
 * ./controllers/put.js
 * 
 * Usage:
 * 
 * The pkg var is from the parent module.
 * 
 * app.use( "/api", require( './controllers/put' )( parentInfo, methodOps ) );
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
		
	router.put( 
			'/:model/:id', 
			_ssl.isSSL( prefix, methodOps ),
			_rights.isAuthorized( methodOps ), 
			function( req, res, next ) {
		var model = req.params.model;
		var id    = req.params.id;  // Validated by params.id - but may not exist
		collection = req.collection; // Set by router.param( 'model', ... );
		// var collection = parent.model( model );
		if( ! collection ) {
			// TODO - should never get here if router.params did job right
			var emsg = "INTERNAL ERROR: router.param let null model collection through.";
			if( log ) log.error( emsg );
			res.status(500).json( { error: emsg } );
		} else {
			if( ! id ) {
				var emsg = "INTERNAL ERROR: router.id let null ID through";
				if( log ) log.error( emsg );
				res.status(500).json( { error: emsg } );
				return;
			} else {
				
				var obj = u.find( 
						methodOps, 
						function(obj) { return obj.model.toLowerCase() === model.toLowerCase() } );
				var before = obj.before;
				var after  = obj.after;
				
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
							if( log ) log.error( err );
							return res.status(403).json( { error: err.message } );
						} else {
							if( after ) {
								after( 
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
				
				if( before ) {
					before(  
						{ req: req }, 
						update );
				} else {
					// TODO - look at options (second param)
					update( req.body, {}, null );
				}
			}
		}
	});
	
	// NOTE: We are returning the router here.
	
	return router;
};


