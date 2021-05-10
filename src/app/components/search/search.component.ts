import {Component, OnInit} from '@angular/core';
import {GamePlatform} from '../../interfaces/Model/GamePlatform';
import {Person} from '../../interfaces/Model/Person';
import {GameService} from '../../services/game.service';
import {PlatformService} from '../../services/platform.service';
import {PersonService} from '../../services/person.service';
import * as moment from 'moment';
import {AvailableGamePlatform} from '../../interfaces/Model/AvailableGamePlatform';
import {Game} from '../../interfaces/Model/Game';
import {MyGamePlatform} from '../../interfaces/Model/MyGamePlatform';
import * as _ from 'underscore';
import {ArrayUtil} from '../../utility/ArrayUtil';

@Component({
  selector: 'mm-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  searchTitle = '';
  matches = [];
  rating: number;
  loading = false;
  error: string;
  allPlatforms: GamePlatform[] = [];
  me: Person;

  constructor(private gameService: GameService,
              private platformService: PlatformService,
              private personService: PersonService) {
  }

  ngOnInit(): void {
    this.platformService.platforms.subscribe(platforms => ArrayUtil.refreshArray(this.allPlatforms, platforms));
    this.personService.me$.subscribe(person => this.me = person);
  }

  canSearch(): boolean {
    return this.searchTitle !== '';
  }

  getDateFrom(unixTimestamp: number): Date {
    return !unixTimestamp ? null : moment.unix(unixTimestamp).toDate();
  }

  getImageUrlForMatch(match: any): string {
    return !!match.cover ?
      'https://images.igdb.com/igdb/image/upload/t_720p/' + match.cover.image_id + '.jpg' :
      'images/GenericSeries.gif';
  }

  getLastUpdatedFromNow(match: any): string {
    return moment.unix(match.updated_at).fromNow();
  }

  getButtonClass(platform): string {
    if (!!platform.availableGamePlatform) {
      return 'btn-success';
    } else {
      return 'btn-primary';
    }
  }

  findExistingPlatformsNotListed(match: any): AvailableGamePlatform[] {
    const existingGame: Game = match.existingGame;
    if (!existingGame) {
      return [];
    }
    const availablePlatforms = existingGame.availablePlatforms;
    const matchPlatformIDs = _.map(match.platforms, platform => platform.id);
    return _.filter(availablePlatforms, availablePlatform => !_.contains(matchPlatformIDs, availablePlatform.gamePlatform.igdb_platform_id));
  }

  private findMatchingGame(match: any): Game {
    return this.gameService.findGame(match.id);
  }

  // noinspection JSMethodCanBeStatic
  private findExistingPlatformForGame(match: any, platform: any): AvailableGamePlatform {
    if (!!match.existingGame) {
      return match.existingGame.findPlatformWithIGDBID(platform.id);
    }
  }

  private findPlatformWithIGDBID(igdbID: number): GamePlatform {
    return _.find(this.allPlatforms, platform => platform.igdb_platform_id === igdbID);
  }

  hasAvailablePlatforms(match: any): boolean {
    return !!match.platforms && this.getAvailablePlatforms(match).length > 0;
  }

  hasUnavailablePlatforms(match: any): boolean {
    return !!match.platforms && this.getUnavailablePlatforms(match).length > 0;
  }

  getAvailablePlatforms(match: any): any[] {
    return _.filter(match.platforms, platform => !platform.unavailablePlatform);
  }

  getUnavailablePlatforms(match: any): any[] {
    return _.filter(match.platforms, platform => platform.unavailablePlatform);
  }

  async getMatches(): Promise<void> {
    this.loading = true;
    try {
      const matches = await this.gameService.getIGDBMatches(this.searchTitle);
      ArrayUtil.refreshArray(this.matches, matches);
      _.forEach(this.matches, match => {
        match.existingGame = this.findMatchingGame(match);
        _.forEach(match.platforms, platform => {
          const existingGamePlatform = this.findPlatformWithIGDBID(platform.id);
          if (!!existingGamePlatform) {
            platform.unavailablePlatform = !existingGamePlatform.myGlobalPlatform;
          }
          const availableGamePlatform = this.findExistingPlatformForGame(match, platform);
          if (!!availableGamePlatform) {
            if (availableGamePlatform.gamePlatform.myGlobalPlatform) {
              platform.availableGamePlatform = availableGamePlatform;
              platform.myGamePlatform = !platform.availableGamePlatform ? undefined : platform.availableGamePlatform.myGamePlatform;
            } else {
              platform.unavailablePlatform = true;
            }
          }
        });
      });
    } catch (err) {
      this.error = err.message;
    } finally {
      this.loading = false;
    }
  }

  async handleAddClick(match: any, platform: any): Promise<void> {
    const game: Game = this.findMatchingGame(match);
    if (!game) {
      await this.addGame(match, platform);
    } else {
      await this.addToMyPlatforms(game, match, platform);
    }
  }

  async addExistingWithMyPlatform(availablePlatform: AvailableGamePlatform): Promise<MyGamePlatform> {
    const myGamePlatform = new MyGamePlatform(availablePlatform);
    myGamePlatform.rating.value = this.rating;
    return this.gameService.addMyGamePlatform(availablePlatform, myGamePlatform);
  }

  getOrCreateGamePlatform(platform: any): Promise<GamePlatform> {
    return new Promise((resolve) => {
      const existingPlatform = this.findPlatformWithIGDBID(platform.id);
      if (!existingPlatform) {
        this.platformService.waitForPlatformAdded(platform.id).subscribe(addedPlatform => {
          resolve(addedPlatform);
        });
        const gamePlatform = this.createNewGamePlatform(platform);
        this.platformService.addPlatform(gamePlatform);
      } else {
        resolve(existingPlatform);
      }
    });
  }

  async getOrCreateAvailablePlatform(game: Game, platform: any): Promise<AvailableGamePlatform> {
    const gamePlatform = await this.getOrCreateGamePlatform(platform);
    if (!platform.availableGamePlatform) {
      const availablePlatformObj = new AvailableGamePlatform(gamePlatform, game);
      platform.availableGamePlatform = await this.gameService.addAvailablePlatformForExistingGamePlatform(game, availablePlatformObj);
    }
    return platform.availableGamePlatform;
  }

  async addToMyPlatforms(game: Game, match: any, platform: any): Promise<MyGamePlatform> {
    for (const platformObj of match.platforms) {
      await this.getOrCreateAvailablePlatform(game, platformObj);
    }
    const availablePlatform = await this.getOrCreateAvailablePlatform(game, platform);
    platform.myGamePlatform = await this.addExistingWithMyPlatform(availablePlatform);
    return platform.myGamePlatform;
  }

  // noinspection JSMethodCanBeStatic
  private createNewGamePlatform(platform: any): any {
    return {
      full_name: platform.name,
      short_name: platform.name,
      igdb_name: platform.name,
      igdb_platform_id: platform.id
    };
  }

  async addGame(match: any, selectedPlatform: any): Promise<Game> {
    const gameObj = new Game(this.platformService, this.allPlatforms);

    gameObj.title.value = match.name;
    gameObj.igdb_id.value = match.id;

    gameObj.igdb_rating.value = match.rating;
    gameObj.igdb_rating_count.value = match.rating_count;
    gameObj.igdb_popularity.value = match.popularity;
    gameObj.igdb_slug.value = match.slug;
    gameObj.igdb_summary.value = match.summary;
    gameObj.igdb_updated.value = this.getDateFrom(match.updated_at);

    const releaseDates = _.map(match.release_dates, release_date => release_date.date);
    const compact = _.compact(releaseDates);
    const minUnixDate = _.min(compact);

    gameObj.igdb_release_date.value = this.getDateFrom(minUnixDate);

    if (!!match.cover) {
      gameObj.igdb_poster.value = match.cover.image_id;
      gameObj.igdb_width.value = match.cover.width;
      gameObj.igdb_height.value = match.cover.height;
    }

    const game = await this.gameService.addGame(gameObj);

    let selectedAvailablePlatform;

    for (const platform of match.platforms) {
      const availablePlatform = await this.getOrCreateAvailablePlatform(game, platform);
      if (selectedPlatform.id === availablePlatform.gamePlatform.igdb_platform_id) {
        selectedAvailablePlatform = availablePlatform;
      }
    }

    if (!!selectedAvailablePlatform) {
      // noinspection JSUnusedAssignment
      await this.addToMyPlatforms(selectedAvailablePlatform, match, selectedPlatform);
    } else {
      throw new Error(`No available platform found for platform name '${selectedPlatform.name}'`);
    }

    return game;

  }
}
