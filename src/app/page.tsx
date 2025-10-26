"use client";
import { useState, JSX } from "react";

type Mode = "flat" | "triangle";

export default function Page(): JSX.Element {
  const [mode, setMode] = useState<Mode>("flat");
  const [railLength, setRailLength] = useState(150);
  const [balusterWidth, setBalusterWidth] = useState(1.2);
  const [spacing, setSpacing] = useState(9);

  // Triangle inputs
  const [triangleBase, setTriangleBase] = useState(150);
  const [triangleHeight, setTriangleHeight] = useState(80);
  const [triangleAngleDeg, setTriangleAngleDeg] = useState<number>(0); // degrees; if >0 it overrides triangleHeight

  // ---------- Derived triangle height (angle overrides manual height) ----------
  const triangleAngleRad = (triangleAngleDeg * Math.PI) / 180;
  const triangleHeightUsed = triangleAngleDeg > 0 ? triangleBase * Math.tan(triangleAngleRad) : triangleHeight;

  // ---------- Flat Rail Calculations ----------
  const calcFlat = () => {
    const count = Math.floor((railLength + spacing) / (balusterWidth + spacing));
    const usedLength = count * balusterWidth + Math.max(0, count - 1) * spacing;
    const remaining = Math.max(0, railLength - usedLength);
    return { count, usedLength, remaining };
  };

  // ---------- Triangle Stair Calculations ----------
  const calcTriangle = () => {
    const count = Math.floor((triangleBase + spacing) / (balusterWidth + spacing));
    const results = [] as { index: number; x: number; height: number }[];
    for (let i = 0; i < count; i++) {
      const x = i * (balusterWidth + spacing);
      const height = (triangleHeightUsed / triangleBase) * x;
      results.push({ index: i + 1, x, height });
    }
    return { count, results };
  };

  const flat = calcFlat();
  const triangle = calcTriangle();

  // ---------- Visual Preview Settings (dynamic scaling for triangle) ----------
  // preview pixel constraints
  const previewMaxWidth = 760; // px
  const previewMaxHeightFlat = 80; // px (flat preview height)
  const previewMaxHeightTriangle = 120; // px (triangle preview height)

  // pxPerCm for flat: keep a reasonable max scale so small rails are visible
  const pxPerCmFlat = Math.min(3, previewMaxWidth / Math.max(railLength, 1));

  // pxPerCm for triangle: scale so both base and height fit the preview box
  const pxPerCmTriangle = Math.min(previewMaxWidth / Math.max(triangleBase, 1), previewMaxHeightTriangle / Math.max(triangleHeightUsed, 1));

  const pxPerCm = mode === "flat" ? pxPerCmFlat : pxPerCmTriangle;

  const widthPx = Math.round((mode === "flat" ? railLength : triangleBase) * pxPerCm);
  const balusterPx = Math.max(1, Math.round(balusterWidth * pxPerCm));
  const spacingPx = Math.round(spacing * pxPerCm);

  const positions: number[] = [];

  if (mode === "flat") {
    const totalWidthPx = flat.count * balusterPx + Math.max(0, flat.count - 1) * spacingPx;
    const endGapPx = Math.max(0, (widthPx - totalWidthPx) / 2);
    for (let i = 0; i < flat.count; i++) {
      positions.push(endGapPx + i * (balusterPx + spacingPx));
    }
  } else {
    const totalWidthPx = triangle.count * balusterPx + Math.max(0, triangle.count - 1) * spacingPx;
    const endGapPx = Math.max(0, (widthPx - totalWidthPx) / 2);
    for (let i = 0; i < triangle.count; i++) {
      positions.push(endGapPx + i * (balusterPx + spacingPx));
    }
  }

  // triangle visual helpers
  const hypotenusePx = Math.sqrt(triangleBase * triangleBase + triangleHeightUsed * triangleHeightUsed) * pxPerCm;
  const slopeAngleRad = Math.atan2(triangleHeightUsed, triangleBase);
  const slopeAngleDeg = (slopeAngleRad * 180) / Math.PI;

  return (
    <main className="min-h-screen flex justify-center items-start bg-gray-50 p-6">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Baluster Calculator</h1>

        {/* Mode Toggle */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setMode("flat")}
            className={`px-4 py-2 rounded-md border ${mode === "flat" ? "bg-black text-white" : "bg-gray-100"}`}
          >
            Flat Rail
          </button>
          <button
            onClick={() => setMode("triangle")}
            className={`px-4 py-2 rounded-md border ${mode === "triangle" ? "bg-black text-white" : "bg-gray-100"}`}
          >
            Triangle Stair
          </button>
        </div>

        {/* Inputs */}
        {mode === "flat" ? (
          <div className="flex flex-col gap-2.5">
            <section className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium">Rail Length (cm)</span>
                <input
                  type="number"
                  value={railLength}
                  onChange={e => setRailLength(Number(e.target.value))}
                  className="mt-1 w-full rounded-md border p-2"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Baluster Width (cm)</span>
                <input
                  type="number"
                  value={balusterWidth}
                  onChange={e => setBalusterWidth(Number(e.target.value))}
                  className="mt-1 w-full rounded-md border p-2"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Space Between (cm)</span>
                <input
                  type="number"
                  value={spacing}
                  onChange={e => setSpacing(Number(e.target.value))}
                  className="mt-1 w-full rounded-md border p-2"
                />
              </label>

              <div className="p-4 bg-gray-50 rounded-md border">
                <p className="font-medium">Results</p>
                <p>Balusters that fit: {flat.count}</p>
                <p>Used length: {flat.usedLength.toFixed(2)} cm</p>
                <p>Remaining: {flat.remaining.toFixed(2)} cm</p>
              </div>
            </section>

            <section>
              <p className="text-sm font-medium mb-2">Visual Preview</p>
              <div className="border rounded-md bg-white p-4 overflow-auto">
                <div
                  style={{ width: widthPx, height: previewMaxHeightFlat }}
                  className="relative bg-linear-to-b from-gray-100 to-gray-50 border rounded-md"
                >
                  <div className="absolute bottom-10 left-0 right-0 h-2 bg-black/60" />
                  {positions.map((x, i) => (
                    <div
                      key={i}
                      style={{ left: x, width: balusterPx, height: 60, position: "absolute", bottom: 12, borderRadius: 4 }}
                      className="bg-black"
                    />
                  ))}
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            <section className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium">Triangle Base Length (cm)</span>
                <input
                  type="number"
                  value={triangleBase}
                  onChange={e => setTriangleBase(Number(e.target.value))}
                  className="mt-1 w-full rounded-md border p-2"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium">Triangle Height (cm)</span>
                <input
                  type="number"
                  value={triangleHeight}
                  onChange={e => setTriangleHeight(Number(e.target.value))}
                  className="mt-1 w-full rounded-md border p-2"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium">Triangle Angle (deg) — optional (overrides Height)</span>
                <input
                  type="number"
                  value={triangleAngleDeg}
                  onChange={e => setTriangleAngleDeg(Number(e.target.value))}
                  className="mt-1 w-full rounded-md border p-2"
                />
                <p className="text-xs text-gray-500 mt-1">If angle &gt; 0, height is computed as: height = base × tan(angle).</p>
              </label>

              <label className="block">
                <span className="text-sm font-medium">Baluster Width (cm)</span>
                <input
                  type="number"
                  value={balusterWidth}
                  onChange={e => setBalusterWidth(Number(e.target.value))}
                  className="mt-1 w-full rounded-md border p-2"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium">Space Between (cm)</span>
                <input
                  type="number"
                  value={spacing}
                  onChange={e => setSpacing(Number(e.target.value))}
                  className="mt-1 w-full rounded-md border p-2"
                />
              </label>

              <div className="p-4 bg-gray-50 rounded-md border">
                <p className="font-medium">Results</p>
                <p>Balusters that fit: {triangle.count}</p>
                <p>
                  Using height: {triangleHeightUsed.toFixed(2)} cm{" "}
                  {triangleAngleDeg > 0 ? `(derived from angle ${triangleAngleDeg.toFixed(2)}°)` : ""}
                </p>

                <table className="w-full mt-2 text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-2 py-1 text-left">#</th>
                      <th className="border px-2 py-1 text-left">X (cm)</th>
                      <th className="border px-2 py-1 text-left">Height (cm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {triangle.results.map(b => (
                      <tr key={b.index}>
                        <td className="border px-2 py-1">{b.index}</td>
                        <td className="border px-2 py-1">{b.x.toFixed(2)}</td>
                        <td className="border px-2 py-1">{b.height.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <p className="text-sm font-medium mb-2">Stylized Slope Preview</p>
              <div className="border rounded-md bg-white p-4 overflow-auto">
                <div
                  style={{ width: widthPx, height: previewMaxHeightTriangle }}
                  className="relative bg-linear-to-b from-gray-100 to-gray-50 border rounded-md"
                >
                  <div
                    className="absolute left-0 bottom-0 origin-bottom-left bg-black"
                    style={{ width: hypotenusePx, height: 2, transform: `rotate(-${slopeAngleRad}rad)` }}
                  />

                  {positions.map((x, i) => {
                    const bal = triangle.results[i];
                    const balHeightPx = Math.round((bal?.height || 0) * pxPerCm);
                    return (
                      <div
                        key={i}
                        style={{ left: x, width: balusterPx, height: balHeightPx, position: "absolute", bottom: 0, borderRadius: 3 }}
                        className="bg-black"
                      />
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-gray-500">Preview scaled to fit (not true size). Angle: {slopeAngleDeg.toFixed(2)}°</p>
              </div>
            </section>
          </div>
        )}

        <footer className="mt-6 text-xs text-gray-500">Mousa Masegeroot Metkademet</footer>
      </div>
    </main>
  );
}
