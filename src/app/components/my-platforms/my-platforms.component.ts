import {Component, OnInit} from '@angular/core';
import {PlatformService} from '../../services/platform.service';
import {GamePlatform} from '../../interfaces/Model/GamePlatform';
import {ArrayUtil} from '../../utility/ArrayUtil';
import * as _ from 'underscore';
import {MyGlobalPlatform} from '../../interfaces/Model/MyGlobalPlatform';

@Component({
  selector: 'mm-my-platforms',
  templateUrl: './my-platforms.component.html',
  styleUrls: ['./my-platforms.component.scss']
})
export class MyPlatformsComponent implements OnInit {

  allPlatforms: GamePlatform[] = [];

  constructor(private platformService: PlatformService) { }

  ngOnInit(): void {
    this.platformService.platforms.subscribe(incoming => {
      ArrayUtil.refreshArray(this.allPlatforms, incoming);
    });
  }

  myGlobalPlatforms(): GamePlatform[] {
    return _.filter(this.allPlatforms, platform => platform.isAvailableForMe());
  }

  otherPlatforms(): GamePlatform[] {
    return _.filter(this.allPlatforms, platform => !platform.isAvailableForMe());
  }

  async addToMyPlatforms(platform: GamePlatform) {
    const myGlobalPlatform = new MyGlobalPlatform(platform);
    const gamePlatforms = this.myGlobalPlatforms();
    const ranks = _.map(gamePlatforms, myGlobalPlatform => myGlobalPlatform.myGlobalPlatform.rank.value);
    myGlobalPlatform.rank.value = _.max(ranks) > 0 ? _.max(ranks) + 1 : 1;
    await this.platformService.addMyGlobalPlatform(myGlobalPlatform);
  }

}
