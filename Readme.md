Head-on.js
===========
The javascript game engine for Sirs

Use
=========

Head-on.js is made to make games easier to create it come with several function to facilitate that
Creating a canvas
------------------
With Head-on.js creating a canvas element is easy.

`headOn.canvas(width,height)`

If you want to use an already created canvas element pass it's id as the last paramater and that will be used instead

`headOn.canvas(width, height, canvasId);

Drawing to canvas
-------------------
`headOn.drawRect(width, height, x, y [, color])`

Draws a rectange to the canvas with the specified width, height x, and y and optional color argument can be specified to fill the retange with a color

`headOn.drawImage(image, x, y)`

Draws an image to the canvas at the x and y specified.

`headOn.drawImageRotated(image, rotation, x, y)`

Draws an image to the canvas at with the specified roatation in *degerees* at x and y

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

Currently Head-on.js features simple AABB collision detection to test for collisions between objects reutrn true if the objects are colliding

`headOn.collides(object1,object2)`

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
Loading multiple images in head-on.js is simple via the `headOn.loadImages(image1,image2 ...)` function

Head-on expects and image argument to an argument formated as `{name:"",src:""}` name being the name we want to give the image and src being the location of the image.

The images you load via Head-on are accesible from the headOn.images variable to get the image we want we simply do `headOn.images["image name"]` where image name is the name we gave the image when we loaded it.

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
