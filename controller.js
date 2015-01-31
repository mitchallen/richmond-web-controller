/**
 * controller.js
 */

function Controller() {
	this.name    = require("./package").name;
	this.version = require("./package").version;
	this.parent = null,
	this.router = null,
	this.prefix = null,
	this.controller = [],
	this.options = {};
}

module.exports = Controller; // For export

Controller.prototype.clear = function() {
	this.controller = [];
	return this;
}

Controller.prototype.parent = function( p ) {
	this.parent = p;
	return this;
}

Controller.prototype.router = function( r ) {
	this.router = r;
	return this;
}

Controller.prototype.prefix = function( p ) {
	this.prefix = p;
	return this;
}

Controller.prototype.setup = function( ops ) {
	this.options = ops || {};
	return this;
}

Controller.prototype.install = function( app ) {
	
	var params = require( './controllers/params' ).parent( this.parent );
	
	this.router.param( 'model', params.model );
	this.router.param( 'id',    params.id );
	
	var parentInfo = {
		parent: this.parent,
		router: this.router,
		prefix: this.prefix
	}
	
	if( this.options.getOne  ) this.controller.push( require( './controllers/get-one'   	)( parentInfo, this.options.getOne  ) );
	if( this.options.getMany ) this.controller.push( require( './controllers/get-many'  	)( parentInfo, this.options.getMany ) );
	if( this.options.post    ) this.controller.push( require( './controllers/post'  		)( parentInfo, this.options.post    ) );
	if( this.options.del     ) this.controller.push( require( './controllers/del'   		)( parentInfo, this.options.del     ) );
	if( this.options.put     ) this.controller.push( require( './controllers/put'   		)( parentInfo, this.options.put     ) );
	if( this.options.patch   ) this.controller.push( require( './controllers/patch' 		)( parentInfo, this.options.patch   ) );
	
	if( ! this.controller.length ) {
		// If 0 will get TypeError: app.use() requires middleware functions
		throw new Error("richmond-web-controller - activate at least one HTTP route")
	}
	
	app.use( 
			this.parent.prefix(), 
			this.controller
		);
}