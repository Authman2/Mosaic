# Mosaic
Mosaic is a front-end JavaScript library for building user interfaces. It is a component-based library that uses a virtual dom for fast rendering and JSX for creating views. Mosaic handles the views of a web app, which means that you can choose to include it in a project here and there or you can create an entire application based around it.

Every "Mosaic" is its own component that can be reused throughout your project. It holds its own data, actions, and lifecycle functions that get called whenever its data changes. Take a look at the example below to see how you can create a main "app" component and render it onto the screen.

# Usage
The easiest way to use Mosaic is to first install the npm package by using:
```shell
npm install --save @authman2/Mosaic
```
Then, for fast builds and hot reloading, install the build tool "Parcel." You will also need to create a .babelrc file so that you can transpile JSX into JS. The .babelrc file should look similar to this:
```js
{
    "presets": ["env"],
    "plugins": [["babel-plugin-transform-react-jsx", {
        "pragma": "h"
    }]]
}
```
Now you are ready to use Mosaic!

# Example
Here is an example of a simple Mosaic application. All you need is an index.html file and an index.js file.
For a more detailed example, run the project inside the "example" folder.
**index.html**:
```
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
  const { h, Mosaic } = require('@authman2/Mosaic');
    
  // Create an "app" component.
  const app = new Mosaic({
      element: document.getElementById('root'),
      data: {
          title: "Mosaic App"
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
