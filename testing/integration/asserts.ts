import assert from "assert";
export const isHtmxError = async (res: Response) => {
  const validationHeader = res.headers.get("X-Validation-Error");
  assert(validationHeader === "true");
};
