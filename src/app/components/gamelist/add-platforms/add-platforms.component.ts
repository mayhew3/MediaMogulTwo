import {Component, Input} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Game} from '../../../interfaces/Model/Game';
import {AvailableGamePlatform} from '../../../interfaces/Model/AvailableGamePlatform';
import {MyGamePlatform} from '../../../interfaces/Model/MyGamePlatform';
import {GameService} from '../../../services/game.service';
import {PlatformService} from '../../../services/platform.service';

@Component({
  selector: 'mm-add-game',
  templateUrl: './add-platforms.component.html',
  styleUrls: ['./add-platforms.component.scss']
})
export class AddPlatformsComponent {
  @Input() game: Game;

  rating: number;

  mostRecentAdd: MyGamePlatform;

  constructor(public activeModal: NgbActiveModal,
              private gameService: GameService,
              private platformService: PlatformService) {
  }

  get addablePlatforms(): AvailableGamePlatform[] {
    return this.platformService.addablePlatforms(this.game);
  }

  showAddButton(availableGamePlatform: AvailableGamePlatform): boolean {
    return !availableGamePlatform.myGamePlatform && availableGamePlatform.platform_name !== 'Steam';
  }

  addPlatform(availableGamePlatform: AvailableGamePlatform): void {
    this.gameService.addMyGamePlatform(availableGamePlatform, this.rating);
  }

  async close(): Promise<void> {
    this.activeModal.close(this.mostRecentAdd);
  }

  dismiss(): void {
    this.activeModal.dismiss();
  }
}