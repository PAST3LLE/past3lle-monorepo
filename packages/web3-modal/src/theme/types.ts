import { BackgroundPropertyFull, ThemeBaseRequired, ThemeContentPartsRequired } from '@past3lle/theme'
import { DeepRequired } from '@past3lle/types'

type DefaultCSSProps = string | 'initial' | 'none' | 'unset' | 'inherit'

export interface FontStyles {
  color?: DefaultCSSProps
  family?: DefaultCSSProps
  style?: DefaultCSSProps
  size?: DefaultCSSProps
  weight?: number
  letterSpacing?: DefaultCSSProps
  lineHeight?: number
  textShadow?: DefaultCSSProps
  textTransform?: DefaultCSSProps
  textAlign?: 'left' | 'right' | 'center' | DefaultCSSProps
}
interface BorderStyles {
  border?: string
  color?: string
  radius?: string
}
export interface BackgroundStyles {
  main?: string
  secondary?: string
  alternate?: string
  success?: string
  error?: string
  warning?: string
  url?: BackgroundPropertyFull
}

export interface ButtonStyles {
  filter?: string
  font?: FontStyles
  border?: BorderStyles
  height?: string
  hoverAnimations?: boolean
  background?: {
    default?: string
    url?: BackgroundPropertyFull
  }
  icons?: {
    filter?: string
    height?: string
  }
}

export interface ContainerStyles {
  background?: string
  border?: BorderStyles
}

export interface SharedModalTheme {
  background?: BackgroundStyles
  baseFontSize?: number
  filter?: string
  font?: FontStyles
  button?: {
    main?: ButtonStyles
    secondary?: ButtonStyles
    alternate?: ButtonStyles
    active?: ButtonStyles
    disabled?: ButtonStyles
  }
  container?: {
    main?: ContainerStyles
    secondary?: ContainerStyles
    alternate?: ContainerStyles
  }
  text?: {
    main?: FontStyles
    header?: FontStyles
    strong?: FontStyles
    subHeader?: FontStyles
    small?: FontStyles
    error?: FontStyles
    warning?: FontStyles
  }
}
export interface BaseModalTheme extends SharedModalTheme {
  padding?: string
  tooltip?: {
    background?: string
    font?: FontStyles
  }
  title?: {
    font?: FontStyles
    margin?: string
  }
  attribution?: {
    color?: string
  }
  input?: {
    border?: BorderStyles
    background?: string
    font?: FontStyles
  }
  error?: {
    font?: Pick<FontStyles, 'color'>
    background?: Pick<BackgroundStyles, 'error'>['error']
  }
  helpers?: {
    show?: boolean
    font?: Pick<FontStyles, 'color' | 'size'>
  }
  closeIcon?: {
    color?: string
    /**
     * Size of icon in pixels
     * @type number
     */
    size?: number
    background?: string
  }
}
interface AccountModalTheme extends SharedModalTheme {
  connectionImages?: {
    size?: string
    background?: string
  }
  icons?: {
    wallet?: { url: string; invert?: boolean }
    network?: { url: string; invert?: boolean }
    copy?: { url: string; invert?: boolean }
  }
}
type ConnectionModal = SharedModalTheme
type HidDeviceModal = SharedModalTheme
type TransactionsModalTheme = SharedModalTheme
export interface PstlSubModalsTheme {
  base?: BaseModalTheme
  account?: AccountModalTheme
  connection?: ConnectionModal
  hidDevice?: HidDeviceModal
  transactions?: TransactionsModalTheme
}
export type RequiredPstlSubModalsTheme = DeepRequired<PstlSubModalsTheme>
export type PstlModalKeys = keyof PstlSubModalsTheme
export interface PstlModalTheme {
  modals?: PstlSubModalsTheme
}
export type PstlModalThemeExtension = Partial<ThemeContentPartsRequired> & {
  modals?: PstlSubModalsTheme & { base: DeepRequired<BaseModalTheme> }
}
export type RequiredPstlModalThemeExtension = DeepRequired<PstlModalThemeExtension>
declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends PstlModalTheme, ThemeBaseRequired {}
}
