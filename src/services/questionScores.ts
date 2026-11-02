import type { PropertyQuestionScore } from '../types/property'

export const formatQuestionScore = (result: PropertyQuestionScore): string => {
  if (result.status === 'unknown') {
    return result.errorCode === 'missing_image_evidence' ? 'Unknown — images unavailable' : 'Unknown — unable to evaluate'
  }
  return typeof result.score === 'number' && Number.isFinite(result.score)
    ? `${Math.round(result.score * 100)}%`
    : 'Pending'
}
