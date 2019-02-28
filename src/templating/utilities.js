export const marker = `{{m-${String(Math.random()).slice(2)}}}`;
export const nodeMarker = `<!--${marker}-->`;
export const markerRegex = new RegExp(`${marker}|${nodeMarker}`);
export const boundAttributeSuffix = '$m$';
export const lastAttributeNameRegex = /([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F \x09\x0a\x0c\x0d"'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;
export const createMarker = () => document.createComment('');

export const isPrimitive = value => {
    return !(value === null || !(typeof value === 'object' || typeof value === 'function'));
};
export const isIterable = value => {
    return Array.isArray(value) || !!(value && value[Symbol.iterator]);
};