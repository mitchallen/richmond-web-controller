/**
 * rwc.js
 */


var pkg = module.exports = {};

pkg.name    = require("./package").name;
pkg.version = require("./package").version;

var _parent = null,
	_router = null,
	_prefix = null,
	_controller = [],
	_options = {};

pkg.clear = function() {
	_controller = [];
	return this;
}

pkg.parent = function( p ) {
	_parent = p;
	return this;
}

pkg.router = function( r ) {
	_router = r;
	return this;
}

pkg.prefix = function( p ) {
	_prefix = p;
	return this;
}

pkg.setup = function( ops ) {
	options = ops || {};
	return this;
}

pkg.install = function( _app ) {
	
	var _params = require( './controllers/params' ).parent( _parent );
	
	_router.param( 'model', _params.model );
	_router.param( 'id',    _params.id );
	
	if( options.getOne  ) _controller.push( require( './controllers/get_one'   	)( _parent, _router, _prefix, options.getOne  ) );
	if( options.getMany ) _controller.push( require( './controllers/get_many'  	)( _parent, _router, _prefix, options.getMany ) );
	if( options.post    ) _controller.push( require( './controllers/post'  		)( _parent, _router, _prefix, options.post    ) );
	if( options.del     ) _controller.push( require( './controllers/del'   		)( _parent, _router, _prefix, options.del     ) );
	if( options.put     ) _controller.push( require( './controllers/put'   		)( _parent, _router, _prefix, options.put     ) );
	if( options.patch   ) _controller.push( require( './controllers/patch' 		)( _parent, _router, _prefix, options.patch   ) );
	
	if( ! _controller.length ) {
		// If 0 will get TypeError: app.use() requires middleware functions
		throw new Error("richmond-web-controller - activate at least one HTTP route")
	}
	
	_app.use( 
			_parent.prefix(), 
			_controller
		);
}