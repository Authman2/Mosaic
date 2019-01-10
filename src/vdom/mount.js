/** Actually places a DOM onto the page by replacing an old version with a new version. 
* @param {Element} $newNode The node that you want to show on the page.
* @param {Element} $realNode The real node that will be replaced.
*/
const mount = ($newNode, $realNode) => {
    $realNode.replaceWith($newNode);
    return $newNode;
}
exports.mount = mount;