
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MCQExtractor() {
  const [file, setFile] = useState(null);
  const [extractedData, setExtractedData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [currentEdit, setCurrentEdit] = useState({ question: '', options: [], correctAnswer: null });
  const [projectName, setProjectName] = useState('MCQ Project');
  const [showPreview, setShowPreview] = useState(false);
  const [savedProjects, setSavedProjects] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Load saved projects from localStorage on component mount
  useEffect(() => {
    const savedProjectsData = localStorage.getItem('mcqProjects');
    if (savedProjectsData) {
      setSavedProjects(JSON.parse(savedProjectsData));
    }
  }, []);
  
  const extractTextFromDocument = async (file) => {
    setIsLoading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await axios.post('http://localhost:5000/extract', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Add additional fields to each question
      const enhancedData = response.data.map(item => ({
        ...item,
        correctAnswer: null,
        difficulty: 'medium',
        tags: []
      }));
      
      setExtractedData(enhancedData);
      setError('');
    } catch (err) {
      setError(Failed to extract text: ${err.response?.data?.error || err.message});
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file first');
      return;
    }
    
    await extractTextFromDocument(file);
  };

  const startEditing = (index) => {
    setEditingIndex(index);
    setCurrentEdit({...extractedData[index]});
  };

  const handleQuestionChange = (e) => {
    setCurrentEdit({...currentEdit, question: e.target.value});
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...currentEdit.options];
    updatedOptions[index] = value;
    setCurrentEdit({...currentEdit, options: updatedOptions});
  };

  const addOption = () => {
    setCurrentEdit({
      ...currentEdit, 
      options: [...currentEdit.options, '']
    });
  };

  const removeOption = (index) => {
    const updatedOptions = [...currentEdit.options];
    updatedOptions.splice(index, 1);
    
    // Update correctAnswer if the removed option was the correct one
    let updatedCorrectAnswer = currentEdit.correctAnswer;
    if (currentEdit.correctAnswer === index) {
      updatedCorrectAnswer = null;
    } else if (currentEdit.correctAnswer > index) {
      updatedCorrectAnswer = currentEdit.correctAnswer - 1;
    }
    
    setCurrentEdit({
      ...currentEdit, 
      options: updatedOptions,
      correctAnswer: updatedCorrectAnswer
    });
  };
  
  const setCorrectAnswer = (index) => {
    setCurrentEdit({
      ...currentEdit,
      correctAnswer: currentEdit.correctAnswer === index ? null : index
    });
  };
  
  const handleDifficultyChange = (e) => {
    setCurrentEdit({
      ...currentEdit,
      difficulty: e.target.value
    });
  };
  
  const handleTagChange = (e) => {
    const tagInput = e.target.value;
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!currentEdit.tags.includes(tagInput.trim())) {
        setCurrentEdit({
          ...currentEdit,
          tags: [...currentEdit.tags, tagInput.trim()]
        });
      }
      e.target.value = '';
    }
  };
  
  const removeTag = (tagToRemove) => {
    setCurrentEdit({
      ...currentEdit,
      tags: currentEdit.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const saveEdit = () => {
    const updatedData = [...extractedData];
    updatedData[editingIndex] = currentEdit;
    setExtractedData(updatedData);
    setEditingIndex(null);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
  };
  
  const deleteQuestion = (index) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      const updatedData = [...extractedData];
      updatedData.splice(index, 1);
      setExtractedData(updatedData);
    }
  };
  
  const addNewQuestion = () => {
    setExtractedData([
      ...extractedData, 
      {
        question: 'New Question',
        options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
        correctAnswer: null,
        difficulty: 'medium',
        tags: []
      }
    ]);
    // Start editing the new question
    setEditingIndex(extractedData.length);
    setCurrentEdit({
      question: 'New Question',
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      correctAnswer: null,
      difficulty: 'medium',
      tags: []
    });
  };

  const saveToJsonFile = () => {
    if (extractedData.length === 0) {
      setError('No questions to save');
      return;
    }
    
    // Create project metadata
    const projectData = {
      name: projectName,
      createdAt: new Date().toISOString(),
      questions: extractedData
    };
    
    // Create a JSON string from the extracted data
    const jsonData = JSON.stringify(projectData, null, 2);
    
    // Create a blob with the JSON data
    const blob = new Blob([jsonData], { type: 'application/json' });
    
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = url;
    
    // Set the filename for the download
    const safeProjectName = projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = ${safeProjectName}.json;
    
    // Append the link to the document
    document.body.appendChild(link);
    
    // Trigger the download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Save to localStorage for future reference
    const updatedProjects = [...savedProjects];
    const existingProjectIndex = updatedProjects.findIndex(p => p.name === projectName);
    
    if (existingProjectIndex >= 0) {
      updatedProjects[existingProjectIndex] = projectData;
    } else {
      updatedProjects.push(projectData);
    }
    
    setSavedProjects(updatedProjects);
    localStorage.setItem('mcqProjects', JSON.stringify(updatedProjects));
  };
  
  const loadProject = (project) => {
    setProjectName(project.name);
    setExtractedData(project.questions);
  };
  
  const togglePreview = () => {
    setShowPreview(!showPreview);
  };
  
  const filteredData = extractedData.filter(item => 
    item.question.toLowerCase().includes(currentFilter.toLowerCase()) ||
    item.tags?.some(tag => tag.toLowerCase().includes(currentFilter.toLowerCase()))
  );
  
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0;
    
    let comparison = 0;
    if (sortField === 'question') {
      comparison = a.question.localeCompare(b.question);
    } else if (sortField === 'options') {
      comparison = a.options.length - b.options.length;
    } else if (sortField === 'difficulty') {
      const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
      comparison = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  const exportAsHTML = () => {
    if (extractedData.length === 0) {
      setError('No questions to export');
      return;
    }
    
    let htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${projectName} - MCQ Quiz</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        .question { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .options { list-style-type: lower-alpha; padding-left: 25px; }
        .options li { margin-bottom: 8px; }
        .correct { color: green; font-weight: bold; }
        .difficulty { font-size: 14px; color: #666; margin-top: 10px; }
        .tags { display: flex; flex-wrap: wrap; margin-top: 10px; }
        .tag { background: #f0f0f0; padding: 3px 8px; border-radius: 12px; margin-right: 5px; font-size: 12px; }
        h1 { text-align: center; }
      </style>
    </head>
    <body>
      <h1>${projectName}</h1>
    `;
    
    extractedData.forEach((item, index) => {
      htmlContent += `
      <div class="question">
        <h3>Question ${index + 1}: ${item.question}</h3>
        <ol class="options">
      `;
      
      item.options.forEach((option, optIndex) => {
        const isCorrect = optIndex === item.correctAnswer;
        htmlContent += `<li${isCorrect ? ' class="correct"' : ''}>${option}</li>`;
      });
      
      htmlContent += `
        </ol>
        <div class="difficulty">Difficulty: ${item.difficulty}</div>
      `;
      
      if (item.tags && item.tags.length > 0) {
        htmlContent += <div class="tags">;
        item.tags.forEach(tag => {
          htmlContent += <span class="tag">${tag}</span>;
        });
        htmlContent += </div>;
      }
      
      htmlContent += </div>;
    });
    
    htmlContent += `
    </body>
    </html>
    `;
    
    // Create a blob with the HTML content
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    const safeProjectName = projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = ${safeProjectName}_quiz.html;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">MCQ Document Extractor</h1>
      
      <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-8">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Project Name:</label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Enter project name"
          />
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Upload your document (image or PDF)</label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="w-full border p-2 rounded"
            />
          </div>
          
          <button 
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isLoading ? 'Processing...' : 'Extract Questions'}
          </button>
        </form>
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {savedProjects.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Load Saved Project:</h3>
            <div className="flex flex-wrap gap-2">
              {savedProjects.map((project, index) => (
                <button
                  key={index}
                  onClick={() => loadProject(project)}
                  className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 text-sm"
                >
                  {project.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {extractedData.length > 0 && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
              <h2 className="text-2xl font-semibold">Questions ({extractedData.length})</h2>
              
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={addNewQuestion}
                  className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                  Add Question
                </button>
                <button 
                  onClick={togglePreview}
                  className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700"
                >
                  {showPreview ? 'Edit Mode' : 'Preview Mode'}
                </button>
                <button 
                  onClick={saveToJsonFile}
                  className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                >
                  Save as JSON
                </button>
                <button 
                  onClick={exportAsHTML}
                  className="bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700"
                >
                  Export as HTML
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <input
                type="text"
                placeholder="Filter questions by keyword or tag..."
                value={currentFilter}
                onChange={(e) => setCurrentFilter(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>
            
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => {
                  setSortField('question');
                  setSortDirection(sortField === 'question' && sortDirection === 'asc' ? 'desc' : 'asc');
                }}
                className={px-3 py-1 rounded ${sortField === 'question' ? 'bg-blue-500 text-white' : 'bg-gray-200'}}
              >
                Sort by Question {sortField === 'question' && (sortDirection === 'asc' ? '↑' : '↓')}
              </button>
              <button
                onClick={() => {
                  setSortField('options');
                  setSortDirection(sortField === 'options' && sortDirection === 'asc' ? 'desc' : 'asc');
                }}
                className={px-3 py-1 rounded ${sortField === 'options' ? 'bg-blue-500 text-white' : 'bg-gray-200'}}
              >
                Sort by Options Count {sortField === 'options' && (sortDirection === 'asc' ? '↑' : '↓')}
              </button>
              <button
                onClick={() => {
                  setSortField('difficulty');
                  setSortDirection(sortField === 'difficulty' && sortDirection === 'asc' ? 'desc' : 'asc');
                }}
                className={px-3 py-1 rounded ${sortField === 'difficulty' ? 'bg-blue-500 text-white' : 'bg-gray-200'}}
              >
                Sort by Difficulty {sortField === 'difficulty' && (sortDirection === 'asc' ? '↑' : '↓')}
              </button>
            </div>
          </div>
          
          {sortedData.map((item, index) => {
            const originalIndex = extractedData.findIndex(q => q === item);
            
            return (
              <div key={originalIndex} className="bg-white p-4 rounded-lg shadow">
                {showPreview ? (
                  // Preview Mode
                  <div className="preview-mode">
                    <div className="flex justify-between">
                      <h3 className="text-lg font-medium mb-3">
                        <span className="font-bold">Q{originalIndex + 1}:</span> {item.question}
                      </h3>
                      <div className="badge px-2 py-1 rounded bg-gray-200 text-sm">
                        {item.difficulty}
                      </div>
                    </div>
                    
                    <div className="ml-6 mb-4">
                      <h4 className="font-medium mb-2">Options:</h4>
                      <ol className="list-alpha pl-6 space-y-1">
                        {item.options.map((option, optIndex) => (
                          <li key={optIndex} className={item.correctAnswer === optIndex ? "font-bold text-green-600" : ""}>
                            {option} {item.correctAnswer === optIndex && "(Correct)"}
                          </li>
                        ))}
                      </ol>
                    </div>
                    
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.tags.map((tag, tagIndex) => (
                          <span key={tagIndex} className="bg-gray-100 px-2 py-1 rounded text-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <button
                      onClick={() => setShowPreview(false)}
                      className="mt-4 bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700"
                    >
                      Switch to Edit Mode
                    </button>
                  </div>
                ) : editingIndex === originalIndex ? (
                  // Edit Mode - Currently Editing
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 mb-2">Question:</label>
                      <input
                        type="text"
                        value={currentEdit.question}
                        onChange={handleQuestionChange}
                        className="w-full border p-2 rounded"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 mb-2">Options:</label>
                      {currentEdit.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center mb-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(optIndex, e.target.value)}
                            className="flex-grow border p-2 rounded mr-2"
                          />
                          <button
                            type="button"
                            onClick={() => setCorrectAnswer(optIndex)}
                            className={mr-2 px-3 py-1 rounded ${currentEdit.correctAnswer === optIndex ? 'bg-green-500 text-white' : 'bg-gray-200'}}
                          >
                            Correct
                          </button>
                          <button
                            type="button"
                            onClick={() => removeOption(optIndex)}
                            className="bg-red-500 text-white p-1 rounded"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addOption}
                        className="bg-blue-500 text-white py-1 px-2 rounded mt-2"
                      >
                        + Add Option
                      </button>
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 mb-2">Difficulty:</label>
                      <select
                        value={currentEdit.difficulty || 'medium'}
                        onChange={handleDifficultyChange}
                        className="border p-2 rounded"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 mb-2">Tags (press Enter to add):</label>
                      <input
                        type="text"
                        placeholder="Add a tag..."
                        onKeyDown={handleTagChange}
                        className="w-full border p-2 rounded mb-2"
                      />
                      
                      <div className="flex flex-wrap gap-1">
                        {currentEdit.tags?.map((tag, tagIndex) => (
                          <span key={tagIndex} className="bg-gray-100 px-2 py-1 rounded text-sm flex items-center">
                            {tag}
                            <button
                              onClick={() => removeTag(tag)}
                              className="ml-1 text-red-500"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={saveEdit}
                        className="bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="bg-gray-500 text-white py-1 px-3 rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // Edit Mode - Not Currently Editing
                  <>
                    <div className="flex justify-between">
                      <h3 className="text-lg font-medium mb-3">
                        <span className="font-bold">Q{originalIndex + 1}:</span> {item.question}
                      </h3>
                      {item.difficulty && (
                        <div className="badge px-2 py-1 rounded bg-gray-200 text-sm">
                          {item.difficulty}
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-6">
                      <h4 className="font-medium mb-2">Options:</h4>
                      <ol className="list-alpha pl-6 space-y-1">
                        {item.options.map((option, optIndex) => (
                          <li key={optIndex} className={item.correctAnswer === optIndex ? "font-bold text-green-600" : ""}>
                            {option} {item.correctAnswer === optIndex && "(Correct)"}
                          </li>
                        ))}
                      </ol>
                    </div>
                    
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.tags.map((tag, tagIndex) => (
                          <span key={tagIndex} className="bg-gray-100 px-2 py-1 rounded text-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex space-x-2 mt-4">
                      <button
                        onClick={() => startEditing(originalIndex)}
                        className="bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteQuestion(originalIndex)}
                        className="bg-red-600 text-white py-1 px-3 rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MCQExtractor;