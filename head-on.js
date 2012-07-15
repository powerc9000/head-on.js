(function(window, undefined){
	"use strict";
	var headOn = (function(){
		var headOn = {
			registeredObjects: {},
			groups: {},
			register: function(name,values,group){
				this.registeredObjects[name] = values;
				if(typeof group === "string"){
					if(this.groups[group]){
						this.group[group].push(name);
					}
					else{
						this.objectGroup[group] = [name];
					}
				}
				return this;
			}
		};
		return headOn;
	}());
	window.headOn = headOn;
})(window);

