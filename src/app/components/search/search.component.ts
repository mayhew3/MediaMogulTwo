import { Component, OnInit } from '@angular/core';
import {GamePlatform} from '../../interfaces/Model/GamePlatform';
import {Person} from '../../interfaces/Model/Person';
import {GameService} from '../../services/game.service';
import {ArrayService} from '../../services/array.service';
import {PlatformService} from '../../services/platform.service';
import {PersonService} from '../../services/person.service';
import * as moment from 'moment';
import {AvailableGamePlatform} from '../../interfaces/Model/AvailableGamePlatform';
import {Game} from '../../interfaces/Model/Game';
import {MyGamePlatform} from '../../interfaces/Model/MyGamePlatform';
import * as _ from 'underscore';

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
              private arrayService: ArrayService,
              private platformService: PlatformService,
              private personService: PersonService) {
  }

  ngOnInit() {
    this.platformService.platforms.subscribe(platforms => this.arrayService.refreshArray(this.allPlatforms, platforms));
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
    return _.filter(availablePlatforms, availablePlatform => !_.contains(matchPlatformIDs, availablePlatform.platform.igdb_platform_id.value));
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
    return _.find(this.allPlatforms, platform => platform.igdb_platform_id.value === igdbID);
  }

  async getMatches() {
    this.loading = true;
    try {
      const matches = await this.gameService.getIGDBMatches(this.searchTitle);
      this.arrayService.refreshArray(this.matches, matches);
      _.forEach(this.matches, match => {
        match.existingGame = this.findMatchingGame(match);
        _.forEach(match.platforms, platform => {
          platform.availableGamePlatform = this.findExistingPlatformForGame(match, platform);
          platform.myGamePlatform = !platform.availableGamePlatform ? undefined : platform.availableGamePlatform.myGamePlatform;
        });
      });
    } catch (err) {
      this.error = err.message;
    } finally {
      this.loading = false;
    }
  }

  async handleAddClick(match: any, platform: any) {
    let game: Game = this.findMatchingGame(match);
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

  async getOrCreateGamePlatform(platform: any): Promise<GamePlatform> {
    const existingPlatform = this.findPlatformWithIGDBID(platform.id);
    if (!existingPlatform) {
      const gamePlatform = this.createNewGamePlatform(platform);
      return this.platformService.addPlatform(gamePlatform);
    } else {
      return existingPlatform;
    }
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
  private createNewGamePlatform(platform: any) {
    const gamePlatform = new GamePlatform();
    gamePlatform.full_name.value = platform.name;
    gamePlatform.short_name.value = platform.name;
    gamePlatform.igdb_name.value = platform.name;
    gamePlatform.igdb_platform_id.value = platform.id;
    return gamePlatform;
  }

  addGame(match: any, selectedPlatform: any): Promise<Game> {
    return new Promise<Game>(async next => {
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
        if (selectedPlatform.id === availablePlatform.platform.igdb_platform_id.value) {
          selectedAvailablePlatform = availablePlatform;
        }
      }

      if (!!selectedAvailablePlatform) {
        // noinspection JSUnusedAssignment
        await this.addToMyPlatforms(selectedAvailablePlatform, match, selectedPlatform);
      } else {
        throw new Error(`No available platform found for platform name '${selectedPlatform.name}'`);
      }

      next(game);

    });


  }
}
