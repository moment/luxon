import {create} from './create';
import {diff} from './diff';
import {format} from './format';
import {getters} from './getters';
import {many} from './many';
import {math} from './math';
import {parse} from './parse';
import {setters} from './setters';
import {zone} from './zone';

export let instant = () => {
  create();
  zone();
  getters();
  setters();
  format();
  parse();
  math();
  many();
  diff();
};
