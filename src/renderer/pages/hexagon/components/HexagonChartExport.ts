/**
 * 使用html2canvas导出图表为PNG图片
 * @param elementSelector 要导出的DOM元素选择器
 * @returns 返回Promise，成功时返回图片dataUrl，失败时返回错误
 */
export const exportChartToPng = async (elementSelector: string): Promise<string> => {
  // 查找DOM元素
  const chartElement = document.querySelector(elementSelector);
  if (!chartElement) {
    throw new Error('找不到图表元素');
  }
  
  try {
    // 动态导入html2canvas
    const { default: html2canvas } = await import('html2canvas');
    
    // 执行导出
    const canvas = await html2canvas(chartElement as HTMLElement);
    const dataUrl = canvas.toDataURL('image/png');
    
    return dataUrl;
  } catch (error) {
    console.error('导出图表失败:', error);
    throw error;
  }
};

/**
 * 触发图片下载
 * @param dataUrl 图片的Data URL
 * @param filename 文件名
 */
export const downloadImage = (dataUrl: string, filename: string): void => {
  // 创建下载链接
  const downloadLink = document.createElement('a');
  downloadLink.href = dataUrl;
  downloadLink.download = filename;
  
  // 添加到文档中并触发点击
  document.body.appendChild(downloadLink);
  downloadLink.click();
  
  // 清理DOM
  document.body.removeChild(downloadLink);
}; 