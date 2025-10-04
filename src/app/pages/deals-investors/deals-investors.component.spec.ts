import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DealsInvestorsComponent } from './deals-investors.component';

describe('DealsInvestorsComponent', () => {
  let component: DealsInvestorsComponent;
  let fixture: ComponentFixture<DealsInvestorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DealsInvestorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DealsInvestorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
