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

  constructor(private gameService: GameService,
              private personService: PersonService,
              private arrayService: ArrayService) { }

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

  getLastPlayedFormat(dateToFormat: Date): string {
    const thisYear = (new Date()).getFullYear();

    if (!!dateToFormat) {
      const year = dateToFormat.getFullYear();

      if (year === thisYear) {
        return 'EEE M/d';
      } else {
        return 'yyyy.M.d';
      }
    } else {
      return 'yyyy.M.d';
    }
  }

  getImageUrlForMatch(match: any): string {
    return 'https://images.igdb.com/igdb/image/upload/t_720p/' + match.cover.image_id + '.jpg';
  }

  getLastUpdatedFromNow(match: any): string {
    return moment.unix(match.updated_at).fromNow();
  }

  async getMatches() {
    const matches = await this.gameService.getIGDBMatches(this.searchTitle);
    this.arrayService.refreshArray(this.matches, matches);
  }

  async addGame(match: any) {
    this.personService.me$.subscribe(async person => {
      const game = new Game();
      const personGame = new PersonGame();

      personGame.person_id.value = person.id.value;
      personGame.tier.value = 1;
      personGame.minutes_played.value = 0;
      personGame.rating.value = 100;

      game.personGame = personGame;
      game.title.value = match.name;
      game.platform.value = 'PC';

      await this.gameService.addGame(game);
    });
  }
}
