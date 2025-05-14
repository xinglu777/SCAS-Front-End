import request from "../index";

interface Member {
    assess: number;
    examine: number;
    state: number;
    status: number;
    tenantId: number;
    userId: number;
    avatar: string;
    email: string;
    password: string;
    phone: string;
    username: string;
}

export const memberList = (data : any) => {
    return request({
        url: `/user/listByTenant?tenantId=${data.tenantId}`,
        method: "GET",
        data
    });
};

export const memberUpdate = (data : Member) => {
    return request({
        url: `/user/update`,
        method: "POST",
        data
    });
};

export const memberAdd = (data: Member) => {
    return request({
        url: '/user/add',
        method: 'POST',
        data
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

// 批量删除接口调用
export const memberDelete = (userIds: number[]) => {
    return request({
        url: `/user/deleteBatch`,
        method: 'POST',
        data: userIds,  // 这里直接传递一个数组
    });
};

// 删除成员接口
export const memberDeleteOne = (userId: number) => {
    return request({
        url: `/user/delete`,
        method: 'POST',
        params: { userId }, // 使用 data 传递请求体
    });
};

export const uploadAvatar = (file: File, userId: number) => {
    console.log("suer:",userId)
    const formData = new FormData();
    formData.append("file", file);
    if(userId == 0){
        formData.append("userId","");
    }else {
        formData.append("userId", userId.toString());
    }
    return request({
        url:"/user/uploadAvatar",
        method:'POST',
        data:formData,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};