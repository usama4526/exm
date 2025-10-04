import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestorsScreeningComponent } from './investors-screening.component';

describe('InvestorsScreeningComponent', () => {
  let component: InvestorsScreeningComponent;
  let fixture: ComponentFixture<InvestorsScreeningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestorsScreeningComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvestorsScreeningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
