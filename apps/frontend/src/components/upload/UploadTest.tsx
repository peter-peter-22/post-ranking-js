import { useState, ChangeEvent } from 'react';

interface PresignedUrlResponse {
    uploadUrl: string;
    objectName: string;
}

export default function FileUpload() {
    const [file, setFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first');
            return;
        }

        try {
            // 1. Get pre-signed URL from backend
            const response = await fetch('http://localhost:3000/upload/generate-presigned-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileName: file.name }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: PresignedUrlResponse = await response.json();

            // 2. Upload file directly to MinIO
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', data.uploadUrl, true);
            xhr.setRequestHeader('Content-Type', file.type);

            xhr.upload.onprogress = (e: ProgressEvent) => {
                if (e.lengthComputable) {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    setUploadProgress(percent);
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200) {
                    alert('Upload successful!');
                    setUploadProgress(0);
                } else {
                    throw new Error(`Upload failed with status ${xhr.status}`);
                }
            };

            xhr.onerror = () => {
                throw new Error('Upload failed due to network error');
            };

            xhr.send(file);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
            console.error('Upload error:', err);
        }
    };

    return (
        <div className="file-upload-container">
            <h2>MinIO File Upload</h2>

            <input
                type="file"
                onChange={handleFileChange}
                accept="*"  // Or restrict to specific types: "image/*,.pdf"
            />

            <button
                onClick={handleUpload}
                disabled={!file || uploadProgress > 0}
            >
                {uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : 'Upload'}
            </button>

            {error && <div className="error-message">{error}</div>}

            {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="progress-bar">
                    <div style={{ width: `${uploadProgress}%` }}></div>
                </div>
            )}
        </div>
    );
};