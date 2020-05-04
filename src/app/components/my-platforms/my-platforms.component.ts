import {Component, OnInit} from '@angular/core';
import {PlatformService} from '../../services/platform.service';
import {GamePlatform} from '../../interfaces/Model/GamePlatform';
import {ArrayUtil} from '../../utility/ArrayUtil';
import * as _ from 'underscore';
import {MyGlobalPlatform} from '../../interfaces/Model/MyGlobalPlatform';
import {GameService} from '../../services/game.service';
import {Game} from '../../interfaces/Model/Game';

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

  platformsInGlobal(): GamePlatform[] {
    return _.sortBy(_.filter(this.allPlatforms, platform => platform.isAvailableForMe()), platform => platform.myGlobalPlatform.rank.originalValue);
  }

  myGlobalPlatforms(): MyGlobalPlatform[] {
    return _.map(this.platformsInGlobal(), platform => platform.myGlobalPlatform);
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
      return !!matching && matching.isManuallyPreferred();
    }).length;
  }

  canUpdateRanks(): boolean {
    return this.hasChanges() && !this.hasDuplicates();
  }

  hasChanges(): boolean {
    return _.filter(this.myGlobalPlatforms(), myGlobalPlatform => myGlobalPlatform.rank.isChanged()).length > 0;
  }

  hasDuplicates(): boolean {
    const ranks = _.map(this.myGlobalPlatforms(), myGlobalPlatform => myGlobalPlatform.rank.value);
    const uniqRanks = _.uniq(ranks);
    return ranks.length !== uniqRanks.length;
  }

  async updateRanks() {
    if (this.hasDuplicates()) {
      throw new Error(`Can't update ranks with duplicates.`);
    }
    const changedPlatforms = _.filter(this.myGlobalPlatforms(), myGlobalPlatform => myGlobalPlatform.hasChanges());
    await this.gameService.updateMultipleGlobalPlatforms(changedPlatforms);
  }

  async addToMyPlatforms(platform: GamePlatform) {
    const myGlobalPlatform = new MyGlobalPlatform(platform);
    const gamePlatforms = this.platformsInGlobal();
    const ranks = _.map(gamePlatforms, myGlobalPlatform => myGlobalPlatform.myGlobalPlatform.rank.value);
    myGlobalPlatform.rank.value = _.max(ranks) > 0 ? _.max(ranks) + 1 : 1;
    await this.platformService.addMyGlobalPlatform(myGlobalPlatform);
  }

  async removeFromMyPlatforms(platform: GamePlatform) {
    await this.gameService.platformAboutToBeRemovedFromGlobal(platform);
    await this.platformService.removeMyGlobalPlatform(platform.myGlobalPlatform);
  }

}
