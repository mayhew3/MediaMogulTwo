import {Component, OnInit} from '@angular/core';
import {GameService} from '../../services/game.service';
import {Platform} from '../../interfaces/Enum/Platform';
import * as _ from 'underscore';
import {Game} from '../../interfaces/Model/Game';
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
  rating: number;

  constructor(private gameService: GameService,
              private arrayService: ArrayService) {
    this.igdbPlatformMap.set('PC (Microsoft Windows)', Platform.PC);
    this.igdbPlatformMap.set('Nintendo Switch', Platform.SWITCH);
    this.igdbPlatformMap.set('Wii U', Platform.WII_U);
    this.igdbPlatformMap.set('PlayStation 4', Platform.PS4);
    this.igdbPlatformMap.set('PlayStation 3', Platform.PS3);
    this.igdbPlatformMap.set('Nintendo DS', Platform.DS);
    this.igdbPlatformMap.set('SteamVR', Platform.Steam);
  }

  ngOnInit() {
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
    const matches = await this.gameService.getIGDBMatches(this.searchTitle);
    this.arrayService.refreshArray(this.matches, matches);
    _.forEach(this.matches, match => {
      _.forEach(match.platforms, platform => {
        const existing = this.findMatchingGameForPlatform(match, platform);
        platform.exists = !!existing;
        platform.owned = !!existing && !!existing.personGame;
      });
    });
  }

  async handleAddClick(match: any, platform: any) {
    let game: Game = this.findMatchingGameForPlatform(match, platform);
    if (!game) {
      game = await this.addGame(match, platform);
    }

    await this.gameService.addToMyGames(game, this.rating);
    platform.owned = true;
  }

  async addGame(match: any, platform: any): Promise<Game> {
    const game = new Game();

    game.title.value = match.name;
    game.platform.value = this.translatePlatformName(platform);
    game.igdb_id.value = match.id;
    if (!!match.cover) {
      game.igdb_poster.value = match.cover.image_id;
      game.igdb_width.value = match.cover.width;
      game.igdb_height.value = match.cover.height;
    }

    const returnGame = await this.gameService.addGame(game);
    platform.exists = true;

    return returnGame;
  }
}
