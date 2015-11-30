import * as chai from 'chai';
import {create} from './create.instant.spec';
import {getters} from './getters.instant.spec';

chai.should();

describe('Instant', () => {
  create();
  getters();
});
