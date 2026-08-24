import * as XLSX from 'xlsx';

function normalizeForExcel<T extends Record<string, unknown>>(
  data: T[],
): Record<string, unknown>[] {
  return data.map((row) => {
    const normalized: Record<string, unknown> = {};
    for (const key in row) {
      const value = row[key];
      if (Array.isArray(value)) {
        normalized[key] = value.join(', ');
      } else if (value !== null && typeof value === 'object') {
        normalized[key] = JSON.stringify(value);
      } else {
        normalized[key] = value;
      }
    }
    return normalized;
  });
}

export function downloadExcel<T extends Record<string, unknown>>(
  data: T[],
  filename = 'data.xlsx',
  sheetName = 'Sheet1',
) {
  if (!Array.isArray(data) || data.length === 0) {
    console.error('Invalid or empty data');
    return;
  }

  const normalized = normalizeForExcel(data);
  const worksheet = XLSX.utils.json_to_sheet(normalized);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  XLSX.writeFile(workbook, filename);
}

export async function convertToWebP(file: any, quality = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    if (!file.type.match(/image\/(png|jpeg|jpg)/)) {
      return reject(new Error('Unsupported file type'));
    }

    const img = new Image();
    const reader = new FileReader();

    reader.onload = function (e) {
      img.src = <string>e.target?.result;
    };

    reader.onerror = reject;

    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return reject(new Error('Conversion failed'));
          }
          // Construct a proper File from the blob
          const webpFile = new File([blob], file.name.replace(/\.(png|jpe?g)$/i, '.webp'), {
            type: 'image/webp',
          });
          resolve(webpFile);
        },
        'image/webp',
        quality,
      );
    };

    img.onerror = reject;

    reader.readAsDataURL(file);
  });
}
