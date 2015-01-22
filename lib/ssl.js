/**
 * ssl.js
 */

/**
 * ssl.js
 */

var lib = module.exports = {};	// For export

var u = require("underscore");

lib.isSSL = function( prefix, options ) {
	return function(req, res, next) {
		// console.log( "DEBUG: ### isSSL.");;
		if( ! req ) {
			var emsg = "INTERNAL ERROR (isSSL): req not defined.";
			// console.error( emsg );
			return next( { status:500, message: emsg, type:'internal'} )
		}
		var model = req.params.model;		
		var obj = u.find( 
				options, 
				function(obj) { return obj.model.toLowerCase() === model.toLowerCase() } );
		
		var sslStatus = undefined; 
		if( obj ) sslStatus = obj.ssl;
		
		if( sslStatus ) {
			// console.error( req.headers );
			if( req.connection.encrypted || ( req.headers['x-forwarded-proto'] === "https" ) ) {
				// console.log( "OKAY - already SSL." );
				next();
			} else {
				if( sslStatus == 302 ) {
					// console.log( "DEBUG - redirecting to SSL." );
					return res.redirect("https://" + req.headers["host"] + prefix + req.url ); 
				} else if( sslStatus == 404 ) {
					// Instead of redirecting, return not found
					return res.sendStatus( 404 );
				} else {
					var emsg = ("INTERNAL ERROR: Only 302 or 404 allowed for sslStatus.")
					// console.error( emsg );
					return next( { status:500, message: emsg, type:'internal'} )
				}
			}
		} else {
			next();
		}
	}
}

