import { Component, input, output } from '@angular/core';
import { TuiPagination } from '@taiga-ui/kit';

@Component({
  selector: 'app-pagination-component',
  imports: [TuiPagination],
  templateUrl: './pagination-component.html',
  styleUrl: './pagination-component.css',
})
export class PaginationComponent {
  currentPage = input.required<number>();
  totalPages = input.required<number>();
  totalItems = input.required<number>();

  nextPage = output<number>();

  goToPage(page: number) {
    this.nextPage.emit(page + 1);
  }
}
