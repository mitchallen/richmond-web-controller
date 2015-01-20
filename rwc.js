/**
 * rwc.js
 */


var pkg = module.exports = {};

pkg.name    = require("./package").name;
pkg.version = require("./package").version;

var _parent = null;
var _router = null;
var _controller = [];

pkg.parent = function( p ) {
	_parent = p;
	return this;
}

pkg.router = function( r ) {
	_router = r;
	return this;
}

var _getOne = false;

pkg.getOne = function() {
	_getOne = true;
	return this;
}

var _getMany = false;

pkg.getMany = function() {
	_getMany = true;
	return this;
}

var _post = false;

pkg.post = function() {
	_post = true;
	return this;
}

var _del = false;

pkg.del = function() {
	_del = true;
	return this;
}

var _put = false;

pkg.put = function() {
	_put = true;
	return this;
}

var _patch = false;

pkg.patch = function() {
	_patch = true;
	return this;
}

pkg.install = function( _app ) {
	
	var _params = require( './controllers/params' ).parent( _parent );
	
	_router.param( 'model', _params.model );
	_router.param( 'id',    _params.id );
	
	if( _getOne  ) _controller.push( require( './controllers/get_one'   	)( _parent, _router ) )
	if( _getMany ) _controller.push( require( './controllers/get_many'  	)( _parent, _router ) );
	if( _post    ) _controller.push( require( './controllers/post'  		)( _parent, _router ) );
	if( _del     ) _controller.push( require( './controllers/del'   		)( _parent, _router ) );
	if( _put     ) _controller.push( require( './controllers/put'   		)( _parent, _router ) );
	if( _patch   ) _controller.push( require( './controllers/patch' 		)( _parent, _router ) );
	
	// TODO - exception if _controller.length = 0;
	// If 0 will get TypeError: app.use() requires middleware functions
	
	_app.use( 
			_parent.prefix(), 
			_controller
		);
}