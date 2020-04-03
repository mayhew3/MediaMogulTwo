import {Directive, Input, HostBinding, HostListener, ElementRef} from '@angular/core';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: 'img[default]',
})

export class ImagePreloadDirective {
  @Input() default: string;
  @HostBinding('class') className;

  constructor(private eRef: ElementRef) {
  }

  @HostListener('error')
  load(){
    const element: HTMLImageElement = this.eRef.nativeElement;
    element.src = this.default;
  }
}
