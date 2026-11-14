import {beforeEach,describe,expect,it} from 'vitest';
import {TestBed} from '@angular/core/testing';
import {DataTable} from './data-table';
describe('DataTable',()=>{
 beforeEach(async()=>{await TestBed.configureTestingModule({imports:[DataTable]}).compileComponents();});
 it('sorts rows and renders only the requested page',()=>{
  const fixture=TestBed.createComponent(DataTable);
  fixture.componentRef.setInput('columns',[{key:'name',label:'Name',sortable:true}]);
  fixture.componentRef.setInput('rows',[{id:'3',name:'Charlie'},{id:'1',name:'Alpha'},{id:'2',name:'Bravo'}]);
  fixture.componentRef.setInput('pageSize',2);
  fixture.detectChanges();
  fixture.componentInstance.sort({key:'name',label:'Name',sortable:true});
  fixture.detectChanges();
  const cells=Array.from(fixture.nativeElement.querySelectorAll('tbody tr td:first-child') as NodeListOf<Element>).map(x=>x.textContent?.trim());
  expect(cells).toEqual(['Alpha','Bravo']);
 });
 it('filters records using the search control',()=>{
  const fixture=TestBed.createComponent(DataTable);
  fixture.componentRef.setInput('columns',[{key:'name',label:'Name'}]);
  fixture.componentRef.setInput('rows',[{id:'1',name:'Alice'},{id:'2',name:'Bilal'}]);
  fixture.detectChanges();
  fixture.componentInstance.query.set('bil');
  fixture.detectChanges();
  expect(fixture.componentInstance.filteredRows().map(x=>x['name'])).toEqual(['Bilal']);
 });
 it('exposes loading and empty states without fake rows',()=>{
  const fixture=TestBed.createComponent(DataTable);
  fixture.componentRef.setInput('columns',[{key:'name',label:'Name'}]);
  fixture.componentRef.setInput('rows',[]);
  fixture.componentRef.setInput('loading',true);
  fixture.detectChanges();
  expect(fixture.nativeElement.textContent).toContain('Loading records');
  fixture.componentRef.setInput('loading',false);
  fixture.detectChanges();
  expect(fixture.nativeElement.textContent).toContain('No records found');
 });
});
