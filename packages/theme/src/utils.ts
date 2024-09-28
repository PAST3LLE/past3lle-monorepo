import { DDPXImageUrlMap, GenericImageSrcSet } from '@past3lle/types'
import { score as getScore, ratio } from 'get-contrast'
import { darken, lighten, transparentize } from 'polished'
import { CSSObject, DefaultTheme, SimpleInterpolation, css } from 'styled-components'

import { MEDIA_WIDTHS, MediaWidths } from './styles'
import { BaseColours } from './templates/base'
import {
  BackgroundPropertyFull,
  Color,
  ImageKitUrl,
  ThemeBaseRequired,
  ThemeByModes,
  ThemeModesRequired
} from './types'

export const WHITE = BaseColours.white
export const OFF_WHITE = BaseColours.offwhite
export const BLACK = BaseColours.black
export const OFF_BLACK = BaseColours.offblack
export const BLACK_TRANSPARENT = transparentize(0.15, BLACK)

const whenMediaSmallerThan =
  (size: keyof ThemeBaseRequired['mediaWidth']) =>
  (first: CSSObject | TemplateStringsArray, ...interpolations: SimpleInterpolation[]) =>
  ({ theme }: { theme: ThemeBaseRequired }) =>
    theme.mediaWidth[size]`${css(first, ...interpolations)}`

export const upToExtraSmall = whenMediaSmallerThan('upToExtraSmall')
export const upToSmall = whenMediaSmallerThan('upToSmall')
export const upToMedium = whenMediaSmallerThan('upToMedium')
export const upToLarge = whenMediaSmallerThan('upToLarge')
export const upToExtraLarge = whenMediaSmallerThan('upToExtraLarge')

const whenMediaHeightSmallerThan =
  (size: keyof ThemeBaseRequired['mediaHeight']) =>
  (first: CSSObject | TemplateStringsArray, ...interpolations: SimpleInterpolation[]) =>
  ({ theme }: { theme: ThemeBaseRequired }) =>
    theme.mediaHeight[size]`${css(first, ...interpolations)}`

// height checks
export const upToExtraSmallHeight = whenMediaHeightSmallerThan('upToExtraSmallHeight')
export const upToSmallHeight = whenMediaHeightSmallerThan('upToSmallHeight')
export const upToMediumHeight = whenMediaHeightSmallerThan('upToMediumHeight')

const whenMediaLargerThan =
  (size: keyof ThemeBaseRequired['fromMediaWidth']) =>
  (first: CSSObject | TemplateStringsArray, ...interpolations: SimpleInterpolation[]) =>
  ({ theme }: { theme: ThemeBaseRequired }) =>
    theme.fromMediaWidth[size]`${css(first, ...interpolations)}`

export const fromExtraSmall = whenMediaLargerThan('fromExtraSmall')
export const fromSmall = whenMediaLargerThan('fromSmall')
export const fromMedium = whenMediaLargerThan('fromMedium')
export const fromLarge = whenMediaLargerThan('fromLarge')
export const fromExtraLarge = whenMediaLargerThan('fromExtraLarge')

const whenMediaBetween =
  (size: keyof ThemeBaseRequired['betweenMediaWidth']) =>
  (first: CSSObject | TemplateStringsArray, ...interpolations: SimpleInterpolation[]) =>
  ({ theme }: { theme: ThemeBaseRequired }) =>
    theme.betweenMediaWidth[size]`${css(first, ...interpolations)}`

export const betweenExtraSmallAndSmall = whenMediaBetween('betweenExtraSmallAndSmall')
export const betweenSmallAndMedium = whenMediaBetween('betweenSmallAndMedium')
export const betweenMediumAndLarge = whenMediaBetween('betweenMediumAndLarge')
export const betweenLargeAndExtraLarge = whenMediaBetween('betweenLargeAndExtraLarge')
export const betweenSmallAndLarge = whenMediaBetween('betweenSmallAndLarge')

// big to small
// e.g { width: 500, ar: "3:2" }
const IMG_SET_SIZE_ENTRIES = Object.entries(MEDIA_WIDTHS).reverse()
type UpToSizeKey = keyof typeof MEDIA_WIDTHS

type CheckHexColourContrastParams = { bgColour: Color; fgColour: Color; options: ContrastCheckOptions }

