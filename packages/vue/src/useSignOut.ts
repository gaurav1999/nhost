import { unref } from 'vue'

import { signOutPromise } from '@nhost/core'
import { useSelector } from '@xstate/vue'

import { RefOrValue } from './helpers'
import { useAuthInterpreter } from './useAuthInterpreter'

/**
 * Sign the current user out
 */
export const useSignOut = () => {
  const service = useAuthInterpreter()
  const signOut = (
    /** Sign out on all devices */
    all?: RefOrValue<boolean | undefined>
  ) => signOutPromise(service.value, typeof unref(all) === 'boolean' ? unref(all) : false)

  const isSuccess = useSelector(service.value, (state) =>
    state.matches({ authentication: { signedOut: 'success' } })
  )
  return { signOut, isSuccess }
}