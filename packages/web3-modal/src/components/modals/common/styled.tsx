import { Button, CloseIcon, ColumnCenter, Modal, Text } from '@past3lle/components'
import { setBackgroundOrDefault, setBestTextColour, upToExtraSmall, upToSmall } from '@past3lle/theme'
import styled from 'styled-components'

import { RequiredPstlSubModalsTheme } from '../../../theme'
import { PstlWeb3ConnectionModalProps } from '../ConnectionModal'
import { RecommendedLabelWrapper } from '../ConnectionModal/RecommendedLabel'

const ERROR_CONTAINER_HEIGHT_PX = 120

type ButtonThemeTypes<ST extends keyof RequiredPstlSubModalsTheme = keyof RequiredPstlSubModalsTheme> = {
  modal: ST
  node: keyof RequiredPstlSubModalsTheme[ST]['button']
}
export const ModalButton = styled(Button)<ButtonThemeTypes & { connected: boolean }>`
  position: relative;
  width: 100%;
  justify-content: flex-start;
  height: 82px;
  ${(props) =>
    setBackgroundOrDefault(props.theme, {
      bgValue: props.theme.modals?.[props.modal]?.button?.[props.node]?.background?.url,
      defaultValue: props.theme.modals?.[props.modal]?.button?.[props.node]?.background?.default as string
    })};

  border: ${(props) => props.theme.modals?.[props.modal]?.button?.[props.node]?.border?.border};
  border-color: ${(props) => props.theme.modals?.[props.modal]?.button?.[props.node]?.border?.color};

  font-size: ${(props) => props.theme.modals?.[props.modal]?.button?.[props.node]?.font?.size};
  font-style: ${(props) => props.theme.modals?.[props.modal]?.button?.[props.node]?.font?.style};
  font-variation-settings: ${(props) =>
    `'wght' ${props.theme.modals?.[props.modal]?.button?.[props.node]?.font?.weight}`};
  color: ${({ theme: { modals }, modal, node }) =>
    modals?.[modal]?.button?.[node]?.font?.color ||
    setBestTextColour(modals?.[modal]?.button?.[node]?.background?.default || '#000', 7)};

  letter-spacing: ${(props) => props.theme.modals?.[props.modal]?.button?.[props.node]?.font?.letterSpacing};
  text-shadow: ${(props) => props.theme.modals?.[props.modal]?.button?.[props.node]?.font?.textShadow};
  text-transform: ${(props) => props.theme.modals?.[props.modal]?.button?.[props.node]?.font?.textTransform};

  gap: 10px;

  &:hover {
    ${({ theme, modal, node }) =>
      !!theme?.modals?.[modal]?.button?.[node]?.hoverAnimations &&
      `
    background: ${theme.modals?.[modal]?.button?.[node]?.background?.default};
    filter: ${theme.modals?.[modal]?.button?.[node]?.filter};
    transform: scale(0.95);
  `}
  }

  ${({ connected, theme: { modals }, modal, node }) =>
    connected &&
    `
      background: ${modals?.[modal]?.button?.[node]?.background?.default};
      filter: ${modals?.[modal]?.button?.[node]?.filter};
      transform: scale(0.95);
  `}

  > img {
    border-radius: 50%;
  }

  transition: transform 0.3s ease-in-out, filter 0.3s ease-in-out, background 0.6s ease-in-out;
`
type TextThemeTypes<ST extends keyof RequiredPstlSubModalsTheme = keyof RequiredPstlSubModalsTheme> = {
  modal: ST
  node: keyof RequiredPstlSubModalsTheme[ST]['text']
}
export const ModalText = styled(Text.Main)<{ fontWeight?: number; gap?: string } & TextThemeTypes>`
  color: ${(props) => props.theme?.modals?.[props.modal]?.text?.[props.node]?.color};
  font-family: ${(props) => props.theme?.modals?.[props.modal]?.text?.[props.node]?.family};
  font-size: ${(props) => props.theme?.modals?.[props.modal]?.text?.[props.node]?.size};
  font-style: ${(props) => props.theme?.modals?.[props.modal]?.text?.[props.node]?.style};
  font-weight: ${({ theme, modal, node, fontWeight }) => fontWeight || theme?.modals?.[modal]?.text?.[node]?.weight};
  font-variation-settings: 'wght'
    ${({ theme, modal, node, fontWeight }) => fontWeight || theme?.modals?.[modal]?.text?.[node]?.weight};
  letter-spacing: ${(props) => props.theme?.modals?.[props.modal]?.text?.[props.node]?.letterSpacing};
  line-height: ${(props) => props.theme?.modals?.[props.modal]?.text?.[props.node]?.lineHeight};
  text-align: ${(props) => props.theme?.modals?.[props.modal]?.text?.[props.node]?.textAlign};
  text-shadow: ${(props) => props.theme?.modals?.[props.modal]?.text?.[props.node]?.textShadow};
  text-transform: ${(props) => props.theme?.modals?.[props.modal]?.text?.[props.node]?.textTransform};

  gap: ${({ gap = '0' }) => gap};
`

