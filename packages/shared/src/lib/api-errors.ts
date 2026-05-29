export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string) {
    super(code);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

const ERROR_KEY_BY_CODE: Record<string, string> = {
  "insufficient balance": "insufficientBalance",
  "plan not found": "planNotFound",
  "order failed": "orderFailed",
  "invalid credentials": "invalidCredentials",
  "email already registered": "emailTaken",
  "invalid amount": "zarinpalMinAmount",
  "zarinpal not configured": "zarinpalNotConfigured",
  "fardahost not configured": "zarinpalNotConfigured",
  "registration disabled": "registrationDisabled",
  "login disabled": "loginDisabled",
  "plan purchases disabled": "planPurchasesDisabled",
  "support ticketing disabled": "supportTicketingDisabled",
};

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError;
}

export function isInsufficientBalance(err: unknown): boolean {
  return isApiError(err) && err.code === "insufficient balance";
}

export function mapApiError(t: (key: string) => string, err: unknown): string {
  if (isApiError(err)) {
    const key = ERROR_KEY_BY_CODE[err.code];
    if (key) {
      try {
        return t(key);
      } catch {
        return err.code;
      }
    }
    return err.code || t("genericError");
  }
  if (err instanceof Error && err.message) {
    const key = ERROR_KEY_BY_CODE[err.message];
    if (key) {
      try {
        return t(key);
      } catch {
        return err.message;
      }
    }
    return err.message;
  }
  return t("genericError");
}
