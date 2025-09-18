import { setupWorker } from "msw/browser";
import { handlers } from "./handle";

export const worker = setupWorker(...handlers);
