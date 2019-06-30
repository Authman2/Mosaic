/** Config options for a memory. */
interface MemoryOptions {
    type: string;
    steps: number[];
    attribute?: string;
    isEvent?: boolean;
    isComponentAttribute?: boolean;
}

/** Represents a piece of dynamic content in the markup. */
export default class Memory {
    constructor(public config: MemoryOptions) {
        // console.log(config);
    }

}