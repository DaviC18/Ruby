import Image from "next/image";

export function Wordmark() {
  return (
    <span className="flex items-center gap-2.5 text-sidebar-foreground">
      <Image
        src="/ruby-mark.png"
        alt=""
        width={56}
        height={96}
        priority
        className="h-7 w-auto"
      />
      <span className="text-lg font-semibold tracking-tight">Ruby</span>
    </span>
  );
}
