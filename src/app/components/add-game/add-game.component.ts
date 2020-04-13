import {Component, OnInit} from '@angular/core';
import {GameService} from '../../services/game.service';
import {Platform} from '../../interfaces/Platform';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'underscore';
import {PersonService} from '../../services/person.service';

@Component({
  selector: 'mm-add-game',
  templateUrl: './add-game.component.html',
  styleUrls: ['./add-game.component.scss']
})
export class AddGameComponent implements OnInit {

  interfaceFields = {
    title: '',
    platform: this.getDisplayValueOf(Platform.PC),
    personGame: {
      rating: null
    }
  };

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
    this.interfaceFields.platform = this.getDisplayValueOf(platform);
  }

  canSubmit(): boolean {
    return this.interfaceFields.title !== '';
  }

  async submitAndClose() {
    this.personService.me$.subscribe(async person => {
      const gameObj = {
        title: this.interfaceFields.title,
        platform: this.interfaceFields.platform,
        personGame: {
          person_id: person.id.getValue(),
          tier: 1,
          rating: this.interfaceFields.personGame.rating,
          minutes_played: 0
        }
      };
      await this.gameService.addGame(gameObj);
      this.activeModal.close('Submit Click');
    });
  }
}
