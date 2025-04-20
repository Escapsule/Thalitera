"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

type CustomToasterProps = ToasterProps & {
  isConfirmation?: boolean;
}

const Toaster = ({ isConfirmation = false, ...props }: CustomToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className={`toaster group ${isConfirmation ? 'confirmation-toast' : ''}`}
      position={isConfirmation ? "center" : props.position || "top-right"}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      closeButton={isConfirmation}
      duration={isConfirmation ? 100000 : props.duration}
      {...props}
    />
  )
}

export { Toaster }
export type { CustomToasterProps }
