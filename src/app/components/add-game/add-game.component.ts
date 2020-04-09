import { Component, OnInit } from '@angular/core';
import {GameService} from '../../services/game.service';
import {Platform} from '../../interfaces/Platform';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

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
              public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
  }

  getPlatformOptions(): string[] {
    return Object.keys(Platform);
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
        person_id: 1,
        tier: 1,
        rating: this.interfaceFields.personGame.rating,
        minutes_played: 0
      }
    };
    await this.gameService.addGame(gameObj);
    this.activeModal.close('Submit Click');
  }
}
