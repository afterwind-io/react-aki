export class BitMask {
  private bytes: Uint32Array;
  private byteLength: number;

  private constructor(byteLength: number) {
    this.bytes = new Uint32Array(byteLength);
    this.byteLength = byteLength;
  }

  public static FromBitIndex(bitIndex: number): BitMask {
    const byteLength = bitIndexToByteLength(bitIndex);

    const bitmask = new BitMask(byteLength);
    bitmask.bytes[byteLength - 1] = getHighestByte(bitIndex);

    return bitmask;
  }

  public merge(v: BitMask): BitMask {
    const byteLength = Math.max(this.byteLength, v.byteLength);
    const newBitmask = new BitMask(byteLength);

    const newBytes = newBitmask.bytes;
    const ourBytes = this.bytes;
    const theirBytes = v.bytes;

    for (let i = 0; i < byteLength; i++) {
      newBytes[i] = ourBytes[i] | theirBytes[i];
    }

    return newBitmask;
  }

  public test(v: BitMask): boolean {
    const byteLength = Math.min(this.byteLength, v.byteLength);

    const ourBytes = this.bytes;
    const theirBytes = v.bytes;

    for (let i = 0; i < byteLength; i++) {
      if ((ourBytes[i] & theirBytes[i]) !== 0) {
        return true;
      }
    }

    return false;
  }
}

function bitIndexToByteLength(bitIndex: number): number {
  return ((bitIndex - 1) >> 5) + 1;
}

function getHighestByte(bitIndex: number): number {
  // n & 31 === n % 32 (n>=0)
  return 1 << ((bitIndex - 1) & 31);
}
