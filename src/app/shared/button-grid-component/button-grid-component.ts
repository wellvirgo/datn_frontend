import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

interface ButtonGridParams extends ICellRendererParams {
  editCallback: (id: number) => void;
  deleteCallback: (id: number) => void;
}

@Component({
  selector: 'app-button-grid-component',
  imports: [],
  templateUrl: './button-grid-component.html',
  styleUrl: './button-grid-component.css',
})
export class ButtonGridComponent implements ICellRendererAngularComp {

  private params!: ButtonGridParams;

  agInit(params: ButtonGridParams): void {
    this.params = params;
  }
  refresh(params: ButtonGridParams): boolean {
    return false
  }

  onUpdateClick() {
    if (this.params?.value && this.params?.editCallback) {
      this.params?.editCallback(this.params.value);
    }
  }

  onDeleteClick() {
    if (this.params?.value && this.params?.deleteCallback) {
      this.params?.deleteCallback(this.params.value);
    }
  }

}
