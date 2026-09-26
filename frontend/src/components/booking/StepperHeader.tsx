import React from 'react';
import { useTranslation } from 'react-i18next';

interface StepperHeaderProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

export const StepperHeader: React.FC<StepperHeaderProps> = ({
  currentStep,
  onStepClick,
}) => {
  const { t } = useTranslation();

  const steps = [
    { number: 1, label: t('booking.step1_service') },
    { number: 2, label: t('booking.step2_master') },
    { number: 3, label: t('booking.step3_time') },
    { number: 4, label: t('booking.step4_details') },
  ];

  if (currentStep > 4) {
    return null;
  }

  return (
    <div className="w-full border-b border-line bg-paper-100 px-4 py-3 select-none">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        {steps.map((step) => {
          const isCurrent = currentStep === step.number;
          const isPassed = currentStep > step.number;

          return (
            <button
              key={step.number}
              onClick={() => isPassed && onStepClick(step.number)}
              disabled={!isPassed}
              className={`flex items-center gap-2 group transition-opacity ${
                !isPassed && !isCurrent ? 'opacity-40 cursor-default' : 'opacity-100'
              }`}
            >
              <div
                className={`w-6 h-6 flex items-center justify-center font-mono text-micro rounded-sm transition-colors ${
                  isCurrent
                    ? 'bg-charcoal-900 text-paper-50 font-semibold'
                    : isPassed
                    ? 'border border-charcoal-900 text-charcoal-900 bg-paper-50'
                    : 'border border-line text-charcoal-500'
                }`}
              >
                0{step.number}
              </div>
              <span
                className={`text-label font-medium ${
                  isCurrent
                    ? 'text-charcoal-900 font-semibold'
                    : 'text-charcoal-500'
                }`}
              >
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
