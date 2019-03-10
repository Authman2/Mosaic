<p align="center"><a href="https://mosaicjs.netlify.com" target="_blank" rel="noopener noreferrer"><img width="100" height="100" src="./MosaicLogo.png" alt="Mosaic logo"></a></p>
<p align="center">
  <a href="https://npmcharts.com/compare/@authman2/mosaic?minimal=true"><img src="https://img.shields.io/npm/dm/@authman2/mosaic.svg" alt="Downloads"></a>
  <a href="https://www.npmjs.com/package/@authman2/mosaic"><img src="https://img.shields.io/npm/v/@authman2/mosaic.svg" alt="Version"></a>
</p>

# <a target='_blank' rel='noopener noreferrer' href='https://mosaicjs.netlify.com'>Mosaic</a>
Mosaic is a declarative front-end JavaScript library for building user interfaces.

:diamond_shape_with_a_dot_inside:**Component-Based**: Mosaic components are reusable pieces of code that keep track of their own data, actions, lifecycle functions, and more.

⚡️**Observable Data**: Mosaic uses Observables to keep track of changes to a component's data. This means 
that there is no need to call "setState" or anything like that, instead just change the data directly.

🧠**Smart DOM**: Updates in Mosaic work by remembering which nodes are dynamic (i.e. subject to change) and traveling directly to those nodes to make changes, rather than traversing the tree again.

👌**Small Library Size**: Mosaic is extremely small, with the minified JavaScript file being only 12KB.

🔖**Tagged Template Literals**: Views are written using tagged template literals, which means there is no need for a compiler:
```javascript
const name = "Mosaic";
html`<h1>Welcome to ${name}!</h1>`
```

## Installation
The easiest way to use Mosaic is to first install the npm package by using:
```shell
npm install --save @authman2/mosaic
```
or with a script tag.
```html
<script src='https://unpkg.com/@authman2/mosaic@latest/dist/index.js'></script>
```
Then, for fast builds and hot reloading, install the build tool "Parcel." Although Parcel is the easiest build tool to use with Mosaic, any other can be used as well such as Webpack, for example.
```shell
npm install --save-dev parcel-bundler
```
Now you are ready to use Mosaic!

## Example
Here is an example of a simple Mosaic application. All you need is an index.html file and an index.js file.
For a more detailed example, run the project inside the "example" folder.

**index.html**:
```html
<html>
  <head>
    <title>My Mosaic App</title>
  </head>
    
  <div id='root'></div>
  <script type="text/javascript" src='./index.js'></script>
</html>
```
**index.js**:
```js
// Import Mosaic
import Mosaic from '@authman2/mosaic';

// Create a label component. Data is not defined yet,
// however, it will be injected later on.
const Label = new Mosaic({
    view: function() {
        return html`<div>
            <h2>${ this.data.text }</h2>
            <p>This is a custom label component!</p>
        </div>`;
    }
});

// Create an "app" component.
const app = new Mosaic({
    element: '#root',
    data: { title: "Mosaic App" },
    actions: {
        sayHello: function() {
            console.log("Hello World!!");
            console.log("This component is ", this);
        }
    },
    view: function() {
        return html`<div>
            <h1>This is a ${this.data.title}!</h1>
            <p>Click below to print a message!</p>
            <button onclick="${this.actions.sayHello}">Click Here</button>

            ${ Label.new({ text: "Welcome to Mosaic!" }) }
        </div>`;
    }
});

// Paint the Mosaic onto the page.
app.paint();
```

# Author
- Year: 2019
- Programmer: Adeola Uthman
- Languages/Tools: JavaScript, Parcel
