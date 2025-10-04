import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectorsIndustriesComponent } from './sectors-industries.component';

describe('SectorsIndustriesComponent', () => {
  let component: SectorsIndustriesComponent;
  let fixture: ComponentFixture<SectorsIndustriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectorsIndustriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SectorsIndustriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
