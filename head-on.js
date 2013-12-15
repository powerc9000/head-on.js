//	__  __			  __					 _	
//	/ / / /__  ____ _____/ /	____  ____	 (_)____
//   / /_/ / _ \/ __ `/ __  /_____/ __ \/ __ \	/ / ___/
//  / __  /  __/ /_/ / /_/ /_____/ /_/ / / / /   / (__  ) 
// /_/ /_/\___/\__,_/\__,_/	 \____/_/ /_(_)_/ /____/  
//										  /___/		
					
(function(window, undefined){
	"use strict";
	var headOn = (function(){
		var vectorProto;
		var headOn = {

				groups: {},
				_images: {},
				fps: 50,
				imagesLoaded: true,
				gameTime: 0,
				_update:"",
				_render:"",
				_ticks: 0,

				randInt: function(min, max) {
					return Math.floor(Math.random() * (max +1 - min)) + min;
				},
				randFloat: function(min, max) {
					return Math.random() * (max - min) + min
				},
				events: {
					events: {},
					listen: function(eventName, callback){
						if(!this.events[eventName]){
							this.events[eventName] = [];
						}
						this.events[eventName].push(callback);
					},
					
					trigger: function(eventName){
						var args = [].splice.call(arguments, 1),
							e = this.events[eventName],
							l,
							i;
						if(e){
							l = e.length;
							for(i = 0; i < l; i++){
								e[i].apply(headOn, args);
							}
						}
						
					}
				},
				animate: function(object,keyFrames,callback){
					var that, interval, currentFrame = 0;
					if(!object.animating){
						object.animating = true;
						object.image = keyFrames[0];
						that = this;

						interval = setInterval(function(){
							if(keyFrames.length === currentFrame){
								callback();
								object.animating = false;
								object.image = "";
								clearInterval(interval);
							}
							else{
								currentFrame += 1;
								object.image = keyFrames[currentFrame];
							}
						},1000/this.fps);
					}
					
					
					
				},

				update: function(cb){this._update = cb},

				render: function(cb){this._render = cb},

				entity: function(values, parent){
					var i, o, base;
					if (parent && typeof parent === "object") {
						o = Object.create(parent);
					}
					else{
						o = {};
					}
					for(i in values){
						if(values.hasOwnProperty(i)){
							o[i] = values[i];
						}
					}
					return o;
				},

				collides: function(poly1, poly2) {
					var points1 = this.getPoints(poly1),
						points2 = this.getPoints(poly2),
						i = 0,
						l = points1.length,
						j, k = points2.length,
						normal = {
							x: 0,
							y: 0
						},
						length,
						min1, min2,
						max1, max2,
						interval,
						MTV = null,
						MTV2 = null,
						MN = null,
						dot,
						nextPoint,
						currentPoint;

					//loop through the edges of Polygon 1
					for (; i < l; i++) {
						nextPoint = points1[(i == l - 1 ? 0 : i + 1)];
						currentPoint = points1[i];

						//generate the normal for the current edge
						normal.x = -(nextPoint[1] - currentPoint[1]);
						normal.y = (nextPoint[0] - currentPoint[0]);

						//normalize the vector
						length = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
						normal.x /= length;
						normal.y /= length;

						//default min max
						min1 = min2 = -1;
						max1 = max2 = -1;

						//project all vertices from poly1 onto axis
						for (j = 0; j < l; ++j) {
							dot = points1[j][0] * normal.x + points1[j][1] * normal.y;
							if (dot > max1 || max1 === -1) max1 = dot;
							if (dot < min1 || min1 === -1) min1 = dot;
						}

						//project all vertices from poly2 onto axis
						for (j = 0; j < k; ++j) {
							dot = points2[j][0] * normal.x + points2[j][1] * normal.y;
							if (dot > max2 || max2 === -1) max2 = dot;
							if (dot < min2 || min2 === -1) min2 = dot;
						}

						//calculate the minimum translation vector should be negative
						if (min1 < min2) {
							interval = min2 - max1;

							normal.x = -normal.x;
							normal.y = -normal.y;
						} else {
							interval = min1 - max2;
						}

						//exit early if positive
						if (interval >= 0) {
							return false;
						}

						if (MTV === null || interval > MTV) {
							MTV = interval;
							MN = {
								x: normal.x,
								y: normal.y
							};
						}
					}

					//loop through the edges of Polygon 2
					for (i = 0; i < k; i++) {
						nextPoint = points2[(i == k - 1 ? 0 : i + 1)];
						currentPoint = points2[i];

						//generate the normal for the current edge
						normal.x = -(nextPoint[1] - currentPoint[1]);
						normal.y = (nextPoint[0] - currentPoint[0]);

						//normalize the vector
						length = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
						normal.x /= length;
						normal.y /= length;

						//default min max
						min1 = min2 = -1;
						max1 = max2 = -1;

						//project all vertices from poly1 onto axis
						for (j = 0; j < l; ++j) {
							dot = points1[j][0] * normal.x + points1[j][1] * normal.y;
							if (dot > max1 || max1 === -1) max1 = dot;
							if (dot < min1 || min1 === -1) min1 = dot;
						}

						//project all vertices from poly2 onto axis
						for (j = 0; j < k; ++j) {
							dot = points2[j][0] * normal.x + points2[j][1] * normal.y;
							if (dot > max2 || max2 === -1) max2 = dot;
							if (dot < min2 || min2 === -1) min2 = dot;
						}

						//calculate the minimum translation vector should be negative
						if (min1 < min2) {
							interval = min2 - max1;

							normal.x = -normal.x;
							normal.y = -normal.y;
						} else {
							interval = min1 - max2;


						}

						//exit early if positive
						if (interval >= 0) {
							return false;
						}
					
						if (MTV === null || interval > MTV) MTV = interval;
						if (interval > MTV2 || MTV2 === null) {
							MTV2 = interval;
							MN = {
								x: normal.x,
								y: normal.y
							};
						}
					}

					return {
						overlap: MTV2,
						normal: MN
					};

				},

				getPoints: function (obj){
					var x = obj.position.x,
						y = obj.position.y,
						width = obj.width,
						height = obj.height,
						angle = obj.angle,
						that = this,
						points = [];

					points[0] = [x,y];
					points[1] = [];
					points[1].push(Math.sin(-angle) * height + x);
					points[1].push(Math.cos(-angle) * height + y);
					points[2] = [];
					points[2].push(Math.cos(angle) * width + points[1][0]);
					points[2].push(Math.sin(angle) * width + points[1][1]);
					points[3] = [];
					points[3].push(Math.cos(angle) * width + x);
					points[3].push(Math.sin(angle) * width + y);
						//console.log(points);
					return points;

				},

				
				pause: function(){
					this.paused = true;
					this.events.trigger("pause");
				},
				unpause: function(){
					this.events.trigger("unpause");
					this.paused = false;
				},
				isPaused: function(){
					return this.paused;
				},
				group: function(groupName, entity){
					if(this.groups[groupName]){
						if(entity){
							this.groups[groupName].push(entity);
						}
					}
					else{
						this.groups[groupName] = [];
						if(entity){
							this.groups[groupName].push(entity);
						}
					}
					return this.groups[groupName];
				},

				loadImages: function(imageArray, imgCallback, allCallback){
					var args, img, total, loaded, timeout, interval, that, cb, imgOnload;
					that = this;
					this.imagesLoaded = false;
					total = imageArray.length;
					if(!total){
						this.imagesLoaded = true;
					}
					loaded = 0;
					imgOnload = function(){
						loaded += 1;
						imgCallback && imgCallback(image.name);
						if(loaded === total){
							allCallback && allCallback();
							that.imagesLoaded = true;
						}
					}
					imageArray.forEach(function(image){
						img = new Image();
						img.src = image.src;
						img.onload = imgOnload
					
						that._images[image.name] = img;
					});
				},
				images: function(image){
					if(this._images[image]){
						return this._images[image];
					}
					else{
						return new Image();
					}
				},
				onTick: function(then){
					var now = Date.now(),
					modifier = now - then;
				  	this.trueFps = 1/(modifier/1000);
					this._ticks+=1;
					this._update(modifier, this._ticks);
					this._render(modifier, this._ticks);
					this.gameTime += modifier;

				},

				timeout: function(cb, time, scope){
					setTimeout(function(){
						cb.call(scope);
					}, time)
				},

				interval: function(cb, time, scope){
					return setInterval(function(){
						cb.call(scope);
					}, time);
				},
				canvas: function(name){
					if(this === headOn){
						return new this.canvas(name);
					}
					this.canvas = this.canvases[name];
					this.width = this.canvas.width;
					this.height = this.canvas.height;
					return this;
				},

				Vector: function(x, y){
					var vec = this.entity({x:x,y:y}, vectorProto);
					return vec;
				},
				run: function(){
					var that = this;
					var then = Date.now();

					window.requestAnimationFrame(aniframe);
					function aniframe(){
						if(that.imagesLoaded){
							that.onTick(then);
							then = Date.now();

						}
						window.requestAnimationFrame(aniframe);
					}
					
				}
		};

		headOn.canvas.create = function(name,width,height){
			var canvas, ctx;
			canvas = document.createElement("canvas");
			canvas.width = width;
			canvas.height = height;
			ctx = canvas.getContext("2d");
			this.prototype.canvases[name] = {
				canvas: canvas,
				ctx: ctx,
				width: canvas.width,
				height: canvas.height
			};
		}
		headOn.canvas.prototype = {
			canvases: {},
			stroke: function(stroke){
				var ctx = this.canvas.ctx;
				ctx.save();
				if(stroke){
					ctx.lineWith = stroke.width;
					ctx.strokeStyle = stroke.color;
					ctx.stroke();
				}
				ctx.restore();
			},
			drawRect: function(width, height, x, y, color, stroke, rotation){
				var ctx = this.canvas.ctx, mod = 1;
				ctx.save();
				ctx.beginPath();

				if(rotation){
					ctx.translate(x,y);
					ctx.rotate(rotation);
					ctx.rect(0, 0, width,height);
					
					
				}
				else{
					ctx.rect(x,y,width,height);
				}
				if(color){
					ctx.fillStyle = color;
				}
				
				ctx.fill();
				if(typeof stroke === "object" && !isEmpty(stroke)){
					this.stroke(stroke);
				}
				ctx.closePath();
				ctx.restore();
				return this;
			},
			drawCircle: function(x, y, radius, color, stroke){
				var ctx = this.canvas.ctx;
				ctx.save();
				ctx.beginPath();
				ctx.arc(x, y, radius, 0, 2*Math.PI, false);
				ctx.fillStyle = color || "black";
				ctx.fill();
				this.stroke(stroke);
				ctx.restore();
				ctx.closePath();
				return this;
			},
			drawImage: function(image,x,y){
				var ctx = this.canvas.ctx;
				try{
					ctx.drawImage(image,x,y);	
				}
				catch(e){
					console.log(image);
				}
				return this;
			},

			drawImageRotated: function(image, rotation, x,y){
				var ctx = this.canvas.ctx;
				var radians = rotation * Math.PI / 180;
				ctx.save();
				ctx.translate(x, y);
				ctx.rotate(radians);
				ctx.drawImage(image, 0-image.width, 0-image.height);
				ctx.restore();
				return this;
			},

			drawText: function(textString, x, y, fontStyle, color, alignment, baseline){
				var ctx = this.canvas.ctx;
				ctx.save();

				if(fontStyle){
					ctx.font = fontStyle + " sans-serif";
				}
				if(color){
					ctx.fillStyle = color;
				}
				if(alignment){
					ctx.textAlign = alignment;
				}
				if(baseline){
					ctx.textBaseline = baseline;
				}

				ctx.fillText(textString,x,y);

				ctx.restore();
				return this;
			},

			append: function(element){
				element = document.querySelector(element);
				if(element){
					element.appendChild(this.canvas.canvas);
				}
				else{
					document.body.appendChild(this.canvas.canvas);
				}
				return this;
			}
		}
		vectorProto = {
			normalize: function(){
				var len = this.length();
				return headOn.Vector(this.x/len, this.y/len);
			},

			normalizeInPlace: function(){
				var len = this.length();
				this.x /= len;
				this.y /= len;
			},

			dot: function(vec2){
				return vec2.x * this.x + vec2.y * this.y;
			},

			length: function(){
				return Math.sqrt(this.x*this.x + this.y*this.y);
			},

			sub: function(vec2){
				return headOn.Vector(this.x - vec2.x, this.y - vec2.y);
			},

			add: function(vec2){
				return headOn.Vector(this.x + vec2.x, this.y + vec2.y);
			},

			mul: function(scalar){
				return headOn.Vector(this.x * scalar, this.y * scalar);
			}
		}

		

		return headOn;

		function isEmpty(obj){
			return Object.keys(obj).length === 0;
		}
	}());
	window.headOn = headOn;
})(window);
