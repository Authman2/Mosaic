/** Returns a DOM element from a base element. */
const getDOMElement = (element) => {
	if(typeof element !== 'string') return element;
	return document.createElement(element);
}

/** Generates a random id for a component. */
const randomID = () => {
    return '_' + Math.random().toString(36).substr(2, 9);
}

exports.getDOMElement = getDOMElement;
exports.randomID = randomID;