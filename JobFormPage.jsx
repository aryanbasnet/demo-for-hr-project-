// frontend/src/pages/JobForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Plus, X } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const JobForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    employmentType: 'Full-time',
    experienceLevel: 'Mid',
    description: '',
    requirements: [''],
    responsibilities: [''],
    salaryRange: { min: '', max: '', currency: 'USD' },
    postingType: 'both',
    status: 'draft',
    openings: 1,
    skills: [''],
    benefits: ['']
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchJob();
    }
  }, [id]);

  const fetchJob = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/jobs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setFormData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching job:', error);
      alert('Failed to load job details');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const cleanedData = {
        ...formData,
        requirements: formData.requirements.filter(r => r.trim()),
        responsibilities: formData.responsibilities.filter(r => r.trim()),
        skills: formData.skills.filter(s => s.trim()),
        benefits: formData.benefits.filter(b => b.trim())
      };

      if (isEdit) {
        await axios.put(`${API_URL}/jobs/${id}`, cleanedData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/jobs`, cleanedData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      navigate('/jobs');
    } catch (error) {
      console.error('Error saving job:', error);
      alert('Failed to save job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/jobs')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Job Posting' : 'Create New Job Posting'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employment Type *
              </label>
              <select
                name="employmentType"
                value={formData.employmentType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level *
              </label>
              <select
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="Entry">Entry</option>
                <option value="Mid">Mid</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
                <option value="Executive">Executive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Openings *
              </label>
              <input
                type="number"
                name="openings"
                value={formData.openings}
                onChange={handleChange}
                min="1"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Posting Type *
              </label>
              <select
                name="postingType"
                value={formData.postingType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="internal">Internal Only</option>
                <option value="external">External Only</option>
                <option value="both">Both Internal & External</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
                <option value="on-hold">On Hold</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Salary Range */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Salary Range</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum
              </label>
              <input
                type="number"
                name="salaryRange.min"
                value={formData.salaryRange.min}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum
              </label>
              <input
                type="number"
                name="salaryRange.max"
                value={formData.salaryRange.max}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Requirements</h2>
            <button
              type="button"
              onClick={() => addArrayItem('requirements')}
              className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-700"
            >
              <Plus className="h-4 w-4" />
              <span>Add</span>
            </button>
          </div>
          {formData.requirements.map((req, index) => (
            <div key={index} className="flex space-x-2">
              <input
                type="text"
                value={req}
                onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter requirement"
              />
              {formData.requirements.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem('requirements', index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Responsibilities */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Responsibilities</h2>
            <button
              type="button"
              onClick={() => addArrayItem('responsibilities')}
              className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-700"
            >
              <Plus className="h-4 w-4" />
              <span>Add</span>
            </button>
          </div>
          {formData.responsibilities.map((resp, index) => (
            <div key={index} className="flex space-x-2">
              <input
                type="text"
                value={resp}
                onChange={(e) => handleArrayChange('responsibilities', index, e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter responsibility"
              />
              {formData.responsibilities.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem('responsibilities', index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Skills */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Required Skills</h2>
            <button
              type="button"
              onClick={() => addArrayItem('skills')}
              className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-700"
            >
              <Plus className="h-4 w-4" />
              <span>Add</span>
            </button>
          </div>
          {formData.skills.map((skill, index) => (
            <div key={index} className="flex space-x-2">
              <input
                type="text"
                value={skill}
                onChange={(e) => handleArrayChange('skills', index, e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter skill"
              />
              {formData.skills.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem('skills', index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Submit Buttons */}
        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Saving...' : (isEdit ? 'Update Job' : 'Create Job')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/jobs')}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobForm;