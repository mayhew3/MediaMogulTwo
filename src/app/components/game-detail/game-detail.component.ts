import {Component, Input, OnInit} from '@angular/core';
import {GameService} from '../../services/game.service';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {ArrayService} from '../../services/array.service';
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

  originalFields;
  interfaceFields;
  originalPersonFields;
  interfacePersonFields;
  changedGameFields = {};
  changedPersonFields = {};
  finished = false;

  editedTitle;

  titleEditMode = false;

  constructor(private gameService: GameService,
              public activeModal: NgbActiveModal,
              private arrayService: ArrayService,
              public personService: PersonService) { }

  ngOnInit(): void {
    this.finished = !!this.game.personGame && !!this.game.personGame.finished_date;
    this.editedTitle = this.game.title.value;

    if (!!this.game.personGame) {
      this.originalPersonFields = {
        rating: this.game.personGame.rating,
        final_score: this.game.personGame.final_score,
        replay_score: this.game.personGame.replay_score,
        finished_date: this.game.personGame.finished_date,
      };

      this.interfacePersonFields = {
        rating: this.game.personGame.rating,
        final_score: this.game.personGame.final_score,
        replay_score: this.game.personGame.replay_score,
        finished_date: this.game.personGame.finished_date,
      };
    }
  }

  toggleTitleEdit() {
    this.titleEditMode = !this.titleEditMode;
  }

  anyFieldsChanged(): boolean {
    return Object.keys(this.changedGameFields).length > 0 || Object.keys(this.changedPersonFields).length > 0;
  }

  onFinishedFieldEdit() {
    this.interfacePersonFields.finished_date = !!this.finished ? new Date() : undefined;
    this.onFieldEdit();
  }

  onFieldEdit() {
    this.changedGameFields = this.game.getChangedFields();
    this.changedPersonFields = this.getChangedPersonFields();
  }

  getChangedPersonFields() {
    return this.arrayService.getChangedFields(this.interfacePersonFields, this.originalPersonFields);
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
    this.refreshPersonFields(changedFields);
  }

  async doGameUpdate(changedFields) {
    await this.gameService.updateGame(this.game, changedFields);
    this.game.update();
  }

  refreshPersonFields(changedFields) {
    for (const key in changedFields) {
      if (changedFields.hasOwnProperty(key)) {
        const changedField = changedFields[key];
        this.game.personGame[key] = changedField;
        this.originalPersonFields[key] = changedField;
      }
    }
  }

  async updateTitle() {
    const changedFields = {
      title: this.editedTitle
    }
    await this.gameService.updateGame(this.game, changedFields);
    this.titleEditMode = false;
  }
}
