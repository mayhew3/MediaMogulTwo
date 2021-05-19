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
    const myPlatforms = _.filter(this.allPlatforms, (platform: GamePlatform) => !!platform.myGlobalPlatform);
    return _.sortBy(myPlatforms, (platform: GamePlatform) => platform.myGlobalPlatform.rank);
  }

  myGlobalPlatforms(): MyGlobalPlatform[] {
    return _.map(this.platformsInGlobal(), platform => platform.myGlobalPlatform);
  }

  otherPlatforms(): GamePlatform[] {
    return _.filter(this.allPlatforms, platform => !platform.myGlobalPlatform);
  }

  getCountOfOwnedGames(platform: GamePlatform): number {
    return _.filter(this.allGames, game => {
      const matching = _.find(game.myPlatforms, myPlatform => myPlatform.availableGamePlatform.gamePlatform.id === platform.id);
      return !!matching;
    }).length;
  }

  getCountOfPreferredGames(platform: GamePlatform): number {
    return _.filter(this.allGames, game => {
      const matching = _.find(game.myPlatforms, myPlatform => myPlatform.availableGamePlatform.gamePlatform.id === platform.id);
      return !!matching && matching.isManuallyPreferred();
    }).length;
  }

  canUpdateRanks(): boolean {
    return this.hasChanges() && !this.hasDuplicates();
  }

  hasChanges(): boolean {
    return _.filter(this.myGlobalPlatforms(), myGlobalPlatform => !!myGlobalPlatform.rank).length > 0;
  }

  hasDuplicates(): boolean {
    const ranks = _.map(this.myGlobalPlatforms(), myGlobalPlatform => myGlobalPlatform.rank);
    const uniqRanks = _.uniq(ranks);
    return ranks.length !== uniqRanks.length;
  }

  async updateRanks(): Promise<void> {
    if (this.hasDuplicates()) {
      throw new Error(`Can't update ranks with duplicates.`);
    }
    const changedPlatforms = _.filter(this.myGlobalPlatforms(), myGlobalPlatform => true);
    await this.gameService.updateMultipleGlobalPlatforms(changedPlatforms);
  }

  get nextRank(): number {
    const ranks = _.map(this.platformsInGlobal(), mgp => mgp.myGlobalPlatform.rank);
    return _.max(ranks) > 0 ? _.max(ranks) + 1 : 1;
  }

  addToMyPlatforms(platform: GamePlatform): void {
    const myGlobalPlatform = {
      game_platform_id: platform.id,
      platform_name: platform.platform_name,
      rank: this.nextRank,
    };
    this.platformService.addMyGlobalPlatform(myGlobalPlatform);
  }

  removeFromMyPlatforms(platform: GamePlatform): void {
    this.platformService.removeMyGlobalPlatform(platform.myGlobalPlatform);
  }

}
