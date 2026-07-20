export type TargetSizeUnit = "KB" | "MB";

export const targetSizeLimits = {
  minimumBytes: 50 * 1024,
  maximumBytes: 20 * 1024 * 1024,
};

export function targetBytesFromInput(value: string, unit: TargetSizeUnit) {
  if (!/^\d+$/.test(value.trim())) return undefined;
  const numericValue = Number(value.trim());
  if (!Number.isSafeInteger(numericValue) || numericValue <= 0) return undefined;
  return numericValue * (unit === "KB" ? 1024 : 1024 * 1024);
}

export function recommendTargetSize(originalBytes?: number) {
  if (!originalBytes || originalBytes <= targetSizeLimits.minimumBytes) return undefined;

  const ratio =
    originalBytes >= 10 * 1024 * 1024
      ? 0.25
      : originalBytes >= 5 * 1024 * 1024
        ? 0.3
        : originalBytes >= 1024 * 1024
          ? 0.35
          : 0.55;
  const roundedKilobytes = Math.max(50, Math.round((originalBytes * ratio) / 1024));
  const maximumKilobytesBelowOriginal = Math.max(1, Math.floor((originalBytes - 1024) / 1024));
  const value = Math.min(roundedKilobytes, maximumKilobytesBelowOriginal);
  if (value < 50) return undefined;

  return {
    bytes: value * 1024,
    value: String(value),
    unit: "KB" as const,
  };
}

export function validateTargetSize(input: {
  value: string;
  unit: TargetSizeUnit;
  originalBytes?: number;
  maxUploadBytes: number;
}) {
  if (!input.value.trim()) return "Enter a maximum target size.";
  const targetBytes = targetBytesFromInput(input.value, input.unit);
  if (!targetBytes) return "Enter a whole-number target size.";
  if (targetBytes < targetSizeLimits.minimumBytes) return "Enter a target of at least 50 KB.";
  if (targetBytes > targetSizeLimits.maximumBytes || targetBytes >= input.maxUploadBytes) return "Choose a target below 20 MB.";
  if (input.originalBytes && targetBytes >= input.originalBytes) {
    return "This PDF is already below the selected maximum size. Choose a smaller target or use the original file.";
  }
  return "";
}