export function checkHexColourContrast({
  bgColour,
  fgColour,
  options
}: CheckHexColourContrastParams): [number, string] {
  const score: number = ratio(bgColour, fgColour, { ignoreAlpha: !!options?.ignoreAlpha })
  const rating: string = getScore(bgColour, fgColour, { ignoreAlpha: !!options?.ignoreAlpha })

  return [score, rating]
}

type BestContrastingColourParams = CheckHexColourContrastParams & {
  lightColour: Color
  darkColour: Color
}
type PossiblePassingContrastRatingThresholds = 'AAA' | 'AA' | 'A'
type ContrastCheckOptions = {
  ignoreAlpha?: boolean
  threshold: number | PossiblePassingContrastRatingThresholds[]
}

export function setBestContrastingColour(
  { bgColour, fgColour, lightColour, darkColour }: Omit<BestContrastingColourParams, 'options'>,
  options: ContrastCheckOptions = { ignoreAlpha: false, threshold: ['AA'] }
): string {
  const [contrastScore, contrastRating] = checkHexColourContrast({
    bgColour,
    fgColour,
    options
  })

  const passesThreshold =
    typeof options.threshold === 'number'
      ? contrastScore > options.threshold
      : !options.threshold.some((acceptedRating) => acceptedRating === contrastRating)

  return passesThreshold ? lightColour : darkColour
}

type LqIkUrlOptions = {
  fallbackUrl: string
  dpi?: keyof DDPXImageUrlMap
  transforms?: string | (((width?: number) => string) | string | null)[]
}
export function getLqIkUrl(
  urlAtWidth: DDPXImageUrlMap | undefined,
  { fallbackUrl, dpi = '2x', transform = '' }: Omit<LqIkUrlOptions, 'transforms'> & { transform?: string | null }
) {
  const queryUrl = urlAtWidth?.[dpi] || fallbackUrl
  const urlObj = queryUrl && new URL(queryUrl)

  if (!process.env.REACT_APP_IMAGEKIT_URL_ENDPOINT || !urlObj) return null

  return process.env.REACT_APP_IMAGEKIT_URL_ENDPOINT + urlObj?.pathname + '?tr=' + transform
}
export type BackgroundBlendMode =
  | 'color'
  | 'color-burn'
  | 'color-dodge'
  | 'darken'
  | 'difference'
  | 'exclusion'
  | 'hard-light'
  | 'hue'
  | 'lighten'
  | 'luminosity'
  | 'multiply'
  | 'normal'
  | 'overlay'
  | 'saturation'
  | 'screen'
  | 'soft-light'
  | 'inherit'
  | 'initial'
  | 'revert'
  | 'revert-layer'
  | 'unset'
/**
 *
 * @param theme
 * @param options
 * @example {
    isLogo?: boolean | undefined;
    imageUrls?: (string | undefined)[] | undefined;
    backgroundColor?: string | undefined;
    backgroundAttributes: string[];
    backgroundBlendMode?: string | undefined;
} 
 * @returns
 */
type SetCssBackgroundParams = {
  imageUrls?: GenericImageSrcSet<MediaWidths>[]
  backgroundAttributes?: string[]
  backgroundBlendMode?: BackgroundBlendMode
  backgroundColor?: string
  ignoreQueriesWithFixedWidth?: MediaWidths
  dpiLevel?: '3x' | '2x' | '1x'
  skipIk?: boolean
  lqIkUrlOptions?: Omit<LqIkUrlOptions, 'fallbackUrl'>
}
export const setCssBackground = (
  theme: ThemeBaseRequired,
  {
    imageUrls,
    backgroundColor = '',
    backgroundAttributes = ['center/cover no-repeat', 'center/cover no-repeat'],
    backgroundBlendMode = 'unset',
    ignoreQueriesWithFixedWidth = undefined,
    dpiLevel = '1x',
    skipIk = false,
    lqIkUrlOptions = {}
  }: SetCssBackgroundParams
) => {
  const getBackground = (width?: MediaWidths) => {
    return imageUrls
      ? imageUrls.map((urlSet, i, { length }) => {
          const [, isLast] = [!i, i === length - 1]

          const urlAtWidth = width && urlSet[width]
          const urlAtDpi = urlAtWidth?.[dpiLevel]

          const lqProp = lqIkUrlOptions.transforms?.[i]
          const lqTransform =
            typeof lqIkUrlOptions.transforms === 'string'
              ? lqIkUrlOptions.transforms
              : typeof lqProp === 'function'
              ? lqProp(width)
              : lqProp

          const lqUrl =
            !skipIk &&
            !!lqTransform &&
            getLqIkUrl(urlAtWidth, { fallbackUrl: urlSet.defaultUrl, transform: lqTransform, ...lqIkUrlOptions })

          const urlBuilt = `
            url(${lqUrl || urlAtDpi || urlSet.defaultUrl}) ${backgroundAttributes[i] || 'center/cover no-repeat'}${
            isLast ? ` ${backgroundColor}` : ','
          }
          `

          return urlBuilt
        })
      : backgroundColor
  }

  const backgroundMediaQueries = !!ignoreQueriesWithFixedWidth
    ? null
    : IMG_SET_SIZE_ENTRIES.map(([size, width]) => {
        const queryMethod = theme.mediaWidth?.[size as UpToSizeKey]
        if (!queryMethod) return null

        return queryMethod`background: ${getBackground(width)};`
      })

  return css`
    background: ${getBackground(ignoreQueriesWithFixedWidth)};
    ${backgroundMediaQueries}

    background-blend-mode: ${backgroundBlendMode};
  `
}

