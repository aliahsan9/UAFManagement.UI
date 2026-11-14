import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdmissionsService } from '../admissions.service';
import { DOCUMENT_TYPES } from '../admissions.models';
import { NotificationService } from '../../../core/services/notification.service';
import { FileUpload } from '../../../shared/components/file-upload/file-upload';

@Component({selector:'app-document-upload',standalone:true,imports:[FormsModule,FileUpload],
 template:`<div class="border-top pt-3 mt-2"><label class="form-label small fw-semibold">Upload a document</label><div class="row g-2"><div class="col-md-5"><select class="form-select form-select-sm" [(ngModel)]="documentType"><option [ngValue]="null">Choose document type</option>@for(type of types;track type.value){<option [ngValue]="type.value">{{type.label}}</option>}</select></div><div class="col-md-7"><app-file-upload [multiple]="false" [maxSizeMb]="10" accept=".pdf,.jpg,.jpeg,.png" label="Choose document" helpText="PDF, JPEG or PNG · maximum 10 MB." (filesChange)="selectFiles($event)"/></div></div><div class="d-flex justify-content-between align-items-center mt-2"><small class="text-muted">PDF, JPEG or PNG · maximum 10 MB.</small><button class="btn btn-sm btn-primary" (click)="upload()" [disabled]="!file||documentType===null||loading()">{{loading()?'Uploading…':'Upload document'}}</button></div></div>`})
export class DocumentUpload {
 @Input({required:true}) applicationId!:string;
 @Output() uploaded=new EventEmitter<void>();
 private service=inject(AdmissionsService);private notices=inject(NotificationService);
 readonly types=DOCUMENT_TYPES;readonly loading=signal(false);documentType:number|null=null;file:File|null=null;
 selectFiles(files:File[]):void{this.file=files[0]??null;}
 upload():void{if(!this.file||this.documentType===null||this.loading())return;this.loading.set(true);this.service.uploadDocument(this.applicationId,this.documentType,this.file).subscribe({next:()=>{this.loading.set(false);this.notices.show('Document uploaded.','success');this.file=null;this.documentType=null;this.uploaded.emit();},error:e=>{this.loading.set(false);this.notices.show(e.error?.detail??'Document upload failed.','error');}});}
}