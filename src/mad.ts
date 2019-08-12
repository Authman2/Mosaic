import { ViewFunction } from "./options";

/** An array diffing algorithm that gives back the fewest number of 
modifications, additions, and deletions from one array of strings
to another. Based on the implementation by the JSDiff library. */
export default class MAD {

    constructor(private first: ViewFunction[], private second: ViewFunction[]) {
        this.first = first;
        this.second = second;
    }


    /** The main function to compute and return the fewest changes 
    * from the old array to the new one. */
    diff(finished?: ((value) => any)) {
        let oldLength = this.first.length;
        let newLength = this.second.length;

        // Calculate the length of the edit script.
        let editLength = 1;
        let maxEditLength = oldLength + newLength;
        let bestPath: any[] = [{
            components: [],
            newPos: -1,
        }];

        // Define an end value function.
        const done = (value) => {
            if(finished) {
                setTimeout(() => finished(value), 0);
                return true;
            } else {
                return value;
            }
        }

        // When the content start with the same value.
        let oldPos = this.extractCommon(bestPath[0], 0);
        if(bestPath[0].newPos + 1 >= newLength && oldPos + 1 >= oldLength) {
            return done([{
                edit: this.second,
                count: this.second.length
            }]);
        }

        // This is where most of the work is done. Finds all permutations
        // of the edit script.
        const findEditLength = () => {
            for(let path = -1 * editLength; path <= editLength; path += 2) {
                let base;
                let addPath = bestPath[path - 1];
                let deletePath = bestPath[path + 1];
                let oldPos = (deletePath ? deletePath.newPos : 0) - path;

                // Value will not be used again, so clear it.
                if(addPath) bestPath[path - 1] = undefined;

                // Value unchanged, so skip to the next grid point.
                let canAdd = addPath && addPath.newPos + 1 < newLength;
                let canDelete = deletePath && 0 <= oldPos && oldPos < oldLength;
                if(!canAdd && !canDelete) {
                    bestPath[path] = undefined;
                    continue;
                }

                // Move to the diagonal where the position of the path in
                // the new array is at the farthes point from the origin
                // and does not go over the bounds of the diff graph.
                if(!canAdd || (canDelete && addPath.newPos < deletePath.newPos)) {
                    base = this.clonePath(deletePath);
                    this.pushComponent(base.components, undefined, true);
                } else {
                    base = addPath;
                    base.newPos += 1;
                    this.pushComponent(base.components, true, undefined);
                }

                oldPos = this.extractCommon(base, path);

                // If you reach the end of the arrays then you're done.
                if(base.newPos + 1 >= newLength && oldPos + 1 >= oldLength) {
                    const edits = this.constructEdits(base.components, true);
                    return done(edits);
                }
                // Otherwise, this is a potential best path and we need to
                // keep going.
                else {
                    bestPath[path] = base;
                }
            }

            editLength += 1;
        }

        // Goes through the edit iterations. Using this kind of function
        // makes async work too.
        const callback = finished;
        if(callback) {
            (function exec() {
                setTimeout(() => {
                    if(editLength > maxEditLength) return callback([]);
                    if(!findEditLength()) exec();
                }, 0);
            }());
        } else {
            while(editLength <= maxEditLength) {
                let ret = findEditLength();
                if(ret) return ret;
            }
        }
    }

    /** Utility functions. */
    private extractCommon(basePath, diagonalPath) {
        let oldLength = this.first.length;
        let newLength = this.second.length;
        
        let newPos = basePath.newPos;
        let oldPos = newPos - diagonalPath;

        let commonCount = 0;

        while(newPos + 1 < newLength
            && oldPos + 1 < oldLength
            && this.equals(this.second[newPos + 1], this.first[oldPos + 1])) {
            
            newPos += 1;
            oldPos += 1;
            commonCount += 1;
        }

        if(commonCount) basePath.components.push({ count: commonCount });

        basePath.newPos = newPos;
        return oldPos;
    }

    private clonePath(path) {
        return {
            newPos: path.newPos,
            components: path.components.slice()
        };
    }

    private pushComponent(components, added, deleted) {
        let last = components[components.length - 1];

        // Make a clone of the component.
        if(last && last.added === added && last.deleted === deleted) {
            components[components.length - 1] = {
                count: last.count + 1,
                added,
                deleted
            };
        } else {
            components.push({
                count: 1,
                added,
                deleted
            });
        }
    }

    private constructEdits(components, useLongestToken) {
        let componentPos = 0;
        let componentLength = components.length;
        let newPos = 0;
        let oldPos = 0;

        for(; componentPos < componentLength; componentPos++) {
            let comp = components[componentPos];
            if(!comp.deleted) {
                if(!comp.added && useLongestToken) {
                    let edit = this.second.slice(newPos, newPos + comp.count)
                        .map((value, index) => {
                            let oldVal = this.first[oldPos + index];
                            let len = edit ? edit.length : 0;
                            return this.first.length > len ? oldVal : edit;
                        });

                    comp.edit = edit.slice();
                } else {
                    comp.edit = this.second.slice(newPos, newPos + comp.count);
                }
                newPos += comp.count;

                // Common Case.
                if(!comp.added) oldPos += comp.count;
            } else {
                comp.edit = this.first.slice(oldPos, oldPos + comp.count);
                oldPos += comp.count;

                // Reverse the add and removes so removes happen first.
                if(componentPos && components[componentPos - 1].added) {
                    let temp = components[componentPos - 1];
                    components[componentPos - 1] = components[componentPos];
                    components[componentPos] = temp;
                }
            }
        }
        return components;
    }

    private equals(one: ViewFunction, two: ViewFunction): boolean {
        return (''+one.values === ''+two.values);
    }
}