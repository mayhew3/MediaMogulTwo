import {Component, OnInit} from '@angular/core';
import {GameService} from '../../services/game.service';
import {Platform} from '../../interfaces/Enum/Platform';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'underscore';
import {PersonService} from '../../services/person.service';
import {Game} from '../../interfaces/Model/Game';
import {PersonGame} from '../../interfaces/Model/PersonGame';

@Component({
  selector: 'mm-add-game',
  templateUrl: './add-game.component.html',
  styleUrls: ['./add-game.component.scss']
})
export class AddGameComponent implements OnInit {

  game = new Game();
  personGame = new PersonGame();

  constructor(private gameService: GameService,
              public activeModal: NgbActiveModal,
              private personService: PersonService) { }

  ngOnInit() {
  }

  getPlatformOptions(): string[] {
    const allPlatforms = Object.keys(Platform);
    return _.without(allPlatforms, Platform.Steam);
  }

  getDisplayValueOf(platformOption: string): string {
    return Platform[platformOption];
  }

  updatePlatform(platform) {
    this.game.platform.value = this.getDisplayValueOf(platform);
  }

  canSubmit(): boolean {
    return this.game.title.value !== '';
  }

  async submitAndClose() {
    this.personService.me$.subscribe(async person => {
      this.personGame.person_id.value = person.id.value;
      this.personGame.tier.value = 1;
      this.personGame.minutes_played.value = 0;

      this.game.personGame = this.personGame;

      await this.gameService.addGame(this.game);
      this.activeModal.close('Submit Click');
    });
  }
}
