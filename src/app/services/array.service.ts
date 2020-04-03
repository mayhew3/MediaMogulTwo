import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ArrayService {

  constructor() { }

  addToArray(originalArray, newArray) {
    originalArray.push.apply(originalArray, newArray);
  }

  refreshArray(originalArray, newArray) {
    this.emptyArray(originalArray);
    this.addToArray(originalArray, newArray);
  }

  emptyArray(originalArray) {
    originalArray.length = 0;
  }

  removeFromArray(originalArray, element) {
    const indexOf = originalArray.indexOf(element);
    if (indexOf < 0) {
      console.debug('No element found!');
      return;
    }
    originalArray.splice(indexOf, 1);
  }
}
