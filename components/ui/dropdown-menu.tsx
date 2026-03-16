// components/ui/dropdown-menu.tsx
"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { Check, ChevronRight, Circle, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

const DropdownMenu = DropdownMenuPrimitive.Root

const DropdownMenuTrigger = React.forwardRef((props: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Trigger>, ref: React.ForwardedRef<HTMLButtonElement>) => (
  <DropdownMenuPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-medium",
      "data-[state=open]:bg-discord-accent data-[state=closed]:bg-[#2b2d31] text-foreground",
      "data-[state=open]:text-white data-[state=closed]:text-muted",
      props.className
    )}
    {...props}
  />
))
DropdownMenuTrigger.displayName = DropdownMenuPrimitive.Trigger.displayName

const DropdownMenuContent = React.forwardRef((props: Omit<React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>, "sideOffset"> & { sideOffset?: number }, ref: React.ForwardedRef<HTMLDivElement>) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={props.sideOffset ?? 4}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border border-[#1e1f22] bg-[#2b2d31] p-1 text-muted-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 data-[state=open]:slide-in-from-top-2 data-[state=closed]:slide-in-from-left-1 data-[state=closed]:slide-in-from-right-1 data-[state=closed]:slide-in-from-bottom-2",
        props.className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

const DropdownMenuItem = React.forwardRef((props: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>, ref: React.ForwardedRef<HTMLDivElement>) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none focus:bg-discord-accent/10 focus:text-white data-[disabled]:pointer-events-none data-[highlighted]:bg-discord-accent/50",
      "data-[disabled]:opacity-50",
      props.className
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

const DropdownMenuLabel = React.forwardRef((props: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>, ref: React.ForwardedRef<HTMLDivElement>) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", props.className)}
    {...props}
  />
))
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

const DropdownMenuSeparator = React.forwardRef((props: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>, ref: React.ForwardedRef<HTMLDivElement>) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-[#1e1f22]", props.className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

const DropdownMenuShortcut = ({
  className, ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span className={cn("ml-auto text-xs tracking-widest text-discord-muted", className)} {...props}>
      {props.children}
    </span>
  )
}

const DropdownMenuCheckboxItem = React.forwardRef((props: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>, ref: React.ForwardedRef<HTMLDivElement>) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-discord-accent/10 focus:text-white data-[disabled]:pointer-events-none data-[checked]:bg-discord-accent/50",
      props.className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {props.children}
  </DropdownMenuPrimitive.CheckboxItem>
))
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuPrimitive
}
