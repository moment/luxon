import {create} from './create';
import {units} from './units';
import {setters} from './setters';
import {math} from './math';
import {format} from './format';

export let duration = () => {
  create();
  setters();
  units();
  format();
  math();
};
