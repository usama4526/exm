import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessDescriptionComponent } from './business-description.component';

describe('BusinessDescriptionComponent', () => {
  let component: BusinessDescriptionComponent;
  let fixture: ComponentFixture<BusinessDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessDescriptionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusinessDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
