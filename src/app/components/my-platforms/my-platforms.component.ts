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
    return _.sortBy(_.filter(this.allPlatforms, (platform: GamePlatform) => !!platform.myGlobalPlatform), (platform: GamePlatform) => platform.myGlobalPlatform.rank);
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

  async addToMyPlatforms(platform: GamePlatform): Promise<void> {
    const myGlobalPlatform = new MyGlobalPlatform();
    myGlobalPlatform.game_platform_id = platform.id;
    myGlobalPlatform.platform_name = platform.full_name;
    const gamePlatforms = this.platformsInGlobal();
    const ranks = _.map(gamePlatforms, mgp => mgp.myGlobalPlatform.rank);
    myGlobalPlatform.rank = _.max(ranks) > 0 ? _.max(ranks) + 1 : 1;
    await this.platformService.addMyGlobalPlatform(myGlobalPlatform);
  }

  async removeFromMyPlatforms(platform: GamePlatform): Promise<void> {
    await this.gameService.platformAboutToBeRemovedFromGlobal(platform);
    await this.platformService.removeMyGlobalPlatform(platform.myGlobalPlatform);
  }

}
