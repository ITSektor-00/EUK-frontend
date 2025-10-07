'use client';

import React from 'react';
import { WordTemplateStep } from '@/types/wordTemplate';

interface StepperProps {
    steps: WordTemplateStep[];
    currentStep: number;
}

const WordTemplateStepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
    return (
        <div className="stepper mb-8">
            <div className="flex items-center justify-between bg-white rounded-xl p-6 shadow-lg">
                {steps.map((step, index) => (
                    <div key={index} className="flex items-center">
                        <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                            index <= currentStep 
                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                                : 'border-gray-300 text-gray-500 bg-gray-100'
                        }`}>
                            {index + 1}
                        </div>
                        <div className="ml-4">
                            <div className={`text-sm font-semibold ${
                                index <= currentStep ? 'text-blue-600' : 'text-gray-500'
                            }`}>
                                {step.title}
                            </div>
                            <div className="text-xs text-gray-400">{step.description}</div>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`w-20 h-1 mx-6 rounded-full transition-all duration-300 ${
                                index < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                            }`} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WordTemplateStepper;
