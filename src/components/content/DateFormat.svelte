<script lang="ts">
  type Fmt = "datetime" | "date" | "time" | "relative" | "iso";
  type Style = "full" | "long" | "medium" | "short";
  import { _t } from "$lib";
  let {
    stamp, // string | number | Date
    format = "datetime" as Fmt,
    locale = undefined as string | string[] | undefined,
    timeZone = undefined as string | undefined,
    dateStyle = "medium" as Style,
    timeStyle = "short" as Style,
    class: className = "",
    customOptions = undefined as Intl.DateTimeFormatOptions | undefined,
  } = $props<{
    class?: string;
    stamp: string | number | Date;
    format?: Fmt;
    locale?: string | string[];
    timeZone?: string;
    dateStyle?: Style;
    timeStyle?: Style;
    customOptions?: Intl.DateTimeFormatOptions;
  }>();

  function parseStamp(x: string | number | Date): Date | null {
    if (x instanceof Date) return isNaN(x.getTime()) ? null : x;
    const s = String(x).trim();

    // unix millis
    if (/^\d{13}$/.test(s)) return new Date(Number(s));
    // unix seconds
    if (/^\d{10}$/.test(s)) return new Date(Number(s) * 1000);

    // try native parse
    let d = new Date(s);
    if (!isNaN(d.getTime())) return d;

    // common "YYYY-MM-DD HH:mm:ss" → ISO-ish
    const isoGuess = s.replace(" ", "T");
    d = new Date(isoGuess);
    return isNaN(d.getTime()) ? null : d;
  }

  function formatRelative(target: Date, base = new Date()): string {
    const diffMs = target.getTime() - base.getTime();
    const abs = Math.abs(diffMs);
    const rtf = new Intl.RelativeTimeFormat(locale ?? undefined, {
      numeric: "auto",
    });

    const table: [Intl.RelativeTimeFormatUnit, number][] = [
      ["year", 365 * 24 * 60 * 60 * 1000],
      ["month", 30 * 24 * 60 * 60 * 1000],
      ["week", 7 * 24 * 60 * 60 * 1000],
      ["day", 24 * 60 * 60 * 1000],
      ["hour", 60 * 60 * 1000],
      ["minute", 60 * 1000],
      ["second", 1000],
    ];
    for (const [unit, ms] of table) {
      if (abs >= ms || unit === "second") {
        const value = Math.round(diffMs / ms);
        return rtf.format(value, unit);
      }
    }
    return "";
  }

  const dateObj = $derived(parseStamp(stamp));
  const human = $derived(() => {
    if (!dateObj) return "";
    if (format === "iso") return dateObj.toISOString();
    if (format === "relative") return formatRelative(dateObj);

    const opts: Intl.DateTimeFormatOptions =
      customOptions ??
      (format === "date"
        ? { dateStyle, timeZone }
        : format === "time"
          ? { timeStyle, timeZone }
          : { dateStyle, timeStyle, timeZone });

    return new Intl.DateTimeFormat(locale ?? undefined, opts).format(dateObj);
  });
</script>

{#if dateObj}
  <time
    class={className}
    datetime={dateObj.toISOString()}
    title={dateObj.toString()}
  >
    {human()}
  </time>
{:else}
  <span data-invalid-date>{$_t("Invalid date")}</span>
{/if}
