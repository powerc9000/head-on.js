(function(){

	function headOn(width,height){
		return new headOn.fn.init()
	}
	var registeredObjects = {};

	headOn.fn = headOn.prototype = {
		init: function(){
			return this
		},



		entity: function(name, values){
			registeredObjects[name] = values;
		}

		run: function(){
			
		}

	};

}())


