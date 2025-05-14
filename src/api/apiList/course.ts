import request from "../index";


export const coursePage = (data : any) => {
    return request({
        url: `/course/page?pageIndex=${data.pageIndex}&pageSize=${data.pageSize}&name=${data.name}&number=${data.number}&type=${data.type}`,
        method: "GET",
        data
    });
};
