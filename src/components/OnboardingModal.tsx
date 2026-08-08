import { useState, useEffect } from 'react'
import { Button } from './Button'
import { X } from 'lucide-react'

interface OnboardingModalProps {
  onClose: () => void
}

export function OnboardingModal({ onClose }: OnboardingModalProps) {
  const [step, setStep] = useState(0)

  const steps = [
    {
      title: '✨ Bienvenido a KEVANZA',
      description: 'La plataforma moderna para gestionar requerimientos y bases de compra pública.',
      action: 'Siguiente',
    },
    {
      title: '📋 Crea requerimientos',
      description: 'Ingresa todos los detalles: presupuesto, criterios de evaluación, tipos de compra.',
      action: 'Siguiente',
    },
    {
      title: '📊 Monitorea en Tiempo Real',
      description: 'Visualiza gráficos, estadísticas y el estado de todos tus requerimientos en el dashboard.',
      action: '¡Empezar!',
    },
  ]

  const currentStep = steps[step]
  const isLastStep = step === steps.length - 1

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentStep.title}</h2>
          <p className="text-gray-600">{currentStep.description}</p>
        </div>

        {/* Progress Dots */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index <= step ? 'bg-teal-600 w-8' : 'bg-gray-200 w-2'
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          {step > 0 && (
            <Button
              variant="ghost"
              onClick={() => setStep(step - 1)}
              className="flex-1"
            >
              Anterior
            </Button>
          )}
          {!isLastStep && (
            <Button onClick={() => setStep(step + 1)} className="flex-1">
              {currentStep.action}
            </Button>
          )}
          {isLastStep && (
            <Button onClick={onClose} className="flex-1">
              {currentStep.action}
            </Button>
          )}
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          Paso {step + 1} de {steps.length}
        </p>
      </div>
    </div>
  )
}