type BackgroundWithDPIProps = Partial<Omit<SetCssBackgroundParams, 'isLogo' | 'imageUrls'>> & {
  preset?: 'navbar' | 'header' | 'logo'
  modeColours?: [string, string]
}

export function setBestTextColour(
  bgColor: Color,
  threshold: ContrastCheckOptions['threshold'] = ['AA'],
  ignoreAlpha = false
) {
  return setBestContrastingColour(
    {
      bgColour: bgColor,
      fgColour: OFF_WHITE,
      darkColour: BLACK,
      lightColour: OFF_WHITE
    },
    { threshold, ignoreAlpha }
  )
}

export function setBackgroundWithDPI(
  theme: ThemeBaseRequired,
  logoUrlSet: GenericImageSrcSet<MediaWidths> | SetCssBackgroundParams['imageUrls'],
  auxOptions: BackgroundWithDPIProps = {}
) {
  const imageUrls = logoUrlSet && (Array.isArray(logoUrlSet) ? logoUrlSet : [logoUrlSet, logoUrlSet])
  const presetOptions = _getPresetOptions(auxOptions, theme.mode)
  const options = Object.assign({ imageUrls }, presetOptions, auxOptions)
  return css`
    ${setCssBackground(theme, options)}

    @media (min-resolution: 2x) {
      ${setCssBackground(theme, { ...options, dpiLevel: '2x' })}
    }

    @media (min-resolution: 3x) {
      ${setCssBackground(theme, { ...options, dpiLevel: '3x' })}}
    }
  `
}

function _getPresetOptions(
  options: BackgroundWithDPIProps,
  mode: ThemeModesRequired
): Partial<SetCssBackgroundParams> | undefined {
  const isLightMode = mode === 'LIGHT'
  switch (options.preset) {
    case 'header': {
      const [lmColour, dmColour] = options.modeColours || [OFF_WHITE, BLACK]
      return {
        backgroundColor: isLightMode ? lmColour : dmColour,
        backgroundAttributes: ['center / cover no-repeat', '5px / cover repeat'],
        backgroundBlendMode: 'difference',
        lqIkUrlOptions: { dpi: '3x', transforms: [null, 'pr-true,q-2,w-770,h-50'], ...options.lqIkUrlOptions }
      }
    }
    case 'navbar': {
      const [lmColour, dmColour] = options.modeColours || [BLACK, BLACK]
      return {
        backgroundColor: isLightMode ? lmColour : dmColour,
        backgroundAttributes: ['center / cover no-repeat', '5px / cover repeat'],
        backgroundBlendMode: 'difference',
        lqIkUrlOptions: { dpi: '3x', transforms: [null, 'pr-true,q-2,w-50,h-700'], ...options.lqIkUrlOptions }
      }
    }
    case 'logo':
      return {
        ...options,
        backgroundAttributes: ['center/cover repeat', 'center/cover repeat']
      }

    default: {
      const [lmColour, dmColour] = options.modeColours || [BLACK, BLACK]
      return {
        ...options,
        backgroundColor: isLightMode ? lmColour : dmColour
      }
    }
  }
}

export function isImageSrcSet(data?: any): data is GenericImageSrcSet<MediaWidths> {
  return Boolean(typeof data === 'object' && data?.defaultUrl)
}

