import { Component, OnInit } from '@angular/core';
import {GameService} from '../../services/game.service';
import {Platform} from '../../interfaces/Platform';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'underscore';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'mm-add-game',
  templateUrl: './add-game.component.html',
  styleUrls: ['./add-game.component.scss']
})
export class AddGameComponent implements OnInit {
  private person;

  interfaceFields = {
    title: '',
    platform: this.getDisplayValueOf(Platform.PC),
    personGame: {
      rating: null
    }
  };

  constructor(private gameService: GameService,
              public activeModal: NgbActiveModal,
              private authService: AuthService) { }

  async ngOnInit(): Promise<any> {
    this.person = await this.authService.getPerson();
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
    const gameObj = {
      title: this.interfaceFields.title,
      platform: this.interfaceFields.platform,
      personGame: {
        person_id: this.person.id,
        tier: 1,
        rating: this.interfaceFields.personGame.rating,
        minutes_played: 0
      }
    };
    await this.gameService.addGame(gameObj);
    this.activeModal.close('Submit Click');
  }
}
