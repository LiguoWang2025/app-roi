"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UploadResult {
  success: boolean;
  imported: number;
  collection_date: string;
  errors: string[];
}

export function CsvUploader() {
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      setError("请上传 CSV 格式的文件");
      return;
    }

    setIsUploading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "上传失败");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "上传过程中出现错误");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && fileInputRef.current) {
      fileInputRef.current.files = e.dataTransfer.files;
      handleUpload({ target: { files: e.dataTransfer.files } } as any);
    }
  };

  return (
    <Card className="bg-card text-card-foreground">
      <CardHeader>
        <CardTitle>CSV 数据上传</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 p-8 text-center hover:border-slate-400 dark:hover:border-slate-600"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <Input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleUpload}
            disabled={isUploading}
            className="hidden"
            id="csv-upload"
          />
          <label htmlFor="csv-upload" className="cursor-pointer text-center">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              <span className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                点击上传
              </span>{" "}
              或将文件拖拽至此
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-500">
              仅支持 CSV 格式文件，最大 50MB
            </div>
          </label>
        </div>

        {isUploading && (
          <div className="rounded-lg bg-blue-50 p-4 text-center">
            <p className="text-sm text-blue-600">正在上传并处理数据...</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 p-4">
            <p className="text-sm text-red-600">错误：{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-3 rounded-lg bg-green-50 p-4">
            <div className="text-sm text-green-800">
              <p className="font-medium">✓ 上传成功</p>
              <p className="mt-1">
                导入行数：<span className="font-medium">{result.imported}</span>
              </p>
              <p>
                数据日期：
                <span className="font-medium">{result.collection_date}</span>
              </p>
            </div>
            {result.errors && result.errors.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-amber-700">
                  警告：{result.errors.length} 行数据解析失败
                </p>
                <ul className="mt-1 max-h-32 overflow-y-auto text-xs text-amber-600">
                  {result.errors.slice(0, 5).map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                  {result.errors.length > 5 && (
                    <li>... 还有 {result.errors.length - 5} 条错误</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-slate-500">
          <p className="font-medium">注意事项：</p>
          <ul className="mt-1 list-disc pl-4 space-y-0.5">
            <li>重复数据将自动覆盖更新</li>
            <li>支持并发上传，系统会自动处理冲突</li>
            <li>CSV 格式需符合标准模板要求</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
