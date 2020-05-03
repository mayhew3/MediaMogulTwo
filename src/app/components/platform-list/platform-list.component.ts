import { Component, OnInit } from '@angular/core';
import {PlatformService} from '../../services/platform.service';

@Component({
  selector: 'mm-platform-list',
  templateUrl: './platform-list.component.html',
  styleUrls: ['./platform-list.component.scss']
})
export class PlatformListComponent implements OnInit {

  constructor(public platformService: PlatformService) { }

  ngOnInit(): void {
  }

}
