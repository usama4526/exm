import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestorsCriteriaComponent } from './investors-criteria.component';

describe('InvestorsCriteriaComponent', () => {
  let component: InvestorsCriteriaComponent;
  let fixture: ComponentFixture<InvestorsCriteriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestorsCriteriaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvestorsCriteriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
