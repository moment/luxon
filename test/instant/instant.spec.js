import {create} from './create.instant.spec';
import {getters} from './getters.instant.spec';
import {format} from './format.instant.spec';
import {zone} from './zone.instant.spec';
import {math} from './math.instant.spec';

export let instant = () => {
  describe('Instant', () => {
    create();
    zone();
    getters();
    //setters();
    format();
    //parse();
    math();
    //utils();
  });
};
