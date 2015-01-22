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
	_options = ops || {};
	return this;
}

pkg.install = function( _app ) {
	
	var params = require( './controllers/params' ).parent( _parent );
	
	_router.param( 'model', params.model );
	_router.param( 'id',    params.id );
	
	var parentInfo = {
		parent: _parent,
		router: _router,
		prefix: _prefix
	}
	
	if( _options.getOne  ) _controller.push( require( './controllers/get_one'   	)( parentInfo, _options.getOne  ) );
	if( _options.getMany ) _controller.push( require( './controllers/get_many'  	)( parentInfo, _options.getMany ) );
	if( _options.post    ) _controller.push( require( './controllers/post'  		)( parentInfo, _options.post    ) );
	if( _options.del     ) _controller.push( require( './controllers/del'   		)( parentInfo, _options.del     ) );
	if( _options.put     ) _controller.push( require( './controllers/put'   		)( parentInfo, _options.put     ) );
	if( _options.patch   ) _controller.push( require( './controllers/patch' 		)( parentInfo, _options.patch   ) );
	
	if( ! _controller.length ) {
		// If 0 will get TypeError: app.use() requires middleware functions
		throw new Error("richmond-web-controller - activate at least one HTTP route")
	}
	
	_app.use( 
			_parent.prefix(), 
			_controller
		);
}