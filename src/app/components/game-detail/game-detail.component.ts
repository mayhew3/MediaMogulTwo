import {Component, Input, OnInit} from '@angular/core';
import {GameService} from '../../services/game.service';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Platform} from '../../interfaces/Platform';
import {PersonService} from '../../services/person.service';
import {Game} from '../../interfaces/Game';

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
      allUpdates.push(this.doPersonUpdate(this.changedPersonFields));
    }

    if (Object.getOwnPropertyNames(this.changedGameFields).length > 0) {
      allUpdates.push(this.doGameUpdate(this.changedGameFields));
    }

    await Promise.all(allUpdates);
    this.activeModal.close('Update Click');
  }

  async doPersonUpdate(changedFields) {
    await this.gameService.updatePersonGame(this.game, changedFields);
  }

  async doGameUpdate(changedFields) {
    await this.gameService.updateGame(this.game, changedFields);
  }

  async updateTitle() {
    const changedFields = {
      title: this.editedTitle
    }
    await this.gameService.updateGame(this.game, changedFields);
    this.titleEditMode = false;
  }
}
