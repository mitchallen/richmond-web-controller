/**
 * rwc.js
 */


var pkg = module.exports = {};

pkg.name    = require("./package").name;
pkg.version = require("./package").version;

var _params = require( './controllers/params' ).parent( pkg );

pkg.install = function( __app, __pkg, __router ) {
	
	__router.param( 'model', _params.model );
	__router.param( 'id',    _params.id );
	
	__app.use( 
			__pkg.prefix(), 
			[ 
			    require( './controllers/get_one'   	)( __pkg, __router ), 
			    require( './controllers/get_many'  	)( __pkg, __router ),
			    require( './controllers/post'  		)( __pkg, __router ), 
			    require( './controllers/del'   		)( __pkg, __router ), 
			    require( './controllers/put'   		)( __pkg, __router ), 
			    require( './controllers/patch' 		)( __pkg, __router ) 
			]
		);
}