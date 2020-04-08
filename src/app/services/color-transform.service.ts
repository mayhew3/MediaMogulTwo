import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ColorTransformService {

  constructor() { }

  colorStyle(value, maxValue) {
    const scaledValue = value;
    const halfVal = maxValue / 2;

    const hue = (scaledValue <= halfVal) ? scaledValue * 0.5 : (halfVal * 0.5 + (scaledValue - halfVal) * 4.5);
    const saturation = !scaledValue ? '0%' : '50%';
    return {
      'background-color': `hsla(${hue}, ${saturation}, 42%, 1`
    };
  }
}
