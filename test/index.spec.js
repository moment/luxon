import * as chai from 'chai';
import {instant} from './instant/instant.spec';
import {duration} from './duration/duration.spec';
import {interval} from './interval/interval.spec';

chai.should();

describe('Luxon', () => {
  instant();
  duration();
  interval();
});
