        __  __               __                      _     
       / / / /__  ____ _____/ /     ____  ____      (_)____
      / /_/ / _ \/ __ `/ __  /_____/ __ \/ __ \    / / ___/
     / __  /  __/ /_/ / /_/ /_____/ /_/ / / / /   / (__  ) 
    /_/ /_/\___/\__,_/\__,_/      \____/_/ /_(_)_/ /____/  
                                              /___/        
       __  __              _                                  _       __     ___ __                             ____                   _          
      / /_/ /_  ___       (_)___ __   ______ ________________(_)___  / /_   / (_) /_  _________ ________  __   / __/___  _____   _____(_)_________
     / __/ __ \/ _ \     / / __ `/ | / / __ `/ ___/ ___/ ___/ / __ \/ __/  / / / __ \/ ___/ __ `/ ___/ / / /  / /_/ __ \/ ___/  / ___/ / ___/ ___/
    / /_/ / / /  __/    / / /_/ /| |/ / /_/ (__  ) /__/ /  / / /_/ / /_   / / / /_/ / /  / /_/ / /  / /_/ /  / __/ /_/ / /     (__  ) / /  (__  ) 
    \__/_/ /_/\___/  __/ /\__,_/ |___/\__,_/____/\___/_/  /_/ .___/\__/  /_/_/_.___/_/   \__,_/_/   \__, /  /_/  \____/_/     /____/_/_/  /____/  
                    /___/                                  /_/                                     /____/                                         


                    
(function(window, undefined){
    "use strict";
    var headOn = (function(){
        var headOn = {

                groups: {},
                images: {},
                fps: 50,
                imagesLoaded: false,
                gameTime: 0,

                randInt: function(min, max) {
                    return Math.floor(Math.random() * (max + 1 - min)) + min;
                },

                events: {
                    events: {},
                    add: function(eventName, callback){
                        this.events[eventName] = callback;
                    },
                    trigger: function(eventName){
                        var args = [].splice.call(arguments, 1)
                        this.events[eventName].apply(null,args);
                    }
                },

                drawRect: function(width,height,x,y,color){
                    this.ctx.save();
                    if(color){
                        this.ctx.fillStyle = color;
                    }
                    this.ctx.fillRect(x,y,width,height);
                    this.ctx.restore();
                },

                drawImage: function(image,x,y){
                    this.ctx.drawImage(image,x,y);
                },

                drawImageRotated: function(image, rotation, x,y){
                    var radians = rotation * Math.PI / 180;
                    this.ctx.save();
                    this.ctx.translate(x + (image.width / 2), y + (image.height / 2));
                    this.ctx.rotate(radians);
                    this.ctx.drawImage(image, -image.width / 2, -image.height / 2);
                    this.ctx.restore();
                },

                drawText: function(textString, x, y, fontStyle, color, alignment){
                    this.ctx.save();

                    if(fontStyle){
                        this.ctx.font = fontStyle + " sans-serif";
                    }
                    if(color){
                        this.ctx.fillStyle = color;
                    }
                    if(alignment){
                        this.ctx.textAlign = alignment;
                    }

                    this.ctx.fillText(textString,x,y);

                    this.ctx.restore();
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

                update: function(){},

                render: function(){},

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

                collides: function(ob1,ob2){
                 var x1, x2, y1, y2, w1, w2, h1, h2;
                 x1 = ob1.x;
                 x2 = ob2.x;
                 y1 = ob1.y;
                 y2 = ob2.y;
                 w1 = ob1.width;
                 w2 = ob2.width;
                 h1 = ob1.height;
                 h2 = ob2.height;
                 w1 += x1;
                 w2 += x2;

                 if(w2 < x1 || w1 < x2){
                    return false;
                 }

                 h1 += y1;
                 h2 += y2;

                 if(h2 < y1 || h1 < y2){
                    return false;
                 }
                 return true;
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

                loadImages: function(){
                    var args, img, total, loaded, timeout, interval, that;
                    that = this;
                    this.imagesLoaded = false;
                    args = [].slice.call(arguments);
                    total = args.length;
                    if(!total){
                        this.imagesLoaded = true;
                    }
                    loaded = 0;
                    args.forEach(function(image){
                        img = new Image();
                        img.src = image.src;
                        img.onload = function(){
                            loaded += 1;
                        };
                    
                        that.images[image.name] = img;
                    });
                    
                    interval = setInterval(function(){
                        if(total === loaded){
                            that.imagesLoaded = true;
                            clearInterval(interval);
                        }
                    }, 100);
                },

                onTick: function(then){
                    var now = Date.now(),
                    modifier = now - then;
                    this.update(modifier);
                    this.render(modifier);
                    this.gameTime += modifier;
                },

                canvas: function(name){
                    if(this === headOn){
                        return new this.canvas(name);
                    }
                    this.canvas = this.canvases[name];
                    return this;
                },


                run: function(){
                    var that = this;
                    var then = Date.now();
                    setInterval(function(){ 
                        if(that.imagesLoaded){
                            that.onTick(then);
                        }
                        then = Date.now();
                    }, 1000/this.fps);
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
                ctx: ctx
            };
        }
        headOn.canvas.prototype = {
            canvases: {},

            drawRect: function(width,height,x,y,color){
                var ctx = this.canvas.ctx;
                ctx.save();
                if(color){
                    ctx.fillStyle = color;
                }
                ctx.fillRect(x,y,width,height);
                ctx.restore();
                return this;
            },

            drawImage: function(image,x,y){
                var ctx = this.canvas.ctx;
                ctx.drawImage(image,x,y);
                return this;
            },

            drawImageRotated: function(image, rotation, x,y){
                var ctx = this.canvas.ctx;
                var radians = rotation * Math.PI / 180;
                ctx.save();
                ctx.translate(x + (image.width / 2), y + (image.height / 2));
                ctx.rotate(radians);
                ctx.drawImage(image, -image.width / 2, -image.height / 2);
                ctx.restore();
                return this;
            },

            drawText: function(textString, x, y, fontStyle, color, alignment){
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

                ctx.fillText(textString,x,y);

                ctx.restore();
                return this;
            },

            append: function(element){
                document[element].appendChild(this.canvas.canvas);
                return this;
            }
        }

        return headOn;
    }());
    window.headOn = headOn;
})(window);