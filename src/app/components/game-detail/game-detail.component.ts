import {Component, Input, OnInit} from '@angular/core';
import {GameService} from '../../services/game.service';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Platform} from '../../interfaces/Enum/Platform';
import {PersonService} from '../../services/person.service';
import {Game} from '../../interfaces/Model/Game';

@Component({
  selector: 'mm-game-detail',
  templateUrl: './game-detail.component.html',
  styleUrls: ['./game-detail.component.scss']
})
export class GameDetailComponent implements OnInit {
  @Input() game: Game;

  changedGameFields = {};
  changedPersonFields = {};
  finished = false;

  editedTitle;

  titleEditMode = false;

  constructor(private gameService: GameService,
              public activeModal: NgbActiveModal,
              public personService: PersonService) { }

  ngOnInit(): void {
    this.finished = !!this.game.personGame && !!this.game.personGame.finished_date.value;
    this.editedTitle = this.game.title.value;
  }

  toggleTitleEdit() {
    this.titleEditMode = !this.titleEditMode;
  }

  anyFieldsChanged(): boolean {
    return Object.keys(this.changedGameFields).length > 0 || Object.keys(this.changedPersonFields).length > 0;
  }

  onFinishedFieldEdit() {
    this.game.personGame.finished_date.value = !!this.finished ? new Date() : undefined;
    this.onFieldEdit();
  }

  onFieldEdit() {
    this.changedGameFields = this.game.getChangedFields();
    this.changedPersonFields = this.game.personGame.getChangedFields();
  }

  getPlatformOptions(): string[] {
    return Object.keys(Platform);
  }

  getDisplayValueOf(platformOption: string): string {
    return Platform[platformOption];
  }

  updatePlatform(platform) {
    this.game.platform.value = this.getDisplayValueOf(platform);
    this.onFieldEdit();
  }

  hasPerson(): boolean {
    return !!this.game.personGame;
  }

  async changeValues() {
    const allUpdates = [];

    if (Object.getOwnPropertyNames(this.changedPersonFields).length > 0) {
      allUpdates.push(this.doPersonUpdate());
    }

    if (Object.getOwnPropertyNames(this.changedGameFields).length > 0) {
      allUpdates.push(this.doGameUpdate());
    }

    await Promise.all(allUpdates);
    this.activeModal.close('Update Click');
  }

  dismiss() {
    this.game.discardChanges();
    this.activeModal.dismiss('Cross Click');
  }

  async doPersonUpdate() {
    await this.gameService.updatePersonGame(this.game.personGame);
  }

  async doGameUpdate() {
    await this.gameService.updateGame(this.game);
  }

  async updateTitle() {
    await this.gameService.updateGame(this.game);
    this.titleEditMode = false;
  }
}
