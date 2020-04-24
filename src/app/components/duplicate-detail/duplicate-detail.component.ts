import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {GameGroup} from '../duplicate-resolution/duplicate-resolution.component';

@Component({
  selector: 'mm-duplicate-detail',
  templateUrl: './duplicate-detail.component.html',
  styleUrls: ['./duplicate-detail.component.scss']
})
export class DuplicateDetailComponent implements OnInit {
  @Input() gameGroup: GameGroup;

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
  }

  submitAndClose() {
    this.activeModal.close('Submit click');
  }

  dismiss() {
    this.activeModal.dismiss('Cross Click');
  }

}
