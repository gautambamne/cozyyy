import { cn } from '@/lib/utils'

interface StepsProps {
  steps: string[]
  currentStep: number
  onStepClick?: (step: number) => void
}

export function Steps({ steps, currentStep, onStepClick }: StepsProps) {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
        {steps.map((step, index) => (
          <li key={step} className="md:flex-1">
            <button
              onClick={() => onStepClick?.(index)}
              disabled={index > currentStep}
              className={cn(
                'group flex w-full flex-col border-l-4 py-2 pl-4 hover:border-slate-400 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4',
                index <= currentStep
                  ? 'border-blue-600 hover:border-blue-800'
                  : 'border-slate-200',
                'cursor-pointer'
              )}
            >
              <span className="text-sm font-medium">Step {index + 1}</span>
              <span
                className={cn(
                  'text-sm font-medium',
                  index <= currentStep ? 'text-blue-600' : 'text-slate-500'
                )}
              >
                {step}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  )
}