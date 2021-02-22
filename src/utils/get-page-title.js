import defaultSettings from '@/settings'

const { title } = defaultSettings

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}
