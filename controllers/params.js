/**
 * params.js
 */

var _parent = null;

module.exports = {
		
	parent: function( p ) { 
		_parent = p;
		return this;
	}, 
	
	model: function( req, res, next, model ) {
		// store id or other info in req
		var collection = _parent.model( model );
		// return 404 otherwise ???
		if( ! collection ) {
			var emsg = "PARAM: Model '" + model + "' not found. [1]";
			if( _parent.log ) _parent.log.error( emsg );
			res.status(404).json( { error: emsg } );
			return;	// stop
		}
		// call next when done
		req.collection = collection;
		next();
	}, 
	
	id: function( req, res, next, id ) {
		// console.log("DEBUG: params - id");
		// IF ID is invalid methods may return: 
		// CastError: Cast to ObjectId failed for value "<bad id" at path "_id"
		// So need to intercept.
		// TODO: an id of 'thisisabadid' got through as valid ???
		if( ! _parent.mongoose.Types.ObjectId.isValid( req.params.id ) ) {
			var emsg = "PARAM: id '" + req.params.id + "' is not in a valid MongoDB ObjectID format";
			if( _parent.log ) _parent.log.error( emsg );
			res.status(404).json( { error: emsg } );
			return;	// stop
		}
		// call next when done
		// No need to set ID - next function will get from req.param.id
		next();
	}
};
