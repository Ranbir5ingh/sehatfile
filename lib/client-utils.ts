export async function downscaleImage(file: File, maxDim = 1400, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(e.target?.result as string);
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('Failed to load image for processing'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

export function generateSampleLabReportCanvas(personName: string, relation: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1000;
  canvas.height = 1300;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Top Banner
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvas.width, 130);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 34px -apple-system, BlinkMacSystemFont, Arial';
  ctx.fillText('DR. LAL PATHLABS & DIAGNOSTICS', 60, 60);
  ctx.font = '18px Arial';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('Accredited Clinical Pathology & Molecular Diagnostic Center • New Delhi', 60, 95);

  // Patient Card
  ctx.strokeStyle = '#e2e8f0';
  ctx.strokeRect(60, 160, 880, 150);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 22px Arial';
  ctx.fillText(`Patient: ${personName || 'Ramesh Kumar'} (${relation || 'Father'})`, 80, 205);
  ctx.font = '17px Arial';
  ctx.fillStyle = '#475569';
  ctx.fillText(`Date: 2026-08-14 | Ref: Dr. A. K. Sharma (MD Internal Med)`, 80, 245);
  ctx.fillText(`Barcode: DL-2026-981442 | Sample: Blood (Fluoride / Serum)`, 80, 280);

  // Table Headers
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(60, 350, 880, 48);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 18px Arial';
  ctx.fillText('INVESTIGATION', 80, 380);
  ctx.fillText('OBSERVED VALUE', 450, 380);
  ctx.fillText('REFERENCE RANGE', 720, 380);

  // Test Rows
  ctx.font = '17px Arial';
  const rows = [
    ['HbA1c (Glycated Hemoglobin)', '7.6 % [HIGH]', '4.0 - 5.6 %'],
    ['Estimated Avg Glucose (eAG)', '171 mg/dL [HIGH]', '70 - 126 mg/dL'],
    ['Fasting Plasma Glucose', '148 mg/dL [HIGH]', '70 - 100 mg/dL'],
    ['Serum Creatinine', '0.95 mg/dL', '0.70 - 1.30 mg/dL'],
    ['Blood Urea Nitrogen (BUN)', '18 mg/dL', '7 - 20 mg/dL'],
  ];

  let y = 445;
  rows.forEach(([test, val, ref]) => {
    ctx.fillStyle = val.includes('[HIGH]') ? '#e11d48' : '#1e293b';
    ctx.fillText(test, 80, y);
    ctx.fillText(val, 450, y);
    ctx.fillStyle = '#64748b';
    ctx.fillText(ref, 720, y);
    y += 55;
  });

  // Doctor consultation notes box
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(60, 780, 880, 280);
  ctx.strokeStyle = '#cbd5e1';
  ctx.strokeRect(60, 780, 880, 280);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 19px Arial';
  ctx.fillText('DOCTOR CONSULTATION & PRESCRIPTION NOTES', 80, 820);
  ctx.font = '17px Arial';
  ctx.fillStyle = '#334155';
  ctx.fillText('Diagnosis: Type 2 Diabetes Mellitus with suboptimal control.', 80, 865);
  ctx.fillText('Rx: Tab Metformin 500mg — 1 tab twice daily after meals.', 80, 910);
  ctx.fillText('Rx: Tab Glimepiride 1mg — 1 tab once daily before breakfast.', 80, 955);
  ctx.fillText('Advised: Low carbohydrate diet, regular physical activity, review in 3 months.', 80, 1000);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '15px Arial';
  ctx.fillText('Verified & Digitally Signed by Pathologist Dr. N. Sengupta', 80, 1200);

  return canvas.toDataURL('image/jpeg', 0.85);
}
