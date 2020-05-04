import {Component, OnInit} from '@angular/core';
import {PlatformService} from '../../services/platform.service';
import {GamePlatform} from '../../interfaces/Model/GamePlatform';
import {ArrayUtil} from '../../utility/ArrayUtil';
import * as _ from 'underscore';
import {MyGlobalPlatform} from '../../interfaces/Model/MyGlobalPlatform';
import {GameService} from '../../services/game.service';
import {Game} from '../../interfaces/Model/Game';
import {MyGamePlatform} from '../../interfaces/Model/MyGamePlatform';

@Component({
  selector: 'mm-my-platforms',
  templateUrl: './my-platforms.component.html',
  styleUrls: ['./my-platforms.component.scss']
})
export class MyPlatformsComponent implements OnInit {

  allPlatforms: GamePlatform[] = [];
  allGames: Game[] = [];

  constructor(private platformService: PlatformService,
              private gameService: GameService) { }

  ngOnInit(): void {
    this.platformService.platforms.subscribe(incoming => {
      ArrayUtil.refreshArray(this.allPlatforms, incoming);
      this.gameService.games.subscribe(games => {
        ArrayUtil.refreshArray(this.allGames, games);
      });
    });
  }

  myGlobalPlatforms(): GamePlatform[] {
    return _.filter(this.allPlatforms, platform => platform.isAvailableForMe());
  }

  otherPlatforms(): GamePlatform[] {
    return _.filter(this.allPlatforms, platform => !platform.isAvailableForMe());
  }

  getCountOfOwnedGames(platform: GamePlatform): number {
    return _.filter(this.allGames, game => {
      const matching = _.find(game.myPlatforms, myPlatform => myPlatform.availableGamePlatform.gamePlatform.id.originalValue === platform.id.originalValue);
      return !!matching;
    }).length;
  }

  getCountOfPreferredGames(platform: GamePlatform): number {
    return _.filter(this.allGames, game => {
      const matching = _.find(game.myPlatforms, myPlatform => myPlatform.availableGamePlatform.gamePlatform.id.originalValue === platform.id.originalValue);
      return !!matching && matching.isManuallyPreferred() && this.hasAlternatePreferred(game, matching);
    }).length;
  }

  hasAlternatePreferred(game: Game, myGamePlatform: MyGamePlatform): boolean {
    const otherPlatforms = _.without(game.myPlatformsInGlobal, myGamePlatform);
    return otherPlatforms.length > 0;
  }

  async addToMyPlatforms(platform: GamePlatform) {
    const myGlobalPlatform = new MyGlobalPlatform(platform);
    const gamePlatforms = this.myGlobalPlatforms();
    const ranks = _.map(gamePlatforms, myGlobalPlatform => myGlobalPlatform.myGlobalPlatform.rank.value);
    myGlobalPlatform.rank.value = _.max(ranks) > 0 ? _.max(ranks) + 1 : 1;
    await this.platformService.addMyGlobalPlatform(myGlobalPlatform);
  }

  async removeFromMyPlatforms(platform: GamePlatform) {
    await this.gameService.platformAboutToBeRemovedFromGlobal(platform);
    await this.platformService.removeMyGlobalPlatform(platform.myGlobalPlatform);
  }

}
