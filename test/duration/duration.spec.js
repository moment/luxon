import {create} from './create.duration.spec';
import {units} from './units.duration.spec';
import {math} from './math.duration.spec';

export let duration = () => {
  describe('Duration', () => {
    create();
    units();
    math();
  });
};
