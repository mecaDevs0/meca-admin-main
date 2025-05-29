import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialReportDetailsPageComponent } from './financial-report-details-page.component';

describe('FinancialReportDetailsPageComponent', () => {
  let component: FinancialReportDetailsPageComponent;
  let fixture: ComponentFixture<FinancialReportDetailsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FinancialReportDetailsPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinancialReportDetailsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
