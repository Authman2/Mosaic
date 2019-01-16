/** Returns a DOM element from a base element. */
const getDOMElement = (element) => {
	if(typeof element !== 'string') return element;
	return document.createElement(element);
}

/** Generates a random id for a component. */
const randomID = () => {
    return '_' + Math.random().toString(36).substr(2, 9);
}

/** Traverses a Mosaic component tree and calls the "created" method on all of them in order
* of when they show up in the app. So if you have Footer inside of Home inside of App, then you
* will run created on Footer first, then on Home, then on App.
* @param {Mosaic} start The entry point of the Mosaic app. */
const incrementallyCreateMosaics = (start) => {
	let children = Object.values(start.references);
	if(children.length === 1) {
		children[0].created();
	}

	children.forEach(child => incrementallyCreateMosaics(child));
}

exports.getDOMElement = getDOMElement;
exports.randomID = randomID;
exports.incrementallyCreateMosaics = incrementallyCreateMosaics;