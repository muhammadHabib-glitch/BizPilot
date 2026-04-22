import * as React from "react";
import { cn } from "@/lib/utils";

function Avatar({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  src,
  alt,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      className={cn("aspect-square h-full w-full object-cover", className)}
      src={src}
      alt={alt}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600",
        className
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
