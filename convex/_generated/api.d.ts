/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as assessments from "../assessments.js";
import type * as calendar from "../calendar.js";
import type * as clients from "../clients.js";
import type * as estimates from "../estimates.js";
import type * as http from "../http.js";
import type * as models_assessments from "../models/assessments.js";
import type * as organizations from "../organizations.js";
import type * as public_ from "../public.js";
import type * as services from "../services.js";
import type * as stripe from "../stripe.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  assessments: typeof assessments;
  calendar: typeof calendar;
  clients: typeof clients;
  estimates: typeof estimates;
  http: typeof http;
  "models/assessments": typeof models_assessments;
  organizations: typeof organizations;
  public: typeof public_;
  services: typeof services;
  stripe: typeof stripe;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
