/** Actually places a DOM onto the page by replacing an old version with a new version. 
* @param {Element} $newNode The node that you want to show on the page.
* @param {Element} $realNode The real node that will be replaced.
*/
const mount = ($newNode, $realNode) => {
    // This "works" by making the new node sit inside of root instead of replacing root.
    // however, there is a problem where you update different component states and every now and
    // then, if the updates comes at different times, we end up with child-child elements.
    // if($realNode.firstChild) {
    //     $realNode.firstChild.replaceWith($newNode);
    // } else {
    //     $realNode.appendChild($newNode);
    // }

    // This works.
    $realNode.replaceWith($newNode);
    return $newNode;
}
exports.mount = mount;