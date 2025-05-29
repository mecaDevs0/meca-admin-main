import { Component, Input, Output, EventEmitter } from '@angular/core';

interface IPerPage {
  id: number;
  name: string;
}

@Component({
  selector: 'app-list-pagination',
  templateUrl: './list-pagination.component.html',
  styleUrls: ['./list-pagination.component.scss'],
})
export class ListPaginationComponent {
  perPageList: IPerPage[] = [
    { id: 10, name: '10 por página' },
    { id: 25, name: '25 por página' },
    { id: 50, name: '50 por página' },
    { id: 100, name: '100 por página' },
  ];

  totalPages: number[] = [1];

  @Input()
  page: number = 0;

  @Input()
  pageSize: number = 10;

  @Input()
  listSize: number = 0;

  @Input()
  listSizeFiltered: number = 0;

  @Output()
  pageChange: EventEmitter<{ page: number; pageSize: number }> =
    new EventEmitter();

  ngOnChanges() {
    const totalPages = this.listSizeFiltered / this.pageSize;
    for (let i = 1; i < totalPages; i++) {
      this.totalPages.push(i + 1);
    }
  }

  setPage(value: number): void {
    this.page = value;
    this.emitPageChange();
  }

  previousPage() {
    if (this.page > 1) {
      this.setPage(this.page - 1);
    }
  }

  nextPage() {
    if (this.page < this.totalPages.length) {
      this.setPage(this.page + 1);
    }
  }

  setPageSize(value: number): void {
    this.pageSize = value;
    this.emitPageChange();
  }

  emitPageChange(): void {
    this.pageChange.emit({
      page: this.page,
      pageSize: this.pageSize,
    });
  }

  getOf(): number {
    return this.listSizeFiltered ? (this.page - 1) * this.pageSize + 1 : 0;
  }

  getTill(): number {
    const x = this.page * this.pageSize;
    return x > this.listSizeFiltered
      ? x - this.pageSize + (this.listSizeFiltered % this.pageSize)
      : x;
  }
}
