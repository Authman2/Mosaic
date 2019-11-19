// import { PortfolioAction } from './options';

// /** A central data store for Mosaic applications. */
// export default class Portfolio {
//     /** @interal */
//     private data: Object;
//     /** @interal */
//     private dependencies: Set<HTMLElement>;
//     /** @interal */
//     private action: PortfolioAction;

//     constructor(data: Object, action: PortfolioAction) {
//         this.data = data;
//         this.action = action;
//         this.dependencies = new Set();
//     }

//     /** Returns the value of a data property. */
//     get(name: string) {
//         return this.data[name];
//     }

//     /** Adds a dependency to this portfolio. @internal */
//     addDependency(component: HTMLElement) {
//         this.dependencies.add(component);
//     }

//     /** Removes a dependency from this portfolio. @internal */
//     removeDependency(component: HTMLElement) {
//         this.dependencies.delete(component);
//     }

//     /** Dispatches one or more events and updates its dependencies. */
//     dispatch(event: string|string[], additional: Object = {}) {
//         if(!this.action)
//             throw new Error(`You must define an action in the Portfolio constructor before dispatching events.`);

//         // Trigger the events.
//         if(Array.isArray(event)) event.forEach(eve => this.action(eve, this.data, additional));
//         else this.action(event, this.data, additional);

//         // Repaint all of the dependencies.
//         this.dependencies.forEach(component => (component as any).repaint());
//     }
// }