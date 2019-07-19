This Project is the server side compartment of our Client-Server Assignment.

Its purpose is to run in the background, wait for incoming HTTP request from clients and then handle them.

We have modified the version we handed in as Assignment 3.2, some (but not all) of the changes are:

 - added support for time-stamps in the favourites/review modules (we did not anticipate the need to support this behaviour in the code.)

 - added support for leaflet.js usage: changed POI request to include lat/long coordinates to support interactive maps and markers.

 - augmented server side to support one city: due to our misunderstanding of the assignment, we included a 'city' attribute for each POI.