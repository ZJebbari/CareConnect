import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { TablePersonnelComponent } from './table-personnel.component';

describe('TablePersonnelComponent', () => {
  let component: TablePersonnelComponent;
  let fixture: ComponentFixture<TablePersonnelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, TablePersonnelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TablePersonnelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
