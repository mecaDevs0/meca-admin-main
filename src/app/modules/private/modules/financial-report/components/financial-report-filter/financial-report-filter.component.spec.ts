import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialReportFilterComponent } from './financial-report-filter.component';

describe('FinancialReportFilterComponent', () => {
  let component: FinancialReportFilterComponent;
  let fixture: ComponentFixture<FinancialReportFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FinancialReportFilterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinancialReportFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
