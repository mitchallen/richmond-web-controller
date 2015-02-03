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
		
	// TODO - consider methodOveride() as an option.
	
	router.delete( 
			'/:model/:id', 
			_ssl.isSSL( prefix, methodOps ), 
			_rights.isAuthorized( methodOps ),
			function(req, res, next) {
		// console.log("DEBUG: del.delete");
		var model = req.params.model;
		collection = req.collection; // Set by router.param( 'model', ... );
		// var collection = parent.model( model );
		if( ! collection ) {
			// TODO - should never get here if router.params did job right
			var emsg = "INTERNAL ERROR: router.param let null model collection through.";
			if( log ) log.error( emsg );
			res.status(404).json( { error: emsg } );
			return;
		} else {	
			
			var obj = u.find( 
					methodOps, 
					function(obj) { return obj.model.toLowerCase() === model.toLowerCase() } );
			var before = obj.before;
			var after  = obj.after;
			
			function send() {
				res.status(200).json( { status: "OK" } );
			}
			
			function find( _extras ) {
				// if( log ) log.debug("del.find")
				collection.findById(req.params.id, function(err, doc) {
					if( ! doc ) {
						// NOTE: If doc is undefined, err may be undefined too.
						var emsg = "No " + model + " found for id = " + req.params.id;
						if( log ) log.error( emsg );
						res.status(404).json( { error: emsg } );
						return;
					} else if( err ) { 
						var emsg = "Model find error '" + model + "'";
						var ex = { error: emsg, message: err.message };
						if( log ) log.error( ex );
						res.status(404).json( ex );
						return;
					} else {
						doc.remove(function(err) { 
							if( err ) {  
								var emsg = "Model remove error '" + model + "'";
								var ex = { error: emsg, message: err.message }
								if( log ) log.error( ex );
								res.status(404).json( ex );
							} else { 
								if( after ) {
									after( 
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
			
			if( before ) {
				before(  
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
