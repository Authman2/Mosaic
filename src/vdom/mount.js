const mount = function($node, $onto) {
    $onto.replaceWith($node);
    return $onto;
}
exports.mount = mount;