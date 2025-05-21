// Mock for canvas.toBlob
export const setupCanvasMock = () => {
  // Create a mock for HTMLCanvasElement.prototype.toBlob
  HTMLCanvasElement.prototype.toBlob = function(callback, type = 'image/jpeg', quality = 0.8) {
    const blob = new Blob(['test'], { type });
    setTimeout(() => callback(blob), 0);
  };
};
