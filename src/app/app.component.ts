import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'mm-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'media-mogul-two';

  constructor() {
  }

  ngOnInit(): void {
  }

}
