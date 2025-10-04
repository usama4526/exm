import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessCyclesBackingStatusComponent } from './business-cycles-backing-status.component';

describe('BusinessCyclesBackingStatusComponent', () => {
  let component: BusinessCyclesBackingStatusComponent;
  let fixture: ComponentFixture<BusinessCyclesBackingStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessCyclesBackingStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusinessCyclesBackingStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
