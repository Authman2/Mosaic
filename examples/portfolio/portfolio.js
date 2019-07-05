import { Portfolio } from "../../src/index";

export default new Portfolio({
    count: 0
}, (e, data, other) => {
    if(e === 'count-up') data.count += 1;
    else if(e === 'count-down') data.count -= 1;
});