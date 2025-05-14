import request from "@/api";
import { UnwrapNestedRefs } from "vue";

interface PFSData {
    id?: string;
    name: string;
    projectId: string;
    parentId?: string;
    description?: string;
    level?: number;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

// 获取所有一级功能结构
export const getRootPFSList = () => {
    return request({
        url: `/pfs/list/root`,
        method: "GET",
    });
};
// 获取指定根节点下的完整树形结构
export const getTreeStructure = (rootId: string) => {
    return request({
        url: `/pfs/tree/${rootId}`,
        method: "GET",
    });
};

// 获取指定项目下的所有功能结构
export const getPFSListByProject = (projectId: string) => {
    return request({
        url: `/pfs/list/project/${projectId}`,
        method: "GET",
    });
};

export const addPFS = (data: UnwrapNestedRefs<PFSData>) => {
    return request({
        url: '/pfs/add',
        method: 'POST',
        data,
    });
};

export const updatePFS = (data: UnwrapNestedRefs<PFSData>) => {
    return request({
        url: '/pfs/update',
        method: 'PUT',
        data,
    });
};
// 保存新建的树结构
export const saveTree = (data: UnwrapNestedRefs<PFSData>) => {
    return request({
        url: '/pfs/saveTree',
        method: 'POST',
        data,
    });
};
export const deletePFS = (id: string) => {
    return request({
        url: '/pfs/delete',
        method: 'DELETE',
        params: { id },
    });
};

export const importPFS = (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request({
        url: '/pfs/import',
        method: 'POST',
        data: formData,
    });
};
// 检查 projectId 是否存在于 PFS 表中
export const checkProjectIdExists = (projectId: string) => {
    return request({
        url: `/pfs/exists/project/${projectId}`,
        method: 'GET',
    });
};