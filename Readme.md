Head-on.js
===========
The javascript game engine for velociraptors

Use
=========

Head-on.js is made to make games easier to create it come with several function to facilitate that
Creating a canvas
------------------
Head-on.js supports multiple canvas elements simple call

`headOn.canvas.create(canvasName, width, height);`

To access a canvas element call 

`headOn.canvas(canvasName)`

Drawing to canvas
-------------------
```javascript
headOn.canvas(canvasName).drawRect(width, height, x, y [, color])
```

Draws a rectange to the canvas specified by `canvasName` with the specified width, height x, and y and optional color argument can be specified to fill the retange with a color

`headOn.canvas(canvasName).drawImage(image, x, y)`

Draws an image to the canvas at the x and y specified.

`headOn.canvas(canvasName).drawImageRotated(image, rotation, x, y)`

Draws an image to the specified canvas at with the specified roatation in *degerees* at x and y

Vectors
---------
Head-on provides a vector method `headOn.Vector(x,y)` returns a vector with the following methods availible.
All methods return a new `Vector` leaving the old one unchanged.

`Vector.mul(scalar)` Multiplies a vector by a scalar returns a vector.

`Vector.normalize()` normalizes a vector.

`Vector.length()` returns the length of the vector as a floating point number.

`Vector.dot(vector2)` returns the dot product of two vectors as a floating point number.

`Vector.add(vector2)` returns a new vector of the addition of two vectors.

`Vector.sub(vector2)` returns a new vector of the first vector subtracted by vector2 eg `(vec1.x - vec2.x), (vec1.y - vec2.y)`

Animating
---------

First we define the animation

`headOn.animate(object,keyFrames)`

Object is the object you want to animate keyFrames is an array of images in order you want the to show up

After we define our animation we need to render it animate automatically creates a attribute in our object of the current image to draw all we need to do now is:

`headOn.drawImage(object.image, object.x, object.y)`

Object
--------
To create an object in Head-on.js all we need to do is call `headOn.entity()`

`object = headOn.entity(values[,parent])`

this will create an object with attributes supplied by the values argument that inherits from the optional parent argument

Collision Detection
-------------------

Head-on uses SAT collision detection but it assumes rectangles.

`headOn.collides(object1,object2)`

`object1` and `object2` must have an angle and position property set. Angle must be the rotation of the object in radians and position must be
a `headOn.Vector`

Looping
-----------------------
The event loop in Head-on.js can be started with `headOn.run()` it should be noted that you should only run the event loop after last of all in your code
 
Every tick Head-on.js run the functions `headOn.update(time)` and `headOn.render(time)` time being the amount of time (in miliseconds) since the last tick. Adding our code to the render and update functions is easy

`headOn.update = function(time){
	do what you need to here
}`

`headOn.render = function(time){
	Do what you need to here
}`

The fps of Head-on.js can be changed via the `headOn.fps` variable

Image loading
--------------
Loading multiple images in head-on.js is simple via the `headOn.loadImages(imageArray, imageCallback, allCallback)` function

`imageArray` is an array of objects formated as `{name:"",src:""}` name being the name we want to give the image and src being the location of the image.

`imageCallback` is called for each image that loads passing the image name as an argument.

`allCallback` is called when all images have finished loading.

The images you load via Head-on are accesible from the headOn.images method to get the image we want we simply do `headOn.images("image name")` where image name is the name we gave the image when we loaded it.

Event Manager
---------------
To create events in Head-on we call

`headOn.events.add(eventName, callback)`

Now we have our event we can trigger wherever we want in our code with

`headOn.events.trigger(eventName, arg1, arg2 ...)`

The arguments we define in trigger will get passed as arguments to the callback function we defined with `headOn.events.add()`

Grouping
---------
You can group elements in head-on with 

`headOn.group(groupName, element)`

If a group with that name does not exist it will create one and add the element. If it does exist it will add the element to the end of the group. 

`headOn.group()` always returns an array of the members of the group with the given group name. So to access a group after we have made it we can call.

`headOn.group(groupName)`


Helper Functions
----------------
`headOn.randInt(min,max)` returns a random number between the min and max (inclusive) given
