
export class ArrayUtil {
  static removeFromArray(originalArray, element) {
    const indexOf = originalArray.indexOf(element);
    if (indexOf < 0) {
      console.debug('No element found!');
      return;
    }
    originalArray.splice(indexOf, 1);
  }

  static cloneArray(originalArray): any[] {
    return originalArray.slice();
  }

  static addToArray(originalArray, newArray) {
    originalArray.push.apply(originalArray, newArray);
  }

  static refreshArray(originalArray, newArray) {
    this.emptyArray(originalArray);
    this.addToArray(originalArray, newArray);
  }

  static emptyArray(originalArray) {
    originalArray.length = 0;
  }

}
