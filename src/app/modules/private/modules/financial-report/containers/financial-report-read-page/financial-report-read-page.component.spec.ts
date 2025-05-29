import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialReportReadPageComponent } from './financial-report-read-page.component';

describe('FinancialReportReadPageComponent', () => {
  let component: FinancialReportReadPageComponent;
  let fixture: ComponentFixture<FinancialReportReadPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FinancialReportReadPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinancialReportReadPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
