import {create} from './create';
import {format} from './format';
import {info} from './info';
import {many} from './many';
import {parse} from './parse';

export let interval = () => {
  create();
  info();
  many();
  format();
  parse();
};
