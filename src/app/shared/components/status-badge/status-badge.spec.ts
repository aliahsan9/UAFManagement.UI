import {describe,expect,it} from 'vitest';
import {TestBed} from '@angular/core/testing';
import {StatusBadge} from './status-badge';
describe('StatusBadge',()=>{
 it('maps common workflow states to accessible labels and semantic tones',async()=>{
  await TestBed.configureTestingModule({imports:[StatusBadge]}).compileComponents();
  const fixture=TestBed.createComponent(StatusBadge);
  fixture.componentRef.setInput('status','Approved');fixture.detectChanges();
  expect(fixture.nativeElement.textContent).toContain('Approved');
  expect(fixture.nativeElement.querySelector('.text-bg-success')).not.toBeNull();
  fixture.componentRef.setInput('status','Rejected');fixture.detectChanges();
  expect(fixture.nativeElement.querySelector('.text-bg-danger')).not.toBeNull();
 });
 it('keeps the existing active input contract for academic structure screens',async()=>{
  await TestBed.configureTestingModule({imports:[StatusBadge]}).compileComponents();
  const fixture=TestBed.createComponent(StatusBadge);
  fixture.componentRef.setInput('active',false);fixture.detectChanges();
  expect(fixture.nativeElement.textContent).toContain('Inactive');
 });
});
