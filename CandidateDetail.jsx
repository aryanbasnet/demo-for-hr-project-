// frontend/src/pages/CandidateDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, Award, Calendar } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const CandidateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    fetchCandidate();
  }, [id]);

  const fetchCandidate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/candidates/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setCandidate(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching candidate:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/candidates/${id}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCandidate();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/candidates/${id}/notes`, 
        { text: newNote },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewNote('');
      fetchCandidate();
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Failed to add note');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading candidate details...</div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Candidate not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/candidates')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Candidate Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Candidate Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="h-20 w-20 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-semibold">
                  {candidate.firstName.charAt(0)}{candidate.lastName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {candidate.firstName} {candidate.lastName}
                  </h2>
                  <p className="text-gray-600">{candidate.currentPosition || 'N/A'}</p>
                  {candidate.currentCompany && (
                    <p className="text-gray-500 text-sm">at {candidate.currentCompany}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-yellow-500" />
                <span className="text-2xl font-bold text-gray-900">{candidate.ruleBasedScore}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center text-gray-600">
                <Mail className="h-5 w-5 mr-2" />
                {candidate.email}
              </div>
              <div className="flex items-center text-gray-600">
                <Phone className="h-5 w-5 mr-2" />
                {candidate.phone}
              </div>
              <div className="flex items-center text-gray-600">
                <Briefcase className="h-5 w-5 mr-2" />
                {candidate.experience} years experience
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar className="h-5 w-5 mr-2" />
                Applied: {new Date(candidate.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Job Applied */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Applied For</h3>
            {candidate.jobAppliedFor && (
              <div className="border-l-4 border-indigo-500 pl-4">
                <h4 className="font-semibold text-gray-900">{candidate.jobAppliedFor.title}</h4>
                <p className="text-gray-600">{candidate.jobAppliedFor.department}</p>
                <p className="text-gray-500 text-sm">{candidate.jobAppliedFor.location}</p>
              </div>
            )}
          </div>

          {/* Skills */}
          {candidate.skills && candidate.skills.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {candidate.education && candidate.education.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Education</h3>
              <div className="space-y-3">
                {candidate.education.map((edu, index) => (
                  <div key={index} className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                    <p className="text-gray-600">{edu.institution}</p>
                    <p className="text-gray-500 text-sm">{edu.year}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cover Letter */}
          {candidate.coverLetter && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cover Letter</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{candidate.coverLetter}</p>
            </div>
          )}

          {/* Notes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
            
            <form onSubmit={handleAddNote} className="mb-4">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note about this candidate..."
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-2"
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Add Note
              </button>
            </form>

            <div className="space-y-3">
              {candidate.notes && candidate.notes.length > 0 ? (
                candidate.notes.map((note, index) => (
                  <div key={index} className="border-l-4 border-gray-300 pl-4 py-2">
                    <p className="text-gray-700">{note.text}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {note.addedBy?.name} • {new Date(note.addedAt).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No notes yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6">
          {/* Status Update */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h3>
            <select
              value={candidate.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="new">New</option>
              <option value="screening">Screening</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interview_scheduled">Interview Scheduled</option>
              <option value="interviewed">Interviewed</option>
              <option value="offer_extended">Offer Extended</option>
              <option value="hired">Hired</option>
              <option value="rejected">Rejected</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </div>

          {/* Quick Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Info</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Source</p>
                <p className="font-medium text-gray-900 capitalize">{candidate.source}</p>
              </div>
              {candidate.expectedSalary && (
                <div>
                  <p className="text-sm text-gray-500">Expected Salary</p>
                  <p className="font-medium text-gray-900">${candidate.expectedSalary.toLocaleString()}</p>
                </div>
              )}
              {candidate.availability && (
                <div>
                  <p className="text-sm text-gray-500">Available From</p>
                  <p className="font-medium text-gray-900">
                    {new Date(candidate.availability).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Schedule Interview
              </button>
              <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Send Offer Letter
              </button>
              <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Send Rejection Letter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetail;