import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableDoctorsComponent } from './table-doctors.component';

describe('TableDoctorsComponent', () => {
  let component: TableDoctorsComponent;
  let fixture: ComponentFixture<TableDoctorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableDoctorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableDoctorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
