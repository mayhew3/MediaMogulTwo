import {Component, OnInit} from '@angular/core';
import {GameService} from '../../services/game.service';
import {Platform} from '../../interfaces/Enum/Platform';
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
  igdbPlatformMap = new Map();
  rating: number;
  loading = false;
  error: string;
  allPlatforms: GamePlatform[] = [];
  me: Person;

  constructor(private gameService: GameService,
              private arrayService: ArrayService,
              private platformService: PlatformService,
              private personService: PersonService) {
    this.igdbPlatformMap.set('PC (Microsoft Windows)', Platform.PC);
    this.igdbPlatformMap.set('Nintendo Switch', Platform.SWITCH);
    this.igdbPlatformMap.set('Wii U', Platform.WII_U);
    this.igdbPlatformMap.set('PlayStation 4', Platform.PS4);
    this.igdbPlatformMap.set('PlayStation 3', Platform.PS3);
    this.igdbPlatformMap.set('Nintendo DS', Platform.DS);
    this.igdbPlatformMap.set('SteamVR', Platform.Steam);
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

  findMyPlatformsNotListed(match: any): string[] {
    const myGames = this.findAllExistingPlatformsForGame(match);
    const myPlatforms = _.map(myGames, game => game.platform.value);
    const theirPlatforms = _.map(match.platforms, platform => this.translatePlatformName(platform));
    return _.difference(myPlatforms, theirPlatforms);
  }

  private findAllExistingPlatformsForGame(match: any): Game[] {
    return this.gameService.findGames(match.id);
  }

  private findMatchingGameForPlatform(match: any, platform: any): Game {
    return this.gameService.findGame(match.id, this.translatePlatformName(platform));
  }

  private translatePlatformName(platform: any): string {
    const myPlatform = this.igdbPlatformMap.get(platform.name);
    return !!myPlatform ? myPlatform : platform.name;
  }

  async getMatches() {
    this.loading = true;
    try {
      const matches = await this.gameService.getIGDBMatches(this.searchTitle);
      this.arrayService.refreshArray(this.matches, matches);
      _.forEach(this.matches, match => {
        _.forEach(match.platforms, platform => {
          const existing = this.findMatchingGameForPlatform(match, platform);
          platform.exists = !!existing;
          platform.owned = !!existing && !!existing.personGame;
        });
      });
    } catch (err) {
      this.error = err.message;
    } finally {
      this.loading = false;
    }
  }

  async handleAddClick(match: any, platform: any) {
    let game: Game = this.findMatchingGameForPlatform(match, platform);
    if (!game) {
      game = await this.addGame(match, platform);
    }

    await this.gameService.addToMyGames(game, this.rating);
    platform.owned = true;
  }

  private getOrCreateExistingGamePlatform(platform: any, game: Game, allPlatforms: GamePlatform[]): void {
    const existing = _.find(allPlatforms, existingPlatform => existingPlatform.igdb_platform_id.value === platform.id);
    if (!existing) {
      const gamePlatform = new GamePlatform();
      gamePlatform.full_name.value = platform.name;
      gamePlatform.short_name.value = platform.name;
      gamePlatform.igdb_name.value = platform.name;
      gamePlatform.igdb_platform_id.value = platform.id;
      game.addToAvailablePlatforms(gamePlatform);
    } else {
      game.addToAvailablePlatforms(existing);
    }
  }

  addGame(match: any, platform: any): Promise<Game> {
    return new Promise<Game>(async next => {
      const game = new Game(this.platformService);

      game.title.value = match.name;
      game.platform.value = this.translatePlatformName(platform);
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

      game.personGame = new PersonGame();
      game.personGame.person_id.value = this.me.id.value;
      game.personGame.game_id.value = game.id.value;
      game.personGame.rating.value = this.rating;

      _.forEach(match.platforms, platform => this.getOrCreateExistingGamePlatform(platform, game, this.allPlatforms));

      const returnGame = await this.gameService.addGame(game);

      const availablePlatforms = returnGame.availablePlatforms;
      _.forEach(availablePlatforms, availablePlatform => this.platformService.addToPlatformsIfDoesntExist(availablePlatform));
      _.forEach(match.platforms, matchPlatform => matchPlatform.exists = true);

      next(returnGame);

    });


  }
}
