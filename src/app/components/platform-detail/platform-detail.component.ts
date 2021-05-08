import {Component, Input} from '@angular/core';
import {GamePlatform} from '../../interfaces/Model/GamePlatform';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {PlatformService} from '../../services/platform.service';

@Component({
  selector: 'mm-platform-detail',
  templateUrl: './platform-detail.component.html',
  styleUrls: ['./platform-detail.component.scss']
})
export class PlatformDetailComponent {
  @Input() platform: GamePlatform;

  constructor(private activeModal: NgbActiveModal,
              private platformService: PlatformService) { }

  async close(): Promise<void> {
    await this.platformService.updatePlatform(this.platform);
    this.activeModal.close();
  }

  dismiss(): void {
    this.platform.discardChanges();
    this.activeModal.dismiss();
  }
}
