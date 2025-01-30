import { test as base, request, APIRequestContext } from '@playwright/test';
import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';

dotenvConfig({ path: resolve(__dirname, '.env'), override: true });

const API_KEY = process.env.DEV_API_KEY || '';
const API_BASE_URL = process.env.DEV_API_URL || '';
const FOREM_TYPE = 'application/vnd.forem.api-v1+json';

export const test = base.extend<{
    authorizedRequest: APIRequestContext;
    unauthorizedRequest: APIRequestContext;
}>({
    authorizedRequest: async ({ }, use) => {
        const requestContext = await request.newContext({
            baseURL: API_BASE_URL,
            extraHTTPHeaders: {
                'api-key': API_KEY,
                'Accept': FOREM_TYPE,
            },
        });

        await use(requestContext);
        await requestContext.dispose();
    },

    unauthorizedRequest: async ({ }, use) => {
        const requestContext = await request.newContext({
            baseURL: API_BASE_URL,
            extraHTTPHeaders: {
                'Accept': FOREM_TYPE,
            },
        });

        await use(requestContext);
        await requestContext.dispose();
    },
});

export { expect } from '@playwright/test';
