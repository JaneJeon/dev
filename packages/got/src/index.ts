import { gotSsrf } from 'got-ssrf'
import { gotScraping } from 'got-scraping'
import gotSizeLimit from './middlewares/size-limit.js'

import type { Got } from 'got'

// The `stream` types are incompatible because got-scraping is using their own build of got...
// Yay...
export default gotSsrf.extend(gotScraping as unknown as Got, gotSizeLimit)
