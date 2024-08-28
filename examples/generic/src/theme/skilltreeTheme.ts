import { createCustomTheme } from '@past3lle/theme'

import BG_LOGO from '../assets/back-logo.png'
import BG from '../assets/background.png'

enum Rarity {
  EMPTY = 'empty',
  COMMON = 'common',
  RARE = 'rare',
  LEGENDARY = 'legendary',
  EPIC = 'epic'
}

const SKILLTREE_WIDGET_THEME = {
  modes: {
    DEFAULT: {
      assetsMap: {
        logos: {
          companyMain: BG_LOGO
        },
        images: {
          appBackground: BG,
          skillpointHighlight: 'string'
        },
        icons: {
          locked: 'string',
          connection: 'string',
          inventory: 'string',
          shop: 'string',
          chains: {
            disconnected: 'disconnected-logo',
            11155111: 'SEPOLIA-logo',
            137: 'POLYGON-logo',
            80002: 'POLYGON_MUMBAI-logo'
          },
          rarity: {
            empty: 'empty',
            common: 'common',
            rare: 'rare',
            legendary: 'lej',
            epic: 'epic'
          }
        }
      },
      mainText: 'red',
      darkText: 'red',
      lightText: 'red',
      mainBg: 'springgreen',
      mainBgDarker: 'red',
      mainBgAlt: 'red',
      mainFg: 'red',
      mainFgAlt: 'red',

      button: {
        mainBg: 'red',
        mainBgLight: 'red',
        altBg: 'red',
        altBgLight: 'red',
        hoverColour: 'red'
      },
      fontSize: {
        small: '1rem',
        normal: '2rem',
        large: '3rem'
      },
      // rarity colours
      rarity: {
        [Rarity.EMPTY]: {
          backgroundColor: 'red',
          boxShadowColor: 'red'
        },
        [Rarity.COMMON]: {
          backgroundColor: 'red',
          boxShadowColor: 'red'
        },
        [Rarity.RARE]: {
          backgroundColor: 'red',
          boxShadowColor: 'red'
        },
        [Rarity.LEGENDARY]: {
          backgroundColor: 'red',
          boxShadowColor: 'red'
        },
        [Rarity.EPIC]: {
          backgroundColor: 'red',
          boxShadowColor: 'red'
        }
      },
      gradients: {
        lockedSkill: 'red',
        unlockedSkill: 'red',
        ownedSkill: 'red'
      }
    },
    LIGHT: {
      mainText: 'cornflowerblue',
      darkText: 'cornflowerblue',
      lightText: 'cornflowerblue',
      mainBg: 'cornflowerblue',
      mainBgDarker: 'cornflowerblue',
      mainBgAlt: 'cornflowerblue',
      mainFg: 'cornflowerblue',
      mainFgAlt: 'cornflowerblue'
    },
    DARK: {
      mainText: 'darkgreen',
      darkText: 'darkgreen',
      lightText: 'darkgreen',
      mainBg: 'darkgreen',
      mainBgDarker: 'darkgreen',
      mainBgAlt: 'darkgreen',
      mainFg: 'darkgreen',
      mainFgAlt: 'darkgreen'
    }
  }
} as const

export const skilltreeThemeCustom = createCustomTheme(SKILLTREE_WIDGET_THEME)
