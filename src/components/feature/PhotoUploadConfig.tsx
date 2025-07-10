import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PhotoItem } from '@/types/photo';
import { Copy, ImageIcon, LayoutGrid, List, MoreVertical, Plus, Scissors, Trash2, Upload } from 'lucide-react';
import React from 'react';
import { ID_PHOTO_SIZES } from '@/constants';

interface PhotoUploadConfigProps {
  photos: PhotoItem[];
  viewMode: 'grid' | 'list';
  margin: {
    horizontal: number;
    vertical: number;
  };
  pageSize: {
    name: string;
    width: number;
    height: number;
  };
  customPageSize: {
    width: number;
    height: number;
  };
  setViewMode: (mode: 'grid' | 'list') => void;
  handlePhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setPhotos: React.Dispatch<React.SetStateAction<PhotoItem[]>>;
  updateLayout: (width: number, height: number, photos: PhotoItem[], margin: {
    horizontal: number;
    vertical: number;
  }) => void;
  handlePhotoSizeChange: (id: string, value: string) => void;
  openCropDialog: (index: number) => void;
  duplicatePhoto: (id: string) => void;
  removePhoto: (id: string) => void;
}

export const PhotoUploadConfig: React.FC<PhotoUploadConfigProps> = ({
  photos,
  viewMode,
  margin,
  pageSize,
  customPageSize,
  setViewMode,
  handlePhotoUpload,
  setPhotos,
  updateLayout,
  handlePhotoSizeChange,
  openCropDialog,
  duplicatePhoto,
  removePhoto,
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>上传并配置照片</CardTitle>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="h-8 w-8 p-0"
          >
            <LayoutGrid size={16} />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="h-8 w-8 p-0"
          >
            <List size={16} />
          </Button>
          <Input
            id="photo-upload-component"
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            className="sr-only"
          />
          <Button
            onClick={() => document.getElementById('photo-upload-component')?.click()}
            size="sm"
          >
            <Upload size={16} className="mr-2" />
            上传照片
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {photos.length === 0 ? (
          <div className="border border-dashed border-gray-300 rounded-md p-12 flex flex-col items-center justify-center text-gray-500">
            <ImageIcon size={48} strokeWidth={1} />
            <p className="mt-4 text-sm">暂无照片，请点击右上角的“上传照片”按钮</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => document.getElementById('photo-upload-component')?.click()}
            >
              <Upload size={16} className="mr-2" />
              选择照片
            </Button>
            <p className="mt-4 text-xs text-gray-400">支持JPG、PNG格式，可同时上传多张照片</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {photos.map((photo, index) => (
              <div key={photo.id} className="border rounded-md p-3 bg-white">
                <div className="aspect-[3/4] mb-2 relative overflow-hidden bg-gray-100 rounded">
                  <img
                    src={photo.croppedSrc || photo.originalSrc}
                    alt={`照片 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <Label htmlFor={`photo-size-${photo.id}`} className="text-xs">尺寸</Label>
                    <Select
                      value={photo.size.name}
                      onValueChange={(value) => handlePhotoSizeChange(photo.id, value)}
                    >
                      <SelectTrigger id={`photo-size-${photo.id}`} className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ID_PHOTO_SIZES.map(size => (
                          <SelectItem key={size.name} value={size.name} className="text-xs">
                            {size.name} ({size.width}×{size.height}mm)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor={`photo-repeat-${photo.id}`} className="text-xs">重复次数</Label>
                      <div className="flex items-center mt-1">
                        <Input
                          id={`photo-repeat-${photo.id}`}
                          type="number"
                          min="1"
                          max="50"
                          value={photo.repeatCount}
                          onChange={(e) => {
                            const value = parseInt(e.target.value)
                            if (!isNaN(value) && value > 0 && value <= 50) {
                              setPhotos(prev => prev.map(p =>
                                p.id === photo.id ? { ...p, repeatCount: value } : p
                              ))

                              // 更新布局
                              const currentWidth = pageSize.name === 'custom' ? customPageSize.width : pageSize.width
                              const currentHeight = pageSize.name === 'custom' ? customPageSize.height : pageSize.height

                              updateLayout(currentWidth, currentHeight, photos, margin)
                            }
                          }}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`photo-margin-${photo.id}`} className="text-xs">自定义边距</Label>
                      <Button
                        id={`photo-margin-${photo.id}`}
                        variant="outline"
                        size="sm"
                        className="w-full h-8 mt-1 text-xs"
                        onClick={() => {
                          // 打开边距设置对话框
                          const currentMargin = photo.margin || { horizontal: margin.horizontal, vertical: margin.vertical };

                          // 使用简单的prompt对话框设置边距
                          const horizontalMargin = prompt('请输入水平边距 (mm):', currentMargin.horizontal.toString());
                          if (horizontalMargin === null) return;

                          const verticalMargin = prompt('请输入垂直边距 (mm):', currentMargin.vertical.toString());
                          if (verticalMargin === null) return;

                          const hMargin = parseFloat(horizontalMargin);
                          const vMargin = parseFloat(verticalMargin);

                          if (!isNaN(hMargin) && !isNaN(vMargin) && hMargin >= 0 && vMargin >= 0) {
                            setPhotos(prev => prev.map(p =>
                              p.id === photo.id ? {
                                ...p,
                                margin: {
                                  horizontal: hMargin,
                                  vertical: vMargin
                                }
                              } : p
                            ));

                            // 更新布局
                            updateLayout(
                              pageSize.name === 'custom' ? customPageSize.width : pageSize.width,
                              pageSize.name === 'custom' ? customPageSize.height : pageSize.height,
                              photos, margin
                            );
                          }
                        }}
                      >
                        {photo.margin ? `${photo.margin.horizontal}×${photo.margin.vertical}mm` : '使用全局边距'}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openCropDialog(index)}
                    className="text-xs h-8"
                  >
                    <Scissors size={14} className="mr-1" />
                    裁剪
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical size={14} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => duplicatePhoto(photo.id)}>
                        <Copy size={14} className="mr-2" />
                        <span>复制照片</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => removePhoto(photo.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 size={14} className="mr-2" />
                        <span>删除照片</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}

            <div
              className="border border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-gray-50"
              onClick={() => document.getElementById('photo-upload-component')?.click()}
            >
              <Plus size={24} strokeWidth={1} className="text-gray-400" />
              <span className="mt-2 text-sm text-gray-500">添加更多照片</span>
            </div>
          </div>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">照片</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">尺寸</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">重复次数</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {photos.map((photo, index) => (
                  <tr key={photo.id}>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 relative">
                          <img
                            src={photo.croppedSrc || photo.originalSrc}
                            alt={`照片 ${index + 1}`}
                            className="h-10 w-10 rounded object-cover"
                          />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">照片 {index + 1}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <Select
                        value={photo.size.name}
                        onValueChange={(value) => handlePhotoSizeChange(photo.id, value)}
                      >
                        <SelectTrigger className="h-8 text-xs w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ID_PHOTO_SIZES.map(size => (
                            <SelectItem key={size.name} value={size.name} className="text-xs">
                              {size.name} ({size.width}×{size.height}mm)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <Input
                        type="number"
                        min="1"
                        max="50"
                        value={photo.repeatCount}
                        onChange={(e) => {
                          const value = parseInt(e.target.value)
                          if (!isNaN(value) && value > 0 && value <= 50) {
                            setPhotos(prev => prev.map(p =>
                              p.id === photo.id ? { ...p, repeatCount: value } : p
                            ))

                            // 更新布局
                            const currentWidth = pageSize.name === 'custom' ? customPageSize.width : pageSize.width
                            const currentHeight = pageSize.name === 'custom' ? customPageSize.height : pageSize.height

                            updateLayout(currentWidth, currentHeight, photos, margin)
                          }
                        }}
                        className="h-8 text-xs w-20"
                      />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {photo.croppedSrc ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          已裁剪
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          待裁剪
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openCropDialog(index)}
                        className="text-xs h-8 mr-2"
                      >
                        <Scissors size={14} className="mr-1" />
                        裁剪
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePhoto(photo.id)}
                        className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-4 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('photo-upload-component')?.click()}
                className="w-full"
              >
                <Plus size={16} className="mr-1" />
                添加更多照片
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};