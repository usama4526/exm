import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Screening2Component } from './screening2.component';

describe('Screening2Component', () => {
  let component: Screening2Component;
  let fixture: ComponentFixture<Screening2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Screening2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Screening2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
