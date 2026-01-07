'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';

interface CustomizationData {
  uploadedImage: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
  previewBase64: string | null;
}

interface ProductCustomizerProps {
  productType: 'cup' | 'tshirt' | 'notebook' | 'set';
  productName: string;
  onCustomizationChange: (data: CustomizationData) => void;
}

const TEMPLATES = {
  cup: {
    width: 400,
    height: 400,
    printArea: { x: 100, y: 80, width: 200, height: 180 },
    bgColor: '#f5f5f5',
    productShape: 'cup'
  },
  tshirt: {
    width: 400,
    height: 480,
    printArea: { x: 120, y: 100, width: 160, height: 180 },
    bgColor: '#ffffff',
    productShape: 'tshirt'
  },
  notebook: {
    width: 350,
    height: 480,
    printArea: { x: 50, y: 60, width: 250, height: 340 },
    bgColor: '#f8f8f8',
    productShape: 'notebook'
  },
  set: {
    width: 400,
    height: 400,
    printArea: { x: 100, y: 80, width: 200, height: 200 },
    bgColor: '#f5f5f5',
    productShape: 'cup'
  }
};

export default function ProductCustomizer({ productType, productName, onCustomizationChange }: ProductCustomizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);
  const [imagePos, setImagePos] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const template = TEMPLATES[productType] || TEMPLATES.cup;

  // Draw the canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = template.bgColor;
    ctx.fillRect(0, 0, template.width, template.height);

    // Draw product outline based on type
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 2;

    if (template.productShape === 'cup') {
      // Draw cup shape
      ctx.beginPath();
      ctx.ellipse(template.width / 2, 60, 100, 30, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(template.width / 2 - 100, 60);
      ctx.lineTo(template.width / 2 - 80, 340);
      ctx.ellipse(template.width / 2, 340, 80, 25, 0, Math.PI, 0);
      ctx.lineTo(template.width / 2 + 100, 60);
      ctx.stroke();
      // Handle
      ctx.beginPath();
      ctx.ellipse(template.width / 2 + 110, 180, 30, 60, 0, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
    } else if (template.productShape === 'tshirt') {
      // Draw t-shirt shape
      ctx.beginPath();
      // Collar
      ctx.arc(template.width / 2, 50, 30, 0, Math.PI, true);
      // Left shoulder & sleeve
      ctx.lineTo(50, 80);
      ctx.lineTo(30, 150);
      ctx.lineTo(80, 160);
      ctx.lineTo(90, 120);
      // Left side
      ctx.lineTo(90, 420);
      // Bottom
      ctx.lineTo(310, 420);
      // Right side
      ctx.lineTo(310, 120);
      ctx.lineTo(320, 160);
      ctx.lineTo(370, 150);
      ctx.lineTo(350, 80);
      ctx.closePath();
      ctx.stroke();
    } else if (template.productShape === 'notebook') {
      // Draw notebook shape
      ctx.strokeRect(40, 40, 270, 400);
      // Spine
      ctx.fillStyle = '#e0e0e0';
      ctx.fillRect(40, 40, 20, 400);
      ctx.strokeRect(40, 40, 20, 400);
      // Rings
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.arc(50, 80 + i * 50, 8, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Draw print area guide
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = '#3b82f6';
    ctx.strokeRect(
      template.printArea.x,
      template.printArea.y,
      template.printArea.width,
      template.printArea.height
    );
    ctx.setLineDash([]);

    // Draw uploaded image if exists
    if (uploadedImage) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(
        template.printArea.x,
        template.printArea.y,
        template.printArea.width,
        template.printArea.height
      );
      ctx.clip();

      ctx.drawImage(
        uploadedImage,
        imagePos.x,
        imagePos.y,
        imagePos.width,
        imagePos.height
      );
      ctx.restore();

      // Draw resize handle
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(
        imagePos.x + imagePos.width - 8,
        imagePos.y + imagePos.height - 8,
        16,
        16
      );
    }

    // Label
    ctx.fillStyle = '#666';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Área de impresión', template.width / 2, template.height - 20);

    // Generate preview and send to parent
    const previewBase64 = canvas.toDataURL('image/png');
    onCustomizationChange({
      uploadedImage: uploadedImageSrc,
      x: imagePos.x,
      y: imagePos.y,
      width: imagePos.width,
      height: imagePos.height,
      previewBase64
    });
  }, [template, uploadedImage, imagePos, uploadedImageSrc, onCustomizationChange]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setUploadedImage(img);
        setUploadedImageSrc(event.target?.result as string);

        // Center image in print area with appropriate size
        const maxWidth = template.printArea.width * 0.8;
        const maxHeight = template.printArea.height * 0.8;
        const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
        const width = img.width * scale;
        const height = img.height * scale;

        setImagePos({
          x: template.printArea.x + (template.printArea.width - width) / 2,
          y: template.printArea.y + (template.printArea.height - height) / 2,
          width,
          height
        });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !uploadedImage) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on resize handle
    const handleX = imagePos.x + imagePos.width - 8;
    const handleY = imagePos.y + imagePos.height - 8;
    if (x >= handleX && x <= handleX + 16 && y >= handleY && y <= handleY + 16) {
      setIsResizing(true);
      return;
    }

    // Check if clicking on image
    if (x >= imagePos.x && x <= imagePos.x + imagePos.width &&
      y >= imagePos.y && y <= imagePos.y + imagePos.height) {
      setIsDragging(true);
      setDragOffset({ x: x - imagePos.x, y: y - imagePos.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDragging) {
      setImagePos(prev => ({
        ...prev,
        x: Math.max(template.printArea.x, Math.min(x - dragOffset.x, template.printArea.x + template.printArea.width - prev.width)),
        y: Math.max(template.printArea.y, Math.min(y - dragOffset.y, template.printArea.y + template.printArea.height - prev.height))
      }));
    } else if (isResizing) {
      setImagePos(prev => ({
        ...prev,
        width: Math.max(30, Math.min(x - prev.x, template.printArea.x + template.printArea.width - prev.x)),
        height: Math.max(30, Math.min(y - prev.y, template.printArea.y + template.printArea.height - prev.y))
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setUploadedImageSrc(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Personaliza tu {productName}</h3>

      {/* Upload Button */}
      <div className="mb-4 flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl cursor-pointer hover:bg-rose-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Subir Imagen
        </label>
        {uploadedImage && (
          <button
            onClick={handleRemoveImage}
            className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Quitar
          </button>
        )}
      </div>

      {/* Canvas */}
      <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50">
        <canvas
          ref={canvasRef}
          width={template.width}
          height={template.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="mx-auto cursor-move rounded-lg shadow-sm"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>

      {/* Instructions */}
      <p className="text-sm text-gray-500 mt-4 text-center">
        {uploadedImage
          ? '📌 Arrastra para mover • Usa la esquina inferior derecha para redimensionar'
          : '📷 Sube una imagen para ver cómo quedará tu producto'
        }
      </p>
    </div>
  );
}
