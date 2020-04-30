import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Game} from '../../interfaces/Model/Game';
import {AvailableGamePlatform} from '../../interfaces/Model/AvailableGamePlatform';
import {MyGamePlatform} from '../../interfaces/Model/MyGamePlatform';
import {GameService} from '../../services/game.service';

@Component({
  selector: 'mm-add-game',
  templateUrl: './add-game.component.html',
  styleUrls: ['./add-game.component.scss']
})
export class AddGameComponent implements OnInit {
  @Input() game: Game;

  constructor(public activeModal: NgbActiveModal,
              private gameService: GameService) {
  }

  ngOnInit() {
  }

  showAddButton(availableGamePlatform: AvailableGamePlatform): boolean {
    return !availableGamePlatform.myGamePlatform && availableGamePlatform.platform_name.originalValue !== 'Steam';
  }

  async addPlatform(availableGamePlatform: AvailableGamePlatform) {
    const myGamePlatform = new MyGamePlatform(availableGamePlatform);
    await this.gameService.addMyGamePlatform(availableGamePlatform, myGamePlatform);
  }

  async close() {
    this.activeModal.close('Submit click');
  }

  dismiss() {
    this.game.discardChanges();
    this.activeModal.dismiss('Cross Click');
  }
}
