import {Directive, Input, HostBinding, HostListener, ElementRef} from '@angular/core';
import {Game} from '../interfaces/Model/Game';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'img[default]',
})

export class ImagePreloadDirective {
  @Input() default: string;
  @Input() game: Game;
  @Input() match: any;
  @HostBinding('class') className;

  constructor(private eRef: ElementRef) {
  }

  @HostListener('error')
  load(): void {
    const element: HTMLImageElement = this.eRef.nativeElement;
    element.src = this.default;
    if (!!this.game) {
      this.game.brokenImage = true;
    }
    if (!!this.match) {
      this.match.brokenImage = true;
    }
  }
}
