listener
=========

the listener module is use to simplify the events trigger and call of function;

##Usage Notes


###Example 1: First subscribe a subject to publish, and then add an event

```javascript
var key1 = $.Listener.sub('address').onsuccess(function () {
      console.log('success-1')
    });

  setTimeout(function () {
    //publish on subject after one second
    $.Listener.pub('address').success();
    //append
    key1.onsuccess(function () {
      console.log('success-2')
    });
  }, 1000);
```

###Example 2: First publish the subject , and the add an event

```javascript
//publish
$.Listener.pub('address2').success();
setTimeout(function () {
    //subscribe after two seconds
    var key2 = $.Listener.sub('address2').onsuccess(function () {
      console.log('success-3');
    });
    key2.onsuccess(function(){
      console.log('success-4');
    });
  }, 2000);
```

###Example 3: Cancel a subscription

```javascript
var key3 = $.Listeners.sub('address3')
    .onsuccess(function () {
      console.log('success-5');
    });

  var key4 = $.Listeners.sub('address3')
    .onsuccess(function () {
      console.log('success-6');
    });

  //unsubscribe
  $.Listeners.unsub('address3').success(key3);

  setTimeout(function () {
    //subscribe after three seconds
    $.Listeners.pub('address3').success();
  }, 3000);
```

###Example 4: subscribe some subjects

```javascript
$.Listeners.sub('sub1').onsuccess(function(data){
    console.log(1, data);
  });

  $.Listeners.pub('sub1').success({sub1 : true});
      


  //subscribe two subjects
  $.Listeners.sub('sub1', 'sub2').onsuccess(function(data){
    console.log(2, data);
  });

  $.Listeners.sub('sub1').onsuccess(function(data){
    console.log(3, data);
  });

  //$.Listeners.pub('sub2').success({sub2 : true});
  
  setTimeout(function () {
    //$.Listeners.pub('sub1', 'sub2').success();
    $.Listeners.pub('sub2').success({sub2 : true});
  }, 500);

  setTimeout(function(){
      $.Listeners.sub('sub2').onsuccess(function(data){
        console.log(4, data);
    });
  }, 2000);
    
  setTimeout(function () {
    $.Listeners.pub('sub2').success();
  }, 1000);
```
