import { computed, ToRefs, unref } from 'vue'

import { DefaultActionState, signUpEmailPasswordPromise, SignUpOptions, User } from '@nhost/core'
import { useSelector } from '@xstate/vue'

import { RefOrValue } from './helpers'
import { useAccessToken } from './useAccessToken'
import { useAuthenticationStatus } from './useAuthenticationStatus'
import { useAuthInterpreter } from './useAuthInterpreter'
import { useError } from './useError'
import { useUserData } from './useUserData'

interface SignUpEmailPasswordState extends DefaultActionState {
  /** @return `true` if an email is required to complete the action, and that a verificaiton email has been sent to complete the action. */
  needsEmailVerification: boolean
  /** User information */
  user: User | null
  /** Access token (JWT) */
  accessToken: string | null
}

type SignUpEmailPasswordHandlerResult = Omit<SignUpEmailPasswordState, 'isLoading'>
interface SignUpEmailPasswordResult extends ToRefs<SignUpEmailPasswordState> {
  /** Used for a new user to sign up. Returns a promise with the current context */
  signUpEmailPassword(
    email: RefOrValue<string>,
    password: RefOrValue<string>
  ): Promise<SignUpEmailPasswordHandlerResult>
}

/**
 * Email and Password Sign-Up
 * @example
```js
const {
  isError,
  isLoading,
  isSuccess,
  needsEmailVerification,
  signUpEmailPassword
} = useSignUpEmailPassword();
```
 */
export const useSignUpEmailPassword = (
  options?: RefOrValue<SignUpOptions>
): SignUpEmailPasswordResult => {
  const service = useAuthInterpreter()
  const isError = useSelector(service.value, (state) =>
    state.matches({ authentication: { signedOut: 'failed' } })
  )

  const error = useError('registration')

  const { isLoading: loading, isAuthenticated: isSuccess } = useAuthenticationStatus()

  const isLoading = computed(() => loading.value && !isSuccess.value)
  const needsEmailVerification = useSelector(service.value, (state) =>
    state.matches({ authentication: { signedOut: 'noErrors' }, email: 'awaitingVerification' })
  )
  const accessToken = useAccessToken()
  const user = useUserData()
  const signUpEmailPassword = (email: RefOrValue<string>, password: RefOrValue<string>) =>
    signUpEmailPasswordPromise(service.value, unref(email), unref(password), unref(options))

  return {
    signUpEmailPassword,
    isLoading,
    isSuccess,
    isError,
    error,
    needsEmailVerification,
    accessToken,
    user
  }
}