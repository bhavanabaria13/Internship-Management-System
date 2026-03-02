'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TrainingWeek {
  id: string;
  weekNumber: number;
  title: string;
  description?: string;
}

interface TrainingTopic {
  id: string;
  title: string;
  description?: string;
}

interface TrainingSubtopic {
  id: string;
  title: string;
  description?: string;
}

interface TrainingModuleProps {
  internId: string;
  internName: string;
}

export default function TrainingModule({ internId, internName }: TrainingModuleProps) {
  const [weeks, setWeeks] = useState<TrainingWeek[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [topics, setTopics] = useState<TrainingTopic[]>([]);
  const [subtopics, setSubtopics] = useState<TrainingSubtopic[]>([]);
  const [selectedSubtopics, setSelectedSubtopics] = useState<Set<string>>(new Set());
  const [completionStatus, setCompletionStatus] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [certificate, setCertificate] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [allWeeksCompleted, setAllWeeksCompleted] = useState(false);

  // Fetch weeks on mount
  useEffect(() => {
    const fetchWeeks = async () => {
      try {
        const response = await fetch('/api/training/weeks', {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        const data = await response.json();
        setWeeks(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch weeks:', error);
        setLoading(false);
      }
    };
    fetchWeeks();
  }, []);

  // Fetch topics when step changes
  useEffect(() => {
    if (weeks[currentStep]) {
      fetchTopics(weeks[currentStep].id);
    }
  }, [currentStep, weeks]);

  // Check completion status
  useEffect(() => {
    checkCompletion();
  }, []);

  const fetchTopics = async (weekId: string) => {
    try {
      const response = await fetch(`/api/training/weeks/${weekId}/topics`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await response.json();
      setTopics(data);
    } catch (error) {
      console.error('Failed to fetch topics:', error);
    }
  };

  const fetchSubtopics = async (topicId: string) => {
    try {
      const response = await fetch(`/api/training/topics/${topicId}/subtopics`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await response.json();
      setSubtopics(data);
    } catch (error) {
      console.error('Failed to fetch subtopics:', error);
    }
  };

  const checkCompletion = async () => {
    try {
      const response = await fetch(`/api/training/check-completion/${internId}`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await response.json();
      
      const status: Record<number, boolean> = {};
      data.completionStatus.forEach((item: any) => {
        status[item.weekNumber] = item.isCompleted;
      });
      setCompletionStatus(status);
      setAllWeeksCompleted(data.allWeeksCompleted);

      if (data.allWeeksCompleted) {
        fetchCertificate();
      }
    } catch (error) {
      console.error('Failed to check completion:', error);
    }
  };

  const fetchCertificate = async () => {
    try {
      const response = await fetch(`/api/training/certificate/${internId}`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setCertificate(data);
      }
    } catch (error) {
      console.error('Failed to fetch certificate:', error);
    }
  };

  const handleTopicClick = (topicId: string) => {
    fetchSubtopics(topicId);
  };

  const handleSubtopicToggle = (subtopicId: string) => {
    const newSelected = new Set(selectedSubtopics);
    if (newSelected.has(subtopicId)) {
      newSelected.delete(subtopicId);
    } else {
      newSelected.add(subtopicId);
    }
    setSelectedSubtopics(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedSubtopics.size === subtopics.length) {
      setSelectedSubtopics(new Set());
    } else {
      setSelectedSubtopics(new Set(subtopics.map(s => s.id)));
    }
  };

  const handleSubmitWeek = async () => {
    if (selectedSubtopics.size !== subtopics.length) {
      alert('Please check all subtopics before submitting');
      return;
    }

    setSubmitLoading(true);
    try {
      const response = await fetch('/api/training/progress/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          internId,
          weekId: weeks[currentStep].id,
          subtopicIds: Array.from(selectedSubtopics),
        }),
      });

      if (response.ok) {
        // Update completion status
        const newStatus = { ...completionStatus };
        newStatus[weeks[currentStep].weekNumber] = true;
        setCompletionStatus(newStatus);

        // Clear selected subtopics
        setSelectedSubtopics(new Set());
        setSubtopics([]);

        // Move to next step if available
        if (currentStep < weeks.length - 1) {
          setCurrentStep(currentStep + 1);
        } else {
          // All weeks completed, show final submit option
          setAllWeeksCompleted(true);
          await checkCompletion();
        }
      }
    } catch (error) {
      console.error('Failed to submit week:', error);
      alert('Failed to submit week. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    setSubmitLoading(true);
    try {
      const response = await fetch('/api/training/final-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ internId }),
      });

      if (response.ok) {
        const data = await response.json();
        setCertificate(data.certificate);
        setSuccessMessage(`🎉 Congratulations! Your internship course is complete. Certificate #${data.certificate.certificateNumber} has been generated.`);
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      console.error('Failed to submit:', error);
      alert('Failed to submit. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading training module...</div>;
  }

  if (weeks.length === 0) {
    return <div className="p-6 text-center">No training weeks available.</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {successMessage && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}

      {certificate && (
        <Card className="mb-6 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Course Completion Certificate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm"><strong>Certificate Number:</strong> {certificate.certificateNumber}</p>
              <p className="text-sm"><strong>Intern:</strong> {internName}</p>
              <p className="text-sm"><strong>Issued Date:</strong> {new Date(certificate.issuedDate).toLocaleDateString()}</p>
              <Button className="w-full mt-4">
                <Download className="h-4 w-4 mr-2" />
                Download Certificate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!allWeeksCompleted && (
        <>
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex justify-between mb-4">
              {weeks.map((week, index) => (
                <div key={week.id} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      completionStatus[week.weekNumber]
                        ? 'bg-green-500 text-white'
                        : index === currentStep
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-300 text-gray-700'
                    }`}
                  >
                    {completionStatus[week.weekNumber] ? '✓' : week.weekNumber}
                  </div>
                  <p className="text-xs mt-2 text-center">Week {week.weekNumber}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Current Week Content */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{weeks[currentStep]?.title}</CardTitle>
              <CardDescription>{weeks[currentStep]?.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {topics.length === 0 ? (
                <p className="text-gray-500">Loading topics...</p>
              ) : (
                topics.map((topic) => (
                  <div key={topic.id} className="border rounded-lg p-4">
                    <div
                      className="cursor-pointer font-semibold text-lg flex items-center justify-between hover:text-blue-600"
                      onClick={() => handleTopicClick(topic.id)}
                    >
                      {topic.title}
                      <span className="text-sm text-gray-500">→</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{topic.description}</p>

                    {/* Subtopics */}
                    {subtopics.length > 0 && topics.find(t => t.id === topic.id) && (
                      <div className="mt-4 space-y-3 pl-4 border-l-2 border-blue-200">
                        <div className="flex items-center justify-between mb-3">
                          <p className="font-semibold text-sm">Subtopics:</p>
                          <button
                            onClick={handleSelectAll}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            {selectedSubtopics.size === subtopics.length ? 'Deselect All' : 'Select All'}
                          </button>
                        </div>
                        {subtopics.map((subtopic) => (
                          <div key={subtopic.id} className="flex items-start gap-3">
                            <Checkbox
                              id={subtopic.id}
                              checked={selectedSubtopics.has(subtopic.id)}
                              onCheckedChange={() => handleSubtopicToggle(subtopic.id)}
                              className="mt-1"
                            />
                            <label htmlFor={subtopic.id} className="text-sm cursor-pointer flex-1">
                              <p className="font-medium">{subtopic.title}</p>
                              {subtopic.description && (
                                <p className="text-xs text-gray-600 mt-1">{subtopic.description}</p>
                              )}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}

              {/* Completion Status */}
              {selectedSubtopics.size > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {selectedSubtopics.size}/{subtopics.length} subtopics selected
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex gap-4 justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              Previous Week
            </Button>

            {currentStep === weeks.length - 1 ? (
              <Button
                onClick={handleSubmitWeek}
                disabled={selectedSubtopics.size !== subtopics.length || subtopics.length === 0 || submitLoading}
                className="flex-1"
              >
                {submitLoading ? 'Submitting...' : 'Submit Final Week'}
              </Button>
            ) : (
              <Button
                onClick={handleSubmitWeek}
                disabled={selectedSubtopics.size !== subtopics.length || subtopics.length === 0 || submitLoading}
                className="flex-1"
              >
                {submitLoading ? 'Submitting...' : 'Submit Week & Continue'}
              </Button>
            )}
          </div>
        </>
      )}

      {allWeeksCompleted && !certificate && (
        <Card className="border-yellow-200 bg-yellow-50 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-900">
              <AlertCircle className="h-5 w-5" />
              Ready for Final Submission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-800 mb-4">
              All weeks have been completed. Click the button below to generate your course completion certificate.
            </p>
            <Button
              onClick={handleFinalSubmit}
              disabled={submitLoading}
              className="w-full"
            >
              {submitLoading ? 'Generating Certificate...' : 'Generate Certificate & Complete Course'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
