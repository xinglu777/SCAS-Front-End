import request from "../index";
import {UnwrapRef} from "vue";

interface Tenant {
    tenantId: string;
    tenantName: string;
    password?: string | undefined;
    email: string;
    phone: string;
}
interface ApiResponse<T = any> {
    code: number;
    message: string;
    data: T;
}

//获取租户信息
export const getTenantInfo = (params: { tenantId: number }) => {
    return request({
        url: "/tenant/info", // 假设 API 路径
        method: "GET",
        params,
    });
};

//租户登录
export const TenantLogin = (params: { tenantName: string,password: string }) => {
    return request({
        url: "/tenant/login", // 假设 API 路径
        method: "POST",
        params
    });
};

export const tenantLogout = () => {
    return request({
        url: "/tenant/logout",
        method: "POST",
    });
};

export const getTenants = () => {
    return request({
        url: "/tenant/list",
        method: "GET",
    });
};

// interface LoginUser {
//     userName: string;
//     role: string;
//     tenantId: number;
//     tenantName: string;
// }
//
// interface PageInfo {
//     pageIndex: number;
//     pageSize: number;
// }
//
// interface SearchData {
//     tenantId?: string;
//     contact?: string;
//     tenantTel?: string;
//     tenantName?: string;
//     pageInfo?: {
//         value: PageInfo;
//     };
// }
//
interface AddData {
    tenantName?: string;
    tenantPic?: string | null;
    contact?: string;
    tenantTel?: string;
    tenantRemark?: string;
    admin?: string;
    tenantId?: number;
    tenantPwd?: string;
}

export const register = (data: AddData): Promise<ApiResponse<null> >=> {
    return request({
        url: '/tenant/register',
        method: 'POST',
        data
    });
};
//
// 获取所有租户
export const getAllTenants = () => {
    return request({
        url: `/tenant/list`,
        method: "GET"
    });
};
//
// export const getTableData = () => {
//     return request({
//         url: `/tenant/list`,
//         method: "GET",
//     });
// };
//
// export const search = (data: SearchData) => {
//     return request({
//         url: `/tenant/page`,
//         method: "POST",
//         params: {
//             pageNum: data.pageInfo?.value.pageIndex,
//             pageSize: data.pageInfo?.value.pageSize,
//             tenantId: data.tenantId,
//             contact: data.contact,
//             tenantTel: data.tenantTel,
//             tenantName: data.tenantName,
//         },
//     });
// };
//
// export const load = (fileName: string) => {
//     return request({
//         url: '/tenant/load',
//         method: "POST",
//         params: { fileName },
//     });
// };
//
// export const uploadAvatar = (data: File) => {
//     const formData = new FormData();
//     formData.append('file', data);
//     return request({
//         url: '/tenant/upload',
//         method: 'POST',
//         data: formData,
//         headers: {
//             'Content-Type': 'multipart/form-data',
//         },
//     });
// };
//
// export const uploadEditor = (data: File) => {
//     const formData = new FormData();
//     formData.append('file', data);
//     return request({
//         url: '/tenant/upload',
//         method: 'POST',
//         data: formData,
//         headers: {
//             'Content-Type': 'multipart/form-data',
//         },
//     });
// };
//
// export const add = (data: AddData) => {
//     return request({
//         url: '/tenant/add',
//         method: 'POST',
//         data,
//     });
// };
//
// export const update = (data: AddData) => {
//     if (data.tenantPic === null) {
//         data.tenantPic = "";
//     }
//     return request({
//         url: '/tenant/update',
//         method: 'POST',
//         data,
//     });
// };
//
// export const deleteById = (tenantId: number) => {
//     return request({
//         url: '/tenant/delete',
//         method: 'POST',
//         params: { tenantId },
//     });
// };
//
// export const deleteBatch = (tenantIds: number[]) => {
//     return request({
//         url: `/tenant/deleteBatch`,
//         method: 'GET',
//         params: { tenantIds: tenantIds.join(',') },
//     });
// };
//
export const login = (tenantName: string, password: string) => {
    return request({
        url: '/tenant/login',
        method: 'POST',
        params: {
            tenantName: tenantName,
            password: password
        },
    })
}

//查找租户
export const searchTenants = (name: string) => {
    return request({
        url: '/tenant/search',
        method: 'GET',
        params: {
            name: name,
        },
    });
}

export const add = (data: UnwrapRef<Tenant>) => {
    return request({
        url: '/tenant/add',
        method: 'POST',
        data,
    });
};
//
export const update = (data: Tenant) => {
    return request({
        url: '/tenant/update',
        method: 'POST',
        data,
    });
};

export const deleteBatch = (tenantIds: number[]) => {
    return request({
        url: `/tenant/deleteBatch`,
        method: 'POST',
        data: tenantIds
    });
};

export const deleteById = (tenantId: number) => {
    return request({
        url: '/tenant/delete',
        method:'POST',
        params:{
            tenantId: tenantId,
        },
    });
};
