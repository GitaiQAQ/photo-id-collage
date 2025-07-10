import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { PAGE_SIZES, ID_PHOTO_SIZES } from '@/constants';
import { PageSize, CustomPageSize } from '@/types/photo';

interface PageConfigProps {
  pageSize: PageSize;
  customPageSize: CustomPageSize;
  customSizes: { name: string; size: CustomPageSize }[];
  configPreviewRef: React.RefObject<HTMLDivElement>;
  configPreviewScale: number;
  handlePageSizeChange: (value: string) => void;
  handleCustomSizeChange: (dimension: keyof CustomPageSize, value: string) => void;
  setCustomSizes: React.Dispatch<React.SetStateAction<{ name: string; size: CustomPageSize }[]>>;
  setConfigPreviewScale: React.Dispatch<React.SetStateAction<number>>;
}

export const PageConfig: React.FC<PageConfigProps> = ({
  pageSize,
  customPageSize,
  customSizes,
  configPreviewRef,
  configPreviewScale,
  handlePageSizeChange,
  handleCustomSizeChange,
  setCustomSizes,
  setConfigPreviewScale,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>页面尺寸配置</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <Label htmlFor="page-size">选择预设尺寸</Label>
            <Select onValueChange={handlePageSizeChange} defaultValue={pageSize.name}>
              <SelectTrigger id="page-size" className="mt-1">
                <SelectValue placeholder="选择纸张尺寸" />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map(size => (
                  <SelectItem key={size.name} value={size.name}>
                    {size.name} ({size.width}×{size.height}mm) - {size.description}
                  </SelectItem>
                ))}
                {customSizes.map((customSize, index) => (
                  <SelectItem key={`custom-${index}`} value={`custom-${index}`}>
                    {customSize.name} ({customSize.size.width}×{customSize.size.height}mm)
                  </SelectItem>
                ))}
                <SelectItem value="custom">自定义尺寸</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {pageSize.name === 'custom' && (
            <div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="custom-width">宽度 (mm)</Label>
                  <Input
                    id="custom-width"
                    type="number"
                    min="10"
                    className="mt-1"
                    value={customPageSize.width}
                    onChange={(e) => handleCustomSizeChange('width', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="custom-height">高度 (mm)</Label>
                  <Input
                    id="custom-height"
                    type="number"
                    min="10"
                    className="mt-1"
                    value={customPageSize.height}
                    onChange={(e) => handleCustomSizeChange('height', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="custom-margin">默认边距 (mm)</Label>
                  <Input
                    id="custom-margin"
                    type="number"
                    min="1"
                    max="20"
                    className="mt-1"
                    value={customPageSize.defaultMargin}
                    onChange={(e) => handleCustomSizeChange('defaultMargin', e.target.value)}
                  />
                </div>
              </div>
              <Button
                className="mt-4"
                onClick={() => {
                  const now = new Date();
                  const timeString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                  const configName = `自定义配置 ${timeString}`;
                  const newCustomSize = {
                    name: configName,
                    size: { ...customPageSize }
                  };
                  const updatedCustomSizes = [...customSizes, newCustomSize];
                  setCustomSizes(updatedCustomSizes);
                  localStorage.setItem('customPageSizes', JSON.stringify(updatedCustomSizes));
                  alert(`已创建并保存自定义配置: ${configName}`);
                }}
              >
                创建自定义配置
              </Button>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">预览</h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setConfigPreviewScale(Math.max(0.5, configPreviewScale - 0.1))}
                  disabled={configPreviewScale <= 0.5}
                >
                  <ZoomOut size={16} />
                </Button>
                <span className="text-xs font-medium">{Math.round(configPreviewScale * 100)}%</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setConfigPreviewScale(Math.min(3, configPreviewScale + 0.1))}
                  disabled={configPreviewScale >= 3}
                >
                  <ZoomIn size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    if (configPreviewRef.current) {
                      const containerWidth = configPreviewRef.current.offsetWidth;
                      const containerHeight = configPreviewRef.current.offsetHeight;
                      const pageWidth = pageSize.name === 'custom' ? customPageSize.width : pageSize.width;
                      const pageHeight = pageSize.name === 'custom' ? customPageSize.height : pageSize.height;
                      const widthScale = (containerWidth - 40) / pageWidth;
                      const heightScale = (containerHeight - 40) / pageHeight;
                      const scale = Math.min(widthScale, heightScale, 1);
                      setConfigPreviewScale(scale);
                    }
                  }}
                >
                  <Maximize size={16} />
                </Button>
              </div>
            </div>
            <div
              ref={configPreviewRef}
              className="border border-gray-300 rounded-md bg-white mx-auto overflow-auto"
              style={{
                width: '100%',
                maxWidth: '600px',
                height: '400px',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: `${(pageSize.name === 'custom' ? customPageSize.width : pageSize.width) * configPreviewScale}px`,
                  height: `${(pageSize.name === 'custom' ? customPageSize.height : pageSize.height) * configPreviewScale}px`,
                  border: '1px solid #e5e7eb',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: '#f9fafb'
                }}
              >
                <div className="absolute top-1 left-1 bg-white px-1 rounded text-xs text-gray-500 z-10">
                  {pageSize.name === 'custom' ? '自定义' : pageSize.name}: 
                  {pageSize.name === 'custom' ? customPageSize.width : pageSize.width} × 
                  {pageSize.name === 'custom' ? customPageSize.height : pageSize.height} mm
                </div>
                {(() => {
                  const oneInchSize = ID_PHOTO_SIZES.find(s => s.name === '1寸');
                  if (!oneInchSize) return null;
                  const photoWidth = oneInchSize.width * configPreviewScale;
                  const photoHeight = oneInchSize.height * configPreviewScale;
                  const photosPerRow = Math.floor(((pageSize.name === 'custom' ? customPageSize.width : pageSize.width) - 10) / (oneInchSize.width + 5));
                  const photosPerCol = Math.floor(((pageSize.name === 'custom' ? customPageSize.height : pageSize.height) - 10) / (oneInchSize.height + 5));
                  const previewPhotos = [];
                  const marginSize = 5 * configPreviewScale;
                  for (let row = 0; row < Math.min(photosPerCol, 4); row++) {
                    for (let col = 0; col < Math.min(photosPerRow, 6); col++) {
                      previewPhotos.push(
                        <div
                          key={`preview-${row}-${col}`}
                          style={{
                            position: 'absolute',
                            left: marginSize + col * (photoWidth + marginSize),
                            top: marginSize + row * (photoHeight + marginSize),
                            width: photoWidth,
                            height: photoHeight,
                            backgroundColor: '#e5e7eb',
                            border: '1px dashed #9ca3af',
                            zIndex: 5
                          }}
                        />
                      );
                    }
                  }
                  return previewPhotos;
                })()}
              </div>
            </div>
            <Alert className="mt-4">
              <Info size={16} />
              <AlertDescription>
                请确保选择的页面尺寸与您的打印纸张相匹配。
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};