export const ModalTitleText = styled(Text.Main).attrs((props) => ({
  fontWeight: props.theme.modals?.base?.title?.font?.weight
}))`
  font-size: ${({ theme, fontSize = theme?.modals?.base?.title?.font?.size }) => fontSize as string};
  font-style: ${({ theme }) => theme?.modals?.base?.title?.font?.style};
  font-weight: ${({ theme }) => theme?.modals?.base?.title?.font?.weight};
  color: ${({ theme }) => theme?.modals?.base?.title?.font?.color};
  letter-spacing: ${({ theme }) => theme?.modals?.base?.title?.font?.letterSpacing};
  line-height: ${({ theme }) => theme?.modals?.base?.title?.font?.lineHeight};
`

export const ModalTitle = styled(ModalTitleText)`
  &&&&& {
    text-align: ${({ theme }) => theme.modals?.base?.title?.font?.textAlign};
    flex: 1;

    margin: ${({ theme }) => theme?.modals?.base?.title?.margin};

    ${({ theme }) => upToSmall`
      text-align: left;
      font-size: calc(${theme?.modals?.base?.title?.font?.size} * 0.85);
    `}

    ${({ theme }) => upToExtraSmall`
      font-size: calc(${theme?.modals?.base?.title?.font?.size} * 0.8);
    `}
  }
`
export type ContainerThemeTypes = {
  modal: keyof RequiredPstlSubModalsTheme
  node: keyof RequiredPstlSubModalsTheme[keyof RequiredPstlSubModalsTheme]['container']
}
export const ModalContainer = styled(ColumnCenter)<ContainerThemeTypes>`
  filter: ${({ theme, modal }) => theme.modals?.[modal]?.filter};
  padding: ${({ theme }) => theme.modals?.base?.padding};

  font-size: ${({ theme, modal }) => theme.modals?.[modal]?.font?.size};
  font-style: ${({ theme, modal }) => theme.modals?.[modal]?.font?.style};
  font-weight: ${({ theme, modal }) => theme.modals?.[modal]?.font?.weight};
  font-family: ${({ theme, modal }) => theme.modals?.[modal]?.font?.family};

  background: ${({ theme, modal, node }) => theme.modals?.[modal]?.container?.[node]?.background};
  border-radius: ${({ theme, modal, node }) => theme.modals?.[modal]?.container?.[node]?.border?.radius};

  &::-webkit-scrollbar,
  *::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;

  overflow-y: auto;

  ${upToExtraSmall`
    padding: 0;
  `}
`

export const InnerContainer = styled(ModalContainer).attrs(
  (props: ReturnType<typeof ModalContainer> & ContainerThemeTypes) => ({
    ...props,
    node: props.node || 'main'
  })
)<{ isError?: boolean }>`
  overflow-x: hidden;

  ${CloseIcon}, svg#back-arrow {
    cursor: pointer;
    color: ${({ theme }) => theme?.modals?.base?.title?.font?.color};
    flex: 0 1 ${({ theme }) => (theme?.modals?.base?.closeIcon?.size as number) - 5}px;
  }

  ${CloseIcon} {
    padding: 5px;
    border-radius: 50%;
    background-color: ${(props) => props.theme?.modals?.base?.closeIcon?.background};

    height: ${({ theme }) => (theme?.modals?.base?.closeIcon?.size as number) - 5}px;
  }

  ${upToExtraSmall`
    padding: 1rem 0.5rem 0.2rem;
  `}

  ${({ theme, modal }) =>
    setBackgroundOrDefault(theme, {
      bgValue: theme?.modals?.[modal]?.background?.url,
      defaultValue: theme?.modals?.[modal]?.background?.main as string
    })};
`
export const ErrorMessageContainer = styled(InnerContainer).attrs({ modal: 'base', node: 'main' })<{ hide: boolean }>`
  font-size: ${(props) => Math.floor((props.theme?.modals?.[props.modal]?.baseFontSize || 18) * 0.75)}px;
  opacity: ${({ hide }) => (hide ? 0 : 1)};

  z-index: ${({ hide }) => (hide ? 0 : 9999)};

  overflow: auto;
  align-items: start;
  height: ${ERROR_CONTAINER_HEIGHT_PX}px;
  padding: 1rem 2rem;
  border-radius: 0 0 0.4rem 0.4rem;
  border-left: 0.5rem solid indianred;
  background: ${(props) => props.theme.modals?.base?.error?.background};
  position: absolute;
  bottom: 0;

  > ${ModalText} {
    font-family: monospace;
    color: ghostwhite;
    font-style: normal;

    &#error-message {
      font-size: 1.1em;
    }
  }

  > ${ModalText}#error-close-icon {
    position: absolute;
    color: ${(props) => setBestTextColour(props.theme.modals?.base?.error?.background || '#580101', 7)};
    cursor: pointer;
    top: 16px;
    right: 18px;
  }

  transition: opacity 0.5s ease-in-out;
`

