import { useSelector } from '@xstate/vue'

import { useAuthInterpreter } from './useAuthInterpreter'

/**
 * @returns `Ref` to the user locale
 */
export const useUserLocale = () => {
  const service = useAuthInterpreter()
  return useSelector(
    service.value,
    (state) => state.context.user?.locale,
    (a, b) => a === b
  )
}