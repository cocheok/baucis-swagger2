//Module with helper functions for building Swagger parameters metadata 
var utils = require('./utils');

function getParamId() {
    return {
        name: 'id',
        in: 'path',
        description: 'The identifier of the resource.',
        type: 'string',
        required: true
      };
}
function getParamXBaucisUpdateOperator() {
    return {
        name: 'X-Baucis-Update-Operator',
        in: 'header',
        description: '**BYPASSES VALIDATION** May be used with PUT to update the document using $push, $pull, or $set. [doc](https://github.com/wprl/baucis/wiki/HTTP-Headers)',
        type: 'string',
        required: false
      };
}
function getParamSkip() {
    return {
        name: 'skip',
        in: 'query',
        description: 'How many documents to skip. [doc](https://github.com/wprl/baucis/wiki/Query-String-Parameters#skip)',
        type: 'integer',
        format: 'int32',
        required: false
      };
}
function getParamLimit() {
    return {
        name: 'limit',
        in: 'query',
        description: 'The maximum number of documents to send. [doc](https://github.com/wprl/baucis/wiki/Query-String-Parameters#limit)',
        type: 'integer',
        format: 'int32',
        required: false
      };
}
function getParamCount() {
    return {
        name: 'count',
        in: 'query',
        description: 'Set to true to return count instead of documents. [doc](https://github.com/wprl/baucis/wiki/Query-String-Parameters#count)',
        type: 'boolean',
        required: false
      };
}
function getParamConditions() {
    return {
        name: 'conditions',
        in: 'query',
        description: 'Set the conditions used to find or remove the document(s). [doc](https://github.com/wprl/baucis/wiki/Query-String-Parameters#conditions)',
        type: 'string',
        required: false
      };
}
function getParamSort() {
    return {
        name: 'sort',
        in: 'query',
        description: 'Set the fields by which to sort. [doc](https://github.com/wprl/baucis/wiki/Query-String-Parameters#sort)',
        type: 'string',
        required: false
      };
}
function getParamSelect() {
    return {
      name: 'select',
      in: 'query',
      description: 'Select which paths will be returned by the query. [doc](https://github.com/wprl/baucis/wiki/Query-String-Parameters#select)',
      type: 'string',
      required: false
    };
}  
function getParamPopulate() {
    return {
      name: 'populate',
      in: 'query',
      description: 'Specify which paths to populate. [doc](https://github.com/wprl/baucis/wiki/Query-String-Parameters#populate)',
      type: 'string',
      required: false
    };
}  
function getParamDistinct() {
    return {
        name: 'distinct',
        in: 'query',
        description: 'Set to a path name to retrieve an array of distinct values. [doc](https://github.com/wprl/baucis/wiki/Query-String-Parameters#distinct)',
        type: 'string',
        required: false
      };
}
function getParamHint() {
    return {
        name: 'hint',
        in: 'query',
        description: 'Add an index hint to the query (must be enabled per controller). [doc](https://github.com/wprl/baucis/wiki/Query-String-Parameters#hint)',
        type: 'string',
        required: false
      };
}
function getParamComment() {
    return {
        name: 'comment',
        in: 'query',
        description: 'Add a comment to a query (must be enabled per controller). [doc](https://github.com/wprl/baucis/wiki/Query-String-Parameters#comment)',
        type: 'string',
        required: false
      };
}

function getParamRef(name) {
	return {
		$ref: '#/parameters/' + name
	};
}

function getParamDocument(isPost, controller) {
    // TODO post body can be single or array
    return {
        name: 'document',
        in: 'body',
        description: (isPost) ?
           'Create a document by sending the paths to be added in the request body.' :
           'Update a document by sending the paths to be updated in the request body.',
        schema: {
          $ref: '#/definitions/' + utils.capitalize(controller.model().singular()),
        }, 
        required: true
      };
}    

// Generate parameter list for operations
function generateOperationParameters(isInstance, verb, controller) {
    var parameters = [];

    if (isInstance) {
	  addOperationSingularParameters(verb, parameters);
    }
    else {
	  addOperationCollectionParameters(verb, parameters);
    }
    addPostParameters(verb, controller, parameters);
    addPutParameters(verb, controller, parameters);

    return parameters;
}

function addOperationSingularParameters(verb, parameters) {
    if (verb === 'put') {
      parameters.push(getParamRef('X-Baucis-Update-Operator'));
    }
}
function addOperationCollectionParameters(verb, parameters) {
	if (verb === 'get') {
		parameters.push(getParamRef('count'));
	}
	if (verb === 'get' || verb === 'delete') {
		parameters.push(
				  getParamRef('skip'),
				  getParamRef('limit'),
				  getParamRef('conditions'),
				  getParamRef('distinct'),
				  getParamRef('hint'),
				  getParamRef('comment')
	              );
	}		
}
function addPostParameters(verb, controller, parameters) {
    if (verb === 'post') {
      parameters.push(getParamDocument(true, controller));
    }
}
function addPutParameters(verb, controller, parameters) {
    if (verb === 'put') {
      parameters.push(getParamDocument(false, controller));
    }
}

// Generate parameter list for path: common for several operations
function generatePathParameters(isInstance) {
    var parameters = [];
    
    // Parameters available for singular and plural routes
    parameters.push(getParamRef('select'), 
                    getParamRef('populate'));

    if (isInstance) {
      // Parameters available for singular routes
      addPathSingularParameters(parameters);
    }
    else {
	  addPathCollectionParameters(parameters);
    }
    return parameters;
}

function addPathSingularParameters(parameters) {
	// Parameters available for singular routes
	 parameters.push(getParamRef('id'));
}
function addPathCollectionParameters(parameters) {
	// Common Parameters available for plural routes 
	parameters.push(
				getParamRef('sort'));
}
function generateCommonParams() {
	var parameters = {};
	parameters.id = getParamId();
	parameters.skip = getParamSkip();
	parameters.limit = getParamLimit();
	parameters.count = getParamCount();
	parameters.conditions = getParamConditions();
	parameters.sort = getParamSort();
	parameters.distinct = getParamDistinct();
	parameters.hint = getParamHint();
	parameters.comment = getParamComment();
	parameters.select = getParamSelect();
	parameters.populate = getParamPopulate();
	parameters['X-Baucis-Update-Operator'] = getParamXBaucisUpdateOperator();	
	return parameters;
}

module.exports = {
	generateOperationParameters : generateOperationParameters,
	generatePathParameters : generatePathParameters,
	generateCommonParams : generateCommonParams 
};