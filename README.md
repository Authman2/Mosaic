<p align="center"><a href="http://mosaicjs.herokuapp.com" target="_blank" rel="noopener noreferrer"><img width="100" height="100" src="./MosaicLogo.png" alt="Mosaic logo"></a></p>
<p align="center">
  <a href="https://npmcharts.com/compare/@authman2/mosaic?minimal=true"><img src="https://img.shields.io/npm/dm/@authman2/mosaic.svg" alt="Downloads"></a>
  <a href="https://www.npmjs.com/package/@authman2/mosaic"><img src="https://img.shields.io/npm/v/@authman2/mosaic.svg" alt="Version"></a>
</p>

# <a target='_blank' rel='noopener noreferrer' href='http://mosaicjs.herokuapp.com'>Mosaic</a>
> Mosaic is a front-end JavaScript library for building user interfaces. It is a component-based library that uses a virtual dom for fast rendering and JSX for creating views. Mosaic handles the views of a web app, which means that you can choose to include it in a project here and there or you can create an entire application based around it.

## Features
- **Component-Based**: Mosaic components are reusable pieces of code that each keep track of their own state (referred to as "data"), actions, lifecycle functions, and more.
- **Virtual DOM**: The use of a virtual dom makes updating web apps very fast.
- **Written in JSX**: You can use jsx or the "h" function that comes with Mosaic to write a component's view.
- **Easy to Learn**: The syntax and structure of Mosaic components is meant to make it easy to learn so that it does not require a lot of setup to start using.

## Usage
The easiest way to use Mosaic is to first install the npm package by using:
```shell
npm install --save @authman2/mosaic
```
Then, for fast builds and hot reloading, install the build tool "Parcel."
```shell
npm install --save-dev parcel-bundler
```
You will also need to create a .babelrc file so that you can transpile JSX into JS. The .babelrc file should look similar to this:
```js
{
    "presets": ["env"],
    "plugins": [["babel-plugin-transform-react-jsx", {
        "pragma": "h"
    }]]
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
    data: {
        label: "Default Label",
        buttonTitle: "Default Button Title"
    },
    actions: function(self) {
        return {
            print: function() {
                console.log(self.data.buttonTitle);
            }
        }
    },
    view: function() {
        // The data will be passed in from the parent component.
        return (
            <div>
                <p>{this.data.label}</p>
                <button onClick={this.actions.print}>
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
    components: {
        homeButton: Mosaic.Child(NavButton, { label: "Home Button", buttonTitle: "Home" }),
        aboutButton: Mosaic.Child(NavButton, { label: "About Button", buttonTitle: "About" }),
        contactButton: Mosaic.Child(NavButton, { label: "Contact Button", buttonTitle: "Contact" }),
    },
    actions: function(thisComponent) {
      return {
          sayHello: function() {
              console.log("Hello World!!");
              console.log("This component is ", thisComponent);
          }
      }
    },
    view: function() {
      return (
          <div>
              <h1>This is a {this.data.title}!</h1>
              <p>Click below to print a message!</p>
              <button onClick={this.actions.sayHello}>Click Here</button>
              <br/>
              <br/>
              { this.homeButton.view() }
              { this.aboutButton.view() }
              { this.contactButton.view() }
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
