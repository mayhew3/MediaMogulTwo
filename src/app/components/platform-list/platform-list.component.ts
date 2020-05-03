import {Component, OnInit} from '@angular/core';
import {PlatformService} from '../../services/platform.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {GamePlatform} from '../../interfaces/Model/GamePlatform';
import {PlatformDetailComponent} from '../platform-detail/platform-detail.component';

@Component({
  selector: 'mm-platform-list',
  templateUrl: './platform-list.component.html',
  styleUrls: ['./platform-list.component.scss']
})
export class PlatformListComponent implements OnInit {

  constructor(public platformService: PlatformService,
              private modalService: NgbModal) { }

  ngOnInit(): void {
  }

  async openDetailPopup(platform: GamePlatform) {
    const modalRef = this.modalService.open(PlatformDetailComponent, {size: 'md'});
    modalRef.componentInstance.platform = platform;
    await modalRef.result;
  }

}
