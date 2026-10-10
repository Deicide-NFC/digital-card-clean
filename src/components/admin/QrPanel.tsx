"use client";

import QRCode from "qrcode";
import { Download, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { fileSafeName } from "@/lib/utils";

const DARK = "#0B1220";

/** Small QR image (SVG) for lists. */
export function QrThumb({ url, size = 96 }: { url: string; size?: number }) {
  const [svg, setSvg] = useState("");
  useEffect(() => {
    QRCode.toString(url, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: DARK, light: "#ffffff" } })
      .then(setSvg)
      .catch(() => setSvg(""));
  }, [url]);
  return (
    <div
      role="img"
      aria-label={`QR code for ${url}`}
      className="shrink-0 overflow-hidden rounded-lg border border-line bg-white [&>svg]:h-full [&>svg]:w-full"
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

function download(href: string, filename: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** Printable QR sheet with download buttons. The QR encodes the exact NFC profile URL. */
export function QrPanel({ url, name }: { url: string; name: string }) {
  const [svg, setSvg] = useState("");
  const base = fileSafeName(name);

  useEffect(() => {
    QRCode.toString(url, { type: "svg", margin: 2, errorCorrectionLevel: "M", color: { dark: DARK, light: "#ffffff" } })
      .then(setSvg)
      .catch(() => setSvg(""));
  }, [url]);

  async function savePng() {
    const dataUrl = await QRCode.toDataURL(url, {
      width: 1200,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: DARK, light: "#ffffff" },
    });
    download(dataUrl, `${base}-qr.png`);
  }

  function saveSvg() {
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const href = URL.createObjectURL(blob);
    download(href, `${base}-qr.svg`);
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  }

  return (
    <div>
      <div className="no-print mb-5 flex flex-wrap gap-2">
        <button onClick={savePng} className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-dark">
          <Download className="h-4 w-4" /> Download PNG
        </button>
        <button onClick={saveSvg} disabled={!svg} className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-bold hover:bg-mist disabled:opacity-50">
          <Download className="h-4 w-4" /> Download SVG
        </button>
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-bold hover:bg-mist">
          <Printer className="h-4 w-4" /> Print
        </button>
      </div>

      {/* The printable sheet */}
      <div className="mx-auto w-full max-w-sm rounded-3xl border border-line bg-white p-8 text-center print:max-w-none print:border-0 print:p-0">
        <h2 className="font-display text-2xl font-bold text-ink">{name}</h2>
        <p className="mt-1 text-base font-medium text-slate-600">Tap or Scan to Connect</p>
        <div
          role="img"
          aria-label={`QR code for ${url}`}
          className="mx-auto mt-6 aspect-square w-full max-w-[280px] [&>svg]:h-full [&>svg]:w-full"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <p className="mt-5 break-all text-sm font-semibold text-ink">{url.replace(/^https?:\/\//, "")}</p>
      </div>
    </div>
  );
}