export function isImageKitUrl(url?: any): url is ImageKitUrl {
  return Boolean(url?.match(/^(https:\/\/)?ik\.imagekit\.io/))
}

export function urlMapToFullSrcSet(urlMap: DDPXImageUrlMap): GenericImageSrcSet<MediaWidths> {
  return {
    defaultUrl: urlMap['1x'],
    500: urlMap,
    720: urlMap,
    960: urlMap,
    1280: urlMap,
    1440: urlMap
  }
}

export function urlToSimpleGenericImageSrcSet(url: string): GenericImageSrcSet<MediaWidths> {
  return {
    defaultUrl: url,
    500: { '1x': url },
    720: { '1x': url },
    960: { '1x': url },
    1280: { '1x': url },
    1440: { '1x': url }
  }
}

export function createImageSrcSet(
  uris: {
    [size in MediaWidths]: string
  } & { default: string }
): GenericImageSrcSet<MediaWidths> {
  return {
    defaultUrl: uris.default,
    500: { '1x': uris[500], '2x': uris[960], '3x': uris[1440] },
    720: { '1x': uris[720], '2x': uris[1440], '3x': uris.default },
    960: { '1x': uris[960], '2x': uris.default, '3x': uris.default },
    1280: { '1x': uris[1280], '2x': uris.default, '3x': uris.default },
    1440: { '1x': uris[1440], '2x': uris.default, '3x': uris.default }
  }
}

const setSizeParam = (size: number) => `w-${size}`
export function ikUrlToSimpleImageSrcSet(url: ImageKitUrl): GenericImageSrcSet<MediaWidths> {
  const [fUrl1x, fUrl2x, fUrl3x] = [new URL(url), new URL(url), new URL(url)]
  const pSearchParams = fUrl1x.searchParams.get('tr')

  const sizeUrlMap = Object.values(MEDIA_WIDTHS).reduce((acc, size) => {
    fUrl1x.searchParams.set('tr', pSearchParams ? `${pSearchParams},${setSizeParam(size)}` : setSizeParam(size))
    fUrl2x.searchParams.set('tr', pSearchParams ? `${pSearchParams},${setSizeParam(size * 2)}` : setSizeParam(size * 2))
    fUrl3x.searchParams.set('tr', pSearchParams ? `${pSearchParams},${setSizeParam(size * 3)}` : setSizeParam(size * 3))

    acc[size] = { '1x': fUrl1x.href, '2x': fUrl2x.href, '3x': fUrl3x.href }

    return acc
  }, {} as GenericImageSrcSet<MediaWidths>)

  sizeUrlMap.defaultUrl = url

  return sizeUrlMap
}

export function getProperBackgroundType(type?: BackgroundPropertyFull | null) {
  if (!type || type == 'unset' || type === 'none') return null

  const isSrcSet = isImageSrcSet(type)
  const isIkProp = !isSrcSet && isImageKitUrl(type)

  return isSrcSet ? type : isIkProp ? ikUrlToSimpleImageSrcSet(type) : urlToSimpleGenericImageSrcSet(type)
}

export function setBackgroundOrDefault(
  theme: DefaultTheme,
  {
    bgValue,
    defaultValue
  }: {
    bgValue?: BackgroundPropertyFull | null
    defaultValue: string
  },
  auxOptions: BackgroundWithDPIProps = {}
) {
  const value = getProperBackgroundType(bgValue)
  return value ? setBackgroundWithDPI(theme, [value], auxOptions) : `background: ${defaultValue};`
}

export const getThemeColourByKeyCurried =
  <T extends ThemeByModes>(theme: T) =>
  <F>(mode: keyof T['modes'] | 'DEFAULT', key: keyof T['modes']['DEFAULT'], fallback?: F) => {
    const baseMode = theme.modes as T['modes']

    // try passed mode else go with DEFAULT
    return baseMode?.[mode]?.[key] || (baseMode['DEFAULT'] as T['modes']['DEFAULT'])?.[key] || fallback
  }

export const getThemeColoursCurried =
  <T extends ThemeByModes>(theme: T) =>
  (mode: keyof T['modes'] | 'DEFAULT') =>
    (theme.modes as T['modes'])?.[mode]

// re-exported polished utils
export { transparentize, darken as darkenColor, lighten as lightenColor }
