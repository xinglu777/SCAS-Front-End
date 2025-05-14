import request from "@/api";
import {UnwrapNestedRefs, UnwrapRef} from "vue";

interface ProjectData {
    id?: string;
    projectName: string;
    description?: string;
}

// 获取所有项目列表
export const getAllProjects = () => {
    return request({
        url: `/project/list`,
        method: "GET",
    });
};

// 根据ID获取项目详情
export const getProjectById = (id: string) => {
    return request({
        url: `/project/${id}`,
        method: "GET",
    });
};

// 根据ID获取项目名称
export const getProjectNameById = (id: string) => {
    return request({
        url: `/project/${id}/name`,
        method: "GET",
    });
};


// 项目数据接口类型
interface Project {
    projectId?: number; // 项目 ID，可选字段
    projectName: string; // 项目名称
    tenantId: number; // 租户 ID
    imageUrl: string; // 项目封面图片的 URL
    description: string; // 项目描述
    creator: string; // 创建人
    requirement: string; // 需求文档 URL
    startTime?: Date | null | string; // 开始时间
    deadline: Date | null | string; // 截止时间
    completedTime?: Date | null | string; // 实际完成时间
    state: string; // 项目状态，比如 "待评估"
    [key: string]: any; // 额外属性
}

// 定义筛选参数类型
interface SearchParams {
    userId: number;
    actor: number;
    projectName?: string;
    s_startTime?: string;
    f_startTime?: string;
    s_endTime?: string;
    f_endTime?: string;
    state?: number;
}

// 通用的 API 响应类型
interface ApiResponse<T> {
    code: number; // 状态码，例如 1000 表示成功
    data: T; // 返回的数据
    message?: string; // 提示消息
}

// 获取项目列表接口
export const getProjectsByTenant = (tenantId: number) => {
    return request({
        url: "/project/listByTenant",
        method: "GET",
        params: { tenantId },
    });
};

// 获取项目中审核师和评估师数量
export const getTeamCounts = (projectId: UnwrapRef<null>): Promise<any> => {
    return request({
        url: "/project/getTeamCounts",
        method: "GET",
        params: { projectId },
    });
};

// 新增项目接口
export const addProject = (projectData: Project) => {
    // 输出即将发送的完整项目数据
    console.log("Sending project data to backend:", projectData);
    return request<ApiResponse<boolean>>({
        url: "/project/add", // 对应后端的新增项目接口
        method: "POST",
        data: projectData, // 传递项目数据
    });
};

// 上传封面图片接口
export const uploadBackgroundImage = (file: File, projectId: number) => {
    const formData = new FormData();
    formData.append("file", file);
    if(projectId == 0){
        formData.append("projectId", "");
    }else {
        formData.append("projectId", projectId.toString());
    }
    return request({
        url: "/project/uploadBackground", // 对应后端的上传封面图片接口
        method: "POST",
        data: formData, // 使用表单数据上传
        headers: {
            "Content-Type": "multipart/form-data", // 设置请求头
        },
    });
};


// 上传富文本接口
export const uploadContent= (file: File, projectId: number) => {
    const formData = new FormData();
    formData.append("file", file);
    if(projectId == 0){
        formData.append("projectId", "");
    }else {
        formData.append("projectId", projectId.toString());
    }
    return request({
        url: "/project/uploadContent", // 对应后端的上传封面图片接口
        method: "POST",
        data: formData, // 使用表单数据上传
        headers: {
            "Content-Type": "multipart/form-data", // 设置请求头
        },
    });
};

// 上传需求文档接口
export const uploadRequirement = (file: File, projectId: number) => {
    const formData = new FormData();
    formData.append("file", file);
    if(projectId == 0){
        formData.append("projectId", "");
    }else {
        formData.append("projectId", projectId.toString());
    }
    return request({
        url: "/project/uploadRequirement", // 对应后端的上传需求文档接口
        method: "POST",
        data: formData,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

//删除项目
export const deleteProject = (projectId: number): Promise<any> => {
    // 输出即将发送的参数
    console.log("Sending projectName to backend:", projectId);
    return request({
        url: "/project/delete",
        method: "POST",
        params: { projectId }, // 传入 projectId
    });
};


// 更新项目
export const updateProject = (projectData: Project): Promise<any> => {
    console.log("updateProject 请求的数据：", projectData);
    return request({
        url: "/project/update",
        method: "POST",
        data: projectData,
    });
};

//下载文档
export const downloadRequirement = (projectId: number): Promise<any> => {
    return request({
        url: "/project/downloadRequirement",
        method: "GET",
        params: { projectId },
    });
};


// 根据项目 ID 获取团队成员列表
export const listTeamMembers = (projectId: number): Promise<any> => {
    return request({
        url: "/project/listTeamMember",
        method: "GET",
        params: { projectId },
    });
};


// 新增团队成员
export const addTeamMember = (
    userId: number,
    projectId: number,
    actor: number
): Promise<any> => {
    return request({
        url: "/project/addTeamMember",
        method: "POST",
        data: { userId, projectId, actor },
    });
};


// 删除团队成员
export const deleteTeamMember = (userId: number, projectId: number): Promise<any> => {
    return request({
        url: "/project/deleteTeamMember",
        method: "POST",
        data: { userId, projectId },
    });
};


// 筛选项目
export const searchProjects = (
    searchParams: Record<string, any>
): Promise<any> => {
    return request({
        url: "/project/search",
        method: "GET",
        params: searchParams,
    });
};


// 获取用户视角的项目列表
export const listProjectsByUser = (userId: number) => {
    console.log("us888erId",userId);
    return request({
        url: "/project/listByUser",
        method: "GET",
        params: {userId} ,
    });
};


// 用户视角的项目筛选
export const searchProjectsByUser = (searchParams: SearchParams) => {
    return request({
        url: "/project/searchByUser",
        method: "GET",
        params: searchParams,
    });
};

// 获取用户视角的项目列表
export const searchForActor = (userId: number, projectId:number) => {
    return request({
        url: "/project/searchForActor",
        method: "GET",
        params: {userId,projectId} ,
    });
};


