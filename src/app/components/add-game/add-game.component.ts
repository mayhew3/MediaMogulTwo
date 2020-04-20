import {Component, OnInit} from '@angular/core';
import {GameService} from '../../services/game.service';
import {Platform} from '../../interfaces/Enum/Platform';
import * as _ from 'underscore';
import {PersonService} from '../../services/person.service';
import {Game} from '../../interfaces/Model/Game';
import {PersonGame} from '../../interfaces/Model/PersonGame';
import {ArrayService} from '../../services/array.service';
import * as moment from 'moment';

@Component({
  selector: 'mm-add-game',
  templateUrl: './add-game.component.html',
  styleUrls: ['./add-game.component.scss']
})
export class AddGameComponent implements OnInit {

  searchTitle = '';
  matches = [];
  igdbPlatformMap = new Map();

  constructor(private gameService: GameService,
              private personService: PersonService,
              private arrayService: ArrayService) {
    this.igdbPlatformMap.set('PC (Microsoft Windows)', Platform.PC);
    this.igdbPlatformMap.set('Nintendo Switch', Platform.SWITCH);
    this.igdbPlatformMap.set('Wii U', Platform.WII_U);
    this.igdbPlatformMap.set('PlayStation 4', Platform.PS4);
    this.igdbPlatformMap.set('PlayStation 3', Platform.PS3);
    this.igdbPlatformMap.set('Nintendo DS', Platform.DS);
  }

  ngOnInit() {
  }

  getPlatformOptions(): string[] {
    const allPlatforms = Object.keys(Platform);
    return _.without(allPlatforms, Platform.Steam);
  }

  getDisplayValueOf(platformOption: string): string {
    return Platform[platformOption];
  }

  canSearch(): boolean {
    return this.searchTitle !== '';
  }

  getDateFrom(unixTimestamp: number): Date {
    return moment.unix(unixTimestamp).toDate();
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
      return 'btn-primary';
    } else {
      return 'btn-warning';
    }
  }

  private findMatchingGame(match: any, platform: any): Game {
    return this.gameService.findGame(match.id, this.translatePlatformName(platform));
  }

  private translatePlatformName(platform: any): string {
    const myPlatform = this.igdbPlatformMap.get(platform.name);
    return !!myPlatform ? myPlatform : platform.name;
  }

  async getMatches() {
    const matches = await this.gameService.getIGDBMatches(this.searchTitle);
    this.arrayService.refreshArray(this.matches, matches);
    _.forEach(this.matches, match => {
      _.forEach(match.platforms, platform => {
        const existing = this.findMatchingGame(match, platform);
        platform.exists = !!existing;
        platform.owned = !!existing && !!existing.personGame;
      });
    });
  }

  async handleAddClick(match: any, platform: any) {
    let game: Game = this.findMatchingGame(match, platform);
    if (!game) {
      game = await this.addGame(match, platform);
    }

    await this.gameService.addToMyGames(game);
    platform.owned = true;
  }

  async addGame(match: any, platform: any): Promise<Game> {
    const game = new Game();

    game.title.value = match.name;
    game.platform.value = this.translatePlatformName(platform);
    game.igdb_id.value = match.id;
    game.igdb_poster.value = !!match.cover ? match.cover.image_id : null;

    const returnGame = await this.gameService.addGame(game);
    platform.exists = true;

    return returnGame;
  }
}
