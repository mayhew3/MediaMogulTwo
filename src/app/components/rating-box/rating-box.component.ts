import {Component, Input, OnInit} from '@angular/core';
import {ColorTransformService} from '../../services/color-transform.service';

@Component({
  selector: 'mm-rating-box',
  templateUrl: './rating-box.component.html',
  styleUrls: ['./rating-box.component.scss']
})
export class RatingBoxComponent implements OnInit {
  @Input() value: number;
  @Input() maxValue: number;

  constructor(private colorTransformService: ColorTransformService) { }

  ngOnInit(): void {
  }

  getValue(): number {
    return this.getFormattedNumber(this.value);
  }

  getFormattedNumber(value) {
    if (!!this.value) {
      const floored = Math.floor(value);
      const remainder = value - floored;
      if (remainder < .05) {
        return floored;
      } else {
        return value.toFixed(1);
      }
    } else {
      return '--';
    }
  }

  colorStyle() {
    return this.colorTransformService.colorStyle(this.value, this.maxValue);
  }
}
