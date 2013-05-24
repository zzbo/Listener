listener
=========

the listener module is use to simplify the events trigger and call of function;

##Usage Notes


###Example 1: First subscribe a subject to publish, and then add an event

```javascript
var key1 = $.Listeners.sub('address')
    .onsuccess(function () {
      console.log('success-1')
    });

  setTimeout(function () {
    //publish on subject after one second
    $.Listeners.pub('address').success();
    //append
    key1.onsuccess(function () {
      console.log('success-2')
    });
  }, 1000);
```