export const StyledConnectionModal = styled(Modal)<{ modal: keyof RequiredPstlSubModalsTheme; baseFontSize?: string }>`
  div {
    &[data-reach-dialog-content] {
      position: relative;
      font-size: ${(props) => props.theme.modals?.[props.modal]?.baseFontSize}px;
      ${(props) => upToExtraSmall`
          min-height: ${props?.minHeight || '75%'};
          max-height: ${props?.maxHeight || '550px'};
          max-width: unset;
          width: 100%;
          margin: auto 0 0;
          
          > ${InnerContainer}{
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
            
              > ${ErrorMessageContainer} {
              border-radius: 0.4rem 0.4rem 0 0;
            }
          }                       
      `}
    }
  }
`

/* 
${(props) => upToSmall`
  font-size: calc(${props.theme.modals?.[props.modal]?.baseFontSize || 0}px * 0.85);
`}

${(props) => upToExtraSmall`
  font-size: calc(${props.theme.modals?.[props.modal]?.baseFontSize || 0}px * 0.75);
`}
*/

export const WalletsWrapper = styled.div.attrs(
  (
    props: ContainerThemeTypes & {
      isError?: boolean
      width?: string
      view?: PstlWeb3ConnectionModalProps['walletsView']
    }
  ) => ({
    ...props,
    node: props.node || 'main'
  })
)<
  ContainerThemeTypes & {
    isError?: boolean
    width?: string
    view?: PstlWeb3ConnectionModalProps['walletsView']
  }
>`
  display: grid;
  gap: 10px;

  width: ${({ width = '100%' }) => width};
  padding: 0 1rem;
  overflow-y: auto;

  z-index: 1;

  ${({ isError }) =>
    isError &&
    `
    z-index: 0;
    overflow-y: hidden;
  `}

  ${upToExtraSmall`
    grid-template-columns: 1fr;
  `}

  // Container
  > div {
    height: auto;
    > ${ModalButton} {
      height: ${({ theme: { modals }, modal, node }) => modals?.[modal]?.button?.[node]?.height};
      > img,
      > svg {
        height: ${({ theme }) => theme.modals?.connection?.button?.main?.icons?.height};
        max-height: 62%;

        ${upToExtraSmall`
          max-height: 100%;
        `}
      }
    }
  }

  ${({ view }) =>
    view === 'list' &&
    `
      > div > ${ModalButton} {
        padding: 1rem;

        > div {
         justify-content: center;
         text-align: center;
        }
        > img, 
        > svg {
          height: 100%;
          max-height: 100%;
        }
      }
  `}

  ${({ view }) =>
    view === 'grid' &&
    `
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 1rem;
    justify-content: center;
    padding: 1rem;

    > div {
      > ${ModalButton} {
        flex-flow: column;
        padding: 5px;
        justify-content: center;
        font-size: 82%;
        
        > ${RecommendedLabelWrapper} {
          position: absolute;
          bottom: 0.5rem;
          height: min-content;
          right: 0.5rem;
        }
      }
    }
  `}

  ${({ view }) =>
    view === 'grid' &&
    upToSmall`
      > div {
        > ${ModalButton} {
          > ${RecommendedLabelWrapper} {
            display: none;
          }
        }
      }
  `}

  ${({ view }) =>
    view === 'list' &&
    upToExtraSmall`
      > div > ${ModalButton} {
        padding: 1rem;
        gap: 1.2rem;
        > div {
          justify-content: flex-start;
          text-align: center; 
        }
      }
  `}
`
