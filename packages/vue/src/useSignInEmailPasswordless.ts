import { ToRefs, unref } from 'vue'

import {
  DefaultActionState,
  PasswordlessOptions,
  SignInEmailPasswordlessHandlerResult,
  signInEmailPasswordlessPromise
} from '@nhost/core'
import { useSelector } from '@xstate/vue'

import { RefOrValue } from './helpers'
import { useAuthInterpreter } from './useAuthInterpreter'
import { useError } from './useError'

interface SignInEmailPasswordlessResult extends ToRefs<DefaultActionState> {
  /** Sends a magic link to the given email */
  signInEmailPasswordless(email: RefOrValue<string>): Promise<SignInEmailPasswordlessHandlerResult>
}

/**
 * Passwordless email authentication
 */
export const useSignInEmailPasswordless = (
  options?: RefOrValue<PasswordlessOptions>
): SignInEmailPasswordlessResult => {
  const service = useAuthInterpreter()
  const signInEmailPasswordless = (email: RefOrValue<string>) =>
    signInEmailPasswordlessPromise(service.value, unref(email), unref(options))

  const error = useError('authentication')

  const isLoading = useSelector(service.value, (state) =>
    state.matches({ authentication: { authenticating: 'passwordlessEmail' } })
  )

  const isSuccess = useSelector(service.value, (state) =>
    state.matches({ authentication: { signedOut: 'noErrors' }, email: 'awaitingVerification' })
  )

  const isError = useSelector(service.value, (state) =>
    state.matches({ authentication: { signedOut: 'failed' } })
  )

  return { signInEmailPasswordless, isLoading, isSuccess, isError, error }
}