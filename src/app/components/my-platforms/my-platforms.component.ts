import { Component, OnInit } from '@angular/core';
import {PlatformService} from '../../services/platform.service';

@Component({
  selector: 'mm-my-platforms',
  templateUrl: './my-platforms.component.html',
  styleUrls: ['./my-platforms.component.scss']
})
export class MyPlatformsComponent implements OnInit {

  constructor(public platformService: PlatformService) { }

  ngOnInit(): void {
  }

}
