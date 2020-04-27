import {Component, OnInit} from '@angular/core';
import {GameService} from '../../services/game.service';
import * as _ from 'underscore';
import {Game} from '../../interfaces/Model/Game';
import {ArrayService} from '../../services/array.service';
import * as moment from 'moment';
import {PlatformService} from '../../services/platform.service';
import {GamePlatform} from '../../interfaces/Model/GamePlatform';
import {Person} from '../../interfaces/Model/Person';
import {PersonService} from '../../services/person.service';
import {PersonGame} from '../../interfaces/Model/PersonGame';

@Component({
  selector: 'mm-add-game',
  templateUrl: './add-game.component.html',
  styleUrls: ['./add-game.component.scss']
})
export class AddGameComponent implements OnInit {

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
    if (!!platform.exists) {
      return 'btn-success';
    } else {
      return 'btn-primary';
    }
  }

  findExistingPlatformsNotListed(match: any): GamePlatform[] {
    const existingGame = this.findMatchingGameForPlatform(match);
    if (!existingGame) {
      return [];
    }
    const existingPlatformIDs = existingGame.getPlatformIGDBIDs();
    const ownedPlatformIDs = !existingGame.personGame ? [] : existingGame.personGame.getPlatformIGDBIDs();
    const matchPlatformIDs = _.map(match.platforms, platform => platform.id);
    const diffIDs = _.difference(_.difference(existingPlatformIDs, ownedPlatformIDs), matchPlatformIDs);
    return _.map(diffIDs, this.findPlatformWithIGDBID.bind(this));
  }

  findOwnedPlatformsNotListed(match: any): GamePlatform[] {
    const existingGame = this.findMatchingGameForPlatform(match);
    if (!existingGame || !existingGame.personGame) {
      return [];
    }
    const ownedPlatformIDs = existingGame.personGame.getPlatformIGDBIDs();
    const matchPlatformIDs = _.map(match.platforms, platform => platform.id);
    const diffIDs = _.difference(ownedPlatformIDs, matchPlatformIDs);
    return _.map(diffIDs, this.findPlatformWithIGDBID.bind(this));
  }

  private gameExistsWithPlatform(match: any, platform: any): boolean {
    const existingGame = this.findMatchingGameForPlatform(match);
    return !!existingGame && existingGame.hasPlatformWithIGDBID(platform.id);
  }

  private gameOwnedWithPlatform(match: any, platform: any): boolean {
    const existingGame = this.findMatchingGameForPlatform(match);
    return !!existingGame && !!existingGame.personGame && existingGame.personGame.hasPlatformWithIGDBID(platform.id);
  }

  private findMatchingGameForPlatform(match: any): Game {
    return this.gameService.findGame(match.id);
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
        _.forEach(match.platforms, platform => {
          platform.exists = this.gameExistsWithPlatform(match, platform);
          platform.owned = this.gameOwnedWithPlatform(match, platform);
        });
      });
    } catch (err) {
      this.error = err.message;
    } finally {
      this.loading = false;
    }
  }

  async handleAddClick(match: any, platform: any) {
    let game: Game = this.findMatchingGameForPlatform(match);
    if (!game) {
      await this.addGame(match, platform);
    } else {
      await this.addToMyGames(game, platform);
    }
    platform.owned = true;
  }

  async addExistingWithMyPlatform(match: any, platform: GamePlatform) {
    const game: Game = this.findMatchingGameForPlatform(match);
    const personGame = new PersonGame(this.platformService, this.allPlatforms);
    personGame.person_id.value = this.me.id.value;
    personGame.game_id.value = game.id.value;
    personGame.rating.value = this.rating;
    personGame.addToMyPlatforms(platform);
    await this.gameService.addPersonGame(game, personGame);
  }

  async addToMyGames(game: Game, platform: any) {
    const personGame = new PersonGame(this.platformService, this.allPlatforms);
    personGame.person_id.value = this.me.id.value;
    personGame.game_id.value = game.id.value;
    personGame.rating.value = this.rating;
    this.getOrCreateMyGamePlatform(platform, personGame);
    await this.gameService.addPersonGame(game, personGame);
  }

  private getOrCreateExistingGamePlatform(platform: any, game: Game): void {
    const existing = _.find(this.allPlatforms, existingPlatform => existingPlatform.igdb_platform_id.value === platform.id);
    if (!existing) {
      const gamePlatform = this.createNewGamePlatform(platform);
      game.addTemporaryPlatform(gamePlatform);
    } else {
      game.addToAvailablePlatforms(existing);
    }
  }

  private getOrCreateMyGamePlatform(platform: any, personGame: PersonGame): void {
    const existing = _.find(this.allPlatforms, existingPlatform => existingPlatform.igdb_platform_id.value === platform.id);
    if (!existing) {
      const gamePlatform = this.createNewGamePlatform(platform);
      personGame.addTemporaryPlatform(gamePlatform);
    } else {
      personGame.addToMyPlatforms(existing);
    }
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
      const game = new Game(this.platformService, this.allPlatforms);

      game.title.value = match.name;
      game.igdb_id.value = match.id;

      game.igdb_rating.value = match.rating;
      game.igdb_rating_count.value = match.rating_count;
      game.igdb_popularity.value = match.popularity;
      game.igdb_slug.value = match.slug;
      game.igdb_summary.value = match.summary;
      game.igdb_updated.value = this.getDateFrom(match.updated_at);

      const releaseDates = _.map(match.release_dates, release_date => release_date.date);
      const compact = _.compact(releaseDates);
      const minUnixDate = _.min(compact);

      game.igdb_release_date.value = this.getDateFrom(minUnixDate);

      if (!!match.cover) {
        game.igdb_poster.value = match.cover.image_id;
        game.igdb_width.value = match.cover.width;
        game.igdb_height.value = match.cover.height;
      }

      game.personGame = new PersonGame(this.platformService, this.allPlatforms);
      game.personGame.person_id.value = this.me.id.value;
      game.personGame.game_id.value = game.id.value;
      game.personGame.rating.value = this.rating;

      // todo: add ALL game platforms for game
      _.forEach(match.platforms, platform => {
        this.getOrCreateExistingGamePlatform(platform, game);
      });

      this.getOrCreateMyGamePlatform(selectedPlatform, game.personGame);

      const returnGame = await this.gameService.addGame(game);

      const availablePlatforms = returnGame.platforms;
      _.forEach(availablePlatforms, availablePlatform => this.platformService.addToPlatformsIfDoesntExist(availablePlatform));
      _.forEach(match.platforms, matchPlatform => matchPlatform.exists = true);
      selectedPlatform.owned = true;

      next(returnGame);

    });


  }
}
