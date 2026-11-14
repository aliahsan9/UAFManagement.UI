import { Component, Input } from '@angular/core';
import { StudentStatus, studentStatusLabel } from './students.models';
@Component({selector:'app-student-status-badge',standalone:true,template:`<span class="badge rounded-pill" [class.text-bg-success]="status===1" [class.text-bg-warning]="status===2" [class.text-bg-primary]="status===3" [class.text-bg-secondary]="status===4">{{label}}</span>`})
export class StudentStatusBadge { @Input({required:true}) status!:StudentStatus; get label():string{return studentStatusLabel(this.status);} }
