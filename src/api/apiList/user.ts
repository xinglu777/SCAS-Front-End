import request from "../index"
import {UnwrapNestedRefs} from "vue";
import {User} from "@element-plus/icons-vue";

interface UserData {
    userId?: string;
    userName: string;
    createTime?: string | Date;
    userNickName?: string;
    departmentId?: number | undefined;
    userTel?: string;
    email?: string;
    gender?: string;
    state?: string;
    post?: string;
    role?: string;
    remark?: string;
    userPwd?: string;
}

export const getTableData = () => {
    return request({
        url: `/user/list`,
        method: "GET",
    });
};

const formatDate = (date: Date): string => {
    const d = new Date(date);
    const month = `${d.getMonth() + 1}`.padStart(2, "0");
    const day = `${d.getDate()}`.padStart(2, "0");
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
};

export const search = (data: {
    userName: string;
    state: string;
    userTel: string;
    createdTime: Date[];
}) => {
    const startTime = data.createdTime.length ? formatDate(data.createdTime[0]) : "";
    const endTime = data.createdTime.length ? formatDate(data.createdTime[1]) : "";

    return request({
        url: `/user/page`,
        method: "GET",
        params: {
            userName: data.userName,
            state: data.state,
            userTel: data.userTel,
            startTime,
            endTime,
        },
    });
};

export const add = (data: UnwrapNestedRefs<UserData>) => {
    data.state = "停用";
    return request({
        url: '/user/add',
        method: 'POST',
        data,
    });
};

export const update = (data: UnwrapNestedRefs<UserData>) => {
    console.log(data.createTime+"5555");
    return request({
        url: '/user/update',
        method: 'POST',
        data,
    });
};

export const updateState = (userId: string) => {
    return request({
        url: '/user/updateState',
        method: 'POST',
        params: { userId },
    });
};

export const deleteById = (userId: string) => {
    return request({
        url: '/user/delete',
        method: 'POST',
        params: { userId },
    });
};

export const deleteBatch = (userIds: string[]) => {
    return request({
        url: `/user/deleteBatch`,
        method: 'GET',
        params: { userIds: userIds.join(',') },
    });
};

export const login = (phone: string,password: string) => {
    return request({
        url: '/user/login',
        method: 'POST',
        params: {
            phone: phone,
            password: password
        },
    });
};

export const getLoginInfo = () => {
    return request({
        url: '/user/getLoginInfo',
        method: 'GET',
    })
};

export const changeUser = (data: any) => {
    return request({
        url: `/user/changeuser?name=${data.account}&cgname=${data.name}&cgtel=${data.phone}&cgemail=${data.email}
        &cggenter=${data.gender}&cggenter=${data.createDate}&cggenter=${data.departmentid}&cggenter=${data.state}&cggenter=${data.post}
        &cggenter=${data.role}&cggenter=${data.remark}&cggenter=${data.password}&cggenter=${data.tenantid}`,
        method: "POST",
        data
    });
};

export const changePassword = (data: any) => {
    return request({
        url: `/user/changepassword?name=${data.account}&cgname=${data.name}&cgtel=${data.phone}&cgemail=${data.email}
        &cggenter=${data.gender}&cggenter=${data.createDate}&cggenter=${data.departmentid}&cggenter=${data.state}&cggenter=${data.post}
        &cggenter=${data.role}&cggenter=${data.remark}&cggenter=${data.password}&cggenter=${data.tenantid}`,
        method: "POST",
        data
    });
};

// 获取用户信息
export const getUserInfo = () => {
    return request({
        url: '/user/info',
        method: 'GET'
    });
};