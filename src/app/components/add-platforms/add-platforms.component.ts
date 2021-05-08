import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Game} from '../../interfaces/Model/Game';
import {AvailableGamePlatform} from '../../interfaces/Model/AvailableGamePlatform';
import {MyGamePlatform} from '../../interfaces/Model/MyGamePlatform';
import {GameService} from '../../services/game.service';

@Component({
  selector: 'mm-add-game',
  templateUrl: './add-platforms.component.html',
  styleUrls: ['./add-platforms.component.scss']
})
export class AddPlatformsComponent implements OnInit {
  @Input() game: Game;

  rating: number;

  mostRecentAdd: MyGamePlatform;

  constructor(public activeModal: NgbActiveModal,
              private gameService: GameService) {
  }

  ngOnInit(): void {
  }

  showAddButton(availableGamePlatform: AvailableGamePlatform): boolean {
    return !availableGamePlatform.myGamePlatform && availableGamePlatform.platform_name.originalValue !== 'Steam';
  }

  async addPlatform(availableGamePlatform: AvailableGamePlatform) {
    const myGamePlatform = new MyGamePlatform(availableGamePlatform);
    myGamePlatform.rating.value = this.rating;
    this.mostRecentAdd = await this.gameService.addMyGamePlatform(availableGamePlatform, myGamePlatform);
  }

  async close() {
    this.activeModal.close(this.mostRecentAdd);
  }

  dismiss() {
    this.game.discardChanges();
    this.activeModal.dismiss();
  }
}
