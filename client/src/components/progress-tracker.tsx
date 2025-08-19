import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

interface ProgressStep {
  id: number;
  title: string;
  completed: boolean;
  active: boolean;
  error?: boolean;
}

interface ProgressTrackerProps {
  status: 'uploaded' | 'processing' | 'completed' | 'error';
  progress: number;
  errorMessage?: string;
}

export function ProgressTracker({ status, progress, errorMessage }: ProgressTrackerProps) {
  const getSteps = (): ProgressStep[] => {
    const baseSteps = [
      { id: 1, title: "File validation complete", completed: progress >= 10, active: progress < 10 && status === 'processing' },
      { id: 2, title: "Processing bridge parameters", completed: progress >= 30, active: progress >= 10 && progress < 30 && status === 'processing' },
      { id: 3, title: "Generating elevation views", completed: progress >= 60, active: progress >= 30 && progress < 60 && status === 'processing' },
      { id: 4, title: "Creating DWG files", completed: progress >= 80, active: progress >= 60 && progress < 80 && status === 'processing' },
      { id: 5, title: "Generating PDF output", completed: progress >= 100, active: progress >= 80 && progress < 100 && status === 'processing' },
    ];

    if (status === 'error') {
      return baseSteps.map(step => ({
        ...step,
        error: step.active,
        active: false,
      }));
    }

    return baseSteps;
  };

  const steps = getSteps();

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="text-primary mr-2" size={20} />
          Generation Progress
        </h3>
        
        <div className="space-y-4 mb-6">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                step.error 
                  ? "bg-red-500 text-white"
                  : step.completed 
                    ? "bg-green-500 text-white" 
                    : step.active 
                      ? "bg-primary text-white animate-pulse" 
                      : "bg-gray-200 text-gray-400"
              }`}>
                {step.error ? (
                  <AlertCircle size={12} />
                ) : step.completed ? (
                  <CheckCircle size={12} />
                ) : (
                  step.id
                )}
              </div>
              <span className={`text-sm ${
                step.error ? "text-red-600" : step.completed ? "text-gray-700" : "text-gray-400"
              }`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>

        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Overall Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                status === 'error' ? 'bg-red-500' : 'bg-primary'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {status === 'error' && errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="text-red-500 mr-2" size={16} />
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
