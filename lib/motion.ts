export const ease = {
  out: [0.22, 1, 0.36, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
  in: [0.64, 0, 0.78, 0] as const,
  expoOut: [0.16, 1, 0.3, 1] as const,
}

export const duration = {
  fast: 0.2,
  base: 0.4,
  slow: 0.6,
  page: 0.8,
  loader: 1.2,
}

export const transition = {
  fast: { duration: duration.fast, ease: ease.out },
  base: { duration: duration.base, ease: ease.out },
  slow: { duration: duration.slow, ease: ease.out },
  page: { duration: duration.page, ease: ease.inOut },
  expo: { duration: duration.slow, ease: ease.expoOut },
}
