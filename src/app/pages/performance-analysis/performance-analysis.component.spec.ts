import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformanceAnalysisComponent } from './performance-analysis.component';

describe('PerformanceAnalysisComponent', () => {
  let component: PerformanceAnalysisComponent;
  let fixture: ComponentFixture<PerformanceAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerformanceAnalysisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerformanceAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
