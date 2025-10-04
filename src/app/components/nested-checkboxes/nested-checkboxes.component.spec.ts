import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NestedCheckboxesComponent } from './nested-checkboxes.component';

describe('NestedCheckboxesComponent', () => {
  let component: NestedCheckboxesComponent;
  let fixture: ComponentFixture<NestedCheckboxesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NestedCheckboxesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NestedCheckboxesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
