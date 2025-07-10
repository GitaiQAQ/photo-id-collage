// 照片类型定义

// 证件照尺寸接口
export interface IDPhotoSize {
  name: string;
  width: number;
  height: number;
  widthPx: number;
  heightPx: number;
  description: string;
}

// 照片项目接口
export interface PhotoItem {
  id: string;
  originalSrc: string;
  croppedSrc?: string;
  size: IDPhotoSize;
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
    unit: string;
  };
  repeatCount: number; // 照片重复次数
  margin?: {
    horizontal: number;
    vertical: number;
  }; // 照片自定义边距
}

// 页面尺寸接口
export interface PageSize {
  name: string;
  width: number;
  height: number;
  description: string;
  defaultMargin: number;
}

// 自定义页面尺寸接口
export interface CustomPageSize {
  width: number;
  height: number;
  defaultMargin: number;
}
