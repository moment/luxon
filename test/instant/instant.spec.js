import {create} from './create.instant.spec';
import {getters} from './getters.instant.spec';
import {format} from './format.instant.spec';

export let instant = () => {
  describe('Instant', () => {
    create();
    //offset()
    getters();
    //setters();
    format();
    //parse();
    //math();
    //utils();
  });
};
