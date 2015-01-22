/**
 * rights.js
 */

var lib = module.exports = {};

var u = require("underscore");

var _roles = [ "none", "admin", "user", "public" ],
    // _rights = [],
	// jwt = require('jwt-simple'),
	// _richmond = require('@minja/richmond'),
    _secret = null,
    // TODO - make rightsAccess a parameter that can be passed in.
    // TODO - could leave this as default
    _rightsAccess = {
    		// rights : [ roles that can access ]
    		"admin"  : [ "admin" ],
    		"user"   : [ "admin", "user" ],
    		"public" : [ "admin", "user", "public" ]
    };


lib.secret = function( s ) {
	_secret = s;
}

/*
lib.validateRouteName = function( routeName ) {
	if( ! routeName ) {
		console.error("ERROR: route name can't be null.");
		return null;
	} else if( routeName.match(/\s+/) ) {
		console.error( "ERROR: route name must not contain whitepace" );
		return null;
	} 
	return routeName.toLowerCase();
};
*/

lib.validateRole = function( role ) {
	if( ! role ) {
		console.error("ERROR: role name can't be null.");
		return null;
	} else if( role.match(/\s+/) ) {
		console.error( "ERROR: role name must not contain whitepace" );
		return null;
	} 
	role = role.toLowerCase();
	if( _roles.indexOf( role.toLowerCase() ) < 0 ) {
		console.error( "ERROR: role TYPE '" + role + "' NOT FOUND.");
		return null;
	}
	return role;
};

lib.hasRights = function( rights, role ) {
	return ( _rightsAccess[ rights.toLowerCase() ].indexOf( role.toLowerCase() ) >= 0 );
}

lib.getRights = function( model, methodOps /* modelName, routeName */ ) {
	
	var obj = u.find( 
			methodOps, 
			function(obj) { return obj.model.toLowerCase() === model.toLowerCase() } );
	
	var rights = undefined; 
	
	if( obj ) rights = obj.rights.toLowerCase();
	
	return rights;
	
	/*
	// modelName = _richmond.normalizeModelName( modelName );
	// routeName = lib.validateRouteName( routeName );
	if( ! _rights[ modelName.toLowerCase() ] ) { 
		// console.log( "WARNING ### model name not found in rights: " + modelName );
		return null; 
	}
	return _rights[ modelName.toLowerCase() ][ routeName.toLowerCase() ];
	*/
};

/*
// TODO - phase out
lib.add = function( modelName, routeName, role ) {
	role = lib.validateRole( role );
	// modelName = _richmond.normalizeModelName( modelName );
	// routeName = lib.validateRouteName( routeName );		
	if( _rights[ modelName ] == null ) _rights[ modelName ] = [];
	_rights[ modelName ][ routeName] = role.toLowerCase();
	return this;
};
*/

// TODO - move where parent can access
// Used by parent app: app.use( _controller.rights.getToken );
lib.getToken = function (req, res, next) {
	// console.log( "DEBUG: ### CALLING getToken.");
	if( ! req ) {
		var emsg = "INTERNAL ERROR (getToken): req not defined.";
		// console.error( emsg );
		return next( { status:500, message: emsg, type:'internal'} )
	}
	if( req.headers['x-auth'] ) {
		try { 
			if( _secret ) {
				req.token = jwt.decode( req.headers['x-auth'], _secret );
			} else {
				var emsg = "ERROR: secret is null, can't decode token. See: .secret()" ;
				// console.error( emsg );
				return next( { status:500, message: emsg, type:'internal'} )
			}
			// console.log( "TOKEN: " + JSON.stringify( req.token ) );
		} catch( ex ) {
			// If secret doesn't match, will get error:
			//   [Error: Signature verification failed]
			// If a bad token string may return:
			//   [Error: Not enough or too many segments]
			// If slightly hacked token:
			//   [SyntaxError: Unexpected token]
			var emsg = "ERROR: jwt.decode: " + ex ;;
			// console.error( emsg );
			return next( { status:500, message: emsg, type:'internal'} )
		}
	}
	next();
};

lib.isAuthorized = function( methodOps /* routeName */ ) {
	return function(req, res, next) {
		// console.log( "DEBUG: ### CALLING isAuthorized");
		if( ! req ) {
			var emsg = "INTERNAL ERROR (isAuthorized): req not defined.";
			// console.error( emsg );
			return next( { status:500, message: emsg, type:'internal'} )
		}
		var model = req.params.model;
		var token = req.token;
		// console.log( "DEBUG: MODEL: " + model );
		var rights = lib.getRights( model, methodOps /* model, routeName.toLowerCase() */ );
		if( ! rights ) {
			var emsg = "*-*-* NO ACCESS *-*-*";
			// console.error( emsg );
			return next( { status:403, message: emsg, type:'authorization'} )
		}
		
		// console.log( "DEBUG: rights: " + rights );
						
		// TODO - hard code ("public") could be issue for dynamic rights
		if( rights.toLowerCase() === "public") {
			if( ! next ) {
				throw new Error("next is not defined.");
			}
			return next();
		}
		
		// Need for non=public access
		
		if( ! token ) {
				var emsg = "Request Error: Missing token";
				// console.error( emsg );
				return next( { status:401, message: emsg, type:'internal'} )
		} 
		
		if( ! token ) {
			var emsg = "You must be logged in to access resource."
			// console.error( emsg );
			return next( { status:401, message: emsg, type:'authorization'} )
		}

		if( ! token.role ) {
			var emsg = "ROLE NOT DEFINED";
			// console.error( emsg );
			return next( { status:401, message: emsg, type:'authorization'} )
		}
		
		if( lib.hasRights( rights, token.role ) ) {
			return next();
		} 
		
		var emsg = "ACCESS DENIED.";
		// console.error( emsg );
		return next( { status:401, message: emsg, type:'authorization'} )
	};
}

