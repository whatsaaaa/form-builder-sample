import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'default'
  wide?: boolean
}

export function Button({ variant = 'default', wide, ...props }: ButtonProps) {
  const classes = [
    'button',
    variant === 'primary' && 'button--primary',
    wide && 'button--wide',
  ].filter(Boolean)
  return <button type="button" {...props} className={classes.join(' ')} />
}
