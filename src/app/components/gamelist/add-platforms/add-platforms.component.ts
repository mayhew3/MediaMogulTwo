import {Component, Input, OnInit} from '@angular/core';
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
export class AddPlatformsComponent implements OnInit {
  @Input() game_id: number;

  rating: number;
  game: Game;

  mostRecentAdd: MyGamePlatform;

  constructor(public activeModal: NgbActiveModal,
              private gameService: GameService,
              private platformService: PlatformService) {
  }

  ngOnInit(): void {
    this.gameService.gameWithIDObservable(this.game_id).subscribe(game => {
      this.game = game;
    });
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
