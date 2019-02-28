import { Template } from './template';

/** A table for the templates. */
export const TemplateTable = new WeakMap();

/** The equivalent of the 'html' tagged function. */
export const m = (strings, ...values) => new Template(strings, values);