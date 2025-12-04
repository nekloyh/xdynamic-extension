import React, { useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import {
  Brain,
  Play,
  Pause,
  RotateCcw,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Database,
  Cpu,
  Activity,
  Settings,
  Download,
  RefreshCw
} from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/ui/Toast';

interface ModelInfo {
  id: string;
  name: string;
  version: string;
  accuracy: number;
  status: 'active' | 'training' | 'idle';
  lastTrained: string;
  datasetSize: number;
}

interface TrainingJob {
  id: string;
  modelName: string;
  progress: number;
  status: 'running' | 'completed' | 'failed' | 'queued';
  startTime: string;
  estimatedTime: string;
}

// Mock data
const mockModels: ModelInfo[] = [
  { id: 'model_001', name: 'Content Classifier', version: 'v2.5.1', accuracy: 94.5, status: 'active', lastTrained: '2025-11-28', datasetSize: 150000 },
  { id: 'model_002', name: 'Image Detector', version: 'v1.8.0', accuracy: 91.2, status: 'training', lastTrained: '2025-11-25', datasetSize: 85000 },
  { id: 'model_003', name: 'Text Analyzer', version: 'v3.0.2', accuracy: 96.8, status: 'idle', lastTrained: '2025-11-30', datasetSize: 10000 },
  { id: 'model_004', name: 'Spam Filter', version: 'v2.1.0', accuracy: 98.1, status: 'idle', lastTrained: '2025-11-20', datasetSize: 50000 },
];

const mockTrainingJobs: TrainingJob[] = [
  { id: 'job_001', modelName: 'Image Detector', progress: 67, status: 'running', startTime: '2025-12-02 08:30', estimatedTime: '2h 15m remaining' },
  { id: 'job_002', modelName: 'Content Classifier', progress: 100, status: 'completed', startTime: '2025-12-01 14:00', estimatedTime: 'Completed' },
  { id: 'job_003', modelName: 'Text Analyzer', progress: 0, status: 'queued', startTime: 'Scheduled', estimatedTime: 'Waiting' },
];

export const AITraining: React.FC = () => {
  const [models] = useState<ModelInfo[]>(mockModels);
  const [trainingJobs] = useState<TrainingJob[]>(mockTrainingJobs);
  const { toasts, success, error } = useToast();

  const getStatusBadge = (status: ModelInfo['status']) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      training: 'bg-blue-100 text-blue-800',
      idle: 'bg-gray-100 text-gray-800',
    };
    const icons = {
      active: CheckCircle,
      training: RefreshCw,
      idle: Clock,
    };
    const Icon = icons[status];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        <Icon className={`w-3 h-3 mr-1 ${status === 'training' ? 'animate-spin' : ''}`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getJobStatusBadge = (status: TrainingJob['status']) => {
    const styles = {
      running: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      queued: 'bg-yellow-100 text-yellow-800',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleStartTraining = (modelId: string) => {
    success(`Training started for model ${modelId}`);
  };

  const handleStopTraining = (jobId: string) => {
    error(`Training stopped for job ${jobId}`);
  };

  return (
    <DashboardLayout>
      <ToastContainer toasts={toasts} />
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Training</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage and train your AI models
            </p>
          </div>
          <button className="btn-primary flex items-center">
            <Upload className="w-4 h-4 mr-2" />
            Upload Dataset
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Models</p>
                <p className="text-2xl font-bold text-gray-900">{models.filter(m => m.status === 'active').length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Brain className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Training Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{trainingJobs.filter(j => j.status === 'running').length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Accuracy</p>
                <p className="text-2xl font-bold text-gray-900">{(models.reduce((a, m) => a + m.accuracy, 0) / models.length).toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Datasets</p>
                <p className="text-2xl font-bold text-gray-900">{(models.reduce((a, m) => a + m.datasetSize, 0) / 1000).toFixed(0)}K</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Database className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Models Table */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">AI Models</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Model</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Version</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Accuracy</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Trained</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Dataset Size</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {models.map((model) => (
                  <tr key={model.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="p-2 bg-primary/10 rounded-lg mr-3">
                          <Cpu className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-medium text-gray-900">{model.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{model.version}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                          <div
                            className="h-2 bg-green-500 rounded-full"
                            style={{ width: `${model.accuracy}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{model.accuracy}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(model.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(model.lastTrained).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {(model.datasetSize / 1000).toFixed(0)}K samples
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleStartTraining(model.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Start Training"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                          title="Settings"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Training Jobs */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Training Jobs</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {trainingJobs.map((job) => (
              <div key={job.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${job.status === 'running' ? 'bg-blue-100' : job.status === 'completed' ? 'bg-green-100' : 'bg-gray-100'}`}>
                    {job.status === 'running' ? (
                      <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                    ) : job.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : job.status === 'failed' ? (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{job.modelName}</p>
                    <p className="text-sm text-gray-500">{job.startTime}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  {job.status === 'running' && (
                    <div className="w-48">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>{job.progress}%</span>
                        <span>{job.estimatedTime}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-blue-500 rounded-full transition-all"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {getJobStatusBadge(job.status)}
                  {job.status === 'running' && (
                    <button
                      onClick={() => handleStopTraining(job.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Stop Training"
                    >
                      <Pause className="w-4 h-4" />
                    </button>
                  )}
                  {job.status === 'failed' && (
                    <button
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Retry"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
