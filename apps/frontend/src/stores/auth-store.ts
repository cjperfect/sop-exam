import { create } from 'zustand'
const ACCESS_TOKEN = 'token'
const USER_KEY = 'sop_user'
const MUST_CHANGE_PWD = 'sop_must_change_pwd'
const MENU_DATA = 'sop_menu_data'

interface AuthUser {
  accountNo: number
  username: string
  role: string[]
  exp: number
}

/** 后端返回的原始菜单数据结构 */
interface RawMenuItem {
  title: string
  url: string
  icon: string
}
interface RawNavGroup {
  title: string
  items: RawMenuItem[]
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    resetAccessToken: () => void
    reset: () => void
  }
  mustChangePassword: boolean
  setMustChangePassword: (v: boolean) => void
  /** 原始菜单数据（带图标字符串，可序列化） */
  rawMenuData: RawNavGroup[] | null
  setRawMenuData: (data: RawNavGroup[] | null) => void
}

function loadUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveUserData(user: AuthUser | null) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(USER_KEY)
  }
}

function loadMenuData(): RawNavGroup[] | null {
  try {
    const raw = localStorage.getItem(MENU_DATA)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveMenuData(data: RawNavGroup[] | null) {
  if (data) {
    localStorage.setItem(MENU_DATA, JSON.stringify(data))
  } else {
    localStorage.removeItem(MENU_DATA)
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  const initToken = localStorage.getItem(ACCESS_TOKEN) || ''
  const initMustChange = localStorage.getItem(MUST_CHANGE_PWD) === 'true'
  return {
    auth: {
      user: loadUser(),
      setUser: (user) => {
        saveUserData(user)
        set((state) => ({ ...state, auth: { ...state.auth, user } }))
      },
      accessToken: initToken,
      setAccessToken: (accessToken) =>
        set((state) => {
          localStorage.setItem(ACCESS_TOKEN, accessToken)
          return { ...state, auth: { ...state.auth, accessToken } }
        }),
      resetAccessToken: () =>
        set((state) => {
          localStorage.removeItem(ACCESS_TOKEN)
          return { ...state, auth: { ...state.auth, accessToken: '' } }
        }),
      reset: () =>
        set((state) => {
          localStorage.removeItem(ACCESS_TOKEN)
          localStorage.removeItem(USER_KEY)
          localStorage.removeItem(MUST_CHANGE_PWD)
          saveMenuData(null)
          return {
            ...state,
            auth: { ...state.auth, user: null, accessToken: '' },
            mustChangePassword: false,
            rawMenuData: null,
          }
        }),
    },
    mustChangePassword: initMustChange,
    setMustChangePassword: (v) => {
      if (v) localStorage.setItem(MUST_CHANGE_PWD, 'true')
      else localStorage.removeItem(MUST_CHANGE_PWD)
      set({ mustChangePassword: v })
    },
    rawMenuData: loadMenuData(),
    setRawMenuData: (data) => {
      saveMenuData(data)
      set({ rawMenuData: data })
    },
  }
})
