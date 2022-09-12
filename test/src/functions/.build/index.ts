
import type P from 'parse';
import actions from './actions';

type ParseType = typeof P;

const initialize = (Parse: ParseType) => {
  actions(Parse);
}

export default initialize;
