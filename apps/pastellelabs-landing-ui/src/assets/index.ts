import COMPANY_LOGO from 'assets/png/back-logo.png'
import APP_BACKGROUND from 'assets/png/background.png'
import ETHEREUM_LOGO from 'assets/png/chains/ethereumChainLogo.webp'
import POLYGON_LOGO from 'assets/png/chains/polygonChainLogo.png'
import HEADER_BACKGROUND from 'assets/png/header_bg.png'
import COMMON_RARITY_ICON from 'assets/png/icons/icons8-diamonds-common-64.png'
import EPIC_RARITY_ICON from 'assets/png/icons/icons8-diamonds-epic-64.png'
import LEGENDARY_RARITY_ICON from 'assets/png/icons/icons8-diamonds-legendary-64.png'
import RARE_RARITY_ICON from 'assets/png/icons/icons8-diamonds-rare-64.png'
import CONNECTION_ICON from 'assets/png/icons/icons8-internet-50.png'
import LOCK_ICON from 'assets/png/icons/icons8-lock-64.png'
import INVENTORY_ICON from 'assets/png/icons/icons8-treasure-chest-90-green.png'
import SHOP_ICON from 'assets/png/icons/pixelated-shirt.png'
import ACCOUNT_BACKGROUND from 'assets/png/spray-account.png'
import HIGHLIGHT from 'assets/png/spray.png'

export const ASSETS_MAP = {
  logos: {
    company: { full: COMPANY_LOGO }
  },
  images: {
    background: {
      app: APP_BACKGROUND,
      header: {
        background: HEADER_BACKGROUND,
        account: ACCOUNT_BACKGROUND
      }
    },
    skills: {
      skillpoint: {
        highlight: HIGHLIGHT
      }
    }
  },
  icons: {
    locked: LOCK_ICON,
    connection: CONNECTION_ICON,
    inventory: INVENTORY_ICON,
    shop: SHOP_ICON,
    chains: {
      disconnected: CONNECTION_ICON,
      11155111: ETHEREUM_LOGO,
      137: POLYGON_LOGO,
      80002: POLYGON_LOGO
    },
    rarity: {
      empty: '',
      common: COMMON_RARITY_ICON,
      rare: RARE_RARITY_ICON,
      legendary: LEGENDARY_RARITY_ICON,
      epic: EPIC_RARITY_ICON
    }
  }
}
