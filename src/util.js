/** Generates a random id for a component. */
const randomID = () => {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// /** Traverses a Mosaic component tree and calls the "created" method on all of them in order
// * of when they show up in the app. So if you have Footer inside of Home inside of App, then you
// * will run created on Footer first, then on Home, then on App.
// * @param {Mosaic} start The entry point of the Mosaic app. */
// const incrementallyCreateMosaics = (start) => {
// 	let children = Object.values(start.references);
// 	if(children.length === 1) {
// 		children[0].created();
// 	}

// 	children.forEach(child => incrementallyCreateMosaics(child));
// }

/** Validates the child Mosaic components of a parent Mosaic component to make sure they
* all follow the same schema. 
* @param {Object} components The components to check for.
* @returns {Boolean} Whether or not there are no errors in the types of the input components. */
const validateMosaicChildren = (components) => {
	if(!components) return true;
	
	let children = Object.values(components);
	if(children.length === 0) return true;

	let foundOneWrong = children.find(comp => {
		if(!('type' in comp)) {
			return false;
		} else if('type' in comp) {
			if(!comp['type'].view) {
				return true;
			}
		}
	});
	return foundOneWrong === undefined || foundOneWrong === null;
}

exports.randomID = randomID;
// exports.incrementallyCreateMosaics = incrementallyCreateMosaics;
exports.validateMosaicChildren = validateMosaicChildren;