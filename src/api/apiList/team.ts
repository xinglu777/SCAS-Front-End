import request from "../index";
import {UnwrapRef} from "vue";

export const searchByIds = (ids: number[]) => {
    return request({
        url: '/user/searchByIds', // 后端接口路径
        method: 'POST', // 使用 POST 方法
        data: ids, // 直接发送 id 数组作为请求体
    });
};

// 定义接口函数，直接接受一个 `int` 类型参数
export const listTeamMember = (projectId: number) => {
    return request({
        url: '/project/listTeamMember', // 后端接口路径
        method: 'GET',
        params: { projectId }, // 将 `projectId` 作为查询参数发送
    });
};

// 搜索用户接口
export const searchMember = (data: any) => {
    return request({
        url: `/user/search`,
        method: "GET",
        params: {  // 使用 params 传递查询参数
            tenantId: data.tenantId,
            username: data.username,
            state: data.state
        }
    });
};
// 根据项目名称查询项目 ID
export const getIdByName = (projectName: string) => {
    return request({
        url: '/project/getIdByName', // 后端接口路径
        method: 'GET', // 使用 GET 方法
        params: { projectName }, // 通过 query 参数发送 projectName
    });
};


export const addTeamMember = (userId: number, projectId: number, actor: number) => {
    return request({
        url:'/project/addTeamMember',
        method:'POST',
        params: {
            userId: userId,
            projectId: projectId,
            actor: actor,
        }
    });
};

export const deleteMember = (userId: number, projectId: number, actor: number) => {
    return request({
        url:'/project/deleteTeamMember',
        method:'POST',
        params: {
            userId: userId,
            projectId: projectId,
            actor: actor,
        }
    });
};

// 定义接口函数，直接接受一个 `int` 类型参数
export const getState = (projectId: number) => {
    console.log("向后获取成员的传参",projectId);
    return request({
        url: '/project/getState', // 后端接口路径
        method: 'GET',
        params: { projectId }, // 将 `projectId` 作为查询参数发送
    });
};