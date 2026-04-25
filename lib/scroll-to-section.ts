type ScrollToSectionOptions = {
  offset?: number
}

export function scrollToSection(
  targetId: string,
  options: ScrollToSectionOptions = {}
) {
  if (typeof document === 'undefined') {
    return false
  }

  const normalizedId = targetId.replace(/^#/, '')
  const target = document.getElementById(normalizedId)

  if (!(target instanceof HTMLElement)) {
    return false
  }

  if (typeof options.offset === 'number') {
    const top = Math.max(
      0,
      target.getBoundingClientRect().top + window.scrollY - options.offset
    )

    window.scrollTo({
      top,
      behavior: 'smooth',
    })
  } else {
    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    })
  }

  return true
}
