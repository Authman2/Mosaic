import { Portfolio } from '../src/index';

export default new Portfolio({
    count: 0
}, (event, data, other) => {
    if(event === 'count-up') data.count += 1;
    else if(event === 'count-down') data.count -= 1;
})