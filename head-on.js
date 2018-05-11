//     __  __         __           _
//    / / / /__  ____ _____/ /  ____  ____         (_)____
//   / /_/ / _ \/ __ `/ __  /_____/ __ \/ __ \    / / ___/
//  / __  /  __/ /_/ / /_/ /_____/ /_/ / / / /   / (__  )
// /_/ /_/\___/\__,_/\__,_/      \____/_/ /_(_)_/ /____/
//                         /___/
(function(window, undefined){
	"use strict";
	var headOn = (function(){

		var headOn = {

				groups: {},
				_images: {},
				fps: 30,
				imagesLoaded: true,
				gameTime: 0,
				_update:"",
				_render:"",
				_ticks: 0,
				alias: false,
				randInt: function(min, max) {
					return Math.floor(Math.random() * (max +1 - min)) + min;
				},
				randFloat: function(min, max) {
					return Math.random() * (max - min) + min;
				},
				clamp: function(value, min, max){
					return Math.min(Math.max(value, min), max);
				},
				lerp: function(start,  end, t){
					//console.log(t)
					t = this.clamp(t,0,1);
					//console.log(t);
					return start + (end - start) * t;
				},
				events: {
					events: {},
					listen: function(eventName, callback){
						var id = headOn.uId();
						if(!this.events[eventName]){
							this.events[eventName] = [];
						}
						this.events[eventName].push({cb:callback, id:id});
					},
					unlisten:function(eventName, id){
						if(!this.events[eventName]) return;
						this.events[eventName].forEach(function(e, i){
							if(e.id === id){
								this.events[eventName].splice(i,1);
							}
						});
					},
					trigger: function(eventName){
						var args = [].splice.call(arguments, 1),
							e = this.events[eventName],
							l,
							i;
						if(e){
							l = e.length;
							for(i = 0; i < l; i++){
								e[i].cb.apply(headOn, args);
							}
						}

					}
				},
				uId: function s4() {
						return Math.floor((1 + Math.random()) * 0x10000)
							.toString(16)
							.substring(1);
				},
				FSM: function(entity){
					this.entity = entity;
					return this;
				},
				Camera: function(width, height, x, y, zoom){
					this.width = width;
					this.height = height;
					x = x || 0;
					y = y || 0;
					this.position = headOn.Vector(x, y);
					this.dimensions = headOn.Vector(width, height);
					this.center = headOn.Vector(x+width/2, y+height/2);
					this.zoomAmt = zoom || 1;
					return this;
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

				update: function(cb){this._update = cb;},

				render: function(cb){this._render = cb;},

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
				inherit: function (base, sub) {
					// Avoid instantiating the base class just to setup inheritance
					// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
					// for a polyfill
					sub.prototype = Object.create(base.prototype);
					// Remember the constructor property was set wrong, let's fix it
					sub.prototype.constructor = sub;
					// In ECMAScript5+ (all modern browsers), you can make the constructor property
					// non-enumerable if you define it like this instead
					Object.defineProperty(sub.prototype, 'constructor', {
						enumerable: false,
						value: sub
					});
				},

				extend: function(base, values){
					var i;
					for(i in values){
						if(values.hasOwnProperty(i)){
							base[i] = values[i];
						}
					}
				},
				clone: function (obj) {
					// Handle the 3 simple types, and null or undefined
					if (null === obj || "object" != typeof obj) return obj;
					var copy;
					// Handle Date
					if (obj instanceof Date) {
							copy = new Date();
							copy.setTime(obj.getTime());
							return copy;
					}

					// Handle Array
					if (obj instanceof Array) {
							copy = [];
							for (var i = 0, len = obj.length; i < len; i++) {
									copy[i] = clone(obj[i]);
							}
							return copy;
					}

					// Handle Object
					if (obj instanceof Object) {
							copy = {};
							for (var attr in obj) {
									if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
							}
							return copy;
					}

					throw new Error("Unable to copy obj! Its type isn't supported.");
				},
				collides: function(poly1, poly2, center) {
					var points1 = this.getPoints(poly1, center),
						points2 = this.getPoints(poly2, center),
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

					if(poly1.type === "circle" && poly2.type ==="circle"){
						return circleCircle(poly1, poly2);
					}else if(poly1.type === "circle"){
						return circleRect(poly1, poly2);
					}else if(poly2.type === "circle"){
						return circleRect(poly2, poly1);
					}


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
					function circleRect(circle, rect){
						var newX = circle.position.x * Math.cos(-rect.angle);
						var newY = circle.position.y * Math.sin(-rect.angle);
						var circleDistance = {x:newX, y:newY};
						var cornerDistance_sq;
						circleDistance.x = Math.abs(circle.position.x - rect.position.x);
							circleDistance.y = Math.abs(circle.position.y - rect.position.y);

							if (circleDistance.x > (rect.width/2 + circle.radius)) { return false; }
							if (circleDistance.y > (rect.height/2 + circle.radius)) { return false; }

							if (circleDistance.x <= (rect.width/2)) { return true; }
							if (circleDistance.y <= (rect.height/2)) { return true; }

							cornerDistance_sq = Math.pow(circleDistance.x - rect.width/2,2) +
																	Math.pow(circleDistance.y - rect.height/2, 2);

							return (cornerDistance_sq <= Math.pow(circle.radius,2));
					}
					function pointInCircle(point, circle){
						return Math.pow(point.x - circle.position.x ,2) + Math.pow(point.y - circle.position.y, 2) < Math.pow(circle.radius,2);
					}
					function circleCircle(ob1, ob2){
						return square(ob2.position.x - ob1.position.x) + square(ob2.position.y - ob1.position.y) <= square(ob1.radius + ob2.radius);
					}
				},

				getPoints: function (obj, center){
					if(obj.type === "circle"){
						return [];
					}
					var pos = obj.pos || obj.position;
					var x = pos.x,
						y = pos.y,
						width = obj.width,
						height = obj.height,
						angle = obj.angle,
						that = this,
						h,
						w,
						points = [];
					if(!center){
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
					}else{
						w = (width/2);
						h = (height/2);
						points[0] = [x-w, y-h];
						points[1] = [x+w, y-h];
						points[2] = [x+w, y+h];
						points[3] = [x-w, y+h];
					}

						//console.log(points);
					return points;

				},

				Timer: function(){
					this.jobs = [];
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

				loadImages: function(imageArray, progress, allCallback){
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
						progress && progress(loaded, total);
						if(loaded === total){
							allCallback && allCallback();
							that.imagesLoaded = true;
						}
					};
					imageArray.forEach(function(image){
						img = new Image();
						img.src = image.src;
						img.onload = imgOnload;

						that._images[image.name] = img;
					});
				},
				setFPS: function(fps){
					this.fps = fps;
					this.events.trigger("FPS change");
				},
				debug: function(){
					if(window.DEBUG){
						console.log.apply(console, arguments);
					}
					return;
				},
				images: function(image){
					if(this._images[image]){
						return this._images[image];
					}
					else{
						return new Image();
					}
				},


				timeout: function(cb, time, scope){
					setTimeout(function(){
						cb.call(scope);
					}, time);
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
					console.log(this);
					return this;
				},
				vectorCount:0,
				copies:0,
				adds:0,
				subs:0,
				muls:0,
				Vector: function(x, y){
					headOn.vectorCount++;
					if(this === headOn){
						return new headOn.Vector(x,y);
					}
					if(typeof x !== "number"){
						if(x){
							this.x = x.x;
							this.y = x.y;
						}else{
							this.x = 0;
							this.y = 0;
						}

					}else{
						this.x = x;
						this.y = y;
					}
					return this;
				},
				run: function(){
					var that = this;
					var then = Date.now();
					var now;
					var interval = 1000/this.fps;
					var delta;
					window.requestAnimationFrame(aniframe);
					//setTimeout(updateFrame, 1000/this.fps);
				this.events.listen("FPS change", function(){
					that.debug(interval)
					interval = 1000/that.fps;
					that.debug(interval);
				})
					function aniframe(){
						var now = Date.now();
						delta = now - then;
						//We want the time inbetween frames not the time in between frames + time it took to do a frame
						if(delta > interval){
							that._update(delta);
							that.renderTick();
							then = now - (delta % interval);
						}


						window.requestAnimationFrame(aniframe);
					}

				},
				updateTick: function(then){
					var now = Date.now(),
					modifier = now - then;
					this.trueFps = 1/(modifier/1000);
					this._ticks+=1;
					this._update(modifier, this._ticks);
					this.gameTime += modifier;

				},
				renderTick: function(then){
					this._render();
				},
				exception: function(message){
					this.message = message;
					this.name = "Head-on Exception";
					this.toString = function(){
						return this.name + ": " + this.message;
					};
				}
		};

		headOn.canvas.create = function(name, width, height, camera, styles){
			var canvas, ctx;
			if(!camera || !(camera instanceof headOn.Camera)){
				throw new headOn.exception("Canvas must be intialized with a camera");
			}
			canvas = document.createElement("canvas");
			canvas.width = width;
			canvas.height = height;
			if(styles){
				for(var key in styles){
					if(styles.hasOwnProperty(key)){
						canvas.style[key] = styles[key];
					}
				}
			}

			ctx = canvas.getContext("2d");
			ctx.webkitImageSmoothingEnabled = false;
			ctx.mozImageSmoothingEnabled = false;
			ctx.imageSmoothingEnabled = false; //future
			this.prototype.canvases[name] = {
				canvas: canvas,
				ctx: ctx,
				width: canvas.width,
				height: canvas.height,
				camera: camera
			};
			console.log(ctx.imageSmoothingEnabled)
			return headOn.canvas(name);
		};
		headOn.canvas.prototype = {
			canvases: {},
			stroke: function(stroke){
				var ctx = this.canvas.ctx;
				ctx.save();
				if(stroke){
					ctx.lineWidth = stroke.width;
					ctx.strokeStyle = stroke.color;
					ctx.stroke();
				}
				ctx.restore();
			},
			drawRect: function(width, height, x, y, color, stroke, rotation){
				var ctx = this.canvas.ctx, mod = 1, camera = this.canvas.camera;
				var obj;
				if(arguments.length === 1 && typeof arguments[0] === "object"){
					obj = arguments[0];
					x = obj.x;
					y = obj.y;
					width = obj.width;
					height = obj.height;
					color = obj.color;
					stroke = obj.stroke;
					rotation = obj.rotation;
				}

				ctx.save();
				ctx.beginPath();

				if(rotation){
					ctx.translate(x,y);
					ctx.rotate(rotation);
					ctx.rect(0, 0, width, height);
				}
				else{
					//console.log(camera.position.x)
					if(obj && obj.camera === false){
						ctx.rect(x, y, width, height);
					}else{
						ctx.rect((x - camera.position.x)/camera.zoomAmt , (y - camera.position.y)/camera.zoomAmt , width / camera.zoomAmt, height / camera.zoomAmt);
					}

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
				var ctx = this.canvas.ctx, mod = 1, camera = this.canvas.camera, oneArg;
				if(arguments.length === 1 && typeof arguments[0] === "object"){
					oneArg = true;
					x=arguments[0].x;
					y=arguments[0].y;
					radius=arguments[0].radius;
					color = arguments[0].color;
					stroke = arguments[0].stroke;
				}

				ctx.save();
				ctx.beginPath();
				if(oneArg && arguments[0].camera === false){
					ctx.arc(x, y, radius, 0, 2*Math.PI, false);
				}else{

					ctx.arc((x - camera.position.x)/camera.zoomAmt, (y - camera.position.y)/camera.zoomAmt, radius / camera.zoomAmt, 0, 2*Math.PI, false);
				}

				ctx.fillStyle = color || "black";
				ctx.fill();
				this.stroke(stroke);
				ctx.restore();
				ctx.closePath();
				return this;
			},
			drawImage: function(image,x,y){
				var ctx = this.canvas.ctx;
				var camera = this.canvas.camera;
				var coords = camera.unproject(headOn.Vector(x,y));
				//try{
					ctx.drawImage(image,coords.x,coords.y);
			// }
			// catch(e){
					//console.log(image);
			//  }
				return this;
			},
			drawLine: function(start, end, color){
				var ctx = this.canvas.ctx;
				var camera = this.canvas.camera;
				start = camera.unproject(start);
				end = camera.unproject(end);
				ctx.save();
				ctx.beginPath();
				ctx.moveTo(start.x, start.y);
				ctx.lineTo(end.x, end.y);
				ctx.strokeStyle = color;
				ctx.stroke();
				ctx.restore();
			},
			drawImageRotated: function(image, rotation, x,y){
				var ctx = this.canvas.ctx;
				var radians = rotation ;
				var camera = this.canvas.camera;
				var coords = camera.unproject(headOn.Vector(x,y))
				ctx.save();
				ctx.translate(coords.x, coords.y);
				ctx.rotate(radians);
				ctx.drawImage(image, 0 - image.width/2, 0 - image.height/2);
				ctx.restore();
				return this;
			},
			createGradient: function(options){
				var grd;
				var ctx = this.canvas.ctx;
				var camera = this.canvas.camera;
				var start;
				var end;
				if(options.camera !== false){
					start = camera.unproject(options.start);
					end = camera.unproject(options.end);
				}else{
					start = options.start;
					end = options.end;
				}
				if(options.type === "radial"){
					return ctx.createRadialGradient(start.x, start.y, options.radius1, end.x, end.y, options.radius2);
				}else{
					return ctx.createLinearGradient(start.x, start.y, end.x, end.y);
				}

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
					this.canvas.canvas = element.appendChild(this.canvas.canvas);
				}
				else{
					this.canvas.canvas = document.body.appendChild(this.canvas.canvas);
				}
				return this;
			},
			clear: function(){
				var ctx = this.canvas.ctx;
				ctx.clearRect(0,0, this.canvas.width, this.canvas.height);
			},
			setCamera: function(cam){
				this.canvas.camera = cam;
			}
		};
		headOn.FSM.prototype = {
			changeState: function(state){
				if(this.state){
					this.state.exit();
				}

				this.state = state;
				this.state.enter();
			},
			update: function(){
				var args = [].slice.call(arguments, 0);
				args.unshift(this.entity);
				this.state.execute.apply(null, args);
			},
			setState: function(state){
				this.state = state;
			}
		},
		headOn.Timer.prototype = {
			job: function(time, start){
				var rem = arguments.length === 2 ? start : time;
				var jiff = {
					TTL: time,
					remaining: rem
				};
				this.jobs.push(jiff);
				return {
					ready: function(){
						return jiff.remaining <= 0;
					},
					reset: function(){
						jiff.remaining = jiff.TTL;
					},
					timeLeft: function(){
						return jiff.remaining;
					}
				};
			},
			update: function(time){
				this.jobs.forEach(function(j){
					j.remaining -= time;
				});
			}
		};
		headOn.Camera.prototype = {
			zoomIn: function(amt){
				this.zoomAmt /= amt;
				this.center.sub(this.dimensions.mul(this.zoomAmt / 2), this.position);
				return this;
			},
			zoomOut: function(amt){
				this.zoomAmt *= amt;
				this.center.sub(this.dimensions.mul(this.zoomAmt / 2), this.position);

				return this;
			},
			move: function(vec){
				this.position.add(vec, this.position);
				this.position.add(headOn.Vector(this.width, this.height).mul(0.5), this.center);
				headOn.events.trigger("cameraMoved", this);
				return this;
			},
			inView: function(vec){
				var x;
				var y;
				if(arguments.length === 2){
					x = arguments[0];
					y = arguments[1]
				}else{
					x = vec.x;
					y = vec.y;
				}
				if(x >= this.position.x && x <= this.position.x + this.width *this.zoomAmt && y >= this.position.y && y <= this.position.y + this.height*this.zoomAmt){
					return true;
				}else{
					return false;
				}
			},
			moveTo: function(vec){
				var temp = $h.Vector(0,0);

				vec.sub(this.dimensions.mul(0.5).mul(this.zoomAmt), temp);
				if(temp.x === this.position.x && temp.y === this.position.y) return;
				this.position = temp;
				headOn.events.trigger("cameraMoved", this);
				this.center = vec;
			},
			project: function(vec){
				return vec.mul(this.zoomAmt).add(this.position);
			},
			unproject: function(vec, out){
				if(out){
					vec.mul(1/this.zoomAmt, out).sub(this.position, out);
				}else{
					return vec.mul(1/this.zoomAmt).sub(this.position);
				}

			}
		};
		headOn.Vector.prototype = {
			normalize: function(out){
				var len = this.length();
				var finalx;
				var finaly;

				if(len === 0){
					finalx = 0;
					finaly = 0;
				}else{
					finalx = this.x/len;
					finaly = this.y/len;
				}
				if(out){
					out.x = finalx;
					out.y = finaly;
					return out;
				}else{
					return $h.Vector(finalx, finaly);
				}

			},

			normalizeInPlace: function(){
				var len = this.length();
				this.x /= len;
				this.y /= len;
			},
			distance: function(vec2){
				return this.sub(vec2).length();
			},
			toString: function(){
				return "( "+this.x + " , "+this.y +")";
			},
			dot: function(vec2){
				return vec2.x * this.x + vec2.y * this.y;
			},

			length: function(){
				return Math.sqrt(this.x*this.x + this.y*this.y);
			},
			copy: function(out){
				headOn.copies++;
				if(out){
					out.x = this.x;
					out.y = this.y;
					return out;
				}else{
					return new headOn.Vector(this.x, this.y);
				}

			},
			sub: function(vec2, out){
				headOn.subs++;
				if(out){
					out.x = this.x - vec2.x;
					out.y = this.y - vec2.y;
					return out;
				}
				return headOn.Vector(this.x - vec2.x, this.y - vec2.y);
			},

			add: function(vec2, out){
				if(out){
					out.x = this.x + vec2.x;
					out.y = this.y + vec2.y;
					return out;
				}
				headOn.adds++;
				return headOn.Vector(this.x + vec2.x, this.y + vec2.y);
			},
			truncate: function(max, out){
				var i;
				i = max / this.length();
				i = i < 1 ? i : 1;
				return this.mul(i, out);
			},
			mul: function(scalar, out){
				headOn.muls++;
				if(out){
					out.x = this.x * scalar;
					out.y = this.y * scalar;
					return out;
				}
				return headOn.Vector(this.x * scalar, this.y * scalar);
			}
		};
		function sign(num){
			if(num < 0){
				return -1;
			}else{
				return 1;
			}
		}


		return headOn;
		function square(num){
			return num * num;
		}
		function isEmpty(obj){
			return Object.keys(obj).length === 0;
		}
	}());
	if(typeof module !== "undefined"){
		
		module.exports = headOn;
	}
	window.headOn = headOn;
})(window);
