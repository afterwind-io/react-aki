import { BitMask } from '../lib/bitmask.mjs';
import Benchmark from 'benchmark';

var suite = new Benchmark.Suite();

suite
    .add('Bitmask', function () {
        const b13 = BitMask.FromBitIndex(13);
        const b5 = BitMask.FromBitIndex(5);
        b13.merge(b5).test(b5);
    })
    //   .add('String-Based', function () {
    //     const a13 = "1" + "\0".repeat(12);
    //     const a5 = "1" + "\0".repeat(4);

    //     const b13 = a13.toString(2);
    //     const b5 = a5.toString(2);

    //     const b135 = parseInt()
    //   })
    .add('Direct Bitwise Operation', function () {
        const b13 = 1 << 13;
        const b5 = 1 << 5;

        ((b13 | b5) & b5) !== 0;
    })
    .on('cycle', function (event) {
        console.log(String(event.target));
    })
    .on('complete', function () {
        console.log('Fastest is ' + this.filter('fastest').map('name'));
    })
    .run({ async: true });
