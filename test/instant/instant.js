import {create} from './create';
import {getters} from './getters';
import {format} from './format';
import {zone} from './zone';
import {math} from './math';

export let instant = () => {
  create();
  zone();
  getters();
  //setters();
  format();
  //parse();
  math();
  //utils();
};
