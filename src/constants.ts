import { IDPhotoSize, PageSize } from './types/photo';

// 证件照尺寸预设
export const ID_PHOTO_SIZES: IDPhotoSize[] = [
  { name: '1寸', width: 25, height: 35, widthPx: 295, heightPx: 413, description: '身份证、驾照' },
  { name: '2寸', width: 35, height: 49, widthPx: 413, heightPx: 579, description: '护照、签证' },
  { name: '小2寸', width: 35, height: 45, widthPx: 413, heightPx: 531, description: '护照、签证' },
  { name: '大1寸', width: 33, height: 48, widthPx: 390, heightPx: 567, description: '简历' },
  { name: '小1寸', width: 22, height: 32, widthPx: 260, heightPx: 378, description: '各类证件' },
  { name: '护照照片', width: 33, height: 48, widthPx: 390, heightPx: 567, description: '国际护照' },
  { name: '美国签证', width: 51, height: 51, widthPx: 600, heightPx: 600, description: '美国签证' },
  { name: '欧盟签证', width: 35, height: 45, widthPx: 413, heightPx: 531, description: '申根签证' },
  { name: '简历照片', width: 35, height: 45, widthPx: 413, heightPx: 531, description: '求职简历' },
  { name: '学生证', width: 22, height: 32, widthPx: 260, heightPx: 378, description: '学生证件' },
];

// 页面尺寸预设
export const PAGE_SIZES: PageSize[] = [
  { name: 'A4', width: 210, height: 297, description: '标准A4纸', defaultMargin: 5 },
  { name: 'A5', width: 148, height: 210, description: '标准A5纸', defaultMargin: 4 },
  { name: '佳能Postcard', width: 100, height: 148, description: '明信片尺寸', defaultMargin: 3 },
  { name: 'L尺寸', width: 89, height: 127, description: '标准照片尺寸', defaultMargin: 2 },
  { name: '2L尺寸', width: 127, height: 178, description: '大尺寸照片', defaultMargin: 3 },
];