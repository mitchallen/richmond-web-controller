/**
 * controller.js
 */

function Controller() {
	this.name    = require("./package").name;
	this.version = require("./package").version;
	this._parent = null,
	this._router = null,
	this._prefix = null,
	this._controller = [],
	this._options = {};
}

module.exports = Controller; // For export

Controller.prototype.clear = function() {
	this._controller = [];
	return this;
}

Controller.prototype.parent = function( p ) {
	this._parent = p;
	return this;
}

Controller.prototype.router = function( r ) {
	this._router = r;
	return this;
}

Controller.prototype.prefix = function( p ) {
	this._prefix = p;
	return this;
}

Controller.prototype.setup = function( ops ) {
	this._options = ops || {};
	return this;
}

Controller.prototype.install = function( app ) {

	var params = require( './controllers/params' ).parent( this._parent );
	
	this._router.param( 'model', params.model );
	this._router.param( 'id',    params.id );
	
	var info = {
		parent: this._parent,
		router: this._router,
		prefix: this._prefix
	}
	
	if( this._options.getOne  ) {
	   this._controller.push( require( './controllers/get-one'   	)( info, this._options.getOne  ) );
	}
	if( this._options.getMany ) {
	   this._controller.push( require( './controllers/get-many'  	)( info, this._options.getMany ) );
	}
	if( this._options.post    ) {
	   this._controller.push( require( './controllers/post'  		)( info, this._options.post    ) );
	}
	if( this._options.del     ) {
	   this._controller.push( require( './controllers/del'   		)( info, this._options.del     ) );
	}
	if( this._options.put     ) {
	   this._controller.push( require( './controllers/put'   		)( info, this._options.put     ) );
    }
	if( this._options.patch   ) {
	   this._controller.push( require( './controllers/patch' 		)( info, this._options.patch   ) );
	}
	
	if( ! this._controller.length ) {
		// If 0 will get TypeError: app.use() requires middleware functions
		throw new Error("richmond-web-controller - activate at least one HTTP route")
	}
	
	app.use( 
			this._parent.prefix(), 
			this._controller
		);
}