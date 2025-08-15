import React from 'react'
import { cn } from "../../lib/utils"

interface ChartProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const Chart = React.forwardRef<HTMLDivElement, ChartProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("w-full h-64", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Chart.displayName = "Chart"

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  config?: ChartConfig
}

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ className, children, config, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("w-full h-[180px] sm:h-[220px] md:h-[280px]", className)}
        style={{
          "--color-savings": config?.savings?.color || "#8884d8",
          "--color-income": config?.income?.color || "#82ca9d", 
          "--color-expenses": config?.expenses?.color || "#ffc658"
        } as React.CSSProperties}
        {...props}
      >
        {children}
      </div>
    )
  }
)
ChartContainer.displayName = "ChartContainer"

interface ChartTooltipProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'content'> {
  active?: boolean
  payload?: unknown[]
  label?: string
  labelKey?: string
  nameKey?: string
  hideLabel?: boolean
  hideIndicator?: boolean
  indicator?: "line" | "dot" | "dashed"
  labelFormatter?: (value: unknown, payload: unknown[]) => React.ReactNode
  formatter?: (value: unknown, name: unknown, props: unknown) => React.ReactNode
  content?: React.ComponentType<unknown> | React.ReactElement
}

const ChartTooltip = React.forwardRef<HTMLDivElement, ChartTooltipProps>(
  ({ className, content, ...props }, ref) => {
    if (content && React.isValidElement(content)) {
      return content;
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border bg-background p-2 shadow-md",
          className
        )}
        {...props}
      />
    )
  }
)
ChartTooltip.displayName = "ChartTooltip"

interface ChartTooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  hideLabel?: boolean
  hideIndicator?: boolean
  indicator?: "line" | "dot" | "dashed"
  labelFormatter?: (value: unknown, payload: unknown[]) => React.ReactNode
  formatter?: (value: unknown, name: unknown, props: unknown) => React.ReactNode
}

const ChartTooltipContent = React.forwardRef<HTMLDivElement, ChartTooltipContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("grid gap-2 rounded-lg border bg-background p-2 shadow-md", className)}
        {...props}
      />
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltipContent"

// Chart configuration type
type ChartConfig = {
  [key: string]: {
    label: string
    color?: string
  }
}

export { 
  Chart, 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  type ChartConfig 
}