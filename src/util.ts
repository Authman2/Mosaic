export const randomKey = (): string => Math.random().toString(36).slice(2);

export function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    return newNode;
}