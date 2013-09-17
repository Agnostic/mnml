# _MNML_

_Minimalistic MVC framework for javascript web applications_

## Creating a new application
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
Use app.route to define your router, note that the controllers are optional.
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
  this.name = name;
});
```

## Views & Databinding
### Databinding
To assign a property of the controller to a view, use: {{ property }}.

/templates/params.html
```html
<div>
  <h2>Hello {{ name }}!</h2>
  <input type="text" model="name"/>
</div>
```

## Directives
### Controller
You can assign a controller to a div using the controller directive, for example:
```html
<div controller="params">
  Hello {{ name }}!
</div>
```

### Include
The include directive allows to attach a view inside an element, example:
```html
<div include="/templates/example.html"></div>
```
### if-class
This directive receives an object as a parameter, where properties are the classes and the values ​​are the conditions.
```html
<ul class="nav">
  <li if-class="{ active: status, inactive: !status }">Link</li>
</ul>
```
Equivalence in javascript, (So just a example):
```javascript
if (status) {
  li.className = 'active';
}
if (!status) {
  li.className = 'inactive';
}
```

## Events

## Utilities