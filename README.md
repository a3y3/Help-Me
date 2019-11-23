# Help-Me

### What is this?
This is a front-end app for an Emergency Services Directory that makes finding help easier. 

### Features
- Single page frontend app that demonstrates the power of jQuery by querying REST-ful services on a serenity server.
- Uses modular pattern of JS development.
- Custom jQuery plugin written for making xhr calls even easier. If you don't need to change error messages during xhr and only care about receiving data, the code looks like this:
```
$().getAjaxdata(fn, url, params); //that's it!
```
as opposed to:
```
$.ajax({
        'url' : url,
        'type' : 'GET',
        'data' : {
            params
        },
        'success' : function(data) {              
            console.log(`This is so huge`);
        },
        'error' : function(request, error, xhr) {
            console.log(`Same error messages for every AHAX request? Why?`);
        }
    });
```
- `Leaflet.js` API to display a cool interactive map for showing the various emergency locations.
