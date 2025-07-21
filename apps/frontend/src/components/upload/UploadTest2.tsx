import { useState, ChangeEvent } from 'react';

export default function FileUpload2() {
    const [file, setFile] = useState<File | null>(null);
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
            const formData = new FormData();
            formData.append("file", file);
            formData.append("options", JSON.stringify({test:"test1"}));

            const res = await fetch("http://localhost:8003/upload/", {
                method: "POST",
                body: formData
            })

            console.log(await res.json())
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
                disabled={!file}
            >
                Upload
            </button>

            {error && <div className="error-message">{error}</div>}

        </div>
    );
};