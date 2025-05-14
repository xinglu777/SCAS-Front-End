export interface Project {
    id:number;
    tenantId:number;
    projectName: string;
    startTime:Date;
    endTime:Date;
    completedTime:Date;
    requirement:string;
    state:string;
    background:string
    description:string
}