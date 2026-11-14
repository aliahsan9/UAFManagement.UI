import { Injectable } from '@angular/core';
@Injectable({providedIn:'root'})
export class FileTransferService {
 download(blob:Blob,fileName:string):void{
  const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download=fileName;anchor.rel='noopener';anchor.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
}
