# pi-door
A remote garage door opener using a raspberry pi running an express web server.

REST API for door interaction:
- GET -> `/nonce` :: Get a random string from the server. 
- POST { key: 'hashed-key+nonce' } -> `/door` :: Request for the door to be opened.   


