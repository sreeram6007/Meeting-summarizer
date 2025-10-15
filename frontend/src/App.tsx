
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [actionItems, setActionItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('No file chosen');

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    alert(`${type} copied to clipboard!`);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setLoading(true);
    setError('');
    setTranscript('');
    setSummary('');
    setActionItems([]);

    const formData = new FormData();
    formData.append('audio', file);

    try {
      const response = await axios.post('http://localhost:3001/api/summarize', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { transcript, summary } = response.data;
      
      // The backend now sends summary and action items combined.
      // We need to split them for the UI.
      const summaryParts = summary.split('Action Items:');
      const mainSummary = summaryParts[0].trim();
      const items = summaryParts[1] ? summaryParts[1].trim().split('\n- ').filter((item: string) => item) : [];

      setTranscript(transcript);
      setSummary(mainSummary);
      setActionItems(items);

    } catch (err) {
      setError('An error occurred. Please check the server logs or try a different file.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <nav className="navbar navbar-dark bg-primary">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">Gemini Meeting Summarizer</span>
        </div>
      </nav>

      <div className="container mt-5">
        <div className="row">
          <div className="col-lg-8 offset-lg-2">
            <div className="card upload-card p-4">
              <div className="card-body text-center">
                <h5 className="card-title">Summarize Your Meeting</h5>
                <p className="text-muted">Upload an audio file to get a transcript, summary, and action items.</p>
                
                <div className="input-group mt-4">
                    <input type="file" className="form-control" id="inputGroupFile02" accept="audio/*" onChange={handleFileChange} />
                </div>

                <button className="btn btn-primary w-50 mt-4" onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <span className="ms-2">Analyzing Audio...</span>
                    </>
                  ) : (
                    'Generate Summary'
                  )}
                </button>
                {error && <div className="alert alert-danger mt-3">{error}</div>}
              </div>
            </div>
          </div>
        </div>

        {loading && (
            <div className="text-center mt-4">
                <div className="spinner-border text-primary" role="status" style={{width: '3rem', height: '3rem'}}>
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">AI is working... This may take a moment.</p>
            </div>
        )}

        {!loading && (transcript || summary || actionItems.length > 0) && (
          <div className="row mt-5">
            <div className="col-lg-10 offset-lg-1">
              
              {summary && (
                <div className="card result-card mb-4">
                  <div className="card-body result-section">
                    <h5 className="card-title">Summary</h5>
                    <div className="result-text">
                      <button className="btn btn-sm copy-btn" onClick={() => copyToClipboard(summary, 'Summary')}>Copy</button>
                      {summary}
                    </div>
                  </div>
                </div>
              )}

              {actionItems.length > 0 && (
                <div className="card result-card mb-4">
                  <div className="card-body result-section">
                    <h5 className="card-title">Action Items</h5>
                    <ul className="action-items-list">
                      {actionItems.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                  </div>
                </div>
              )}

              {transcript && (
                <div className="card result-card">
                  <div className="card-body result-section">
                    <h5 className="card-title">Full Transcript</h5>
                    <div className="result-text">
                      <button className="btn btn-sm copy-btn" onClick={() => copyToClipboard(transcript, 'Transcript')}>Copy</button>
                      {transcript}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
