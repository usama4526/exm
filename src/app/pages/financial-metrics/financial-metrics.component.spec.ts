import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialMetricsComponent } from './financial-metrics.component';

describe('FinancialMetricsComponent', () => {
  let component: FinancialMetricsComponent;
  let fixture: ComponentFixture<FinancialMetricsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinancialMetricsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinancialMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
