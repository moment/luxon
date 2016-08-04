import {create} from './create';
import {units} from './units';
import {setters} from './setters';
import {math} from './math';

export let duration = () => {
  create();
  setters();
  units();
  math();
};
