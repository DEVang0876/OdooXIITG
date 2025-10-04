import React, { useState } from 'react';
import axios from 'axios';

const ExpenseUploadForm = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('idle'); // 'idle', 'uploading', 'success', 'error'
    const [serverResponse, setServerResponse] = useState(null);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setUploadStatus('idle');
        setServerResponse(null);
    };

    const handleUpload = async (event) => {
        event.preventDefault();
        if (!selectedFile) {
            alert('Please select a file first.');
            return;
        }

        setUploadStatus('uploading');

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await axios.post('/api/expenses/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setUploadStatus('success');
            setServerResponse(response.data);
        } catch (error) {
            setUploadStatus('error');
            setServerResponse(error.response ? error.response.data : 'An error occurred');
        }
    };

    return (
        <div>
            <h2>Upload Expense Receipt</h2>
            <form onSubmit={handleUpload}>
                <div>
                    <label htmlFor="file">Select Receipt Image:</label>
                    <input
                        type="file"
                        id="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        required
                    />
                </div>
                <button type="submit" disabled={uploadStatus === 'uploading'}>
                    {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload Receipt'}
                </button>
            </form>

            {uploadStatus === 'uploading' && <p>Uploading your receipt...</p>}
            {uploadStatus === 'success' && (
                <div>
                    <p>Upload successful!</p>
                    <pre>{JSON.stringify(serverResponse, null, 2)}</pre>
                </div>
            )}
            {uploadStatus === 'error' && (
                <div>
                    <p>Upload failed.</p>
                    <pre>{JSON.stringify(serverResponse, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default ExpenseUploadForm;