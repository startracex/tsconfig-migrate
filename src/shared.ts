export const defaultUseDefineForClassFields = (target: string | null | undefined): boolean => {
  const normalized = target?.toLowerCase() ?? "";
  if (normalized === "esnext") {
    return true;
  }
  const year = /^es(\d+)$/.exec(normalized)?.[1];
  return year !== undefined && Number(year) >= 2022;
};
