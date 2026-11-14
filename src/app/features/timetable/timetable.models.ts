export enum TimetableEntryStatus { Draft=1, Published=2, Cancelled=3 }
export interface TeachingRoom { id:string; campusId:string; code:string; name:string; capacity:number; roomType:string; isActive:boolean; }
export interface CreateTeachingRoomRequest { campusId:string; code:string; name:string; capacity:number; roomType:string; }
export interface TimetableEntry { id:string; courseOfferingId:string; roomId:string; dayOfWeek:number|string; startTime:string; endTime:string; effectiveFrom:string; effectiveTo:string; status:TimetableEntryStatus|number|string; }
export interface CreateTimetableEntryRequest { courseOfferingId:string; roomId:string; dayOfWeek:number; startTime:string; endTime:string; effectiveFrom:string; effectiveTo:string; }
export const DAYS=[{value:0,label:'Sunday',short:'Sun'},{value:1,label:'Monday',short:'Mon'},{value:2,label:'Tuesday',short:'Tue'},{value:3,label:'Wednesday',short:'Wed'},{value:4,label:'Thursday',short:'Thu'},{value:5,label:'Friday',short:'Fri'},{value:6,label:'Saturday',short:'Sat'}] as const;
export function dayValue(v:number|string):number { if(typeof v==='number')return v; const n=Number(v); if(!Number.isNaN(n))return n; return DAYS.find(x=>x.label.toLowerCase()===String(v).toLowerCase())?.value??0; }
export function dayLabel(v:number|string):string{return DAYS.find(x=>x.value===dayValue(v))?.label??String(v);}
export function timetableEntryStatusValue(v:TimetableEntry['status']):number { if(typeof v==='number')return v; const n=Number(v); if(!Number.isNaN(n))return n; return ({draft:1,published:2,cancelled:3} as Record<string,number>)[String(v).toLowerCase()]??0; }
export function timetableEntryStatusLabel(v:TimetableEntry['status']):string{return ({1:'Draft',2:'Published',3:'Cancelled'} as Record<number,string>)[timetableEntryStatusValue(v)]??String(v);}
