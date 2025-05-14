// src/types/CourseTypes.ts
export interface SearchData {
    name: string;
    pageIndex: number;
    pageSize: number;
    number: string;
    type: string;
}

export interface ChangeData {
    cgname: string;
    cgcover: string;
    cgintroduction: string;
    cgnumber: number | null;
    cgvideo: string[];
    cgauthor: string;
}

export interface TableData {
    name: string;
    cover: string;
    introduction: string;
    number: number;
    video: string[];
    author: string;
    type: string;
}