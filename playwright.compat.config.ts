import {defineConfig} from '@playwright/test';
import base from './playwright.config';
// Engine-level checks supplement physical Safari; they are not an iPhone receipt.
export default defineConfig({...base,use:{...base.use,browserName:'webkit',channel:undefined}});
