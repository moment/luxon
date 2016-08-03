import {create} from './create';
import {getters} from './getters';
import {setters} from './setters';
import {format} from './format';
import {zone} from './zone';
import {math} from './math';
import {many} from './many';

export let instant = () => {
  create();
  zone();
  getters();
  setters();
  format();
  //parse();
  math();
  many();
  //utils();
};
