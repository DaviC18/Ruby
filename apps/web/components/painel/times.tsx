import { Fragment } from "react";

// Every clock time in the panel is set in Chivo Mono tabular figures.
export function WithMonoTimes({ text }: { text: string }) {
  return text.split(/(\d{1,2}:\d{2})/).map((part, i) =>
    i % 2 ? (
      // biome-ignore lint/suspicious/noArrayIndexKey: static split of a fixed string
      <span key={i} className="font-mono tabular-nums">
        {part}
      </span>
    ) : (
      // biome-ignore lint/suspicious/noArrayIndexKey: static split of a fixed string
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}
