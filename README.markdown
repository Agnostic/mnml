# _MNML_

_Minimalistic MVC framework for javascript web applications_

## Creating Application
```html
<html>
  <body>
    <view></view> <!-- Templates will be rendered here -->
    <script src="/app/app.js"></script>
  </body>
</html>
```

app.js
```javascript
var app = new MNML();
```

## Routers
```javascript
app.route([
  { path: '/', template: '/templates/home.html' },
  { path: '/hello/:name', template: '/templates/params.html', controller: 'params' }
]);
```

## Controllers

### Application controller
This controller is fired before any controller.

```javascript
app.appController(function(data){
  console.log('Pre-controller', data);
});
```

### Single controller
```javascript
app.controller('params', function(name){
  console.log( 'Hello', name );
});
```

## Views

## Directives

## Events