<p align="center"><a href="https://mosaicjs.netlify.com" target="_blank" rel="noopener noreferrer"><img width="100" height="100" src="./MosaicLogo.png" alt="Mosaic logo"></a></p>
<p align="center">
  <a href="https://npmcharts.com/compare/@authman2/mosaic?minimal=true"><img src="https://img.shields.io/npm/dm/@authman2/mosaic.svg" alt="Downloads"></a>
  <a href="https://www.npmjs.com/package/@authman2/mosaic"><img src="https://img.shields.io/npm/v/@authman2/mosaic.svg" alt="Version"></a>
</p>

# <a target='_blank' rel='noopener noreferrer' href='https://mosaicjs.netlify.com'>Mosaic</a>
> Mosaic is a front-end JavaScript library for building user interfaces. It is a component-based library that uses a virtual dom for fast rendering and JSX as well as HTML-templates for creating views. Mosaic handles the views of a 
web app, which means that you can choose to include it in a project here and there or you can create an entire application based around it.

## Features
- **Component-Based**: Mosaic components are reusable pieces of code that each keep track of their own state (referred to as "data"), actions, lifecycle functions, and more.
- **Observable/Reactive Data**: Mosaic uses Observables to keep track of changes to a component's data. This means 
that there is no need to call "setState" or anything like that, instead just change the data directly.
- **Virtual DOM**: The use of a virtual dom makes updating web apps very fast.
- **JSX/HTML-Templates**: You can use jsx or the "h" function that comes with Mosaic to write a component's view. If
you are not a fan of JSX, you can also write some basic HTML-templates that can be dynamically updated using the data
property and the double curly brackets like so: ```html <h1>{{ this.data.title }}</h1>```
- **Router**: Mosaic comes with a basic router for navigating between components.

## Installation
The easiest way to use Mosaic is to first install the npm package by using:
```shell
npm install --save @authman2/mosaic
```
or with a script tag.
```html
<script src='https://unpkg.com/@authman2/mosaic@latest/dist/index.js'></script>
```
Then, for fast builds and hot reloading, install the build tool "Parcel."
```shell
npm install --save-dev parcel-bundler
```
You will also need to create a .babelrc file so that you can transpile JSX into JS. The .babelrc file should look similar to this:
```js
{
    "presets": ["env"],
    "plugins": [["babel-plugin-transform-react-jsx", { "pragma": "h" }]]
}
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
    
  <body>
    <div id='root'></div>
    <script type="text/javascript" src='./index.js'></script>
  </body>
    
</html>
```
**index.js**:
```js
// Import Mosaic
import { h, Mosaic } from '@authman2/mosaic';
    
// Create a label and button component.
const NavButton = new Mosaic({
    actions: {
        print: function() {
            console.log(this.data.buttonTitle);
        }
    },
    view: function() {
        // The data will be passed in from the parent component.
        return (
            <div>
                <p>{this.data.label}</p>
                <button onclick={this.actions.print}>
                    Click to go to {this.data.buttonTitle}
                </button>
            </div>
        );
    }
});

// Create an "app" component.
const app = new Mosaic({
    element: document.getElementById('root'),
    data: {
      title: "Mosaic App"
    },
    actions: {
        sayHello: function() {
            console.log("Hello World!!");
            console.log("This component is ", this);
        }
    },
    view: function() {
      return (
          <div>
              <h1>This is a {this.data.title}!</h1>
              <p>Click below to print a message!</p>
              <button onclick={this.actions.sayHello}>Click Here</button>
              <br/>
              <br/>
              <NavButton label="Home" buttonTitle="Home Button" />
              <NavButton label="About" buttonTitle="Home Button" />
              <NavButton label="Contact" buttonTitle="Contact Button" />
          </div>
      )
    }
});

// Paint the Mosaic onto the page.
app.paint();
```
**Note**: You do not have to use JSX to create Mosaic components. You can use the "h" function that is imported at the top to write code, however this is more prone to errors and tends to make the code messier.


# Author
- Year: 2019
- Programmer: Adeola Uthman
- Languages/Tools: JavaScript, Babel, Parcel
